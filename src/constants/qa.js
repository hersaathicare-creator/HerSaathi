export const readinessGates = [
  {
    key: "core",
    title: "Core app",
    status: "Ready for closed testing",
    items: [
      "Onboarding saves required profile and cycle setup.",
      "Home, Track, Care, Relief, AI, Reports, Profile, and Data Management open.",
      "Local export, restore, and local reset are available."
    ]
  },
  {
    key: "cloud",
    title: "Cloud and AI",
    status: "Billing deferred",
    items: [
      "Firebase and hybrid AI code is built.",
      "Gemini/OpenAI secrets and billing are intentionally pending.",
      "Real cloud AI test must happen before public release."
    ]
  },
  {
    key: "store",
    title: "Store testing",
    status: "Prep mode",
    items: [
      "Internal APK/AAB testing must be repeated on a real Android phone.",
      "Privacy policy and terms need final legal review.",
      "Play Store listing, data safety, screenshots, and content rating are still pending."
    ]
  }
];

export const qaChecklists = [
  {
    title: "Smoke test",
    items: [
      "Fresh install opens splash and onboarding.",
      "Complete onboarding with default cycle values.",
      "Home shows cycle card and daily check-in.",
      "Track saves, edits, and deletes period entries.",
      "Track saves, edits, and deletes symptom logs.",
      "Relief Mode opens remedies without AI.",
      "Care screen shows static wellness content.",
      "AI screen answers a static Saathi question.",
      "Reports open and reflect local records.",
      "Profile opens Legal & Safety and Data Management."
    ]
  },
  {
    title: "Account and data",
    items: [
      "Google sign-in works on real Android APK.",
      "Firestore upload/download works after billing and deploy.",
      "Delete cloud backup works for a signed-in user.",
      "Export JSON includes current local data.",
      "Restore rejects invalid JSON and accepts valid export.",
      "Delete local data clears app state and returns to onboarding."
    ]
  },
  {
    title: "Notifications",
    items: [
      "Notification permission prompt appears on Android.",
      "Daily check-in reminder schedules after permission.",
      "Period reminder logic does not crash without a next period date.",
      "Turning notifications off cancels scheduled reminders."
    ]
  },
  {
    title: "AI and subscription",
    items: [
      "Saathi answers common questions locally.",
      "Saathi Gemini answer works after backend deployment.",
      "Pragya remains locked for free users.",
      "Pragya works only after Premium entitlement is created.",
      "AI safety guidance appears for urgent keywords."
    ]
  },
  {
    title: "Store review",
    items: [
      "Official email works: her.saathi.care@gmail.com.",
      "Privacy Policy and Terms are reachable in app.",
      "Data deletion request path is visible.",
      "Medical disclaimer is visible in AI and Legal & Safety.",
      "No secrets or API keys are committed."
    ]
  }
];

export const deferredProductionItems = [
  "Firebase billing and Cloud Functions deployment",
  "Gemini API billing/key activation",
  "OpenAI API billing/key activation",
  "Real subscription/payment provider",
  "Automated Premium entitlement backend",
  "Store-hosted privacy policy and terms URLs",
  "Crash reporting service and analytics consent",
  "Final legal/privacy review"
];
