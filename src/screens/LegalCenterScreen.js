import React, { useState } from "react";
import { Linking, Modal, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ExternalLink, FileText, HeartPulse, Mail, ShieldCheck, Trash2, X } from "lucide-react-native";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { HealthDisclaimer } from "../components/Feedback";
import { appConfig } from "../constants/app";
import { legalDocuments, legalSummary } from "../constants/legal";
import { colors, fonts, layout, typography } from "../constants/theme";

export default function LegalCenterScreen({ appState, onClose }) {
  const [status, setStatus] = useState("");
  const account = appState.account || {};

  const openSupportEmail = async (type) => {
    const subject = type === "delete" ? "HerSaathi data deletion request" : "HerSaathi support request";
    const body =
      type === "delete"
        ? [
            "Hello HerSaathi Support,",
            "",
            "Please help me delete my HerSaathi account/cloud data.",
            "",
            `Signed-in email: ${account.email || "not signed in"}`,
            `Firebase UID: ${account.uid || "not available"}`,
            "",
            "I understand local data can be deleted from Profile > Data Management on my device."
          ].join("\n")
        : [
            "Hello HerSaathi Support,",
            "",
            "I need help with HerSaathi.",
            "",
            `Signed-in email: ${account.email || "not signed in"}`,
            `Firebase UID: ${account.uid || "not available"}`
          ].join("\n");

    const mailto = `mailto:${appConfig.officialEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    try {
      await Linking.openURL(mailto);
    } catch {
      setStatus(`Email ${appConfig.officialEmail} with subject: ${subject}`);
    }
  };

  const openPublicUrl = async (url, label) => {
    try {
      await Linking.openURL(url);
      setStatus(`Opened ${label}.`);
    } catch {
      setStatus(`Open ${url} to view ${label}.`);
    }
  };

  return (
    <Modal visible animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={styles.shell} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <View style={styles.titleRowNoMargin}>
            <ShieldCheck size={24} color={colors.plum} />
            <Text style={styles.title}>Legal & Safety</Text>
          </View>
          <Button variant="ghost" style={styles.iconButton} onPress={onClose} accessibilityLabel="Close legal center">
            <X size={24} color={colors.mulberry} />
          </Button>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Card style={styles.summaryCard}>
            <View style={styles.titleRow}>
              <HeartPulse size={20} color={colors.plum} />
              <Text style={styles.cardTitle}>HerSaathi safety promise</Text>
            </View>
            <Text style={styles.body}>
              HerSaathi is built as a local-first wellness companion. You control sync, exports, deletion, and support contact.
            </Text>
            <Text style={styles.metaText}>Last updated: {legalSummary.lastUpdated}</Text>
          </Card>

          <HealthDisclaimer />

          <Card>
            <View style={styles.titleRow}>
              <ExternalLink size={20} color={colors.plum} />
              <Text style={styles.cardTitle}>Public policy pages</Text>
            </View>
            <Text style={styles.body}>
              These are the same public pages used for Play Store review and privacy support.
            </Text>
            <View style={styles.linkGrid}>
              <Button title="Privacy Policy" variant="secondary" onPress={() => openPublicUrl(appConfig.privacyPolicyUrl, "Privacy Policy")} style={styles.linkButton} />
              <Button title="Terms of Use" variant="secondary" onPress={() => openPublicUrl(appConfig.termsUrl, "Terms of Use")} style={styles.linkButton} />
              <Button title="Medical & AI Safety" variant="secondary" onPress={() => openPublicUrl(appConfig.medicalSafetyUrl, "Medical & AI Safety")} style={styles.linkButton} />
              <Button title="Data Deletion" variant="secondary" onPress={() => openPublicUrl(appConfig.dataDeletionUrl, "Data Deletion")} style={styles.linkButton} />
            </View>
          </Card>

          {legalDocuments.map((document) => (
            <Card key={document.key}>
              <View style={styles.titleRow}>
                <FileText size={20} color={colors.mulberry} />
                <View style={styles.headingText}>
                  <Text style={styles.cardTitle}>{document.title}</Text>
                  <Text style={styles.metaText}>{document.subtitle}</Text>
                </View>
              </View>
              <View style={styles.sectionList}>
                {document.sections.map((section) => (
                  <View key={section.title} style={styles.legalSection}>
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                    <Text style={styles.body}>{section.body}</Text>
                  </View>
                ))}
              </View>
            </Card>
          ))}

          <Card style={styles.actionCard}>
            <View style={styles.titleRow}>
              <Mail size={20} color={colors.teal} />
              <Text style={styles.cardTitle}>Support & deletion requests</Text>
            </View>
            <Text style={styles.body}>
              Use these actions for public support, privacy questions, or account/cloud deletion requests.
            </Text>
            <View style={styles.actionRow}>
              <Button title="Email Support" variant="secondary" onPress={() => openSupportEmail("support")} style={styles.actionButton}>
                <Mail size={18} color={colors.mulberry} />
                <Text style={styles.secondaryText}>Email Support</Text>
              </Button>
              <Button title="Request Deletion" variant="secondary" onPress={() => openSupportEmail("delete")} style={styles.actionButton}>
                <Trash2 size={18} color={colors.mulberry} />
                <Text style={styles.secondaryText}>Request Deletion</Text>
              </Button>
            </View>
            <Text selectable style={styles.emailText}>{appConfig.officialEmail}</Text>
          </Card>

          {status ? <Text style={styles.status}>{status}</Text> : null}
        </ScrollView>
      </SafeAreaView>
    </Modal>
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
    marginBottom: 10
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
  actionCard: {
    backgroundColor: colors.mint
  },
  cardTitle: {
    ...typography.h3
  },
  headingText: {
    flex: 1
  },
  body: {
    ...typography.body,
    color: colors.muted
  },
  metaText: {
    ...typography.small,
    color: colors.muted
  },
  sectionList: {
    gap: 12
  },
  legalSection: {
    gap: 4,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: colors.border
  },
  sectionTitle: {
    ...typography.bodyMedium,
    color: colors.ink
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14
  },
  linkGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14
  },
  linkButton: {
    flexGrow: 1,
    flexBasis: "46%",
    minWidth: 140
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
  emailText: {
    ...typography.bodyMedium,
    color: colors.ink,
    marginTop: 14
  },
  status: {
    ...typography.body,
    color: colors.success,
    fontFamily: fonts.uiSemiBold
  }
});
