import AsyncStorage from "@react-native-async-storage/async-storage";
import { toDateKey } from "./date";

export const storageKeys = {
  onboardingComplete: "hersaathi:onboardingComplete",
  profile: "hersaathi:profile",
  account: "hersaathi:account",
  cycle: "hersaathi:cycle",
  notifications: "hersaathi:notifications",
  checkIns: "hersaathi:checkIns",
  periodEntries: "hersaathi:periodEntries",
  symptomLogs: "hersaathi:symptomLogs",
  aiUsage: "hersaathi:aiUsage",
  aiMessages: "hersaathi:aiMessages",
  legalConsent: "hersaathi:legalConsent"
};

const defaultState = {
  onboardingComplete: false,
  profile: {
    name: "Saathi",
    ageGroup: null,
    gmailConnected: false,
    cloudSync: false,
    subscription: "free"
  },
  account: {
    status: "guest",
    provider: null,
    email: null,
    displayName: null,
    uid: null,
    photoURL: null,
    syncEnabled: false,
    syncStatus: "local-only",
    lastSyncCheckAt: null,
    lastCloudUploadAt: null,
    lastCloudDownloadAt: null,
    lastCloudDeleteAt: null,
    cloudProvider: "Cloud Firestore",
    syncConsent: false,
    dataScopes: {
      cycle: true,
      periodEntries: true,
      symptomLogs: true,
      checkIns: true,
      aiMessages: false
    }
  },
  cycle: {
    lastPeriodDate: null,
    averageCycleLength: 28,
    periodDuration: 5
  },
  notifications: {
    enabled: false,
    dailyCheckIn: true,
    periodReminder: true,
    wellnessTip: true
  },
  checkIns: [],
  periodEntries: [],
  symptomLogs: [],
  aiUsage: {
    date: toDateKey(),
    count: 0
  },
  aiMessages: [],
  legalConsent: null
};

async function getJSON(key, fallback) {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function setJSON(key, value) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
  return value;
}

export async function loadAppState() {
  const [
    onboardingComplete,
    profile,
    account,
    cycle,
    notifications,
    checkIns,
    periodEntries,
    symptomLogs,
    aiUsage,
    aiMessages,
    legalConsent
  ] = await Promise.all([
    getJSON(storageKeys.onboardingComplete, defaultState.onboardingComplete),
    getJSON(storageKeys.profile, defaultState.profile),
    getJSON(storageKeys.account, defaultState.account),
    getJSON(storageKeys.cycle, defaultState.cycle),
    getJSON(storageKeys.notifications, defaultState.notifications),
    getJSON(storageKeys.checkIns, defaultState.checkIns),
    getJSON(storageKeys.periodEntries, defaultState.periodEntries),
    getJSON(storageKeys.symptomLogs, defaultState.symptomLogs),
    getJSON(storageKeys.aiUsage, defaultState.aiUsage),
    getJSON(storageKeys.aiMessages, defaultState.aiMessages),
    getJSON(storageKeys.legalConsent, defaultState.legalConsent)
  ]);

  return {
    onboardingComplete,
    profile: { ...defaultState.profile, ...profile },
    account: {
      ...defaultState.account,
      ...account,
      dataScopes: { ...defaultState.account.dataScopes, ...(account?.dataScopes || {}) }
    },
    cycle: { ...defaultState.cycle, ...cycle },
    notifications: { ...defaultState.notifications, ...notifications },
    checkIns,
    periodEntries,
    symptomLogs,
    aiUsage: aiUsage.date === toDateKey() ? aiUsage : { date: toDateKey(), count: 0 },
    aiMessages,
    legalConsent
  };
}

export async function completeOnboarding({ ageGroup, cycle, notificationsEnabled, legalConsent = null }) {
  await Promise.all([
    setJSON(storageKeys.profile, { ...defaultState.profile, ageGroup }),
    setJSON(storageKeys.cycle, { ...defaultState.cycle, ...cycle }),
    setJSON(storageKeys.notifications, {
      ...defaultState.notifications,
      enabled: Boolean(notificationsEnabled)
    }),
    setJSON(storageKeys.legalConsent, legalConsent),
    setJSON(storageKeys.onboardingComplete, true)
  ]);
}

export async function saveNotificationSettings(settings) {
  return setJSON(storageKeys.notifications, settings);
}

export async function saveProfile(profile) {
  return setJSON(storageKeys.profile, profile);
}

export async function saveAccount(account) {
  const next = {
    ...defaultState.account,
    ...account,
    dataScopes: { ...defaultState.account.dataScopes, ...(account?.dataScopes || {}) }
  };
  return setJSON(storageKeys.account, next);
}

