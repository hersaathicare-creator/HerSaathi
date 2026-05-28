import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Bot, CalendarDays, HeartPulse, Moon, PenLine, Plus, Sparkles } from "lucide-react-native";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { FadeInView, ProgressBar, StatTile } from "../components/Motion";
import { Screen } from "../components/Screen";
import { colors, fonts, typography } from "../constants/theme";
import { getCycleInfo } from "../utils/cycle";
import { addDailyCheckIn, getTodayCheckIn } from "../utils/storage";

const moodOptions = [
  { label: "Good", value: "good" },
  { label: "Okay", value: "okay" },
  { label: "Bad", value: "bad" }
];

export default function HomeScreen({ appState, refreshAppState, navigate }) {
  const [savingMood, setSavingMood] = useState(false);
  const todayCheckIn = getTodayCheckIn(appState.checkIns);
  const recentSymptoms = appState.symptomLogs?.[0]?.symptoms || appState.periodEntries?.[0]?.symptoms || [];
  const latestMood = appState.checkIns?.[0]?.mood;
  const cycleInfo = useMemo(
    () => getCycleInfo(appState.cycle, recentSymptoms, latestMood),
    [appState.cycle, latestMood, recentSymptoms]
  );

  const cycleLength = Number(appState.cycle.averageCycleLength) || 28;
  const cycleProgress = cycleInfo.currentDay ? cycleInfo.currentDay / cycleLength : 0;

  const handleMood = async (mood) => {
    setSavingMood(true);
    await addDailyCheckIn(mood);
    await refreshAppState();
    setSavingMood(false);
  };

  const phaseLine = cycleInfo.currentDay
    ? `Day ${cycleInfo.currentDay} - ${cycleInfo.phase}`
    : "Add cycle details to begin";

  const countdown = cycleInfo.nextPeriodCountdown
    ? cycleInfo.nextPeriodCountdown === 1
      ? "Tomorrow"
      : `${cycleInfo.nextPeriodCountdown} days`
    : "--";

  return (
    <Screen contentContainerStyle={styles.screen}>
      <FadeInView style={styles.header}>
        <Text style={styles.eyebrow}>Today</Text>
        <Text style={styles.greeting}>Hi {appState.profile.name || "Saathi"}</Text>
        <Text style={styles.subtle}>A calm snapshot of your cycle and wellness.</Text>
      </FadeInView>

      <FadeInView delay={80}>
        <Card style={styles.cycleCard}>
          <View style={styles.rowBetween}>
            <View style={styles.cardTitleRow}>
              <Sparkles size={20} color={colors.plum} />
              <Text style={styles.cardTitle}>Cycle status</Text>
            </View>
            <Text style={styles.badge}>{cycleInfo.phase}</Text>
          </View>
          <Text style={styles.phaseLine}>{phaseLine}</Text>
          <ProgressBar progress={cycleProgress} delay={150} />
          <View style={styles.statRow}>
            <StatTile label="Next period" value={countdown} />
            <StatTile label="Cycle length" value={`${cycleLength}d`} />
          </View>
        </Card>
      </FadeInView>

      <FadeInView delay={150}>
        <Card>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>How are you today?</Text>
            {todayCheckIn ? <Text style={styles.doneBadge}>Done</Text> : null}
          </View>
          <Text style={styles.subtle}>
            {todayCheckIn ? `Checked in as ${todayCheckIn.mood}. You can log again tomorrow.` : "One gentle check-in per day."}
          </Text>
          <View style={styles.moodRow}>
            {moodOptions.map((option) => (
              <Button
                key={option.value}
                title={option.label}
                variant={todayCheckIn?.mood === option.value ? "chipActive" : "chip"}
                style={styles.moodButton}
                disabled={Boolean(todayCheckIn) || savingMood}
                onPress={() => handleMood(option.value)}
              />
            ))}
          </View>
        </Card>
      </FadeInView>

      <FadeInView delay={220}>
        <Card style={styles.insightCard}>
          <View style={styles.cardTitleRow}>
            <Moon size={20} color={colors.teal} />
            <Text style={styles.cardTitle}>Today's insight</Text>
          </View>
          <Text style={styles.insightText}>{cycleInfo.insight}</Text>
        </Card>
      </FadeInView>

      <FadeInView delay={290}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick actions</Text>
          <CalendarDays size={18} color={colors.muted} />
        </View>
        <View style={styles.quickGrid}>
          <QuickAction icon={Plus} label="Log Period" onPress={() => navigate("track", { mode: "period" })} />
          <QuickAction icon={PenLine} label="Log Symptoms" onPress={() => navigate("track", { mode: "symptoms" })} />
          <QuickAction icon={HeartPulse} label="Relief Mode" onPress={() => navigate("relief")} />
          <QuickAction icon={Bot} label="Ask AI" onPress={() => navigate("ai")} />
        </View>
      </FadeInView>
    </Screen>
  );
}

function QuickAction({ icon: Icon, label, onPress }) {
  return (
    <Button variant="secondary" style={styles.quickAction} onPress={onPress}>
      <Icon size={22} color={colors.plum} />
      <Text style={styles.quickText}>{label}</Text>
    </Button>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: 16
  },
  header: {
    gap: 4
  },
  eyebrow: {
    ...typography.smallMedium,
    color: colors.muted,
    textTransform: "uppercase"
  },
  greeting: {
    ...typography.h1,
    color: colors.ink
  },
  subtle: {
    ...typography.body,
    color: colors.muted
  },
  cycleCard: {
    backgroundColor: colors.roseSoft,
    gap: 14
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  cardTitle: {
    ...typography.h3
  },
  badge: {
    ...typography.smallMedium,
    color: colors.mulberry,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: colors.white,
    borderRadius: 999,
    overflow: "hidden"
  },
  doneBadge: {
    ...typography.smallMedium,
    color: colors.success,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: colors.mint,
    borderRadius: 999,
    overflow: "hidden"
  },
  phaseLine: {
    fontSize: 28,
    lineHeight: 34,
    color: colors.ink,
    fontFamily: fonts.premiumBold
  },
  statRow: {
    flexDirection: "row",
    gap: 10
  },
  moodRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14
  },
  moodButton: {
    flex: 1,
    paddingHorizontal: 6
  },
  insightCard: {
    backgroundColor: colors.mint
  },
  insightText: {
    ...typography.body,
    color: colors.ink,
    marginTop: 10
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10
  },
  sectionTitle: {
    ...typography.h3
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  quickAction: {
    width: "48%",
    minHeight: 86
  },
  quickText: {
    color: colors.mulberry,
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    textAlign: "center"
  }
});
