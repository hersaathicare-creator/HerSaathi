const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const OpenAI = require("openai");

admin.initializeApp();

const openAiApiKey = defineSecret("OPENAI_API_KEY");
const remoteDailyLimit = 5;

const modeInstructions = {
  "Private health guidance": "Give calm, non-diagnostic menstrual and wellness guidance.",
  "Diet & nutrition": "Focus on gentle nutrition, hydration, iron-rich foods, and balanced meals.",
  "Workout expert": "Suggest low-risk movement options that match cycle phase, mood, and symptoms.",
  "Home remedies": "Suggest safe home care such as warmth, hydration, breathing, rest, and gentle stretching.",
  "Record analyser": "Explain patterns from the provided cycle phase, symptoms, and mood only."
};

exports.askHerSaathiAI = onCall(
  {
    region: "asia-south1",
    secrets: [openAiApiKey],
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
    const context = sanitizeContext(request.data?.context);

    if (!question) {
      throw new HttpsError("invalid-argument", "Question is required.");
    }

    const apiKey = openAiApiKey.value();
    if (!apiKey) {
      throw new HttpsError("failed-precondition", "OPENAI_API_KEY is not configured.");
    }

    const usage = await reserveRemoteUsage(uid);

    const client = new OpenAI({ apiKey });
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      instructions: buildSystemInstructions(mode),
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
      max_output_tokens: 420
    });

    return {
      text: response.output_text || "I could not generate a response right now. Please try again.",
      source: "openai",
      usage: {
        date: usage.date,
        count: usage.count,
        limit: remoteDailyLimit
      }
    };
  }
);

async function reserveRemoteUsage(uid) {
  const today = getUsageDateKey();
  const ref = admin.firestore().doc(`users/${uid}/usage/ai-${today}`);

  return admin.firestore().runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const current = snapshot.exists ? Number(snapshot.data().count) || 0 : 0;
    if (current >= remoteDailyLimit) {
      throw new HttpsError("resource-exhausted", "Daily AI limit reached. Come back tomorrow.");
    }

    const next = current + 1;
    transaction.set(
      ref,
      {
        date: today,
        count: next,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      },
      { merge: true }
    );
    return { date: today, count: next };
  });
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

function buildSystemInstructions(mode) {
  const modeInstruction = modeInstructions[mode] || modeInstructions["Private health guidance"];

  return [
    "You are HerSaathi, a warm period and wellness companion.",
    modeInstruction,
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
