import React, { useEffect, useRef, useState } from "react";
import { Animated, Modal, ScrollView, StyleSheet, Text, View } from "react-native";
import { Droplets, HeartPulse, X } from "lucide-react-native";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { HealthDisclaimer } from "../components/Feedback";
import { colors, fonts, typography } from "../constants/theme";

const reliefOptions = {
  cramps: {
    title: "Cramps",
    remedy: "Use a warm compress, sip warm water, and try a slow child’s-pose stretch."
  },
  fatigue: {
    title: "Fatigue",
    remedy: "Eat something steady, hydrate, and choose a 10-minute rest before pushing through."
  },
  anxiety: {
    title: "Anxiety",
    remedy: "Place one hand on your chest, breathe out slowly, and reduce noise around you."
  },
  headache: {
    title: "Headache",
    remedy: "Drink water, dim bright light, loosen tight hair, and rest your eyes."
  }
};

export default function ReliefModeScreen({ onClose }) {
  const [selectedIssue, setSelectedIssue] = useState("cramps");
  const pulse = useRef(new Animated.Value(0)).current;
  const issue = reliefOptions[selectedIssue];

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 2600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 2600, useNativeDriver: true })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1.16] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.75, 0.32] });

  return (
    <Modal visible animationType="slide" presentationStyle="fullScreen">
      <ScrollView style={styles.shell} contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <HeartPulse size={24} color={colors.plum} />
            <Text style={styles.title}>Relief Mode</Text>
          </View>
          <Button variant="ghost" style={styles.closeButton} onPress={onClose} accessibilityLabel="Close relief mode">
            <X size={24} color={colors.mulberry} />
          </Button>
        </View>

        <Text style={styles.heroText}>I’m not feeling well</Text>
        <Text style={styles.subtle}>Pick what is bothering you. This mode uses no AI.</Text>

        <View style={styles.issueGrid}>
          {Object.entries(reliefOptions).map(([key, item]) => (
            <Button
              key={key}
              title={item.title}
              variant={selectedIssue === key ? "chipActive" : "chip"}
              style={styles.issueButton}
              onPress={() => setSelectedIssue(key)}
            />
          ))}
        </View>

        <Card style={styles.remedyCard}>
          <Text style={styles.cardTitle}>Quick remedy</Text>
          <Text style={styles.body}>{issue.remedy}</Text>
        </Card>

        <Card style={styles.breathingCard}>
          <Text style={styles.cardTitle}>Breathing pause</Text>
          <View style={styles.breathWrap}>
            <Animated.View style={[styles.breathCircle, { transform: [{ scale }], opacity }]} />
            <View style={styles.breathInner}>
              <Text style={styles.breathText}>Breathe</Text>
              <Text style={styles.breathSubtext}>in 4 • out 6</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.hydrationCard}>
          <View style={styles.titleRow}>
            <Droplets size={21} color={colors.teal} />
            <Text style={styles.cardTitle}>Hydration reminder</Text>
          </View>
          <Text style={styles.body}>Take a few slow sips of water now. Small care still counts.</Text>
        </Card>

        <HealthDisclaimer compact />
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: colors.background
  },
  wrap: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 24,
    gap: 16
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
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
  heroText: {
    ...typography.h1,
    color: colors.ink
  },
  subtle: {
    ...typography.body,
    color: colors.muted
  },
  issueGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  issueButton: {
    width: "48%"
  },
  remedyCard: {
    backgroundColor: colors.roseSoft
  },
  breathingCard: {
    alignItems: "center",
    gap: 16
  },
  hydrationCard: {
    backgroundColor: colors.mint
  },
  cardTitle: {
    ...typography.h3
  },
  body: {
    ...typography.body,
    color: colors.ink,
    marginTop: 6
  },
  breathWrap: {
    width: 190,
    height: 190,
    alignItems: "center",
    justifyContent: "center"
  },
  breathCircle: {
    position: "absolute",
    width: 148,
    height: 148,
    borderRadius: 74,
    backgroundColor: colors.lavender
  },
  breathInner: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: colors.plum,
    alignItems: "center",
    justifyContent: "center"
  },
  breathText: {
    color: colors.white,
    fontSize: 20,
    fontFamily: fonts.uiSemiBold
  },
  breathSubtext: {
    color: colors.white,
    fontSize: 12,
    fontFamily: fonts.uiRegular,
    marginTop: 4
  }
});
