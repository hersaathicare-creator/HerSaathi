import React, { useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CheckCircle2, Database, Download, ShieldCheck, Trash2, Upload, X } from "lucide-react-native";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { ErrorList } from "../components/Feedback";
import { colors, fonts, layout, typography } from "../constants/theme";
import { exportLocalData, resetLocalData, restoreLocalData } from "../utils/storage";
import { validateImportText } from "../utils/validation";

export default function DataManagementScreen({ appState, refreshAppState, onClose }) {
  const [exportText, setExportText] = useState("");
  const [importText, setImportText] = useState("");
  const [importErrors, setImportErrors] = useState([]);
  const [importMessage, setImportMessage] = useState("");
  const [restoring, setRestoring] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const buildExport = async () => {
    const payload = await exportLocalData();
    setExportText(JSON.stringify(payload, null, 2));
  };

  const restoreImport = async () => {
    const result = validateImportText(importText);
    if (!result.valid) {
      setImportErrors(result.errors);
      setImportMessage("");
      return;
    }

    try {
      setRestoring(true);
      await restoreLocalData(result.data);
      await refreshAppState();
      setImportText("");
      setImportErrors([]);
      setImportMessage("Local data restored successfully.");
      setExportText("");
    } catch {
      setImportErrors(["Import could not be restored. Please try a fresh export."]);
      setImportMessage("");
    } finally {
      setRestoring(false);
    }
  };

  const deleteAllData = async () => {
    await resetLocalData();
    await refreshAppState();
    setConfirmReset(false);
    onClose();
  };

  return (
    <Modal visible animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={styles.shell} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <View style={styles.titleRowNoMargin}>
            <Database size={24} color={colors.plum} />
            <Text style={styles.title}>Data Management</Text>
          </View>
          <Button variant="ghost" style={styles.iconButton} onPress={onClose} accessibilityLabel="Close data management">
            <X size={24} color={colors.mulberry} />
          </Button>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Card style={styles.summaryCard}>
            <View style={styles.titleRow}>
              <ShieldCheck size={20} color={colors.success} />
              <Text style={styles.cardTitle}>Local data summary</Text>
            </View>
            <View style={styles.metricsRow}>
              <Metric label="Periods" value={appState.periodEntries?.length || 0} />
              <Metric label="Symptoms" value={appState.symptomLogs?.length || 0} />
              <Metric label="Check-ins" value={appState.checkIns?.length || 0} />
            </View>
            <Text style={styles.body}>
              Account status: {appState.account?.status || "guest"}. Local records remain on this device until real sync is connected.
            </Text>
          </Card>

          <Card>
            <View style={styles.titleRow}>
              <Download size={20} color={colors.plum} />
              <Text style={styles.cardTitle}>Export local data</Text>
            </View>
            <Text style={styles.body}>Generate a readable JSON snapshot for backup, review, or future migration.</Text>
            <Button title="Generate Export" variant="secondary" onPress={buildExport} style={styles.spacedButton} />
            {exportText ? (
              <View style={styles.exportBox}>
                <Text selectable style={styles.exportText}>{exportText}</Text>
              </View>
            ) : null}
          </Card>

          <Card>
            <View style={styles.titleRow}>
              <Upload size={20} color={colors.plum} />
              <Text style={styles.cardTitle}>Restore from JSON</Text>
            </View>
            <Text style={styles.body}>Paste a HerSaathi export here. Valid imports replace the current local data.</Text>
            <TextInput
              value={importText}
              onChangeText={(value) => {
                setImportText(value);
                setImportErrors([]);
                setImportMessage("");
              }}
              placeholder="Paste HerSaathi JSON export"
              placeholderTextColor={colors.placeholder}
              style={styles.importInput}
              multiline
              textAlignVertical="top"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <ErrorList errors={importErrors} />
            {importMessage ? (
              <View style={styles.successRow}>
                <CheckCircle2 size={18} color={colors.success} />
                <Text style={styles.successText}>{importMessage}</Text>
              </View>
            ) : null}
            <Button
              title={restoring ? "Restoring..." : "Restore Import"}
              variant="secondary"
              disabled={!importText.trim() || restoring}
              onPress={restoreImport}
              style={styles.spacedButton}
            />
          </Card>

          <Card style={styles.dangerCard}>
            <View style={styles.titleRow}>
              <Trash2 size={20} color={colors.warning} />
              <Text style={styles.cardTitle}>Delete all local data</Text>
            </View>
            <Text style={styles.body}>This clears onboarding, profile, cycle, symptoms, check-ins, reports, and AI chat history on this device.</Text>
            {confirmReset ? (
              <View style={styles.confirmBox}>
                <Text style={styles.confirmText}>This cannot be undone.</Text>
                <View style={styles.actionRow}>
                  <Button title="Cancel" variant="secondary" onPress={() => setConfirmReset(false)} style={styles.actionButton} />
                  <Button title="Delete All" onPress={deleteAllData} style={styles.actionButton} />
                </View>
              </View>
            ) : (
              <Button title="Delete All Local Data" variant="secondary" onPress={() => setConfirmReset(true)} style={styles.spacedButton} />
            )}
          </Card>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function Metric({ label, value }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: colors.background
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: layout.screenPadding,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white
  },
  titleRowNoMargin: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12
  },
  title: {
    ...typography.h2,
    color: colors.mulberry
  },
  iconButton: {
    width: 46,
    height: 46,
    minHeight: 46,
    paddingHorizontal: 0
  },
  content: {
    padding: layout.screenPadding,
    gap: 14,
    paddingBottom: 30
  },
  summaryCard: {
    backgroundColor: colors.roseSoft
  },
  cardTitle: {
    ...typography.h3
  },
  body: {
    ...typography.body,
    color: colors.muted
  },
  metricsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12
  },
  metric: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white
  },
  metricValue: {
    fontSize: 21,
    lineHeight: 27,
    fontFamily: fonts.premiumBold,
    color: colors.ink
  },
  metricLabel: {
    ...typography.small
  },
  spacedButton: {
    marginTop: 14
  },
  exportBox: {
    maxHeight: 260,
    marginTop: 14,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.lavender
  },
  exportText: {
    ...typography.small,
    color: colors.ink
  },
  importInput: {
    minHeight: 160,
    marginTop: 14,
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white,
    color: colors.ink,
    fontFamily: fonts.uiRegular,
    fontSize: 13,
    lineHeight: 18
  },
  successRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2
  },
  successText: {
    ...typography.smallMedium,
    color: colors.success
  },
  dangerCard: {
    backgroundColor: colors.lemon
  },
  confirmBox: {
    gap: 12,
    marginTop: 14
  },
  confirmText: {
    ...typography.bodyMedium,
    color: colors.warning
  },
  actionRow: {
    flexDirection: "row",
    gap: 10
  },
  actionButton: {
    flex: 1
  }
});
