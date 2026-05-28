# HerSaathi Phase 3 - Hybrid AI Backend Setup

Phase 3 now uses this product system:

```text
Free plan     = Static local answers + Gemini cloud AI with Saathi
Premium plan  = Saathi remains for records/history + Pragya unlocks GPT-4.1-mini advanced actions
```

The goal is that free users still feel cared for, while paid users feel a real upgrade because a new advanced character appears.

## 1. What Is Built

Built in the app:

1. `Saathi` is the familiar free companion.
2. Saathi answers common questions locally without cloud AI.
3. Saathi uses Gemini for uncommon free-plan cloud questions.
4. `Pragya` is the Premium advanced companion.
5. Pragya uses GPT-4.1-mini for advanced actions only.
6. Pragya appears in the AI screen but is locked while the user is on the free plan.
7. The app still sends only safe AI context:

```json
{
  "phase": "PMS",
  "recentSymptoms": ["cramps"],
  "mood": "sad"
}
```

Built in the backend:

1. Firebase Callable Function: `askHerSaathiAI`
2. Gemini route for Saathi.
3. OpenAI route for Pragya.
4. Server-side daily limits.
5. Server-side Premium entitlement check.
6. Firebase Secret Manager for API keys.
7. Firestore rules for private user data.

Important: never paste Gemini or OpenAI API keys into `App.js`, `src/`, `app.json`, screenshots, chat, or GitHub.

## 2. Character Strategy

### Saathi

Saathi is the existing companion.

Use Saathi for:

1. Static local answers.
2. Gemini free-plan AI.
3. Daily support.
4. Record/history reference.
5. Reports and pattern explanation.

### Pragya

Pragya is the Premium advanced companion.

Use Pragya for:

1. Advanced actions.
2. Structured care plans.
3. Deeper personalized guidance.
4. Future paid features.

Pragya should not replace Saathi. Saathi stays emotionally familiar and useful.

## 3. What You Need Before Deployment

You need:

1. Firebase project: `hersaathi-60899`
2. Firebase Blaze plan
3. Google AI Studio / Gemini API key
4. OpenAI API key
5. Firebase CLI login

Firebase Cloud Functions normally requires the Firebase Blaze pay-as-you-go plan.

## 4. Upgrade Firebase To Blaze

