const localKnowledge = [
  {
    keywords: ["cramp", "cramps", "pain", "stomach ache"],
    response:
      "Cramps can happen when the uterus contracts. Try a warm compress, warm water, gentle stretching, and rest. If pain is severe or unusual, talk to a clinician."
  },
  {
    keywords: ["tired", "fatigue", "weak", "sleepy"],
    response:
      "Feeling tired can be linked to hormones, sleep, hydration, or low iron. Drink water, eat a balanced meal, and choose lighter movement today."
  },
  {
    keywords: ["emotional", "sad", "cry", "angry", "mood"],
    response:
      "Hormonal changes can affect emotions. Take a slow breath, name what you are feeling, and give yourself a kinder pace today."
  },
  {
    keywords: ["bloating", "bloated", "gas"],
    response:
      "Bloating is common around PMS and periods. Sip water, reduce extra salt for now, and try a gentle walk or light stretch."
  },
  {
    keywords: ["diet", "food", "nutrition", "eat"],
    response:
      "A simple plate with protein, whole grains, fruit or vegetables, and water is a good start. During periods, iron-rich foods can be helpful."
  },
  {
    keywords: ["workout", "exercise", "yoga", "stretch"],
    response:
      "Choose movement that matches your energy. Gentle stretching, walking, or yoga is usually better than forcing an intense workout when you feel low."
  },
  {
    keywords: ["remedy", "natural", "home remedy"],
    response:
      "For gentle home care, try warmth, hydration, rest, and slow breathing. Avoid any remedy that causes discomfort or replaces medical care."
  },
  {
    keywords: ["record", "report", "analysis", "analyze"],
    response:
      "Your logs can reveal patterns across mood, symptoms, and cycle phase. Keep tracking daily check-ins and symptoms so reports become more useful."
  }
];

export const assistantModes = [
  "Private health guidance",
  "Diet & nutrition",
  "Workout expert",
  "Home remedies",
  "Record analyser"
];

export const suggestedQuestions = [
  "Why do I feel tired?",
  "How to reduce cramps?",
  "Why am I emotional?"
];

export function buildAiContext(appState, cycleInfo) {
  const recentSymptoms = appState.symptomLogs?.[0]?.symptoms || appState.periodEntries?.[0]?.symptoms || [];
  const mood = appState.checkIns?.[0]?.mood || null;
  return {
    phase: cycleInfo.phase,
    recentSymptoms,
    mood
  };
}

export async function getAssistantReply(question, mode, context) {
  const normalized = question.toLowerCase();
  const localMatch = localKnowledge.find((item) => item.keywords.some((keyword) => normalized.includes(keyword)));

  if (localMatch) {
    return {
      source: "local",
      text: `${localMatch.response} 💜`
    };
  }

  return {
    source: "api-placeholder",
    text:
      `I’m ready to send this to the future AI service with only this safe context: ` +
      `${JSON.stringify(context)}. For now, try describing your symptom, mood, and intensity in one line.`
  };
}
