# HerSaathi Phase 7 - Store Listing & Public Policy Prep

Phase 7 prepares the publishing package for Google Play review and closed testing.

Billing-dependent services remain intentionally deferred:

1. Firebase Blaze billing and Cloud Functions deploy
2. Gemini billing/API key activation
3. OpenAI billing/API key activation
4. Real subscription/payment provider

## What Was Built

1. Google Play listing copy pack.
2. Draft Data Safety form answers.
3. Public HTML pages for Privacy Policy, Terms of Use, Medical & AI Safety, and Data Deletion.
4. Screenshot plan for Play Store assets.
5. Tester feedback form.
6. Store submission checklist.
7. Firebase Hosting configuration for public policy pages.
8. App config URLs wired to the public policy pages.

## Official References

Use Google Play as the source of truth:

1. Data safety form: https://support.google.com/googleplay/android-developer/answer/10787469
2. Internal/open/closed testing: https://support.google.com/googleplay/android-developer/answer/9845334
3. Preview assets: https://support.google.com/googleplay/android-developer/answer/9866151
4. User Data policy: https://support.google.com/googleplay/android-developer/answer/10144311

## Files Added

```text
docs/store/PLAY_STORE_LISTING.md
docs/store/DATA_SAFETY_DRAFT.md
docs/store/SCREENSHOT_PLAN.md
docs/store/TESTER_FEEDBACK_FORM.md
docs/store/STORE_RELEASE_CHECKLIST.md
docs/store/public/index.html
docs/store/public/privacy-policy.html
docs/store/public/terms-of-use.html
docs/store/public/medical-ai-safety.html
docs/store/public/data-deletion.html
```

## Hosted Public Policy Pages

The files in:

```text
docs/store/public/
```

are configured for Firebase Hosting.

Current public URLs:

```text
Website: https://hersaathi-60899.web.app
Privacy Policy: https://hersaathi-60899.web.app/privacy-policy
Terms of Use: https://hersaathi-60899.web.app/terms-of-use
Medical & AI Safety: https://hersaathi-60899.web.app/medical-ai-safety
Data Deletion: https://hersaathi-60899.web.app/data-deletion
```

Google Play needs a working public Privacy Policy URL. The URL must not be private, broken, or hidden behind login.

## What To Do In Play Console Later

1. Create/open app `HerSaathi`.
2. Package name: `com.hersaathi.app`.
3. Add official contact email: `her.saathi.care@gmail.com`.
4. Paste short description from `PLAY_STORE_LISTING.md`.
5. Paste full description from `PLAY_STORE_LISTING.md`.
6. Upload app icon and feature graphic.
7. Upload phone screenshots.
8. Add hosted Privacy Policy URL: `https://hersaathi-60899.web.app/privacy-policy`.
9. Complete Data Safety form using `DATA_SAFETY_DRAFT.md`.
10. Complete Content Rating.
11. Complete Target Audience.
12. Upload AAB to internal/closed testing.

## Phase 7 Completion Checklist

Phase 7 is complete when:

1. Store listing copy is prepared.
2. Public legal HTML pages exist locally.
3. Data Safety draft exists.
4. Screenshot plan exists.
5. Tester feedback form exists.
6. Store release checklist exists.
7. Docs are committed and pushed.
8. Public policy URLs are hosted and reachable.

Phase 7 does not require billing, cloud deploy, or Play Console submission.