export async function updateCloudSyncSettings(patch) {
  const account = await getJSON(storageKeys.account, defaultState.account);
  const next = {
    ...defaultState.account,
    ...account,
    ...patch,
    dataScopes: {
      ...defaultState.account.dataScopes,
      ...(account?.dataScopes || {}),
      ...(patch?.dataScopes || {})
    }
  };

  if (patch.syncEnabled === true) {
    next.syncConsent = true;
    next.syncStatus = next.status === "signed-in" ? "ready" : "auth-needed";
  }

  if (patch.syncEnabled === false) {
    next.syncStatus = "paused";
  }

  await setJSON(storageKeys.account, next);
  return next;
}

export async function runLocalSyncReadinessCheck() {
  const account = await getJSON(storageKeys.account, defaultState.account);
  const next = {
    ...defaultState.account,
    ...account,
    lastSyncCheckAt: new Date().toISOString(),
    syncStatus: account.status === "signed-in" ? "ready" : "auth-needed"
  };
  await setJSON(storageKeys.account, next);
  return next;
}

export async function saveSignedInAccount(user, patch = {}) {
  const account = await getJSON(storageKeys.account, defaultState.account);
  const next = {
    ...defaultState.account,
    ...account,
    ...patch,
    status: "signed-in",
    provider: "google",
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    syncStatus: patch.syncStatus || (account.syncEnabled ? "ready" : "signed-in"),
    lastSyncCheckAt: new Date().toISOString(),
    dataScopes: { ...defaultState.account.dataScopes, ...(account?.dataScopes || {}), ...(patch?.dataScopes || {}) }
  };

  await Promise.all([
    setJSON(storageKeys.account, next),
    getJSON(storageKeys.profile, defaultState.profile).then((profile) =>
      setJSON(storageKeys.profile, {
        ...profile,
        name: profile.name || user.displayName || "Saathi",
        gmailConnected: true,
        cloudSync: Boolean(next.syncEnabled)
      })
    )
  ]);

  return next;
}

export async function markCloudSync(patch) {
  const account = await getJSON(storageKeys.account, defaultState.account);
  const next = {
    ...defaultState.account,
    ...account,
    ...patch,
    dataScopes: { ...defaultState.account.dataScopes, ...(account?.dataScopes || {}) }
  };
  await setJSON(storageKeys.account, next);
  return next;
}

export async function signOutAccount() {
  const account = await getJSON(storageKeys.account, defaultState.account);
  const next = {
    ...defaultState.account,
    dataScopes: { ...defaultState.account.dataScopes, ...(account?.dataScopes || {}) },
    syncStatus: "signed-out"
  };
  await Promise.all([
    setJSON(storageKeys.account, next),
    getJSON(storageKeys.profile, defaultState.profile).then((profile) =>
      setJSON(storageKeys.profile, { ...profile, gmailConnected: false, cloudSync: false })
    )
  ]);
  return next;
}

export function getTodayCheckIn(checkIns = []) {
  const today = toDateKey();
  return checkIns.find((entry) => entry.date === today);
}

export async function addDailyCheckIn(mood) {
  const checkIns = await getJSON(storageKeys.checkIns, []);
  const existing = getTodayCheckIn(checkIns);
  if (existing) return { saved: false, entry: existing, checkIns };

  const entry = {
    id: `${Date.now()}`,
    date: toDateKey(),
    mood,
    timestamp: new Date().toISOString()
  };
  const next = [entry, ...checkIns].slice(0, 120);
  await setJSON(storageKeys.checkIns, next);
  return { saved: true, entry, checkIns: next };
}

export async function savePeriodEntry(entry) {
  const entries = await getJSON(storageKeys.periodEntries, []);
  const next = [{ ...entry, id: `${Date.now()}`, createdAt: new Date().toISOString() }, ...entries];
  await setJSON(storageKeys.periodEntries, next);

  if (entry.startDate) {
    const cycle = await getJSON(storageKeys.cycle, defaultState.cycle);
    await setJSON(storageKeys.cycle, { ...cycle, lastPeriodDate: entry.startDate });
  }

  return next;
}

export async function updatePeriodEntry(id, patch) {
  const entries = await getJSON(storageKeys.periodEntries, []);
  const next = entries.map((entry) =>
    entry.id === id ? { ...entry, ...patch, updatedAt: new Date().toISOString() } : entry
  );
  await setJSON(storageKeys.periodEntries, next);

  if (patch.startDate && next[0]?.id === id) {
    const cycle = await getJSON(storageKeys.cycle, defaultState.cycle);
    await setJSON(storageKeys.cycle, { ...cycle, lastPeriodDate: patch.startDate });
  }

  return next;
}

export async function deletePeriodEntry(id) {
  const entries = await getJSON(storageKeys.periodEntries, []);
  const next = entries.filter((entry) => entry.id !== id);
  await setJSON(storageKeys.periodEntries, next);

  if (next[0]?.startDate) {
    const cycle = await getJSON(storageKeys.cycle, defaultState.cycle);
    await setJSON(storageKeys.cycle, { ...cycle, lastPeriodDate: next[0].startDate });
  }

  return next;
}

