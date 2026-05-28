const localKnowledge = [
  {
    keywords: ["cramp", "cramps", "period pain", "stomach ache"],
    response:
      "Cramps can happen when the uterus contracts. Try a warm compress, warm water, gentle stretching, and rest. If pain is severe, sudden, or unusual for you, speak with a clinician."
  },
  {
    keywords: ["tired", "fatigue", "weak", "sleepy", "exhausted"],
    response:
      "Feeling tired can be linked to hormones, sleep, hydration, stress, or low iron. Drink water, eat a balanced meal, and choose lighter movement today."
  },
  {
    keywords: ["emotional", "sad", "cry", "angry", "mood", "irritable"],
    response:
      "Hormonal changes can affect emotions. Take one slow breath, name what you are feeling, and give yourself a kinder pace today."
  },
  {
    keywords: ["bloating", "bloated", "gas"],
    response:
      "Bloating is common around PMS and periods. Sip water, reduce extra salt for now, and try a gentle walk or light stretch."
  },
  {
    keywords: ["diet", "food", "nutrition", "eat", "meal"],
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
    keywords: ["record", "report", "analysis", "analyze", "pattern"],
    response:
      "Your logs can reveal patterns across mood, symptoms, and cycle phase. Keep tracking daily check-ins and symptoms so reports become more useful."
  }
];

const safetyKnowledge = [
  {
    keywords: ["very heavy bleeding", "heavy bleeding", "soaking pad", "faint", "fainting", "dizzy and bleeding"],
    response:
      "Very heavy bleeding, fainting, or dizziness with bleeding should be checked urgently. Please contact a medical professional or local emergency service now."
  },
  {
    keywords: ["severe pain", "unbearable pain", "worst pain", "sharp pain", "sudden pain"],
    response:
      "Severe, sudden, or unusual pain needs medical attention. Please contact a clinician or local emergency service, especially if it does not improve."
  },
  {
    keywords: ["fever", "infection", "bad smell", "foul smell"],
    response:
      "Fever, infection signs, or unusual discharge should be checked by a clinician. Please seek medical advice instead of relying on home care."
  },
  {
    keywords: ["pregnant", "pregnancy", "miscarriage"],
    response:
      "Pregnancy-related bleeding, severe pain, or worry about miscarriage should be discussed with a clinician urgently."
  },
  {
    keywords: ["suicide", "self harm", "hurt myself", "end my life"],
    response:
      "I am really sorry you are feeling this. Please contact local emergency services or a trusted person near you right now. You deserve immediate support."
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

export async function getAssistantReply(question, mode, context, options = {}) {
  const trimmed = question.trim();
  const normalized = normalize(trimmed);
  const safetyMatch = findKnowledgeMatch(normalized, safetyKnowledge);

  if (safetyMatch) {
    return {
      source: "safety guidance",
      text: safetyMatch.response
    };
  }

  const localMatch = findKnowledgeMatch(normalized, localKnowledge);
  if (localMatch) {
    return {
      source: "local guidance",
      text: localMatch.response
    };
  }

  if (typeof options.askCloud !== "function") {
    return {
      source: "sign-in needed",
      text:
        "I can answer common wellness questions privately on this device. For a more personal AI response, please sign in with Google first."
    };
  }

  try {
    const remote = await options.askCloud({
      question: trimmed,
      mode,
      context
    });

    return {
      source: remote?.source === "openai" ? "cloud AI" : remote?.source || "cloud AI",
      text: remote?.text || "I could not generate a response right now. Please try again.",
      usage: remote?.usage || null
    };
  } catch (error) {
    return getCloudErrorReply(error);
  }
}

function findKnowledgeMatch(normalizedQuestion, knowledgeBase) {
  return knowledgeBase.find((item) => item.keywords.some((keyword) => normalizedQuestion.includes(normalize(keyword))));
}

function normalize(value) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function getCloudErrorReply(error) {
  const code = error?.code || "";
  const message = error?.message || "";

  if (code.includes("resource-exhausted") || message.includes("Daily AI limit")) {
    return {
      source: "daily limit",
      text: "The cloud AI daily limit is finished for today. You can still ask common questions that are answered privately on this device."
    };
  }

  if (code.includes("unauthenticated")) {
    return {
      source: "sign-in needed",
      text: "Please sign in with Google before using cloud AI."
    };
  }

  if (code.includes("failed-precondition") || message.includes("OPENAI_API_KEY")) {
    return {
      source: "setup needed",
      text: "Cloud AI is almost ready. The secure server API key still needs to be added in Firebase Functions."
    };
  }

  return {
    source: "cloud unavailable",
    text:
      "Cloud AI is not reachable right now. Your private local answers still work for common period and wellness questions."
  };
}
