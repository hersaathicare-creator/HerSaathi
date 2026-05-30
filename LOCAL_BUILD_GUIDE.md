# HerSaathi Local Build Guide

This guide builds HerSaathi APK and AAB files on a Windows PC without EAS cloud builds.

## Step 1: Install Android Studio

1. Open the Android Studio download page.
2. Download Android Studio for Windows.
3. Run the installer.
4. Keep the default Android SDK options selected.
5. Finish installation and open Android Studio once.

## Step 2: Install SDK

1. Open Android Studio.
2. Go to `More Actions > SDK Manager`.
3. Open the `SDK Platforms` tab.
4. Install Android API `35`.
5. Open the `SDK Tools` tab.
6. Install:
   - Android SDK Build-Tools
   - Android SDK Platform-Tools
   - Android SDK Command-line Tools
7. Confirm `ANDROID_HOME` points to your SDK folder, usually:

```text
C:\Users\LENOVO\AppData\Local\Android\Sdk
```

## Step 3: Install JDK 17

1. Install Java JDK 17.
2. Open PowerShell.
3. Check:

```powershell
java -version
```

The version should show Java 17.

## Step 4: Generate Keystore

Create a release upload key:

```bat
keytool -genkeypair -v -storetype JKS -keystore android\signing\hersaathi-upload-key.jks -alias hersaathi-upload -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=HerSaathi, OU=Release, O=HerSaathi, L=Kolkata, ST=West Bengal, C=IN"
```

Then copy:

```text
android\signing\release-signing.properties.example
```

to:

```text
android\signing\release-signing.properties
```

Fill in the real passwords. Do not commit this file.

## Step 5: Build APK

Double-click:

```text
build-apk.bat
```

or run:

```powershell
npm run build:android:local:apk
```

Output:

```text
android\app\build\outputs\apk\release\app-release.apk
dist\HerSaathi-local-release.apk
```

## Step 6: Build AAB

Double-click:

```text
build-aab.bat
```

or run:

```powershell
npm run build:android:local:aab
```

Output:

```text
android\app\build\outputs\bundle\release\app-release.aab
dist\HerSaathi-local-release.aab
```

## Step 7: Increase Version Before Play Upload

Before every new Google Play upload, increase the version code:

```powershell
npm run version:android -- 1.0.9 11
```

Use a higher number than the previous Play Console upload. Google Play rejects repeated version codes.

## Step 8: Upload To Google Play Console

1. Open Play Console.
2. Open HerSaathi.
3. Go to `Test and release`.
4. Choose the target track, usually `Internal testing` first.
5. Create a new release.
6. Upload `android\app\build\outputs\bundle\release\app-release.aab`.
7. Add release notes.
8. Review and roll out.

If Play Console says the signing key is wrong, use the existing Play upload key or request an upload key reset in Play Console.
