import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { colors, fonts, typography } from "../constants/theme";

export function FadeInView({ children, delay = 0, style }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 420,
        delay,
        useNativeDriver: true
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 420,
        delay,
        useNativeDriver: true
      })
    ]).start();
  }, [delay, opacity, translateY]);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}

export function ProgressBar({ progress = 0, delay = 80 }) {
  const width = useRef(new Animated.Value(0)).current;
  const clampedProgress = Math.max(0, Math.min(1, progress));

  useEffect(() => {
    Animated.timing(width, {
      toValue: clampedProgress,
      duration: 720,
      delay,
      useNativeDriver: false
    }).start();
  }, [clampedProgress, delay, width]);

  const animatedWidth = width.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"]
  });

  return (
    <View style={styles.progressTrack}>
      <Animated.View style={[styles.progressFill, { width: animatedWidth }]} />
    </View>
  );
}

export function StatTile({ label, value }) {
  return (
    <View style={styles.statTile}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.lavender,
    overflow: "hidden"
  },
  progressFill: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.plum
  },
  statTile: {
    flex: 1,
    minHeight: 76,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    justifyContent: "center"
  },
  statValue: {
    fontSize: 21,
    lineHeight: 27,
    fontFamily: fonts.premiumBold,
    color: colors.ink
  },
  statLabel: {
    ...typography.small,
    marginTop: 2
  }
});
