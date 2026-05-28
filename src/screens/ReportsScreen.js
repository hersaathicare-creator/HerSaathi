import React, { useMemo } from "react";
import { Modal, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BarChart3, CalendarDays, ClipboardList, FileText, HeartPulse, ShieldCheck, TrendingUp, X } from "lucide-react-native";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState, HealthDisclaimer } from "../components/Feedback";
import { FadeInView, ProgressBar, StatTile } from "../components/Motion";
import { colors, layout, typography } from "../constants/theme";
import { buildWellnessReport } from "../utils/reports";

export default function ReportsScreen({ appState, onClose }) {
  const report = useMemo(() => buildWellnessReport(appState), [appState]);
  const maxSymptomCount = Math.max(1, ...report.symptomFrequency.map((item) => item.count));
  const maxMoodCount = Math.max(1, ...report.moodSummary.items.map((item) => item.count));

  return (
    <Modal visible animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={styles.shell} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <View style={styles.titleRowNoMargin}>
            <FileText size={24} color={colors.plum} />
            <Text style={styles.title}>Reports</Text>
          </View>
          <Button variant="ghost" style={styles.closeButton} onPress={onClose} accessibilityLabel="Close reports">
            <X size={24} color={colors.mulberry} />
          </Button>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <FadeInView>
            <Card style={styles.heroCard}>
              <View style={styles.rowBetween}>
                <Text style={styles.kicker}>Cycle summary</Text>
                <Text style={styles.privateBadge}>Local only</Text>
              </View>
              <Text style={styles.heroTitle}>{report.cycleInfo.phase}</Text>
              <Text style={styles.body}>
                {report.cycleInfo.currentDay
                  ? `Day ${report.cycleInfo.currentDay}. Next period in ${report.cycleInfo.nextPeriodCountdown} days.`
                  : "Add cycle details to unlock forecasts."}
              </Text>
              <View style={styles.metricsRow}>
                <StatTile label="Period logs" value={report.totals.periodEntries} />
                <StatTile label="Symptoms" value={report.totals.symptomLogs} />
                <StatTile label="Check-ins" value={report.totals.checkIns} />
              </View>
            </Card>
          </FadeInView>

          <FadeInView delay={50}>
            <HealthDisclaimer compact />
          </FadeInView>

          <FadeInView delay={80}>
          <Card>
            <View style={styles.titleRow}>
              <CalendarDays size={20} color={colors.plum} />
              <Text style={styles.cardTitle}>Period forecast</Text>
            </View>
            {report.forecast.length ? (
              report.forecast.map((item) => (
                <View key={item.label} style={styles.forecastRow}>
                  <Text style={styles.forecastLabel}>{item.label}</Text>
                  <Text style={styles.forecastDate}>{item.startDate} to {item.endDate}</Text>
                </View>
              ))
            ) : (
              <EmptyState
                icon={CalendarDays}
                title="No forecast yet"
                body="Add your last period date to unlock cycle forecasts."
              />
            )}
          </Card>
          </FadeInView>

          <FadeInView delay={140}>
          <Card>
            <View style={styles.titleRow}>
              <TrendingUp size={20} color={colors.teal} />
              <Text style={styles.cardTitle}>Cycle patterns</Text>
            </View>
            <View style={styles.metricsRow}>
              <StatTile label="Avg period" value={`${report.periodStats.averageDuration}d`} />
              <StatTile label="Cycle length" value={`${report.periodStats.expectedCycleLength}d`} />
            </View>
            <Text style={styles.body}>
              {report.periodStats.lastPeriodDate
                ? `Last period started ${report.periodStats.lastPeriodDate}.`
                : "Last period date has not been set."}
            </Text>
          </Card>
          </FadeInView>

          <FadeInView delay={200}>
          <Card>
            <View style={styles.titleRow}>
              <HeartPulse size={20} color={colors.plum} />
              <Text style={styles.cardTitle}>Symptom trends</Text>
            </View>
            {report.symptomFrequency.length ? (
              report.symptomFrequency.map((item) => (
                <Bar key={item.key} label={item.label} value={item.count} max={maxSymptomCount} />
              ))
            ) : (
              <EmptyState
                icon={HeartPulse}
                title="No symptom trend yet"
                body="Log symptoms for a few days to see patterns here."
              />
            )}
          </Card>
          </FadeInView>

          <FadeInView delay={260}>
          <Card>
            <View style={styles.titleRow}>
              <BarChart3 size={20} color={colors.teal} />
              <Text style={styles.cardTitle}>Mood check-ins</Text>
            </View>
            {report.moodSummary.items.map((item) => (
              <Bar key={item.key} label={item.label} value={item.count} max={maxMoodCount} />
            ))}
            <Text style={styles.body}>
              {report.moodSummary.mostCommon
                ? `Most common mood: ${report.moodSummary.mostCommon.label}.`
                : "No mood pattern yet. Daily check-ins will build this report."}
            </Text>
          </Card>
          </FadeInView>

          <FadeInView delay={320}>
          <Card>
            <View style={styles.titleRow}>
              <ShieldCheck size={20} color={colors.success} />
              <Text style={styles.cardTitle}>AI-ready private context</Text>
            </View>
            <Text style={styles.contextText}>{JSON.stringify(report.aiContext)}</Text>
          </Card>
          </FadeInView>

          <FadeInView delay={380}>
          <Card>
            <View style={styles.titleRow}>
              <ClipboardList size={20} color={colors.plum} />
              <Text style={styles.cardTitle}>Recent timeline</Text>
            </View>
            {report.timeline.length ? (
              report.timeline.map((item) => (
                <View key={item.id} style={styles.timelineItem}>
                  <Text style={styles.timelineDate}>{item.date}</Text>
                  <Text style={styles.timelineTitle}>{item.title}</Text>
                  <Text style={styles.body}>{item.detail}</Text>
                </View>
              ))
            ) : (
              <EmptyState
                icon={ClipboardList}
                title="No timeline yet"
                body="Period logs, symptoms, and check-ins will appear here."
              />
            )}
          </Card>
          </FadeInView>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function Bar({ label, value, max }) {
  const progress = value / max;

  return (
    <View style={styles.barWrap}>
      <View style={styles.barTop}>
        <Text style={styles.barLabel}>{label}</Text>
        <Text style={styles.barValue}>{value}</Text>
      </View>
      <ProgressBar progress={progress} />
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
  closeButton: {
    width: 46,
    height: 46,
    paddingHorizontal: 0
  },
  content: {
    padding: layout.screenPadding,
    gap: 14,
    paddingBottom: 30
  },
  heroCard: {
    backgroundColor: colors.roseSoft
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10
  },
  kicker: {
    ...typography.smallMedium,
    color: colors.mulberry,
    textTransform: "uppercase"
  },
  privateBadge: {
    ...typography.smallMedium,
    color: colors.success,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.white,
    overflow: "hidden"
  },
  heroTitle: {
    ...typography.h1,
    marginTop: 4
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
    marginTop: 14
  },
  forecastRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: colors.border
  },
  forecastLabel: {
    ...typography.bodyMedium,
    color: colors.ink
  },
  forecastDate: {
    ...typography.smallMedium,
    color: colors.muted,
    textAlign: "right",
    flex: 1
  },
  barWrap: {
    gap: 6,
    marginBottom: 12
  },
  barTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8
  },
  barLabel: {
    ...typography.bodyMedium
  },
  barValue: {
    ...typography.bodyMedium,
    color: colors.mulberry
  },
  contextText: {
    ...typography.small,
    color: colors.ink,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.lavender,
    overflow: "hidden"
  },
  timelineItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: colors.border
  },
  timelineDate: {
    ...typography.smallMedium,
    color: colors.mulberry
  },
  timelineTitle: {
    ...typography.bodyMedium,
    marginTop: 2
  }
});
