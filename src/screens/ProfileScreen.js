import React, { useMemo, useState } from "react";
import { StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { Bell, Cloud, Database, FileText, LogIn, LogOut, ShieldCheck, UserRound, WandSparkles } from "lucide-react-native";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Screen } from "../components/Screen";
import { colors, fonts, typography } from "../constants/theme";
import { getCycleInfo } from "../utils/cycle";
import { saveNotificationSettings, saveProfile } from "../utils/storage";
import { scheduleHerSaathiNotifications } from "../utils/notifications";

export default function ProfileScreen({ appState, refreshAppState, navigate }) {
  const [name, setName] = useState(appState.profile.name || "Saathi");
  const [status, setStatus] = useState("");
  const cycleInfo = useMemo(() => getCycleInfo(appState.cycle), [appState.cycle]);

  const updateProfile = async (patch) => {
    await saveProfile({ ...appState.profile, ...patch });
    await refreshAppState();
  };

  const saveName = async () => {
    await updateProfile({ name: name.trim() || "Saathi" });
    setStatus("Profile saved locally.");
  };

  const toggleGmail = async () => {
    await updateProfile({ gmailConnected: !appState.profile.gmailConnected });
    setStatus(appState.profile.gmailConnected ? "Logged out locally." : "Gmail login placeholder connected.");
  };

  const toggleNotifications = async (enabled) => {
    const next = { ...appState.notifications, enabled };
    await saveNotificationSettings(next);
    const scheduled = await scheduleHerSaathiNotifications(next, cycleInfo);
    await refreshAppState();
    setStatus(scheduled || !enabled ? "Notification settings updated." : "Notification permission was not granted.");
  };

  const periodCount = appState.periodEntries?.length || 0;
  const symptomCount = appState.symptomLogs?.length || 0;
  const checkInCount = appState.checkIns?.length || 0;

  return (
    <Screen title="Profile" subtitle="Settings, reports, privacy, and future account options.">
      <Card>
        <View style={styles.titleRow}>
          <UserRound size={20} color={colors.plum} />
          <Text style={styles.cardTitle}>Profile</Text>
        </View>
        <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Name" placeholderTextColor={colors.placeholder} />
        <Text style={styles.body}>Age group: {appState.profile.ageGroup || "Not set"}</Text>
        <Button title="Save Profile" onPress={saveName} />
      </Card>

      <Card>
        <View style={styles.settingRow}>
          <View style={styles.settingText}>
            <View style={styles.titleRow}>
              {appState.profile.gmailConnected ? <LogOut size={19} color={colors.mulberry} /> : <LogIn size={19} color={colors.mulberry} />}
              <Text style={styles.cardTitle}>Gmail Login</Text>
            </View>
            <Text style={styles.body}>{appState.profile.gmailConnected ? "Connected for future sync." : "Auth placeholder for Stage 1."}</Text>
          </View>
          <Button title={appState.profile.gmailConnected ? "Log out" : "Login"} variant="secondary" onPress={toggleGmail} style={styles.smallButton} />
        </View>
      </Card>

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

      <Card>
        <View style={styles.titleRow}>
          <Cloud size={20} color={colors.teal} />
          <Text style={styles.cardTitle}>Google cloud space</Text>
        </View>
        <Text style={styles.body}>
          Future sync area for phone changes and PC access. Stage 1 keeps the record structure ready without uploading data.
        </Text>
      </Card>

      <Card style={styles.privacyCard}>
        <View style={styles.titleRow}>
          <ShieldCheck size={20} color={colors.success} />
          <Text style={styles.cardTitle}>Privacy</Text>
        </View>
        <Text style={styles.body}>Data stored locally only.</Text>
      </Card>

      <Card>
        <View style={styles.titleRow}>
          <Database size={20} color={colors.plum} />
          <Text style={styles.cardTitle}>Data Management</Text>
        </View>
        <Text style={styles.body}>Export your local data or reset this device when needed.</Text>
        <Button title="Manage Data" variant="secondary" onPress={() => navigate("data-management")} style={styles.reportButton} />
      </Card>

      <Card style={styles.subscriptionCard}>
        <View style={styles.titleRow}>
          <WandSparkles size={20} color={colors.plum} />
          <Text style={styles.cardTitle}>Subscription</Text>
        </View>
        <Text style={styles.body}>Free plan includes 5 assistant messages per day.</Text>
        <Button title="Upgrade" />
      </Card>

      {status ? <Text style={styles.status}>{status}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  settingText: {
    flex: 1
  },
  smallButton: {
    minWidth: 92
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
  privacyCard: {
    backgroundColor: colors.mint
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
