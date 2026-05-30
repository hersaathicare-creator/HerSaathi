# HerSaathi Android APK Testing

HerSaathi now uses local Android Gradle builds. EAS cloud builds are no longer required for APK or AAB generation.

## 1. Build The APK

Open PowerShell:

```powershell
cd D:\App\HerSaathi
.\build-apk.bat
```

The APK is created at:

```text
dist\HerSaathi-local-release.apk
```

## 2. Get Android SHA Fingerprints

Use the local release keystore fingerprints from `android\signing\README.md`, or run:

```powershell
keytool -list -v -keystore android\signing\hersaathi-upload-key.jks -alias hersaathi-upload
```

## 3. Add Android App In Firebase

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

9. Add SHA-1 fingerprint from the local release keystore.
10. Add SHA-256 fingerprint if Firebase offers the field.
11. Click **Register app**.

## 4. Get The Web Client ID

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

## 5. Build APK Again

Run:

```powershell
.\build-apk.bat
```

Install the new APK on your phone.

## 6. Phone Test Checklist

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
