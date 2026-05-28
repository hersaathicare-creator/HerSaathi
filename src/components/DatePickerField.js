import React, { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react-native";

import { colors, fonts, layout, typography } from "../constants/theme";
import { parseDateKey, toDateKey } from "../utils/date";
import { Button } from "./Button";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function DatePickerField({ label, value, onChange, helper }) {
  const selectedDate = parseDateKey(value) || new Date();
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  );

  const days = useMemo(() => buildMonthDays(visibleMonth), [visibleMonth]);
  const selectedKey = toDateKey(selectedDate);

  useEffect(() => {
    if (open) {
      setVisibleMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    }
  }, [open, selectedKey]);

  const changeMonth = (amount) => {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  };

  const selectDay = (date) => {
    onChange(toDateKey(date));
    setOpen(false);
  };

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value}`}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.inputButton, pressed && styles.pressed]}
      >
        <Text style={styles.inputText}>{value || "Select date"}</Text>
        <CalendarDays size={20} color={colors.mulberry} />
      </Pressable>
      {helper ? <Text style={styles.helper}>{helper}</Text> : null}

      <Modal visible={open} animationType="fade" transparent onRequestClose={() => setOpen(false)}>
        <View style={styles.overlay}>
          <SafeAreaView style={styles.modalSafe}>
            <View style={styles.panel}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalKicker}>Select date</Text>
                  <Text style={styles.modalTitle}>
                    {monthNames[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}
                  </Text>
                </View>
                <Button variant="ghost" style={styles.iconButton} onPress={() => setOpen(false)} accessibilityLabel="Close date picker">
                  <X size={22} color={colors.mulberry} />
                </Button>
              </View>

              <View style={styles.monthControls}>
                <Button variant="secondary" style={styles.monthButton} onPress={() => changeMonth(-1)} accessibilityLabel="Previous month">
                  <ChevronLeft size={20} color={colors.mulberry} />
                </Button>
                <Button variant="secondary" style={styles.todayButton} onPress={() => selectDay(new Date())} title="Today" />
                <Button variant="secondary" style={styles.monthButton} onPress={() => changeMonth(1)} accessibilityLabel="Next month">
                  <ChevronRight size={20} color={colors.mulberry} />
                </Button>
              </View>

              <View style={styles.weekGrid}>
                {weekDays.map((day) => (
                  <Text key={day} style={styles.weekDay}>
                    {day}
                  </Text>
                ))}
              </View>

              <View style={styles.dayGrid}>
                {days.map((item, index) => {
                  if (!item) return <View key={`empty-${index}`} style={styles.dayCell} />;
                  const dateKey = toDateKey(item);
                  const selected = dateKey === selectedKey;
                  return (
                    <Pressable
                      key={dateKey}
                      accessibilityRole="button"
                      accessibilityLabel={`Select ${dateKey}`}
                      onPress={() => selectDay(item)}
                      style={({ pressed }) => [
                        styles.dayCell,
                        selected && styles.dayCellSelected,
                        pressed && styles.pressed
                      ]}
                    >
                      <Text style={[styles.dayText, selected && styles.dayTextSelected]}>{item.getDate()}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}

function buildMonthDays(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const totalDays = new Date(year, month + 1, 0).getDate();
  const leadingEmpty = firstDay.getDay();
  const days = Array.from({ length: leadingEmpty }, () => null);

  for (let day = 1; day <= totalDays; day += 1) {
    days.push(new Date(year, month, day));
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
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
  inputButton: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    borderRadius: layout.radius,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10
  },
  inputText: {
    ...typography.body,
    color: colors.ink
  },
  helper: {
    ...typography.small
  },
  pressed: {
    opacity: 0.78
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.24)",
    justifyContent: "center",
    padding: 18
  },
  modalSafe: {
    width: "100%"
  },
  panel: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: 16,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 30,
    elevation: 4
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  modalKicker: {
    ...typography.smallMedium,
    color: colors.muted,
    textTransform: "uppercase"
  },
  modalTitle: {
    ...typography.h2
  },
  iconButton: {
    width: 44,
    height: 44,
    minHeight: 44,
    paddingHorizontal: 0
  },
  monthControls: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center"
  },
  monthButton: {
    width: 48,
    minHeight: 44,
    paddingHorizontal: 0
  },
  todayButton: {
    flex: 1,
    minHeight: 44
  },
  weekGrid: {
    flexDirection: "row"
  },
  weekDay: {
    ...typography.smallMedium,
    width: `${100 / 7}%`,
    textAlign: "center",
    color: colors.muted
  },
  dayGrid: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8
  },
  dayCellSelected: {
    backgroundColor: colors.plum
  },
  dayText: {
    ...typography.bodyMedium,
    color: colors.ink
  },
  dayTextSelected: {
    color: colors.white
  }
});