export async function saveSymptomLog(symptoms, mood, date = toDateKey()) {
  const logs = await getJSON(storageKeys.symptomLogs, []);
  const next = [
    {
      id: `${Date.now()}`,
      date,
      symptoms,
      mood: mood || null,
      timestamp: new Date().toISOString()
    },
    ...logs
  ].slice(0, 180);
  await setJSON(storageKeys.symptomLogs, next);
  return next;
}

export async function updateSymptomLog(id, patch) {
  const logs = await getJSON(storageKeys.symptomLogs, []);
  const next = logs.map((entry) =>
    entry.id === id ? { ...entry, ...patch, updatedAt: new Date().toISOString() } : entry
  );
  await setJSON(storageKeys.symptomLogs, next);
  return next;
}

export async function deleteSymptomLog(id) {
  const logs = await getJSON(storageKeys.symptomLogs, []);
  const next = logs.filter((entry) => entry.id !== id);
  await setJSON(storageKeys.symptomLogs, next);
  return next;
}

export async function saveAiMessages(messages) {
  return setJSON(storageKeys.aiMessages, messages.slice(-40));
}

export async function incrementAiUsage() {
  const today = toDateKey();
  const usage = await getJSON(storageKeys.aiUsage, { date: today, count: 0 });
  const normalized = usage.date === today ? usage : { date: today, count: 0 };
  const next = { date: today, count: normalized.count + 1 };
  await setJSON(storageKeys.aiUsage, next);
  return next;
}

export async function exportLocalData() {
  const state = await loadAppState();
  return {
    exportedAt: new Date().toISOString(),
    app: "HerSaathi",
    version: 2,
    data: state
  };
}

export async function restoreLocalData(data) {
  const nextState = {
    onboardingComplete: Boolean(data.onboardingComplete),
    profile: { ...defaultState.profile, ...(data.profile || {}) },
    account: {
      ...defaultState.account,
      ...(data.account || {}),
      dataScopes: { ...defaultState.account.dataScopes, ...(data.account?.dataScopes || {}) }
    },
    cycle: { ...defaultState.cycle, ...(data.cycle || {}) },
    notifications: { ...defaultState.notifications, ...(data.notifications || {}) },
    checkIns: Array.isArray(data.checkIns) ? data.checkIns : [],
    periodEntries: Array.isArray(data.periodEntries) ? data.periodEntries : [],
    symptomLogs: Array.isArray(data.symptomLogs) ? data.symptomLogs : [],
    aiUsage: { ...defaultState.aiUsage, ...(data.aiUsage || {}) },
    aiMessages: Array.isArray(data.aiMessages) ? data.aiMessages : [],
    legalConsent: data.legalConsent || null
  };

  await Promise.all([
    setJSON(storageKeys.onboardingComplete, nextState.onboardingComplete),
    setJSON(storageKeys.profile, nextState.profile),
    setJSON(storageKeys.account, nextState.account),
    setJSON(storageKeys.cycle, nextState.cycle),
    setJSON(storageKeys.notifications, nextState.notifications),
    setJSON(storageKeys.checkIns, nextState.checkIns),
    setJSON(storageKeys.periodEntries, nextState.periodEntries),
    setJSON(storageKeys.symptomLogs, nextState.symptomLogs),
    setJSON(storageKeys.aiUsage, nextState.aiUsage),
    setJSON(storageKeys.aiMessages, nextState.aiMessages),
    setJSON(storageKeys.legalConsent, nextState.legalConsent)
  ]);

  return loadAppState();
}

export async function applyCloudWellnessData(cloudData) {
  const current = await loadAppState();
  const incoming = cloudData?.data || {};
  const nextState = {
    ...current,
    profile: incoming.profile ? { ...current.profile, ...incoming.profile } : current.profile,
    cycle: incoming.cycle ? { ...current.cycle, ...incoming.cycle } : current.cycle,
    periodEntries: Array.isArray(incoming.periodEntries) ? incoming.periodEntries : current.periodEntries,
    symptomLogs: Array.isArray(incoming.symptomLogs) ? incoming.symptomLogs : current.symptomLogs,
    checkIns: Array.isArray(incoming.checkIns) ? incoming.checkIns : current.checkIns,
    aiMessages: Array.isArray(incoming.aiMessages) ? incoming.aiMessages : current.aiMessages,
    legalConsent: cloudData?.legalConsent || current.legalConsent,
    account: {
      ...current.account,
      lastCloudDownloadAt: new Date().toISOString(),
      syncStatus: "synced"
    }
  };

  return restoreLocalData(nextState);
}

export async function resetLocalData() {
  await AsyncStorage.multiRemove(Object.values(storageKeys));
  return loadAppState();
}
