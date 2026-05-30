export const appConfig = {
  name: "HerSaathi",
  officialEmail: "her.saathi.care@gmail.com",
  supportMailto: "mailto:her.saathi.care@gmail.com",
  version: "1.0.8",
  androidVersionCode: 10,
  authProvider: "Google",
  cloudProvider: "Cloud Firestore",
  firebaseProjectId: "hersaathi-60899",
  easProjectId: "dfd5ce95-ff2d-4e19-bf55-5af5a3407559",
  legalHomeUrl: "https://hersaathi-60899.web.app",
  privacyPolicyUrl: "https://hersaathi-60899.web.app/privacy-policy",
  termsUrl: "https://hersaathi-60899.web.app/terms-of-use",
  medicalSafetyUrl: "https://hersaathi-60899.web.app/medical-ai-safety",
  dataDeletionUrl: "https://hersaathi-60899.web.app/data-deletion",
  androidPackage: "com.hersaathi.app",
  androidGoogleWebClientId: "58884450954-1rbu2duc7fr7ca5tn9sep1i5o5s8rg90.apps.googleusercontent.com",
  androidGoogleClientId: "",
  legalVersion: "2026-05-28",
  privacyVersion: "2026-05-28",
  termsVersion: "2026-05-28"
};

export const syncScopes = [
  {
    key: "cycle",
    label: "Cycle setup",
    description: "Last period date, cycle length, and period duration."
  },
  {
    key: "periodEntries",
    label: "Period records",
    description: "Start date, end date, flow, and symptoms."
  },
  {
    key: "symptomLogs",
    label: "Symptom logs",
    description: "Logged symptoms and mood context."
  },
  {
    key: "checkIns",
    label: "Daily check-ins",
    description: "Mood check-ins used for reports."
  },
  {
    key: "aiMessages",
    label: "AI chat history",
    description: "Excluded by default until the user opts in."
  }
];
