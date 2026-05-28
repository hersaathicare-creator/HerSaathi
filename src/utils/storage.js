import AsyncStorage from "@react-native-async-storage/async-storage";
import { toDateKey } from "./date";

export const storageKeys = {
  onboardingComplete: "hersaathi:onboardingComplete",
  profile: "hersaathi:profile",
  cycle: "hersaathi:cycle",
  notifications: "hersaathi:notifications",
  checkIns: "hersaathi:checkIns",
  periodEntries: "hersaathi:periodEntries",
  symptomLogs: "hersaathi:symptomLogs",
  aiUsage: "hersaathi:aiUsage",
  aiMessages: "hersaathi:aiMessages"
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
  aiMessages: []
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
    cycle,
    notifications,
    checkIns,
    periodEntries,
    symptomLogs,
    aiUsage,
    aiMessages
  ] = await Promise.all([
    getJSON(storageKeys.onboardingComplete, defaultState.onboardingComplete),
    getJSON(storageKeys.profile, defaultState.profile),
    getJSON(storageKeys.cycle, defaultState.cycle),
    getJSON(storageKeys.notifications, defaultState.notifications),
    getJSON(storageKeys.checkIns, defaultState.checkIns),
    getJSON(storageKeys.periodEntries, defaultState.periodEntries),
    getJSON(storageKeys.symptomLogs, defaultState.symptomLogs),
    getJSON(storageKeys.aiUsage, defaultState.aiUsage),
    getJSON(storageKeys.aiMessages, defaultState.aiMessages)
  ]);

  return {
    onboardingComplete,
    profile: { ...defaultState.profile, ...profile },
    cycle: { ...defaultState.cycle, ...cycle },
    notifications: { ...defaultState.notifications, ...notifications },
    checkIns,
    periodEntries,
    symptomLogs,
    aiUsage: aiUsage.date === toDateKey() ? aiUsage : { date: toDateKey(), count: 0 },
    aiMessages
  };
}

export async function completeOnboarding({ ageGroup, cycle, notificationsEnabled }) {
  await Promise.all([
    setJSON(storageKeys.profile, { ...defaultState.profile, ageGroup }),
    setJSON(storageKeys.cycle, { ...defaultState.cycle, ...cycle }),
    setJSON(storageKeys.notifications, {
      ...defaultState.notifications,
      enabled: Boolean(notificationsEnabled)
    }),
    setJSON(storageKeys.onboardingComplete, true)
  ]);
}

export async function saveNotificationSettings(settings) {
  return setJSON(storageKeys.notifications, settings);
}

export async function saveProfile(profile) {
  return setJSON(storageKeys.profile, profile);
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
    version: 1,
    data: state
  };
}

export async function restoreLocalData(data) {
  const nextState = {
    onboardingComplete: Boolean(data.onboardingComplete),
    profile: { ...defaultState.profile, ...(data.profile || {}) },
    cycle: { ...defaultState.cycle, ...(data.cycle || {}) },
    notifications: { ...defaultState.notifications, ...(data.notifications || {}) },
    checkIns: Array.isArray(data.checkIns) ? data.checkIns : [],
    periodEntries: Array.isArray(data.periodEntries) ? data.periodEntries : [],
    symptomLogs: Array.isArray(data.symptomLogs) ? data.symptomLogs : [],
    aiUsage: { ...defaultState.aiUsage, ...(data.aiUsage || {}) },
    aiMessages: Array.isArray(data.aiMessages) ? data.aiMessages : []
  };

  await Promise.all([
    setJSON(storageKeys.onboardingComplete, nextState.onboardingComplete),
    setJSON(storageKeys.profile, nextState.profile),
    setJSON(storageKeys.cycle, nextState.cycle),
    setJSON(storageKeys.notifications, nextState.notifications),
    setJSON(storageKeys.checkIns, nextState.checkIns),
    setJSON(storageKeys.periodEntries, nextState.periodEntries),
    setJSON(storageKeys.symptomLogs, nextState.symptomLogs),
    setJSON(storageKeys.aiUsage, nextState.aiUsage),
    setJSON(storageKeys.aiMessages, nextState.aiMessages)
  ]);

  return loadAppState();
}

export async function resetLocalData() {
  await AsyncStorage.multiRemove(Object.values(storageKeys));
  return loadAppState();
}
