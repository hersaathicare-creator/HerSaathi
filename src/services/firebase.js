import { Platform } from "react-native";
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { deleteDoc, doc, getDoc, getFirestore, serverTimestamp, setDoc } from "firebase/firestore";

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
const provider = new GoogleAuthProvider();

provider.setCustomParameters({ prompt: "select_account" });

export function getCurrentFirebaseUser() {
  return mapFirebaseUser(auth.currentUser);
}

export function watchFirebaseUser(callback) {
  return onAuthStateChanged(auth, (user) => callback(mapFirebaseUser(user)));
}

export async function signInWithGoogle() {
  assertWebAuth();
  const result = await signInWithPopup(auth, provider);
  return mapFirebaseUser(result.user);
}

export async function signOutGoogle() {
  await signOut(auth);
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

function assertWebAuth() {
  if (Platform.OS !== "web") {
    throw new Error("Google sign-in is connected for web. Android/iOS need native OAuth client IDs in the next build step.");
  }
}

function assertSignedIn(uid) {
  if (!uid) {
    throw new Error("Please sign in with Google first.");
  }
}
