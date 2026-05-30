import { Platform } from "react-native";
import { initializeApp, getApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signInWithPopup,
  signOut as firebaseSignOut
} from "firebase/auth";
import { deleteDoc, doc, getDoc, getFirestore, serverTimestamp, setDoc } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { appConfig } from "../constants/app";

const firebaseConfig = {
  apiKey: "AIzaSyCMQgFkhtQXT6TTPC4Z3b-sKSer5neTB4s",
  authDomain: "hersaathi-60899.firebaseapp.com",
  projectId: "hersaathi-60899",
  storageBucket: "hersaathi-60899.firebasestorage.app",
  messagingSenderId: "58884450954",
  appId: "1:58884450954:web:ce1a775f3bef8472799b73",
  measurementId: "G-DS745MR4RL"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app, "asia-south1");
const provider = new GoogleAuthProvider();
const authActionTimeoutMs = 5000;

provider.setCustomParameters({ prompt: "select_account" });

export function getCurrentFirebaseUser() {
  return mapFirebaseUser(auth.currentUser);
}

export function watchFirebaseUser(callback) {
  return onAuthStateChanged(auth, (user) => callback(mapFirebaseUser(user)));
}

export async function signInWithGoogle() {
  if (Platform.OS !== "web") {
    return signInWithGoogleNative();
  }

  const result = await signInWithPopup(auth, provider);
  return mapFirebaseUser(result.user);
}

export async function signOutGoogle() {
  const tasks = [];

  if (Platform.OS !== "web") {
    try {
      const { GoogleSignin } = require("@react-native-google-signin/google-signin");

      if (appConfig.androidGoogleWebClientId) {
        GoogleSignin.configure({
          webClientId: appConfig.androidGoogleWebClientId,
          offlineAccess: false,
          profileImageSize: 120
        });
      }

      tasks.push(withTimeout(GoogleSignin.signOut(), authActionTimeoutMs).catch(() => null));
    } catch {
      // Firebase sign-out below is still the source of truth for app state.
    }
  }

  tasks.push(withTimeout(firebaseSignOut(auth), authActionTimeoutMs).catch(() => null));
  await Promise.all(tasks);
}

export async function uploadWellnessData(uid, payload) {
  assertSignedIn(uid);
  const cleanPayload = JSON.parse(JSON.stringify(payload));
  await setDoc(wellnessDocRef(uid), {
    ...cleanPayload,
    cloudUpdatedAt: serverTimestamp()
  });
}

export async function downloadWellnessData(uid) {
  assertSignedIn(uid);
  const snapshot = await getDoc(wellnessDocRef(uid));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function deleteWellnessData(uid) {
  assertSignedIn(uid);
  await deleteDoc(wellnessDocRef(uid));
}

export async function askHerSaathiAI(payload) {
  const callable = httpsCallable(functions, "askHerSaathiAI");
  const result = await callable(payload);
  return result.data;
}

export function buildWellnessCloudPayload(appState, dataScopes = {}) {
  const data = {
    profile: {
      name: appState.profile?.name || "Saathi",
      ageGroup: appState.profile?.ageGroup || null
    }
  };

  if (dataScopes.cycle !== false) data.cycle = appState.cycle;
  if (dataScopes.periodEntries !== false) data.periodEntries = appState.periodEntries || [];
  if (dataScopes.symptomLogs !== false) data.symptomLogs = appState.symptomLogs || [];
  if (dataScopes.checkIns !== false) data.checkIns = appState.checkIns || [];
  if (dataScopes.aiMessages === true) data.aiMessages = appState.aiMessages || [];

  return {
    app: "HerSaathi",
    version: 2,
    clientUpdatedAt: new Date().toISOString(),
    legalConsent: appState.legalConsent || null,
    dataScopes,
    data
  };
}

function wellnessDocRef(uid) {
  return doc(db, "users", uid, "wellness", "current");
}

function mapFirebaseUser(user) {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL
  };
}

async function signInWithGoogleNative() {
  if (!appConfig.androidGoogleWebClientId) {
    throw new Error("Android Google sign-in needs the Web client ID from Google Cloud/Firebase. Add it to src/constants/app.js after Firebase Android setup.");
  }

  const { GoogleSignin } = require("@react-native-google-signin/google-signin");
  GoogleSignin.configure({
    webClientId: appConfig.androidGoogleWebClientId,
    offlineAccess: false,
    profileImageSize: 120
  });

  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();
  const idToken = response?.data?.idToken || response?.idToken;

  if (!idToken) {
    throw new Error("Google did not return an ID token. Check Firebase Android SHA-1/SHA-256 and Web client ID setup.");
  }

  const credential = GoogleAuthProvider.credential(idToken);
  const result = await signInWithCredential(auth, credential);
  return mapFirebaseUser(result.user);
}

function withTimeout(promise, timeoutMs) {
  return Promise.race([promise, new Promise((resolve) => setTimeout(resolve, timeoutMs))]);
}

function assertSignedIn(uid) {
  if (!uid) {
    throw new Error("Please sign in with Google first.");
  }
}
