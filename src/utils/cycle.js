import { addDays, daysBetween, parseDateKey, toDateKey } from "./date";

export function getCycleInfo(cycle = {}, recentSymptoms = [], latestMood) {
  const averageCycleLength = Number(cycle.averageCycleLength) || 28;
  const periodDuration = Number(cycle.periodDuration) || 5;
  const lastPeriod = parseDateKey(cycle.lastPeriodDate);

  if (!lastPeriod) {
    return {
      currentDay: null,
      phase: "Setup needed",
      nextPeriodDate: null,
      nextPeriodCountdown: null,
      insight: "Add your last period date to unlock cycle insights."
    };
  }

  const elapsed = Math.max(0, daysBetween(lastPeriod));
  const cycleIndex = elapsed % averageCycleLength;
  const currentDay = cycleIndex + 1;
  const daysUntilNextPeriod = averageCycleLength - cycleIndex;
  const nextPeriodDate = toDateKey(addDays(new Date(), daysUntilNextPeriod));
  const phase = getPhase(currentDay, averageCycleLength, periodDuration);
  const insight = getInsight(phase, recentSymptoms, latestMood);

  return {
    currentDay,
    phase,
    nextPeriodDate,
    nextPeriodCountdown: daysUntilNextPeriod,
    insight
  };
}

function getPhase(day, cycleLength, periodDuration) {
  const ovulationDay = Math.max(10, Math.round(cycleLength / 2));
  if (day <= periodDuration) return "Period Phase";
  if (day < ovulationDay - 2) return "Follicular Phase";
  if (day <= ovulationDay + 2) return "Ovulation Phase";
  if (day >= cycleLength - 6) return "PMS Phase";
  return "Luteal Phase";
}

function getInsight(phase, recentSymptoms, latestMood) {
  const symptoms = recentSymptoms || [];
  if (symptoms.includes("cramps")) return "Warmth, rest, and gentle movement may help cramps today.";
  if (latestMood === "bad") return "Take the day softly. A short breathing pause can help your body settle.";
  if (phase === "Period Phase") return "Lower energy can be normal today. Hydration and iron-rich food may help.";
  if (phase === "Follicular Phase") return "You may feel steadier and more energetic today.";
  if (phase === "Ovulation Phase") return "You may feel more energetic today 🌸";
  if (phase === "PMS Phase") return "Mood shifts and cravings can happen now. Keep meals gentle and regular.";
  return "Your body may appreciate consistent sleep and light movement today.";
}
