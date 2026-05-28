import { addDays, daysBetween, parseDateKey, toDateKey } from "./date";
import { getCycleInfo } from "./cycle";

const symptomLabels = {
  cramps: "Cramps",
  acne: "Acne",
  bloating: "Bloating",
  fatigue: "Fatigue"
};

const moodLabels = {
  good: "Good",
  okay: "Okay",
  bad: "Bad"
};

export function buildWellnessReport(appState) {
  const periodEntries = appState.periodEntries || [];
  const symptomLogs = appState.symptomLogs || [];
  const checkIns = appState.checkIns || [];
  const latestSymptoms = symptomLogs[0]?.symptoms || periodEntries[0]?.symptoms || [];
  const latestMood = checkIns[0]?.mood || null;
  const cycleInfo = getCycleInfo(appState.cycle, latestSymptoms, latestMood);
  const symptomFrequency = countSymptoms(periodEntries, symptomLogs);
  const moodSummary = countMoods(checkIns);
  const periodStats = getPeriodStats(periodEntries, appState.cycle);
  const forecast = getForecast(appState.cycle, cycleInfo);
  const timeline = buildTimeline(periodEntries, symptomLogs, checkIns);

  return {
    cycleInfo,
    symptomFrequency,
    moodSummary,
    periodStats,
    forecast,
    timeline,
    totals: {
      periodEntries: periodEntries.length,
      symptomLogs: symptomLogs.length,
      checkIns: checkIns.length
    },
    aiContext: {
      phase: cycleInfo.phase,
      recentSymptoms: latestSymptoms,
      mood: latestMood
    }
  };
}

function countSymptoms(periodEntries, symptomLogs) {
  const counts = {};
  const add = (symptoms = []) => {
    symptoms.forEach((symptom) => {
      counts[symptom] = (counts[symptom] || 0) + 1;
    });
  };

  symptomLogs.forEach((log) => add(log.symptoms));
  periodEntries.forEach((entry) => add(entry.symptoms));

  return Object.entries(counts)
    .map(([key, count]) => ({ key, label: symptomLabels[key] || key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function countMoods(checkIns) {
  const counts = { good: 0, okay: 0, bad: 0 };
  checkIns.forEach((entry) => {
    if (counts[entry.mood] !== undefined) counts[entry.mood] += 1;
  });

  const items = Object.entries(counts).map(([key, count]) => ({
    key,
    label: moodLabels[key],
    count
  }));
  const mostCommon = [...items].sort((a, b) => b.count - a.count)[0];

  return {
    items,
    mostCommon: mostCommon?.count ? mostCommon : null
  };
}

function getPeriodStats(periodEntries, cycle) {
  const durations = periodEntries
    .map((entry) => {
      const start = parseDateKey(entry.startDate);
      const end = parseDateKey(entry.endDate);
      if (!start || !end || end < start) return null;
      return daysBetween(start, end) + 1;
    })
    .filter(Boolean);

  const averageDuration = durations.length
    ? Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length)
    : Number(cycle.periodDuration) || 5;

  return {
    averageDuration,
    expectedCycleLength: Number(cycle.averageCycleLength) || 28,
    lastPeriodDate: cycle.lastPeriodDate || null
  };
}

function getForecast(cycle, cycleInfo) {
  const lastPeriod = parseDateKey(cycle.lastPeriodDate);
  if (!lastPeriod) return [];

  const cycleLength = Number(cycle.averageCycleLength) || 28;
  const duration = Number(cycle.periodDuration) || 5;
  const nextStart = cycleInfo.nextPeriodDate ? parseDateKey(cycleInfo.nextPeriodDate) : addDays(lastPeriod, cycleLength);

  return Array.from({ length: 3 }, (_, index) => {
    const start = addDays(nextStart, index * cycleLength);
    const end = addDays(start, duration - 1);
    return {
      label: index === 0 ? "Next period" : `Forecast ${index + 1}`,
      startDate: toDateKey(start),
      endDate: toDateKey(end)
    };
  });
}

function buildTimeline(periodEntries, symptomLogs, checkIns) {
  const periodItems = periodEntries.map((entry) => ({
    id: `period-${entry.id}`,
    date: entry.startDate,
    title: "Period logged",
    detail: `${entry.startDate} to ${entry.endDate} - ${entry.flow || "medium"} flow`
  }));
  const symptomItems = symptomLogs.map((entry) => ({
    id: `symptom-${entry.id}`,
    date: entry.date,
    title: "Symptoms logged",
    detail: entry.symptoms?.length ? entry.symptoms.join(", ") : "No symptoms selected"
  }));
  const moodItems = checkIns.map((entry) => ({
    id: `mood-${entry.id}`,
    date: entry.date,
    title: "Daily check-in",
    detail: moodLabels[entry.mood] || entry.mood
  }));

  return [...periodItems, ...symptomItems, ...moodItems]
    .filter((item) => item.date)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 8);
}
