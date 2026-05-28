import React, { useState } from "react";
import { Linking, Modal, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CheckCircle2, ClipboardCheck, Mail, ShieldAlert, X } from "lucide-react-native";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { appConfig } from "../constants/app";
import { deferredProductionItems, qaChecklists, readinessGates } from "../constants/qa";
import { colors, fonts, layout, typography } from "../constants/theme";
import { formatDiagnostics } from "../utils/diagnostics";

export default function ReadinessScreen({ appState, onClose }) {
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [status, setStatus] = useState("");
  const diagnostics = formatDiagnostics(appState);

  const emailDiagnostics = async () => {
    const subject = "HerSaathi tester diagnostics";
    const body = [
      "Hello HerSaathi Support,",
      "",
      "Here are my tester diagnostics:",
      "",
      diagnostics
    ].join("\n");

    try {
      await Linking.openURL(`mailto:${appConfig.officialEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    } catch {
      setStatus(`Email ${appConfig.officialEmail} with subject: ${subject}.`);
    }
  };

  return (
    <Modal visible animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={styles.shell} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <View style={styles.titleRowNoMargin}>
            <ClipboardCheck size={24} color={colors.plum} />
            <Text style={styles.title}>Testing & Store Prep</Text>
          </View>
          <Button variant="ghost" style={styles.iconButton} onPress={onClose} accessibilityLabel="Close testing center">
            <X size={24} color={colors.mulberry} />
          </Button>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Card style={styles.summaryCard}>
            <Text style={styles.cardTitle}>Closed testing readiness</Text>
            <Text style={styles.body}>
              Use this screen during APK testing to confirm core flows, known deferred services, and support diagnostics.
            </Text>
            <View style={styles.buildGrid}>
              <BuildMetric label="Version" value={appConfig.version} />
              <BuildMetric label="Code" value={String(appConfig.androidVersionCode)} />
              <BuildMetric label="Package" value={appConfig.androidPackage} />
            </View>
          </Card>

          <View style={styles.gateGrid}>
            {readinessGates.map((gate) => (
              <Card key={gate.key} style={styles.gateCard}>
                <View style={styles.titleRow}>
                  <CheckCircle2 size={18} color={gate.key === "cloud" ? colors.warning : colors.success} />
                  <View style={styles.headingText}>
                    <Text style={styles.gateTitle}>{gate.title}</Text>
                    <Text style={styles.gateStatus}>{gate.status}</Text>
                  </View>
                </View>
                {gate.items.map((item) => (
                  <Text key={item} style={styles.itemText}>- {item}</Text>
                ))}
              </Card>
            ))}
          </View>

          {qaChecklists.map((section) => (
            <Card key={section.title}>
              <Text style={styles.cardTitle}>{section.title}</Text>
              <View style={styles.checkList}>
                {section.items.map((item) => (
                  <View key={item} style={styles.checkRow}>
                    <CheckCircle2 size={15} color={colors.success} />
                    <Text style={styles.body}>{item}</Text>
                  </View>
                ))}
              </View>
            </Card>
          ))}

          <Card style={styles.deferredCard}>
            <View style={styles.titleRow}>
              <ShieldAlert size={20} color={colors.warning} />
              <Text style={styles.cardTitle}>Deferred before public launch</Text>
            </View>
            {deferredProductionItems.map((item) => (
              <Text key={item} style={styles.itemText}>- {item}</Text>
            ))}
          </Card>

          <Card>
            <Text style={styles.cardTitle}>Tester diagnostics</Text>
            <Text style={styles.body}>Share this if a tester reports login, sync, AI, notification, or data issues.</Text>
            <View style={styles.actionRow}>
              <Button title={showDiagnostics ? "Hide Details" : "Show Details"} variant="secondary" onPress={() => setShowDiagnostics((value) => !value)} style={styles.actionButton} />
              <Button title="Email Diagnostics" variant="secondary" onPress={emailDiagnostics} style={styles.actionButton}>
                <Mail size={18} color={colors.mulberry} />
                <Text style={styles.secondaryText}>Email Diagnostics</Text>
              </Button>
            </View>
            {showDiagnostics ? (
              <View style={styles.diagnosticsBox}>
                <Text selectable style={styles.diagnosticsText}>{diagnostics}</Text>
              </View>
            ) : null}
          </Card>

          {status ? <Text style={styles.status}>{status}</Text> : null}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function BuildMetric({ label, value }) {
  return (
    <View style={styles.buildMetric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
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
    marginBottom: 8
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
    ...typography.h3,
    marginBottom: 8
  },
  body: {
    ...typography.body,
    color: colors.muted
  },
  buildGrid: {
    gap: 8,
    marginTop: 12
  },
  buildMetric: {
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white
  },
  metricLabel: {
    ...typography.small,
    color: colors.muted
  },
  metricValue: {
    ...typography.bodyMedium,
    color: colors.ink
  },
  gateGrid: {
    gap: 10
  },
  gateCard: {
    backgroundColor: colors.mint
  },
  headingText: {
    flex: 1
  },
  gateTitle: {
    ...typography.bodyMedium,
    color: colors.ink
  },
  gateStatus: {
    ...typography.smallMedium,
    color: colors.mulberry
  },
  itemText: {
    ...typography.small,
    color: colors.muted,
    marginTop: 5
  },
  checkList: {
    gap: 9
  },
  checkRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start"
  },
  deferredCard: {
    backgroundColor: colors.lemon
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14
  },
  actionButton: {
    flex: 1
  },
  secondaryText: {
    color: colors.mulberry,
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    textAlign: "center"
  },
  diagnosticsBox: {
    maxHeight: 280,
    marginTop: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.lavender
  },
  diagnosticsText: {
    ...typography.small,
    color: colors.ink
  },
  status: {
    ...typography.body,
    color: colors.success,
    fontFamily: fonts.uiSemiBold
  }
});
