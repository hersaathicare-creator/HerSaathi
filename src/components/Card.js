import React from "react";
import { StyleSheet, View } from "react-native";
import { cardStyle } from "../constants/theme";

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    ...cardStyle,
    padding: 16
  }
});
