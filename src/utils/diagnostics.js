import { appConfig } from "../constants/app";

export function buildDiagnostics(appState = {}) {
  const account = appState.account || {};
  return {
    app: appConfig.name,
    version: appConfig.version,
    androidPackage: appConfig.androidPackage,
    androidVersionCode: appConfig.androidVersionCode,
    firebaseProjectId: appConfig.firebaseProjectId,
    easProjectId: appConfig.easProjectId,
    officialEmail: appConfig.officialEmail,
    accountStatus: account.status || "guest",
    signedInEmail: account.email || null,
    syncEnabled: Boolean(account.syncEnabled),
    syncStatus: account.syncStatus || "local-only",
    subscription: appState.profile?.subscription || "free",
    notificationsEnabled: Boolean(appState.notifications?.enabled),
    legalConsentVersion: appState.legalConsent?.privacyVersion || null,
    localCounts: {
      periodEntries: appState.periodEntries?.length || 0,
      symptomLogs: appState.symptomLogs?.length || 0,
      checkIns: appState.checkIns?.length || 0,
      aiMessages: appState.aiMessages?.length || 0
    },
    deferred: {
      billing: true,
      cloudAiDeployment: true,
      payments: true,
      publicStoreListing: true
    }
  };
}

export function formatDiagnostics(appState) {
  return JSON.stringify(buildDiagnostics(appState), null, 2);
}
