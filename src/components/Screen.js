import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, layout, typography } from "../constants/theme";

export function Screen({ title, subtitle, children, contentContainerStyle }) {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
    >
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: layout.screenPadding,
    gap: 16,
    paddingBottom: 28
  },
  header: {
    gap: 6
  },
  title: {
    ...typography.h2
  },
  subtitle: {
    ...typography.body,
    color: colors.muted
  }
});
