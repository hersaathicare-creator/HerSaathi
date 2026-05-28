# HerSaathi Phase 3 - Real AI Backend Setup

Phase 3 adds the real AI foundation for HerSaathi.

What is now built:

1. The app still answers common questions locally without any API call.
2. Uncommon or more personal questions go to a secure Firebase Cloud Function.
3. The OpenAI API key stays on the server, not inside the mobile app.
4. Google sign-in is required before cloud AI can be used.
5. Cloud AI is limited to 5 server messages per signed-in user per day.
6. Firestore security rules protect each user's private wellness backup.

Important: do not paste the OpenAI API key into `App.js`, `src/`, `app.json`, or GitHub.

## 1. What You Need Before Deployment

You need these accounts ready:

1. Firebase project: `hersaathi-60899`
2. Expo account: already connected for APK builds
3. OpenAI platform account
4. A payment/billing method for Firebase Blaze plan
5. A payment/billing method or credits for OpenAI API usage

Firebase Cloud Functions normally requires the Firebase Blaze pay-as-you-go plan. You may still stay inside low usage, but Firebase requires billing to deploy/use Cloud Functions.

## 2. Upgrade Firebase To Blaze

Do this only from the official Firebase Console.

1. Open [Firebase Console](https://console.firebase.google.com/).
2. Click the project named `hersaathi-60899`.
3. Look at the bottom-left or left menu for the plan/billing area.
4. Click **Upgrade** or **Modify plan**.
5. Choose **Blaze**.
6. Add/select a Google Cloud billing account.
7. Confirm the upgrade.

If you do not see **Upgrade**, open:

1. Firebase Console
2. Project `hersaathi-60899`
3. Gear icon near **Project Overview**
4. **Usage and billing**
5. **Details & settings**
6. Choose/confirm **Blaze**

## 3. Create The OpenAI API Key

1. Open [OpenAI Platform](https://platform.openai.com/).
2. Sign in with the account you want to use for HerSaathi.
3. Open **Dashboard**.
4. Open **Settings**.
5. Open **Projects**.
6. Create/select a project named:

```text
HerSaathi
```

7. Inside that project, open **API keys**.
8. Click **Create new secret key**.
9. Name it:

```text
HerSaathi Firebase Functions
```

10. Copy the key one time.
11. Keep it private.

Do not send this key in chat. Do not commit it to GitHub.

## 4. Install Firebase CLI Login

Open PowerShell.

Run:

```powershell
cd D:\App\HerSaathi
npx firebase-tools login
```

What to do when it asks:

1. If it opens a browser, choose your Google account.
2. Use the same Google account that owns or can edit Firebase project `hersaathi-60899`.
3. Allow Firebase CLI permissions.
4. Return to PowerShell after the browser says login is complete.

If PowerShell asks whether to install `firebase-tools`, type:

```text
y
```

Then press Enter.

## 5. Install Function Dependencies

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

## 6. Confirm Firebase Project

Run:

```powershell
cd D:\App\HerSaathi
npx firebase-tools use hersaathi-60899
```

If it says the project is selected, continue.

If it asks for a project:

1. Select `hersaathi-60899`.
2. Press Enter.

## 7. Add The OpenAI Key As A Firebase Secret

Run:

```powershell
cd D:\App\HerSaathi
npx firebase-tools functions:secrets:set OPENAI_API_KEY
```

PowerShell will ask for the secret value.

1. Paste the OpenAI API key.
2. Press Enter.
3. Wait until Firebase confirms it saved the secret.

The key will not be written into your app files.

## 8. Deploy Functions And Firestore Rules

Run:

```powershell
cd D:\App\HerSaathi
npx firebase-tools deploy --only functions,firestore:rules
```

During the first deploy, Firebase/Google Cloud may ask to enable APIs. If it asks, choose/confirm yes for required APIs such as:

1. Cloud Functions API
2. Cloud Build API
3. Artifact Registry API
4. Cloud Run API
5. Secret Manager API

Expected successful result:

```text
Deploy complete!
```

## 9. Verify In Firebase Console

Open [Firebase Console](https://console.firebase.google.com/).

Check the function:

1. Open project `hersaathi-60899`.
2. Left menu: **Build**.
3. Click **Functions**.
4. Look for:

```text
askHerSaathiAI
```

5. Confirm region is:

```text
asia-south1
```

Check Firestore rules:

1. Left menu: **Build**.
2. Click **Firestore Database**.
3. Click **Rules**.
4. Confirm rules mention:

```text
/users/{uid}/wellness/{documentId}
/users/{uid}/usage/{documentId}
```

## 10. Test In The App Browser

1. Start or refresh the app at `http://localhost:8082/`.
2. Go to **Profile**.
3. Sign in with Google.
4. Go to **AI**.
5. Ask this common local question:

```text
How to reduce cramps?
```

Expected: it should answer with `local guidance`.

6. Ask an uncommon question, for example:

```text
I feel low energy during ovulation, what should I do today?
```

Expected: it should answer with `cloud AI`.

If it says `setup needed`, the OpenAI secret is not deployed yet.

If it says `sign-in needed`, sign in with Google first.

If it says `daily limit`, the 5 cloud AI requests for today are used.

## 11. Test On Android APK

After function deployment succeeds:

1. Build a fresh APK:

```powershell
cd D:\App\HerSaathi
npm run build:android:apk
```

2. Open the EAS build link.
3. Download/install the APK on your Android phone.
4. Open HerSaathi.
5. Go to **Profile**.
6. Tap **Sign in with Google**.
7. Go to **AI**.
8. Ask `How to reduce cramps?`
9. Confirm local response works.
10. Ask an uncommon personal wellness question.
11. Confirm cloud AI response works.

## 12. What Not To Do

Do not:

1. Put OpenAI API key in mobile app code.
2. Paste OpenAI API key into GitHub.
3. Share OpenAI API key in screenshots.
4. Make Firestore rules public.
5. Turn off Google sign-in requirement for cloud AI.

## 13. Troubleshooting

`Please sign in before using cloud AI.`

Sign in with Google in the Profile screen, then try again.

`OPENAI_API_KEY is not configured.`

Run:

```powershell
npx firebase-tools functions:secrets:set OPENAI_API_KEY
npx firebase-tools deploy --only functions
```

`Daily AI limit reached. Come back tomorrow.`

This is expected after 5 cloud AI messages for the signed-in user that day.

`PERMISSION_DENIED` during upload/download.

Deploy Firestore rules:

```powershell
npx firebase-tools deploy --only firestore:rules
```

`DEVELOPER_ERROR` during Android Google sign-in.

Check these in Firebase:

1. Android package must be `com.hersaathi.app`.
2. EAS SHA-1 must be added.
3. EAS SHA-256 must be added.
4. `src/constants/app.js` must contain the Web client ID.

## 14. Phase 3 Completion Checklist

Phase 3 is complete when all of these are true:

1. `npm run lint` passes inside `functions`.
2. `npx firebase-tools deploy --only functions,firestore:rules` succeeds.
3. Firebase Console shows `askHerSaathiAI`.
4. Firestore rules are deployed.
5. Local AI answers common questions without cloud.
6. Signed-in users can get cloud AI answers for uncommon questions.
7. Android APK Google login still works.
8. Android APK cloud AI works on a real phone.
