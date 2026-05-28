import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AlertCircle, Inbox, ShieldAlert } from "lucide-react-native";

import { colors, fonts, layout, typography } from "../constants/theme";

export function ErrorList({ errors }) {
  if (!errors?.length) return null;

  return (
    <View style={styles.errorBox}>
      <AlertCircle size={18} color={colors.warning} />
      <View style={styles.errorTextWrap}>
        {errors.map((error) => (
          <Text key={error} style={styles.errorText}>
            {error}
          </Text>
        ))}
      </View>
    </View>
  );
}

export function HealthDisclaimer({ compact = false, style }) {
  return (
    <View style={[styles.disclaimer, compact && styles.disclaimerCompact, style]}>
      <ShieldAlert size={18} color={colors.warning} />
      <Text style={styles.disclaimerText}>
        HerSaathi supports wellness tracking only. It is not a medical diagnosis tool. Seek medical care for severe pain,
        heavy bleeding, fainting, fever, pregnancy concerns, or symptoms that feel unusual.
      </Text>
    </View>
  );
}

export function EmptyState({ title, body, icon: Icon = Inbox }) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Icon size={22} color={colors.plum} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {body ? <Text style={styles.emptyBody}>{body}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  errorBox: {
    flexDirection: "row",
    gap: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(184,106,0,0.28)",
    borderRadius: layout.radius,
    backgroundColor: "#FFF8EC"
  },
  errorTextWrap: {
    flex: 1,
    gap: 4
  },
  errorText: {
    ...typography.smallMedium,
    color: colors.warning
  },
  disclaimer: {
    flexDirection: "row",
    gap: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.radius,
    backgroundColor: colors.lemon
  },
  disclaimerCompact: {
    padding: 10
  },
  disclaimerText: {
    flex: 1,
    ...typography.small,
    color: colors.muted
  },
  emptyState: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    borderRadius: layout.radius,
    backgroundColor: colors.white
  },
  emptyIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.roseSoft
  },
  emptyTitle: {
    ...typography.bodyMedium,
    color: colors.ink,
    textAlign: "center"
  },
  emptyBody: {
    ...typography.small,
    color: colors.muted,
    textAlign: "center",
    fontFamily: fonts.uiRegular
  }
});
