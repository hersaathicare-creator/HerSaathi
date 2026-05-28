import { appConfig } from "./app";

export const legalSummary = {
  privacyVersion: appConfig.privacyVersion,
  termsVersion: appConfig.termsVersion,
  lastUpdated: "May 28, 2026",
  contactEmail: appConfig.officialEmail
};

export const legalDocuments = [
  {
    key: "privacy",
    title: "Privacy Policy",
    subtitle: "How HerSaathi handles wellness data.",
    sections: [
      {
        title: "Data you add",
        body:
          "HerSaathi can store your name, age group, cycle setup, period records, symptom logs, mood check-ins, notification preferences, and AI chat history if you choose to keep it."
      },
      {
        title: "Local-first storage",
        body:
          "Your core wellness records are stored on your device first. Cloud backup is optional and controlled from Profile."
      },
      {
        title: "Cloud backup",
        body:
          "When you sign in with Google and enable Firestore sync, selected wellness data is stored under your Firebase user id and protected by user-specific Firestore rules."
      },
      {
        title: "AI processing",
        body:
          "Common questions are answered locally. For cloud AI, HerSaathi sends only limited context such as cycle phase, recent symptoms, mood, and your question. Full records are not sent to AI unless a future feature asks for clear consent."
      },
      {
        title: "Third-party services",
        body:
          "The app uses Firebase Authentication, Cloud Firestore, Firebase Cloud Functions, Gemini, OpenAI, Expo, and Google sign-in features where enabled."
      },
      {
        title: "Your controls",
        body:
          "You can export local data, delete local data, delete your Firestore backup, pause sync, sign out, or contact support for an account/data deletion request."
      }
    ]
  },
  {
    key: "terms",
    title: "Terms of Use",
    subtitle: "Rules for using HerSaathi safely.",
    sections: [
      {
        title: "Wellness support only",
        body:
          "HerSaathi is a period and wellness companion. It is not a medical device and does not replace a doctor, emergency service, diagnosis, prescription, or treatment."
      },
      {
        title: "Use responsibly",
        body:
          "Cycle predictions and insights can be wrong or incomplete. Use them as helpful estimates, not as medical decisions."
      },
      {
        title: "Account and sync",
        body:
          "Google sign-in is used for optional cloud backup and AI features. You are responsible for keeping your Google account secure."
      },
      {
        title: "Subscription features",
        body:
          "Saathi is available for free support. Premium features may unlock Pragya for advanced actions after a real subscription system is connected."
      },
      {
        title: "Age and guardian guidance",
        body:
          "HerSaathi is not intended for children under 13. Teens should use the app with guardian guidance where local law or family rules require it."
      }
    ]
  },
  {
    key: "medical",
    title: "Medical & AI Safety",
    subtitle: "Important limits of wellness and AI guidance.",
    sections: [
      {
        title: "Not emergency care",
        body:
          "Do not use HerSaathi during a medical emergency. Seek urgent medical help for severe pain, very heavy bleeding, fainting, fever, pregnancy concerns, or symptoms that feel unusual."
      },
      {
        title: "AI limitations",
        body:
          "AI responses may be incomplete, incorrect, or not suitable for your situation. They should be treated as general wellness support only."
      },
      {
        title: "Sensitive decisions",
        body:
          "Do not rely on HerSaathi for contraception, fertility decisions, pregnancy diagnosis, medication decisions, or urgent health decisions."
      },
      {
        title: "Small safe steps",
        body:
          "The app may suggest hydration, rest, warmth, breathing, gentle movement, and tracking patterns. Stop any suggestion that feels unsafe or uncomfortable."
      }
    ]
  }
];

export function buildLegalConsent() {
  return {
    acceptedAt: new Date().toISOString(),
    privacyVersion: legalSummary.privacyVersion,
    termsVersion: legalSummary.termsVersion
  };
}
