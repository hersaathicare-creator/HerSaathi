import React, { useMemo, useState } from "react";
import { Linking, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import {
  Bell,
  CheckCircle2,
  Cloud,
  Database,
  DownloadCloud,
  FileText,
  KeyRound,
  LogIn,
  LogOut,
  Mail,
  RefreshCcw,
  Scale,
  ShieldCheck,
  Trash2,
  UploadCloud,
  UserRound,
  WandSparkles
} from "lucide-react-native";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Screen } from "../components/Screen";
import { appConfig, syncScopes } from "../constants/app";
import { colors, fonts, typography } from "../constants/theme";
import {
  buildWellnessCloudPayload,
  deleteWellnessData,
  downloadWellnessData,
  getCurrentFirebaseUser,
  signInWithGoogle,
  signOutGoogle,
  uploadWellnessData
} from "../services/firebase";
import { getCycleInfo } from "../utils/cycle";
import {
  applyCloudWellnessData,
  markCloudSync,
  saveNotificationSettings,
  saveProfile,
  saveSignedInAccount,
  signOutAccount,
  updateCloudSyncSettings
} from "../utils/storage";
import { scheduleHerSaathiNotifications } from "../utils/notifications";

export default function ProfileScreen({ appState, refreshAppState, navigate }) {
  const account = appState.account || {};
  const [name, setName] = useState(appState.profile.name || "Saathi");
  const [status, setStatus] = useState("");
  const [working, setWorking] = useState("");
  const [confirmClearAccount, setConfirmClearAccount] = useState(false);
  const [confirmCloudDelete, setConfirmCloudDelete] = useState(false);
  const cycleInfo = useMemo(() => getCycleInfo(appState.cycle), [appState.cycle]);

  const updateProfile = async (patch) => {
    await saveProfile({ ...appState.profile, ...patch });
    await refreshAppState();
  };

  const saveName = async () => {
    await updateProfile({ name: name.trim() || "Saathi" });
    setStatus("Profile saved locally.");
  };

  const loginWithGoogle = async () => {
    try {
      setWorking("login");
      const user = await signInWithGoogle();
      await saveSignedInAccount(user, { syncStatus: "ready" });
      await refreshAppState();
      setStatus(`Signed in as ${user.email}.`);
    } catch (error) {
      setStatus(error.message || "Google sign-in could not be completed.");
    } finally {
      setWorking("");
    }
  };

  const signOut = async () => {
    try {
      setWorking("logout");
      await signOutGoogle();
      await signOutAccount();
      await refreshAppState();
      setConfirmClearAccount(false);
      setStatus("Signed out. Local wellness records stayed on this device.");
    } catch (error) {
      setStatus(error.message || "Sign out could not be completed.");
    } finally {
      setWorking("");
    }
  };

  const toggleNotifications = async (enabled) => {
    const next = { ...appState.notifications, enabled };
    await saveNotificationSettings(next);
    const scheduled = await scheduleHerSaathiNotifications(next, cycleInfo);
    await refreshAppState();
    setStatus(scheduled || !enabled ? "Notification settings updated." : "Notification permission was not granted.");
  };

  const toggleSync = async (enabled) => {
    if (account.status !== "signed-in") {
      setStatus("Sign in with Google before enabling cloud sync.");
      return;
    }

    await updateCloudSyncSettings({ syncEnabled: enabled });
    await saveProfile({ ...appState.profile, cloudSync: enabled });
    await refreshAppState();
    setStatus(enabled ? "Cloud sync consent enabled. Use Upload to send data to Firestore." : "Cloud sync paused.");
  };

  const toggleScope = async (key) => {
    const nextScopes = {
      ...(account.dataScopes || {}),
      [key]: !(account.dataScopes || {})[key]
    };
    await updateCloudSyncSettings({ dataScopes: nextScopes });
    await refreshAppState();
    setStatus("Sync data scope updated locally.");
  };

  const runReadinessCheck = async () => {
    const firebaseUser = getCurrentFirebaseUser();
    if (firebaseUser) {
      await saveSignedInAccount(firebaseUser, { syncStatus: account.syncEnabled ? "ready" : "signed-in" });
      setStatus("Firebase session is active.");
    } else {
      await markCloudSync({ lastSyncCheckAt: new Date().toISOString(), syncStatus: "auth-needed" });
      setStatus("No active Firebase session. Sign in with Google first.");
    }
    await refreshAppState();
  };

  const uploadToCloud = async () => {
    if (account.status !== "signed-in" || !account.uid) {
      setStatus("Sign in with Google before uploading.");
      return;
    }
    if (!account.syncEnabled) {
      setStatus("Enable cloud sync before uploading.");
      return;
    }

    try {
      setWorking("upload");
      const payload = buildWellnessCloudPayload(appState, account.dataScopes);
      await uploadWellnessData(account.uid, payload);
      await markCloudSync({
        syncStatus: "synced",
        lastCloudUploadAt: new Date().toISOString()
      });
      await refreshAppState();
      setStatus("Uploaded selected wellness data to Firestore.");
    } catch (error) {
      await markCloudSync({ syncStatus: "error" });
      await refreshAppState();
      setStatus(error.message || "Cloud upload failed.");
    } finally {
      setWorking("");
    }
  };

  const downloadFromCloud = async () => {
    if (account.status !== "signed-in" || !account.uid) {
      setStatus("Sign in with Google before downloading.");
      return;
    }

    try {
      setWorking("download");
      const cloudData = await downloadWellnessData(account.uid);
      if (!cloudData) {
        setStatus("No cloud backup found yet.");
        return;
      }
      await applyCloudWellnessData(cloudData);
      await refreshAppState();
      setStatus("Downloaded cloud data to this device.");
    } catch (error) {
      await markCloudSync({ syncStatus: "error" });
      await refreshAppState();
      setStatus(error.message || "Cloud download failed.");
    } finally {
      setWorking("");
    }
  };

  const deleteCloudBackup = async () => {
    if (account.status !== "signed-in" || !account.uid) {
      setStatus("Sign in with Google before deleting cloud data.");
      return;
    }

    try {
      setWorking("delete-cloud");
      await deleteWellnessData(account.uid);
      await markCloudSync({
        syncStatus: account.syncEnabled ? "ready" : "paused",
        lastCloudDeleteAt: new Date().toISOString()
      });
      await refreshAppState();
      setConfirmCloudDelete(false);
      setStatus("Deleted HerSaathi cloud backup from Firestore.");
    } catch (error) {
      await markCloudSync({ syncStatus: "error" });
      await refreshAppState();
      setStatus(error.message || "Cloud delete failed.");
    } finally {
      setWorking("");
    }
  };

  const emailSupport = async () => {
    try {
      await Linking.openURL(appConfig.supportMailto);
    } catch {
      setStatus(`Email support at ${appConfig.officialEmail}.`);
    }
  };

  const requestDataDeletion = async () => {
    const subject = "HerSaathi data deletion request";
    const body = [
      "Hello HerSaathi Support,",
      "",
      "Please help me delete my HerSaathi account/cloud data.",
      "",
      `Signed-in email: ${account.email || "not signed in"}`,
      `Firebase UID: ${account.uid || "not available"}`,
      "",
      "I understand local data can be deleted from Profile > Data Management on my device."
    ].join("\n");

    try {
      await Linking.openURL(`mailto:${appConfig.officialEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    } catch {
      setStatus(`Email ${appConfig.officialEmail} with subject: ${subject}.`);
    }
  };

  const periodCount = appState.periodEntries?.length || 0;
  const symptomCount = appState.symptomLogs?.length || 0;
  const checkInCount = appState.checkIns?.length || 0;
  const signedIn = account.status === "signed-in";

  return (
    <Screen title="Profile" subtitle="Account, reports, privacy, and real cloud sync.">
      <Card>
        <View style={styles.titleRow}>
          <UserRound size={20} color={colors.plum} />
          <Text style={styles.cardTitle}>Profile</Text>
        </View>
        <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Name" placeholderTextColor={colors.placeholder} />
        <Text style={styles.body}>Age group: {appState.profile.ageGroup || "Not set"}</Text>
        <Button title="Save Profile" onPress={saveName} />
      </Card>

      <Card style={styles.accountCard}>
        <View style={styles.rowBetween}>
          <View style={styles.titleRowNoMargin}>
            <KeyRound size={20} color={colors.plum} />
            <Text style={styles.cardTitle}>Google account</Text>
          </View>
          <StatusPill status={account.syncStatus || "local-only"} />
        </View>
        <Text style={styles.body}>
          {signedIn
            ? `Signed in${account.email ? ` as ${account.email}` : ""}.`
            : "Sign in with Google to use Firestore cloud sync."}
        </Text>
        <View style={styles.actionRow}>
          {signedIn ? (
            <Button title={working === "logout" ? "Signing out..." : "Sign out"} variant="secondary" onPress={() => setConfirmClearAccount(true)} style={styles.actionButton}>
              <LogOut size={18} color={colors.mulberry} />
              <Text style={styles.secondaryText}>{working === "logout" ? "Signing out..." : "Sign out"}</Text>
            </Button>
          ) : (
            <Button title={working === "login" ? "Opening..." : "Sign in with Google"} variant="secondary" onPress={loginWithGoogle} disabled={working === "login"} style={styles.actionButton}>
              <LogIn size={18} color={colors.mulberry} />
              <Text style={styles.secondaryText}>{working === "login" ? "Opening..." : "Sign in with Google"}</Text>
            </Button>
          )}
          <Button title="Check Session" variant="secondary" onPress={runReadinessCheck} style={styles.actionButton}>
            <RefreshCcw size={18} color={colors.mulberry} />
            <Text style={styles.secondaryText}>Check Session</Text>
          </Button>
        </View>
      </Card>

      <Card>
        <View style={styles.titleRow}>
          <Mail size={20} color={colors.teal} />
          <Text style={styles.cardTitle}>Official contact</Text>
        </View>
        <Text selectable style={styles.emailText}>{appConfig.officialEmail}</Text>
        <Text style={styles.body}>Use this as the public support and app contact email.</Text>
        <Button title="Email Support" variant="secondary" onPress={emailSupport} style={styles.reportButton} />
      </Card>

      <Card style={styles.syncCard}>
        <View style={styles.settingRow}>
          <View style={styles.settingText}>
            <View style={styles.titleRow}>
              <Cloud size={19} color={colors.mulberry} />
              <Text style={styles.cardTitle}>Firestore cloud sync</Text>
            </View>
            <Text style={styles.body}>Enable sync, choose data scopes, then upload or download explicitly.</Text>
          </View>
          <Switch
            value={Boolean(account.syncEnabled)}
            onValueChange={toggleSync}
            trackColor={{ false: colors.border, true: colors.roseSoft }}
            thumbColor={account.syncEnabled ? colors.rose : colors.white}
          />
        </View>

        <View style={styles.scopeList}>
          {syncScopes.map((scope) => (
            <SyncScopeRow
              key={scope.key}
              scope={scope}
              enabled={Boolean(account.dataScopes?.[scope.key])}
              onToggle={() => toggleScope(scope.key)}
            />
          ))}
        </View>

        <View style={styles.actionRow}>
          <Button title={working === "upload" ? "Uploading..." : "Upload"} variant="secondary" onPress={uploadToCloud} disabled={working === "upload"} style={styles.actionButton}>
            <UploadCloud size={18} color={colors.mulberry} />
            <Text style={styles.secondaryText}>{working === "upload" ? "Uploading..." : "Upload"}</Text>
          </Button>
          <Button title={working === "download" ? "Downloading..." : "Download"} variant="secondary" onPress={downloadFromCloud} disabled={working === "download"} style={styles.actionButton}>
            <DownloadCloud size={18} color={colors.mulberry} />
            <Text style={styles.secondaryText}>{working === "download" ? "Downloading..." : "Download"}</Text>
          </Button>
        </View>

        <View style={styles.syncFooter}>
          <Text style={styles.body}>Last upload: {account.lastCloudUploadAt ? new Date(account.lastCloudUploadAt).toLocaleString() : "Never"}</Text>
          <Text style={styles.body}>Last download: {account.lastCloudDownloadAt ? new Date(account.lastCloudDownloadAt).toLocaleString() : "Never"}</Text>
          <Button title="Delete Cloud Backup" variant="secondary" onPress={() => setConfirmCloudDelete(true)} style={styles.reportButton} />
        </View>
      </Card>

      {confirmCloudDelete ? (
        <Card style={styles.dangerCard}>
          <View style={styles.titleRow}>
            <Trash2 size={20} color={colors.warning} />
            <Text style={styles.cardTitle}>Delete cloud backup?</Text>
          </View>
          <Text style={styles.body}>This deletes the HerSaathi Firestore backup for your signed-in Google account. Local device records stay here.</Text>
          <View style={styles.actionRow}>
            <Button title="Cancel" variant="secondary" onPress={() => setConfirmCloudDelete(false)} style={styles.actionButton} />
            <Button title={working === "delete-cloud" ? "Deleting..." : "Delete Cloud"} onPress={deleteCloudBackup} disabled={working === "delete-cloud"} style={styles.actionButton} />
          </View>
        </Card>
      ) : null}

      {confirmClearAccount ? (
        <Card style={styles.dangerCard}>
          <View style={styles.titleRow}>
            <Trash2 size={20} color={colors.warning} />
            <Text style={styles.cardTitle}>Sign out?</Text>
          </View>
          <Text style={styles.body}>This signs out Google and pauses sync. Local wellness records stay on this device.</Text>
          <View style={styles.actionRow}>
            <Button title="Cancel" variant="secondary" onPress={() => setConfirmClearAccount(false)} style={styles.actionButton} />
            <Button title="Sign out" onPress={signOut} style={styles.actionButton} />
          </View>
        </Card>
      ) : null}

      <Card style={styles.reportCard}>
        <View style={styles.titleRow}>
          <FileText size={20} color={colors.plum} />
          <Text style={styles.cardTitle}>Reports</Text>
        </View>
        <Text style={styles.reportText}>{periodCount} period entries</Text>
        <Text style={styles.reportText}>{symptomCount} symptom logs</Text>
        <Text style={styles.reportText}>{checkInCount} daily check-ins</Text>
        <Button title="Open Reports" variant="secondary" onPress={() => navigate("reports")} style={styles.reportButton} />
      </Card>

      <Card>
        <View style={styles.settingRow}>
          <View style={styles.settingText}>
            <View style={styles.titleRow}>
              <Bell size={19} color={colors.mulberry} />
              <Text style={styles.cardTitle}>Notifications</Text>
            </View>
            <Text style={styles.body}>Daily check-in, period reminder, and wellness tips.</Text>
          </View>
          <Switch
            value={appState.notifications.enabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: colors.border, true: colors.roseSoft }}
            thumbColor={appState.notifications.enabled ? colors.rose : colors.white}
          />
        </View>
      </Card>

      <Card style={styles.privacyCard}>
        <View style={styles.titleRow}>
          <ShieldCheck size={20} color={colors.success} />
          <Text style={styles.cardTitle}>Privacy</Text>
        </View>
        <Text style={styles.body}>Cloud data is stored under your Firebase user id and protected by Firestore user rules.</Text>
        <View style={styles.actionRow}>
          <Button title="Legal & Safety" variant="secondary" onPress={() => navigate("legal")} style={styles.actionButton}>
            <Scale size={18} color={colors.mulberry} />
            <Text style={styles.secondaryText}>Legal & Safety</Text>
          </Button>
          <Button title="Request Deletion" variant="secondary" onPress={requestDataDeletion} style={styles.actionButton}>
            <Trash2 size={18} color={colors.mulberry} />
            <Text style={styles.secondaryText}>Request Deletion</Text>
          </Button>
        </View>
        {appState.legalConsent?.acceptedAt ? (
          <Text style={styles.legalMeta}>Accepted terms: {new Date(appState.legalConsent.acceptedAt).toLocaleDateString()}</Text>
        ) : null}
      </Card>

      <Card>
        <View style={styles.titleRow}>
          <Database size={20} color={colors.plum} />
          <Text style={styles.cardTitle}>Data Management</Text>
        </View>
        <Text style={styles.body}>Export, restore, or reset local data from this device.</Text>
        <Button title="Manage Data" variant="secondary" onPress={() => navigate("data-management")} style={styles.reportButton} />
      </Card>

      <Card style={styles.subscriptionCard}>
        <View style={styles.titleRow}>
          <WandSparkles size={20} color={colors.plum} />
          <Text style={styles.cardTitle}>Subscription</Text>
        </View>
        <Text style={styles.body}>Free includes Saathi with static answers and Gemini. Premium unlocks Pragya for advanced actions.</Text>
        <Button title="Upgrade" />
      </Card>

      {status ? <Text style={styles.status}>{status}</Text> : null}
    </Screen>
  );
}

function StatusPill({ status }) {
  const label = {
    "local-only": "Local only",
    "auth-needed": "Auth needed",
    ready: "Ready",
    paused: "Paused",
    "signed-out": "Signed out",
    "signed-in": "Signed in",
    synced: "Synced",
    error: "Needs attention"
  }[status] || "Local only";

  return (
    <View style={styles.pill}>
      <CheckCircle2 size={13} color={status === "error" ? colors.warning : colors.success} />
      <Text style={[styles.pillText, status === "error" && styles.pillWarning]}>{label}</Text>
    </View>
  );
}

function SyncScopeRow({ scope, enabled, onToggle }) {
  return (
    <View style={styles.scopeRow}>
      <View style={styles.scopeText}>
        <Text style={styles.scopeTitle}>{scope.label}</Text>
        <Text style={styles.scopeBody}>{scope.description}</Text>
      </View>
      <Switch
        value={enabled}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.roseSoft }}
        thumbColor={enabled ? colors.rose : colors.white}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10
  },
  titleRowNoMargin: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10
  },
  cardTitle: {
    ...typography.h3
  },
  body: {
    ...typography.body,
    color: colors.muted
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    color: colors.ink,
    backgroundColor: colors.white,
    fontFamily: fonts.uiRegular,
    fontSize: 15
  },
  accountCard: {
    backgroundColor: colors.roseSoft
  },
  emailText: {
    ...typography.bodyMedium,
    color: colors.ink,
    marginBottom: 4
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  settingText: {
    flex: 1
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14
  },
  actionButton: {
    flex: 1
  },
  reportCard: {
    backgroundColor: colors.lemon
  },
  reportText: {
    ...typography.body,
    color: colors.ink,
    fontFamily: fonts.uiMedium,
    marginTop: 4
  },
  reportButton: {
    marginTop: 14
  },
  syncCard: {
    gap: 14
  },
  scopeList: {
    gap: 10
  },
  scopeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: colors.border
  },
  scopeText: {
    flex: 1
  },
  scopeTitle: {
    ...typography.bodyMedium,
    color: colors.ink
  },
  scopeBody: {
    ...typography.small,
    color: colors.muted,
    marginTop: 2
  },
  syncFooter: {
    gap: 2
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.white
  },
  pillText: {
    ...typography.smallMedium,
    color: colors.success
  },
  pillWarning: {
    color: colors.warning
  },
  secondaryText: {
    color: colors.mulberry,
    fontFamily: fonts.uiMedium,
    fontSize: 15
  },
  privacyCard: {
    backgroundColor: colors.mint
  },
  legalMeta: {
    ...typography.small,
    marginTop: 10,
    color: colors.muted
  },
  dangerCard: {
    backgroundColor: colors.lemon
  },
  subscriptionCard: {
    backgroundColor: colors.roseSoft
  },
  status: {
    ...typography.body,
    color: colors.success,
    fontFamily: fonts.uiSemiBold,
    paddingHorizontal: 4
  }
});
