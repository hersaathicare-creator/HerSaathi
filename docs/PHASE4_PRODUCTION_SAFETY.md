# HerSaathi Phase 4 - Production Safety Foundation

Phase 4 prepares the app for real tester and store-review expectations before billing-dependent services are activated.

## Built In This Phase

1. In-app Legal & Safety Center.
2. Draft Privacy Policy, Terms of Use, and Medical & AI Safety content.
3. Versioned legal consent captured during onboarding.
4. Profile actions for Legal & Safety and data deletion requests.
5. Support/deletion emails prefilled with signed-in email and Firebase UID.
6. Firestore backup payload now includes legal consent metadata.
7. `.gitignore` protection for API-key-looking Word documents and private key files.

## Important Production Note

These documents are product-ready drafts, not legal advice. Before Play Store release, have a qualified legal/privacy reviewer approve:

1. Privacy Policy
2. Terms of Use
3. Medical disclaimer
4. AI disclaimer
5. Age/teen usage language
6. Data deletion process

## What Users Can Now Do

From Profile:

1. Open Legal & Safety.
2. Read Privacy Policy, Terms, and Medical & AI Safety.
3. Email support.
4. Request account/cloud data deletion.
5. Delete local data from Data Management.
6. Delete cloud backup if signed in.

## What Still Needs Real Backend Work Later

Before public release, connect:

1. Real payment/subscription system.
2. Automated Premium entitlement creation.
3. Server-side account deletion workflow.
4. Store-hosted public Privacy Policy URL.
5. Store-hosted public Terms URL.
6. Crash reporting and analytics consent.

## Store Listing Preparation

Use the official email:

```text
her.saathi.care@gmail.com
```

The Play Store Data Safety form should match actual behavior at launch. Based on the current app, expect to disclose:

1. Health and fitness information if period/symptom data is cloud synced.
2. Personal information if Google sign-in/email is used.
3. App activity or diagnostics only if analytics/crash reporting is later added.
4. Data deletion request path through app support email.

## Phase 4 Completion Checklist

Phase 4 is complete when:

1. Legal & Safety opens from Profile.
2. Onboarding records legal consent metadata.
3. Data deletion email request opens with account details.
4. Local data deletion remains available.
5. Cloud backup deletion remains available.
6. `npx expo-doctor` passes.
7. Web export passes.
8. Android export passes.
9. Browser Profile/Legal screens are visually checked.
