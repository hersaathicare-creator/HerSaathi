# HerSaathi Android APK Testing

This guide is for the first real phone test build.

## 1. Commit Current Work

Open PowerShell:

```powershell
cd D:\App\HerSaathi
git status
git add .
git commit -m "Prepare Android APK testing and native Google auth"
git push
```

## 2. Sign In To Expo

Run:

```powershell
npx eas-cli login
```

If you do not have an Expo account:

1. Go to https://expo.dev/signup
2. Create an account.
3. Return to PowerShell.
4. Run `npx eas login` again.

## 3. Connect The Project To EAS

Run:

```powershell
npx eas-cli init
```

When Expo asks to create or link a project:

1. Choose **Create a new project** if this app is not already in Expo.
2. Project name: `HerSaathi`
3. Accept the default values.

This may update `app.json` with an EAS project id.

## 4. Build The First APK

Run:

```powershell
npm run build:android:apk
```

When EAS asks about Android credentials:

1. Choose **Generate new keystore**.
2. Let Expo manage the credentials.
3. Wait for the build to finish.

The output should be an `.apk` link that can be installed on an Android phone.

## 5. Get Android SHA Fingerprints

After the first EAS build has created Android credentials, run:

```powershell
npx eas-cli credentials --platform android
```

Then:

1. Select the HerSaathi project.
2. Select Android.
3. Select package `com.hersaathi.app`.
4. Open the keystore/certificate details.
5. Copy the SHA-1 fingerprint.
6. Copy the SHA-256 fingerprint if shown.

## 6. Add Android App In Firebase

Open Firebase Console:

1. Go to https://console.firebase.google.com/
2. Open project `HerSaathi`.
3. Click the gear icon near **Project Overview**.
4. Click **Project settings**.
5. Scroll to **Your apps**.
6. Click the Android icon.
7. Android package name:

```text
com.hersaathi.app
```

8. App nickname:

```text
HerSaathi Android
```

9. Add SHA-1 fingerprint from EAS.
10. Add SHA-256 fingerprint if Firebase offers the field.
11. Click **Register app**.

## 7. Get The Web Client ID

In Firebase / Google Cloud:

1. Open Firebase project settings.
2. Go to **Service accounts** or click through to Google Cloud credentials.
3. Find the OAuth 2.0 **Web client ID** used by Firebase Authentication.
4. It usually ends with:

```text
.apps.googleusercontent.com
```

5. Copy it.
6. Open `src/constants/app.js`.
7. Paste it into:

```js
androidGoogleWebClientId: "PASTE_WEB_CLIENT_ID_HERE"
```

Do not paste secrets or private keys.

## 8. Build APK Again

Run:

```powershell
npm run build:android:apk
```

Install the new APK on your phone.

## 9. Phone Test Checklist

On the phone:

1. Open HerSaathi.
2. Go to **Profile**.
3. Tap **Sign in with Google**.
4. Pick the Google account.
5. Turn on **Firestore cloud sync**.
6. Tap **Upload**.
7. Tap **Download**.
8. Confirm no errors appear.

If Google sign-in says `DEVELOPER_ERROR`, the Firebase Android SHA fingerprint or package name is wrong.
