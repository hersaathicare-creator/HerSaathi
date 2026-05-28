const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const OpenAI = require("openai");

admin.initializeApp();

const geminiApiKey = defineSecret("GEMINI_API_KEY");
const openAiApiKey = defineSecret("OPENAI_API_KEY");
const freeDailyLimit = 5;
const premiumDailyLimit = 25;

const characters = {
  saathi: {
    key: "saathi",
    name: "Saathi",
    provider: "gemini",
    role: "free companion for daily care, wellness guidance, and record references"
  },
  pragya: {
    key: "pragya",
    name: "Pragya",
    provider: "openai",
    role: "premium advanced companion for deeper actions and structured plans"
  }
};

const advancedModes = ["Advanced actions", "Advanced care plan"];

const modeInstructions = {
  "Private health guidance": "Give calm, non-diagnostic menstrual and wellness guidance.",
  "Diet & nutrition": "Focus on gentle nutrition, hydration, iron-rich foods, and balanced meals.",
  "Workout expert": "Suggest low-risk movement options that match cycle phase, mood, and symptoms.",
  "Home remedies": "Suggest safe home care such as warmth, hydration, breathing, rest, and gentle stretching.",
  "Record analyser": "Explain patterns from the provided cycle phase, symptoms, and mood only.",
  "Advanced actions": "Create a concise, structured action plan with priority, timing, and follow-up notes."
};

exports.askHerSaathiAI = onCall(
  {
    region: "asia-south1",
    secrets: [geminiApiKey, openAiApiKey],
    enforceAppCheck: false,
    timeoutSeconds: 45,
    memory: "256MiB"
  },
  async (request) => {
    if (!request.auth?.uid) {
      throw new HttpsError("unauthenticated", "Please sign in before using cloud AI.");
    }

    const uid = request.auth.uid;
    const question = cleanString(request.data?.question, 600);
    const mode = cleanString(request.data?.mode, 80) || "Private health guidance";
    const requestedCharacter = cleanString(request.data?.characterKey, 40);
    const context = sanitizeContext(request.data?.context);
    const character = resolveCharacter(requestedCharacter, mode);

    if (!question) {
      throw new HttpsError("invalid-argument", "Question is required.");
    }

    const subscriptionTier = await getSubscriptionTier(uid, request.auth.token);
    if (character.key === "pragya" && subscriptionTier !== "premium") {
      throw new HttpsError("permission-denied", "Pragya advanced AI is available with Premium.");
    }

    const usage = await reserveRemoteUsage(uid, character.key, character.key === "pragya" ? premiumDailyLimit : freeDailyLimit);

    if (character.provider === "openai") {
      return askOpenAI({ question, mode, context, character, usage });
    }

    return askGemini({ question, mode, context, character, usage });
  }
);

async function askGemini({ question, mode, context, character, usage }) {
  const apiKey = geminiApiKey.value();
  if (!apiKey) {
    throw new HttpsError("failed-precondition", "GEMINI_API_KEY is not configured.");
  }

  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: buildSystemInstructions(mode, character) }]
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: JSON.stringify({
                question,
                mode,
                context
              })
            }
          ]
        }
      ],
      generationConfig: {
        maxOutputTokens: 420,
        temperature: 0.55
      }
    })
  });

  if (!response.ok) {
    const details = await response.text();
    throw new HttpsError("unavailable", `Gemini request failed: ${details.slice(0, 180)}`);
  }

  const data = await response.json();
  const text = extractGeminiText(data);

  return buildAiResponse({ text, source: "gemini", character, usage });
}

async function askOpenAI({ question, mode, context, character, usage }) {
  const apiKey = openAiApiKey.value();
  if (!apiKey) {
    throw new HttpsError("failed-precondition", "OPENAI_API_KEY is not configured.");
  }

  const client = new OpenAI({ apiKey });
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    instructions: buildSystemInstructions(mode, character),
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: JSON.stringify({
              question,
              mode,
              context
            })
          }
        ]
      }
    ],
    max_output_tokens: 520
  });

  return buildAiResponse({
    text: response.output_text || "I could not generate a response right now. Please try again.",
    source: "openai",
    character,
    usage
  });
}

async function reserveRemoteUsage(uid, characterKey, limit) {
  const today = getUsageDateKey();
  const ref = admin.firestore().doc(`users/${uid}/usage/ai-${characterKey}-${today}`);

  return admin.firestore().runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const current = snapshot.exists ? Number(snapshot.data().count) || 0 : 0;
    if (current >= limit) {
      throw new HttpsError("resource-exhausted", "Daily AI limit reached. Come back tomorrow.");
    }

    const next = current + 1;
    transaction.set(
      ref,
      {
        date: today,
        characterKey,
        count: next,
        limit,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      },
      { merge: true }
    );
    return { date: today, count: next, limit };
  });
}

async function getSubscriptionTier(uid, token = {}) {
  if (token.subscription === "premium" || token.premium === true) {
    return "premium";
  }

  const snapshot = await admin.firestore().doc(`users/${uid}/entitlements/current`).get();
  if (!snapshot.exists) return "free";

  const data = snapshot.data() || {};
  if (data.tier === "premium" && data.status !== "expired" && data.active !== false) {
    return "premium";
  }

  return "free";
}

function resolveCharacter(requestedCharacter, mode) {
  if (requestedCharacter === "pragya" || advancedModes.includes(mode)) {
    return characters.pragya;
  }

  return characters.saathi;
}

function buildAiResponse({ text, source, character, usage }) {
  return {
    text: text || "I could not generate a response right now. Please try again.",
    source,
    characterKey: character.key,
    characterName: character.name,
    usage: {
      date: usage.date,
      count: usage.count,
      limit: usage.limit
    }
  };
}

function extractGeminiText(data) {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  return parts.map((part) => part.text || "").join("\n").trim();
}

function getUsageDateKey() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function buildSystemInstructions(mode, character) {
  const modeInstruction = modeInstructions[mode] || modeInstructions["Private health guidance"];

  return [
    `You are ${character.name}, HerSaathi's ${character.role}.`,
    modeInstruction,
    character.key === "saathi"
      ? "You are the familiar free companion. Be warm, simple, and suitable for daily support and record references."
      : "You are the premium advanced companion. Give more structured, action-focused support while staying concise.",
    "You are not a doctor and must not diagnose, prescribe medicine, or replace professional care.",
    "Always be concise, emotionally safe, and practical.",
    "Use only the provided context: cycle phase, recent symptoms, and mood.",
    "If severe pain, very heavy bleeding, fainting, fever, pregnancy concerns, or unusual symptoms appear, advise seeking medical care.",
    "Do not ask for unnecessary personal data.",
    "End with one small next step."
  ].join("\n");
}

function sanitizeContext(context = {}) {
  const recentSymptoms = Array.isArray(context.recentSymptoms)
    ? context.recentSymptoms.map((item) => cleanString(item, 40)).filter(Boolean).slice(0, 8)
    : [];

  return {
    phase: cleanString(context.phase, 80) || "Unknown",
    recentSymptoms,
    mood: cleanString(context.mood, 40) || null
  };
}

function cleanString(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}
