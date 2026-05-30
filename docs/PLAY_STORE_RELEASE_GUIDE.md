# HerSaathi Play Store Release Guide

HerSaathi can now build Android APK and AAB files locally with Gradle. EAS cloud builds are not required for release artifacts.

## Current Android Identity

- Package name: `com.hersaathi.app`
- Version name: `1.0.8`
- Version code: `10`
- Target SDK: `35`
- Build tools: `35.0.0`

## Version Management

Google Play requires every uploaded AAB to use a version code higher than all previous uploaded version codes.

Version values are currently stored in:

- `app.json`
- `src/constants/app.js`
- `android/app/build.gradle`

Before every Play upload:

1. Pick the next app version, for example `1.0.9`.
2. Pick a version code higher than every previous Play upload, for example `11`.
3. Run:

```powershell
npm run version:android -- 1.0.9 11
```

The command updates all three required files together.

Example:

```json
"version": "1.0.9",
"android": {
  "versionCode": 11
}
```

## APK Build

Use APKs for direct phone testing:

```powershell
.\build-apk.bat
```

Output:

```text
android\app\build\outputs\apk\release\app-release.apk
dist\HerSaathi-local-release.apk
```

## AAB Build

Use AABs for Google Play Console:

```powershell
.\build-aab.bat
```

Output:

```text
android\app\build\outputs\bundle\release\app-release.aab
dist\HerSaathi-local-release.aab
```

## Signing

Release signing is controlled by:

```text
android\signing\release-signing.properties
```

Required properties:

```properties
HERSAATHI_UPLOAD_STORE_FILE=signing/hersaathi-upload-key.jks
HERSAATHI_UPLOAD_STORE_PASSWORD=your-store-password
HERSAATHI_UPLOAD_KEY_ALIAS=hersaathi-upload
HERSAATHI_UPLOAD_KEY_PASSWORD=your-key-password
```

The real keystore and passwords must never be committed.

## Play Console Compatibility

For an AAB to be accepted:

- Package name must remain `com.hersaathi.app`.
- Version code must be higher than the last uploaded version.
- AAB must be signed with the upload key registered in Play Console.
- Target SDK must meet Google Play requirements.

If previous Play uploads used an EAS-generated upload key, then the local keystore must match that same upload key. Otherwise, request an upload key reset in Play Console or download/import the existing upload keystore before uploading local AABs.

## Validation Commands

Verify APK signing:

```powershell
& "$env:ANDROID_HOME\build-tools\35.0.0\apksigner.bat" verify --verbose android\app\build\outputs\apk\release\app-release.apk
```

Verify AAB signing:

```powershell
jarsigner -verify -verbose -certs android\app\build\outputs\bundle\release\app-release.aab
```
