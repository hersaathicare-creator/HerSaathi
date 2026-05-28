import { daysBetween, parseDateKey, toDateKey } from "./date";

const dateKeyPattern = /^\d{4}-\d{2}-\d{2}$/;
const ageGroups = ["teen", "18-25", "25-35", "35+"];
const flows = ["light", "medium", "heavy"];
const moods = ["good", "okay", "bad"];

export function isValidDateKey(value) {
  if (typeof value !== "string" || !dateKeyPattern.test(value)) return false;
  const parsed = parseDateKey(value);
  return Boolean(parsed && toDateKey(parsed) === value);
}

export function isFutureDateKey(value) {
  if (!isValidDateKey(value)) return false;
  return value > toDateKey();
}

export function validateCycleSetup({ lastPeriodDate, averageCycleLength, periodDuration }) {
  const errors = [];
  const cycleLength = Number(averageCycleLength);
  const duration = Number(periodDuration);

  if (!isValidDateKey(lastPeriodDate)) {
    errors.push("Choose a valid last period date.");
  } else if (isFutureDateKey(lastPeriodDate)) {
    errors.push("Last period date cannot be in the future.");
  }

  if (!Number.isInteger(cycleLength) || cycleLength < 21 || cycleLength > 45) {
    errors.push("Average cycle length should be between 21 and 45 days.");
  }

  if (!Number.isInteger(duration) || duration < 2 || duration > 10) {
    errors.push("Period duration should be between 2 and 10 days.");
  }

  if (Number.isInteger(cycleLength) && Number.isInteger(duration) && duration >= cycleLength) {
    errors.push("Period duration should be shorter than cycle length.");
  }

  return errors;
}

export function validatePeriodEntry({ startDate, endDate, flow }) {
  const errors = [];
  const start = isValidDateKey(startDate) ? parseDateKey(startDate) : null;
  const end = isValidDateKey(endDate) ? parseDateKey(endDate) : null;

  if (!start) errors.push("Choose a valid start date.");
  if (!end) errors.push("Choose a valid end date.");
  if (isFutureDateKey(startDate)) errors.push("Start date cannot be in the future.");
  if (isFutureDateKey(endDate)) errors.push("End date cannot be in the future.");

  if (start && end) {
    const duration = daysBetween(start, end) + 1;
    if (duration < 1) errors.push("End date must be on or after the start date.");
    if (duration > 14) errors.push("Period entries longer than 14 days should be reviewed before saving.");
  }

  if (flow && !flows.includes(flow)) {
    errors.push("Choose a valid flow level.");
  }

  return errors;
}

export function validateSymptomLog({ date, symptoms }) {
  const errors = [];

  if (!isValidDateKey(date)) {
    errors.push("Choose a valid symptom date.");
  } else if (isFutureDateKey(date)) {
    errors.push("Symptom date cannot be in the future.");
  }

  if (!Array.isArray(symptoms) || symptoms.length === 0) {
    errors.push("Choose at least one symptom.");
  }

  return errors;
}

export function validateImportText(text) {
  const errors = [];
  let parsed;

  try {
    parsed = JSON.parse(text);
  } catch {
    return { valid: false, errors: ["Paste a valid HerSaathi JSON export."], data: null };
  }

  const source = parsed?.data && typeof parsed.data === "object" ? parsed.data : parsed;
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    return { valid: false, errors: ["Import must be a HerSaathi data object."], data: null };
  }

  const data = normalizeImportData(source, errors);
  return { valid: errors.length === 0, errors, data: errors.length ? null : data };
}

function normalizeImportData(source, errors) {
  const profile = normalizeProfile(source.profile);
  const cycle = normalizeCycle(source.cycle, errors);
  const notifications = normalizeNotifications(source.notifications);
  const checkIns = normalizeCheckIns(source.checkIns, errors);
  const periodEntries = normalizePeriodEntries(source.periodEntries, errors);
  const symptomLogs = normalizeSymptomLogs(source.symptomLogs, errors);
  const aiUsage = normalizeAiUsage(source.aiUsage);
  const aiMessages = normalizeAiMessages(source.aiMessages);

  return {
    onboardingComplete: Boolean(source.onboardingComplete),
    profile,
    cycle,
    notifications,
    checkIns,
    periodEntries,
    symptomLogs,
    aiUsage,
    aiMessages
  };
}

function normalizeProfile(profile = {}) {
  const source = asObject(profile);
  const ageGroup = ageGroups.includes(source.ageGroup) ? source.ageGroup : null;
  return {
    name: safeString(source.name, "Saathi").slice(0, 40) || "Saathi",
    ageGroup,
    gmailConnected: Boolean(source.gmailConnected),
    cloudSync: Boolean(source.cloudSync),
    subscription: source.subscription === "premium" ? "premium" : "free"
  };
}

