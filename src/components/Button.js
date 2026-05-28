import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts, layout } from "../constants/theme";

const variants = StyleSheet.create({
  primary: {
    backgroundColor: colors.plum,
    borderColor: colors.plum
  },
  secondary: {
    backgroundColor: colors.white,
    borderColor: colors.border
  },
  ghost: {
    backgroundColor: "transparent",
    borderColor: "transparent"
  },
  chip: {
    backgroundColor: colors.white,
    borderColor: colors.border
  },
  chipActive: {
    backgroundColor: colors.mulberry,
    borderColor: colors.mulberry
  },
  soft: {
    backgroundColor: colors.roseSoft,
    borderColor: colors.roseSoft
  },
  tab: {
    backgroundColor: "transparent",
    borderColor: "transparent"
  },
  tabActive: {
    backgroundColor: colors.plum,
    borderColor: colors.plum
  }
});

export function Button({
  title,
  children,
  onPress,
  variant = "primary",
  style,
  textStyle,
  disabled = false,
  accessibilityLabel
}) {
  const activeVariant = variants[variant] || variants.primary;
  const isDark = variant === "primary" || variant === "chipActive" || variant === "tabActive";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        activeVariant,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style
      ]}
    >
      {children ? (
        <View style={styles.content}>{children}</View>
      ) : (
        <Text style={[styles.text, isDark && styles.textDark, textStyle]} numberOfLines={2}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: layout.radius,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4
  },
  text: {
    color: colors.mulberry,
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    textAlign: "center"
  },
  textDark: {
    color: colors.white
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }]
  },
  disabled: {
    opacity: 0.45
  }
});