1. Open [Firebase Console](https://console.firebase.google.com/).
2. Click project `hersaathi-60899`.
3. Click the gear icon near **Project Overview**.
4. Click **Usage and billing**.
5. Click **Details & settings**.
6. Click **Upgrade** or **Modify plan**.
7. Choose **Blaze**.
8. Add/select a Google Cloud billing account.
9. Confirm.

## 5. Create Gemini API Key

1. Open [Google AI Studio](https://aistudio.google.com/).
2. Sign in with the Google account for HerSaathi.
3. Click **Get API key**.
4. Click **Create API key**.
5. Select/create the Google Cloud project connected to HerSaathi if shown.
6. Copy the key.
7. Keep it private.

Recommended secret name:

```text
GEMINI_API_KEY
```

## 6. Create OpenAI API Key

1. Open [OpenAI Platform](https://platform.openai.com/).
2. Sign in.
3. Open **Dashboard**.
4. Open **Settings**.
5. Open **Projects**.
6. Create/select project:

```text
HerSaathi
```

7. Open **API keys**.
8. Click **Create new secret key**.
9. Name it:

```text
HerSaathi Firebase Functions
```

10. Copy the key one time.
11. Keep it private.

Recommended secret name:

```text
OPENAI_API_KEY
```

## 7. Login To Firebase CLI

Open PowerShell:

```powershell
cd D:\App\HerSaathi
npx firebase-tools login
```

When the browser opens:

1. Choose the Google account that owns Firebase project `hersaathi-60899`.
2. Allow Firebase CLI permissions.
3. Return to PowerShell.

If PowerShell asks to install `firebase-tools`, type:

```text
y
```

Then press Enter.

## 8. Install Function Dependencies

Run:

```powershell
cd D:\App\HerSaathi\functions
npm install
npm run lint
```

Expected result:

```text
node --check index.js
```

No syntax error should appear.

## 9. Select Firebase Project

Run:

```powershell
cd D:\App\HerSaathi
npx firebase-tools use hersaathi-60899
```

If it asks which project to use:

1. Select `hersaathi-60899`.
2. Press Enter.

## 10. Add Gemini Secret

Run:

```powershell
cd D:\App\HerSaathi
npx firebase-tools functions:secrets:set GEMINI_API_KEY
```

Then:

1. Paste the Gemini API key.
2. Press Enter.
3. Wait for Firebase to confirm.

## 11. Add OpenAI Secret

Run:

```powershell
cd D:\App\HerSaathi
npx firebase-tools functions:secrets:set OPENAI_API_KEY
```

Then:

1. Paste the OpenAI API key.
2. Press Enter.
3. Wait for Firebase to confirm.

## 12. Deploy Functions And Firestore Rules

Run:

```powershell
cd D:\App\HerSaathi
npx firebase-tools deploy --only functions,firestore:rules
```

If Firebase asks to enable APIs, allow them. Common APIs include:

1. Cloud Functions API
2. Cloud Build API
3. Artifact Registry API
4. Cloud Run API
5. Secret Manager API

Expected result:

```text
Deploy complete!
```

## 13. Verify In Firebase Console

Check function:

1. Open [Firebase Console](https://console.firebase.google.com/).
2. Open project `hersaathi-60899`.
3. Left menu: **Build**.
4. Click **Functions**.
5. Confirm this function exists:

```text
askHerSaathiAI
```

6. Confirm region:

```text
asia-south1
```

Check Firestore rules:

1. Left menu: **Build**.
2. Click **Firestore Database**.
3. Click **Rules**.
4. Confirm rules include:

```text
/users/{uid}/wellness/{documentId}
/users/{uid}/usage/{documentId}
/users/{uid}/entitlements/{documentId}
```

## 14. Free Plan Test

In the app:

1. Go to **Profile**.
2. Sign in with Google.
3. Go to **AI**.
4. Keep a normal mode selected, for example **Private health guidance**.
5. Confirm Saathi is the active companion.
6. Ask:

```text
How to reduce cramps?
```

Expected:

```text
Saathi - local guidance
```

This means no Gemini API call was used.

Then ask an uncommon question:

```text
I feel low energy during ovulation, what should I do today?
```

Expected:

```text
Saathi - Gemini
```

This means free cloud AI is working.

## 15. Premium Pragya Test

Right now the app has no real payment system. So free users will see Pragya, but Pragya stays locked.

To test Premium manually later, create an entitlement document in Firestore.

Firebase Console steps:

1. Open Firebase Console.
2. Open project `hersaathi-60899`.
3. Left menu: **Build**.
4. Click **Firestore Database**.
5. Click **Start collection** only if needed.
6. Go to this path:

```text
users/{USER_UID}/entitlements/current
```

Replace `{USER_UID}` with the signed-in user's Firebase UID.

Add fields:

```text
tier: premium
status: active
active: true
```

Then in the app:

1. Sign out and sign in again if needed.
2. Go to **AI**.
3. Select **Advanced actions**.
4. Ask an advanced question.

Expected:

```text
Pragya - GPT-4.1-mini
```

Do not let users write this entitlement from the app. Only your backend/payment system should create it.

## 16. Android APK Test

After deployment succeeds:

```powershell
cd D:\App\HerSaathi
npm run build:android:apk
```

On Android phone:

1. Install the APK.
2. Open HerSaathi.
3. Go to **Profile**.
4. Sign in with Google.
5. Go to **AI**.
6. Test local Saathi question.
7. Test Gemini Saathi question.
8. Confirm Pragya is locked on free plan.
9. After a Premium entitlement exists, test Pragya advanced action.

## 17. Daily Limits

Current server limits:

```text
Saathi cloud AI  = 5 Gemini messages per signed-in user per day
Pragya advanced  = 25 GPT-4.1-mini messages per premium user per day
```

Static local answers happen before cloud AI.

Default models:

```text
Saathi Gemini model = gemini-3.5-flash
Pragya OpenAI model = gpt-4.1-mini
```

These can be changed later with backend environment variables:

```text
GEMINI_MODEL
OPENAI_MODEL
```

## 18. Troubleshooting

`GEMINI_API_KEY is not configured.`

Run:

```powershell
npx firebase-tools functions:secrets:set GEMINI_API_KEY
npx firebase-tools deploy --only functions
```

`OPENAI_API_KEY is not configured.`

Run:

```powershell
npx firebase-tools functions:secrets:set OPENAI_API_KEY
npx firebase-tools deploy --only functions
```

`Pragya advanced AI is available with Premium.`

The user does not have a Premium entitlement yet.

`Please sign in before using cloud AI.`

Sign in with Google in the Profile screen.

`Daily AI limit reached. Come back tomorrow.`

The signed-in user has used today's server cloud AI allowance.

`PERMISSION_DENIED` during upload/download.

Deploy Firestore rules:

```powershell
npx firebase-tools deploy --only firestore:rules
```

`DEVELOPER_ERROR` during Android Google sign-in.

Check:

1. Android package name is `com.hersaathi.app`.
2. EAS SHA-1 is added in Firebase Android app.
3. EAS SHA-256 is added in Firebase Android app.
4. `src/constants/app.js` contains the Web client ID.

## 19. Phase 3 Completion Checklist

Phase 3 is complete when:

1. `npm run lint` passes inside `functions`.
2. `npx expo-doctor` passes.
3. `npx firebase-tools deploy --only functions,firestore:rules` succeeds.
4. Saathi local static answers work.
5. Saathi Gemini cloud answers work after Google sign-in.
6. Pragya is locked for free users.
7. Pragya GPT-4.1-mini works only after Premium entitlement.
8. Android APK Google login still works.
9. Android APK AI tests work on a real phone.
