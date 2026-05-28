export const appConfig = {
  name: "HerSaathi",
  officialEmail: "her.saathi.care@gmail.com",
  supportMailto: "mailto:her.saathi.care@gmail.com",
  authProvider: "Google",
  cloudProvider: "Cloud Firestore"
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
