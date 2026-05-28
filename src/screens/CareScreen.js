import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Bed, Droplets, Salad, Wind } from "lucide-react-native";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { HealthDisclaimer } from "../components/Feedback";
import { Screen } from "../components/Screen";
import { colors, typography } from "../constants/theme";

const careTips = [
  {
    icon: Droplets,
    title: "Hydration tip",
    text: "Keep a water bottle nearby and sip steadily through the day."
  },
  {
    icon: Salad,
    title: "Food tip",
    text: "Add iron-rich food, fruit, and a gentle protein source when energy dips."
  },
  {
    icon: Bed,
    title: "Sleep reminder",
    text: "A calmer bedtime and less screen light can support mood and recovery."
  }
];

export default function CareScreen({ navigate }) {
  return (
    <Screen title="Care" subtitle="Static wellness support for Stage 1.">
      <Text style={styles.sectionTitle}>Today’s care</Text>
      {careTips.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.title}>
            <View style={styles.tipRow}>
              <View style={styles.iconBox}>
                <Icon size={22} color={colors.plum} />
              </View>
              <View style={styles.tipText}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.body}>{item.text}</Text>
              </View>
            </View>
          </Card>
        );
      })}

      <Card style={styles.exerciseCard}>
        <View style={styles.tipRow}>
          <View style={[styles.iconBox, styles.tealBox]}>
            <Wind size={22} color={colors.teal} />
          </View>
          <View style={styles.tipText}>
            <Text style={styles.cardTitle}>Quick exercise</Text>
            <Text style={styles.body}>Try 2 minutes of gentle stretching, then breathe in for 4 and out for 6.</Text>
          </View>
        </View>
        <Button title="Open Relief Mode" variant="secondary" onPress={() => navigate("relief")} />
      </Card>

      <HealthDisclaimer compact />
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    ...typography.h3
  },
  tipRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start"
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.roseSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  tealBox: {
    backgroundColor: colors.mint
  },
  tipText: {
    flex: 1,
    gap: 4
  },
  cardTitle: {
    ...typography.h3
  },
  body: {
    ...typography.body,
    color: colors.muted
  },
  exerciseCard: {
    gap: 14,
    backgroundColor: colors.lemon
  }
});
