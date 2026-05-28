import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Check, Circle } from "lucide-react-native";
import { Button } from "./Button";
import { colors, fonts, layout, typography } from "../constants/theme";

export function Field({ label, value, onChangeText, placeholder, keyboardType = "default" }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        placeholderTextColor={colors.placeholder}
        style={styles.input}
      />
    </View>
  );
}

export function SegmentedOptions({ options, value, onChange, columns = 2 }) {
  return (
    <View style={styles.segmentWrap}>
      {options.map((option) => {
        const active = value === option.value;
        return (
          <Button
            key={option.value}
            title={option.label}
            variant={active ? "chipActive" : "chip"}
            style={[styles.option, { flexBasis: `${100 / columns - 2}%` }]}
            onPress={() => onChange(option.value)}
          />
        );
      })}
    </View>
  );
}

export function CheckOption({ label, checked, onPress }) {
  return (
    <Button variant={checked ? "chipActive" : "chip"} style={styles.checkOption} onPress={onPress}>
      <View style={styles.checkContent}>
        {checked ? <Check size={18} color={colors.white} /> : <Circle size={18} color={colors.mulberry} />}
        <Text style={[styles.checkText, checked && styles.checkTextActive]}>{label}</Text>
      </View>
    </Button>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 8
  },
  label: {
    ...typography.small,
    color: colors.mulberry,
    fontFamily: fonts.uiSemiBold
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    borderRadius: layout.radius,
    paddingHorizontal: 14,
    color: colors.ink,
    fontFamily: fonts.uiRegular,
    fontSize: 15
  },
  segmentWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  option: {
    flexGrow: 1
  },
  checkOption: {
    alignItems: "stretch"
  },
  checkContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  checkText: {
    color: colors.mulberry,
    fontFamily: fonts.uiMedium,
    fontSize: 14
  },
  checkTextActive: {
    color: colors.white
  }
});
