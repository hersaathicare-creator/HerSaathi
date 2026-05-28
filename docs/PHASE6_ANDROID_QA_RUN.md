# HerSaathi Phase 6 - Real Android APK QA Run

This is the phone-testing round for the latest APK build.

## QA Build Target

```text
App version: 1.0.1
Android versionCode: 3
Package: com.hersaathi.app
Build profile: preview
Build type: APK
Official email: her.saathi.care@gmail.com
```

Billing-dependent services are still intentionally deferred:

1. Firebase Blaze billing
2. Gemini billing/API key activation
3. OpenAI billing/API key activation
4. Real payments/subscriptions

## Build Command

Run from the project folder:

```powershell
cd D:\App\HerSaathi
npx eas-cli build --platform android --profile preview --non-interactive
```

EAS build result:

```text
EAS build URL: https://expo.dev/accounts/sanjeevmazumder/projects/hersaathi/builds/c031e6dc-b94f-4f0a-b0bb-e5075d40a610
APK download URL: https://expo.dev/artifacts/eas/pJvYGhodACvuzypgy1cgUU.apk
Build result: FINISHED
Completed at: 2026-05-28 17:15:24 UTC
```

## Install On Android Phone

1. Open the EAS build URL.
2. Download the APK.
3. If Android blocks install, tap **Settings**.
4. Allow install from this source.
5. Install HerSaathi.
6. Open HerSaathi.

If an older HerSaathi APK is already installed and installation fails:

1. Export/backup any local test data if needed.
2. Uninstall the old HerSaathi app.
3. Install the new APK again.

## Fresh Install Test

Mark each item:

```text
[ ] App installs successfully
[ ] Splash screen opens
[ ] Logo displays correctly
[ ] App reaches onboarding
[ ] Welcome screen text is readable
[ ] Age group screen works
[ ] Cycle setup accepts valid date/length/duration
[ ] Privacy/terms consent screen appears
[ ] Continue completes onboarding
[ ] Home screen opens after onboarding
```

## Core App Test

```text
[ ] Home shows greeting
[ ] Cycle card shows day/phase/countdown
[ ] Daily check-in saves Good
[ ] Daily check-in blocks second check-in same day
[ ] Quick action opens Log Period
[ ] Quick action opens Log Symptoms
[ ] Relief Mode opens
[ ] Ask AI opens
[ ] Bottom navigation works across all tabs
```

## Tracking Test

```text
[ ] Add period entry
[ ] Edit period entry
[ ] Delete period entry
[ ] Add symptom log
[ ] Edit symptom log
[ ] Delete symptom log
[ ] Invalid/future dates show validation errors
```

## AI Test While Billing Is Deferred

Expected behavior before cloud deploy:

```text
[ ] Saathi answers "How to reduce cramps?" locally
[ ] Saathi shows sign-in/setup message for uncommon cloud question if backend not deployed
[ ] Pragya appears as Premium character
[ ] Pragya remains locked for free user
[ ] Safety guidance appears for severe pain/heavy bleeding keywords
```

Do not expect Gemini/OpenAI cloud answers until billing, secrets, and deploy are complete.

## Profile, Legal, And Data Test

```text
[ ] Profile screen opens
[ ] Official contact email is visible
[ ] Legal & Safety opens
[ ] Privacy Policy is readable
[ ] Terms of Use is readable
[ ] Medical & AI Safety is readable
[ ] Request Deletion opens email request or shows support email
[ ] Data Management opens
[ ] Export local data generates JSON
[ ] Invalid import is rejected
[ ] Delete local data asks for confirmation
[ ] Testing & Store Prep opens
[ ] Tester diagnostics details show app version 1.0.1 and versionCode 3
```

## Google Login And Sync Test

Run this only if Firebase auth is ready for the APK:

```text
[ ] Google sign-in opens account picker
[ ] Correct Google account can sign in
[ ] Check Session shows active Firebase session
[ ] Cloud sync toggle requires signed-in user
```

Run this only after Firestore billing/rules/backend are deployed:

```text
[ ] Upload selected wellness data succeeds
[ ] Download selected wellness data succeeds
[ ] Delete cloud backup succeeds
```

## Notifications Test

Run on real Android phone:

```text
[ ] Notification permission prompt appears
[ ] Allow permission
[ ] Notifications toggle stays enabled
[ ] Turning notifications off updates status
[ ] App does not crash if permission is denied
```

## Reports And QA Center

```text
[ ] Reports open from Profile
[ ] Reports reflect new period/symptom/check-in data
[ ] Testing & Store Prep lists deferred billing items
[ ] Email Diagnostics opens mail app or shows support fallback
```

## Issue Log

Use one block per issue:

```text
Issue ID:
Tester:
Phone model:
Android version:
App version/code:
Screen:
Steps:
Expected:
Actual:
Screenshot/video:
Severity: Critical / High / Medium / Low
Status: Open / Fixed / Retest
```

## Pass Criteria

Phase 6 passes when:

1. APK installs on a real phone.
2. All non-billing tests pass.
3. No app crashes occur during the checklist.
4. Any failed items are logged with screenshots.
5. Critical/high issues are fixed before the next APK.