function normalizeCycle(cycle = {}, errors) {
  const source = asObject(cycle);
  const normalized = {
    lastPeriodDate: isValidDateKey(source.lastPeriodDate) ? source.lastPeriodDate : null,
    averageCycleLength: toInteger(source.averageCycleLength, 28),
    periodDuration: toInteger(source.periodDuration, 5)
  };

  if (source.lastPeriodDate && !isValidDateKey(source.lastPeriodDate)) {
    errors.push("Imported cycle has an invalid last period date.");
  }
  if (normalized.lastPeriodDate && isFutureDateKey(normalized.lastPeriodDate)) {
    errors.push("Imported cycle last period date cannot be in the future.");
  }
  if (normalized.averageCycleLength < 21 || normalized.averageCycleLength > 45) {
    errors.push("Imported cycle length must be between 21 and 45 days.");
  }
  if (normalized.periodDuration < 2 || normalized.periodDuration > 10) {
    errors.push("Imported period duration must be between 2 and 10 days.");
  }
  if (normalized.periodDuration >= normalized.averageCycleLength) {
    errors.push("Imported period duration must be shorter than cycle length.");
  }

  return normalized;
}

function normalizeNotifications(notifications = {}) {
  const source = asObject(notifications);
  return {
    enabled: Boolean(source.enabled),
    dailyCheckIn: source.dailyCheckIn !== false,
    periodReminder: source.periodReminder !== false,
    wellnessTip: source.wellnessTip !== false
  };
}

function normalizeCheckIns(checkIns, errors) {
  return normalizeArray(checkIns).slice(0, 120).reduce((items, entry, index) => {
    const source = asObject(entry);
    const date = isValidDateKey(source.date) ? source.date : null;
    const mood = moods.includes(source.mood) ? source.mood : null;
    if (!date || !mood) {
      errors.push(`Check-in ${index + 1} has invalid date or mood.`);
      return items;
    }
    items.push({
      id: safeId(source.id, `checkin-${index}`),
      date,
      mood,
      timestamp: safeString(source.timestamp, new Date().toISOString())
    });
    return items;
  }, []);
}

function normalizePeriodEntries(periodEntries, errors) {
  return normalizeArray(periodEntries).slice(0, 180).reduce((items, entry, index) => {
    const source = asObject(entry);
    const normalized = {
      id: safeId(source.id, `period-${index}`),
      startDate: source.startDate,
      endDate: source.endDate,
      flow: flows.includes(source.flow) ? source.flow : "medium",
      symptoms: normalizeSymptoms(source.symptoms),
      createdAt: safeString(source.createdAt, new Date().toISOString()),
      updatedAt: source.updatedAt ? safeString(source.updatedAt, "") : undefined
    };
    const entryErrors = validatePeriodEntry(normalized);
    if (entryErrors.length) {
      errors.push(`Period entry ${index + 1}: ${entryErrors.join(" ")}`);
      return items;
    }
    items.push(removeUndefined(normalized));
    return items;
  }, []);
}

function normalizeSymptomLogs(symptomLogs, errors) {
  return normalizeArray(symptomLogs).slice(0, 180).reduce((items, entry, index) => {
    const source = asObject(entry);
    const normalized = {
      id: safeId(source.id, `symptom-${index}`),
      date: source.date,
      symptoms: normalizeSymptoms(source.symptoms),
      mood: moods.includes(source.mood) ? source.mood : null,
      timestamp: safeString(source.timestamp, new Date().toISOString()),
      updatedAt: source.updatedAt ? safeString(source.updatedAt, "") : undefined
    };
    const entryErrors = validateSymptomLog(normalized);
    if (entryErrors.length) {
      errors.push(`Symptom log ${index + 1}: ${entryErrors.join(" ")}`);
      return items;
    }
    items.push(removeUndefined(normalized));
    return items;
  }, []);
}

function normalizeAiUsage(aiUsage = {}) {
  const source = asObject(aiUsage);
  return {
    date: isValidDateKey(source.date) ? source.date : toDateKey(),
    count: Math.max(0, Math.min(toInteger(source.count, 0), 5))
  };
}

function normalizeAiMessages(aiMessages) {
  return normalizeArray(aiMessages).slice(-40).reduce((items, message, index) => {
    const source = asObject(message);
    const role = source.role === "user" ? "user" : "ai";
    const text = safeString(source.text, "").trim();
    if (!text) return items;
    items.push({
      id: safeId(source.id, `message-${index}`),
      role,
      text: text.slice(0, 1200),
      source: source.source ? safeString(source.source, "").slice(0, 80) : undefined
    });
    return items;
  }, []).map(removeUndefined);
}

function normalizeSymptoms(symptoms) {
  return normalizeArray(symptoms)
    .map((item) => safeString(item, "").trim().toLowerCase())
    .filter(Boolean)
    .filter((item, index, list) => list.indexOf(item) === index)
    .slice(0, 12);
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function toInteger(value, fallback) {
  const number = Number(value);
  return Number.isInteger(number) ? number : fallback;
}

function safeString(value, fallback) {
  return typeof value === "string" ? value : fallback;
}

function safeId(value, fallback) {
  return safeString(value, fallback).slice(0, 80) || fallback;
}

function removeUndefined(value) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined));
}
