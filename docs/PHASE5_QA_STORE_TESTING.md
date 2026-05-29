# HerSaathi Phase 5 - QA, Hardening, Store Testing Prep

Phase 5 prepares HerSaathi for real closed testing and store-readiness checks.

Billing-dependent work remains intentionally deferred:

1. Firebase Blaze billing
2. Gemini billing/API activation
3. OpenAI billing/API activation
4. Real subscription/payment provider

## What Was Built

1. Graceful app error fallback screen.
2. In-app **Testing & Store Prep** center.
3. Tester diagnostics summary.
4. Email diagnostics action.
5. QA checklist grouped by smoke test, account/data, notifications, AI/subscription, and store review.
6. Clear list of deferred production items.
7. Premium button now explains payments are pending instead of doing nothing.
8. Notification text cleaned for production.

## Official References

Use these as the source of truth when publishing:

1. Expo production builds: https://docs.expo.dev/deploy/build-project/
2. Expo Android production build: https://docs.expo.dev/tutorial/eas/android-production-build/
3. Google Play internal/open/closed testing: https://support.google.com/googleplay/android-developer/answer/9845334
4. Google Play Data safety: https://support.google.com/googleplay/android-developer/answer/10787469

## Local Verification Commands

Run these before every important build:

```powershell
cd D:\App\HerSaathi
npm run lint --prefix functions
npx expo install --check
npx expo-doctor
npx expo export --platform web --output-dir .expo-phase5-web-export-test
npx expo export --platform android --output-dir .expo-phase5-android-export-test
```

After export checks, remove the temporary folders:

```powershell
Remove-Item -Recurse -Force .expo-phase5-web-export-test
Remove-Item -Recurse -Force .expo-phase5-android-export-test
```

## APK Closed Testing Flow

Use this while billing is still pending:

```powershell
cd D:\App\HerSaathi
npm run build:android:apk
```

Test the APK on a real Android phone:

1. Fresh install opens splash.
2. Onboarding completes.
3. Home screen appears.
4. Daily check-in saves once per day.
5. Track period entry saves, edits, deletes.
6. Symptom log saves, edits, deletes.
7. Relief Mode works without AI.
8. Care screen opens.
9. Saathi local AI answer works.
10. Pragya stays locked for free user.
11. Reports open.
12. Profile opens.
13. Legal & Safety opens.
14. Data Management export/restore/reset works.
15. Notifications request permission on device.

## Production AAB Flow

When you are ready for Play Console internal testing, build an Android App Bundle:

```powershell
cd D:\App\HerSaathi
npm run build:android:production
```

This uses the `production` profile in `eas.json`, which builds an AAB.

Before uploading a new AAB, increase:

```json
"android": {
  "versionCode": 4
}
```

Every Play Store upload needs a higher version code than the previous upload.

## Play Console Prep Checklist

Before internal/closed testing:

1. App name: `HerSaathi`
2. Package name: `com.hersaathi.app`
3. Official email: `her.saathi.care@gmail.com`
4. Privacy Policy URL hosted publicly: `https://hersaathi-60899.web.app/privacy-policy`.
5. Terms URL hosted publicly: `https://hersaathi-60899.web.app/terms-of-use`.
6. App icon and feature graphic ready.
7. Phone screenshots ready.
8. App category selected.
9. Content rating completed.
10. Data safety form completed.
11. Internal testers added.
12. AAB uploaded to internal testing track.

## Data Safety Draft Notes

The Google Play Data safety form must match the real production behavior at launch.

Current expected disclosures once cloud sync and AI are active:

1. Health and fitness data: period entries, symptom logs, check-ins.
2. Personal info: email/display name from Google sign-in.
3. User content: optional AI chat history if the user opts into sync.
4. App activity or diagnostics: only if crash reporting/analytics are added later.
5. Data deletion: app has local delete, cloud backup delete, and support deletion request path.

Do not submit the Data safety form until final services are decided.

## Tester Report Template

Ask testers to send:

```text
Phone model:
Android version:
Build version:
What screen:
What action:
What happened:
Screenshot/video:
Tester diagnostics from Profile > Testing & Store Prep:
```

## Phase 5 Completion Checklist

Phase 5 is complete when:

1. App error fallback is present.
2. Testing & Store Prep opens from Profile.
3. Diagnostics can be viewed and emailed.
4. Premium button clearly says setup is pending.
5. Notification copy is clean.
6. Web export passes.
7. Android export passes.
8. Browser UI check passes.
9. Phase 5 changes are committed and pushed.
