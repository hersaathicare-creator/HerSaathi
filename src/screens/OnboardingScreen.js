import React, { useMemo, useState } from "react";
import { Image, StyleSheet, Switch, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Bell, ChevronLeft, LogIn, ShieldCheck, Sparkles } from "lucide-react-native";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { DatePickerField } from "../components/DatePickerField";
import { ErrorList } from "../components/Feedback";
import { Field, SegmentedOptions } from "../components/FormControls";
import { buildLegalConsent, legalSummary } from "../constants/legal";
import { colors, fonts, layout, typography } from "../constants/theme";
import { getCycleInfo } from "../utils/cycle";
import { toDateKey } from "../utils/date";
import { completeOnboarding } from "../utils/storage";
import { scheduleHerSaathiNotifications } from "../utils/notifications";
import { validateCycleSetup } from "../utils/validation";

const logo = require("../../image/logo.png");

const ageOptions = [
  { label: "Teen", value: "teen" },
  { label: "18-25", value: "18-25" },
  { label: "25-35", value: "25-35" },
  { label: "35+", value: "35+" }
];

export default function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useState(0);
  const [ageGroup, setAgeGroup] = useState("18-25");
  const [lastPeriodDate, setLastPeriodDate] = useState(toDateKey());
  const [averageCycleLength, setAverageCycleLength] = useState("28");
  const [periodDuration, setPeriodDuration] = useState("5");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState([]);

  const progressText = useMemo(() => `${step + 1} of 4`, [step]);

  const getCycleForm = () => ({
    lastPeriodDate,
    averageCycleLength: Number(averageCycleLength),
    periodDuration: Number(periodDuration)
  });

  const continueFromCycle = () => {
    const cycle = getCycleForm();
    const nextErrors = validateCycleSetup(cycle);
    if (nextErrors.length) {
      setErrors(nextErrors);
      return;
    }
    setErrors([]);
    setStep(3);
  };

  const finish = async () => {
    const cycle = getCycleForm();
    const nextErrors = validateCycleSetup(cycle);
    if (nextErrors.length) {
      setErrors(nextErrors);
      setStep(2);
      return;
    }

    await completeOnboarding({ ageGroup, cycle, notificationsEnabled, legalConsent: buildLegalConsent() });

    if (notificationsEnabled) {
      await scheduleHerSaathiNotifications(
        { enabled: true, dailyCheckIn: true, periodReminder: true, wellnessTip: true },
        getCycleInfo(cycle)
      );
    }

    onComplete();
  };

  return (
    <LinearGradient colors={[colors.lavender, colors.blush, colors.white]} style={styles.wrap}>
      <View style={styles.topBar}>
        {step > 0 ? (
          <Button
            variant="ghost"
            style={styles.backButton}
            onPress={() => {
              setErrors([]);
              setStep((value) => value - 1);
            }}
          >
            <ChevronLeft size={22} color={colors.mulberry} />
          </Button>
        ) : (
          <View style={styles.backButton} />
        )}
        <Text style={styles.progress}>{progressText}</Text>
      </View>

      <View style={styles.hero}>
        <Image source={logo} resizeMode="contain" style={styles.logo} />
        <Text style={styles.brand}>HerSaathi</Text>
      </View>

      <Card style={styles.panel}>
        {step === 0 && (
          <View style={styles.step}>
            <Text style={styles.title}>Understand your body better.</Text>
            <Text style={styles.copy}>A simple period and wellness companion that starts with only the essentials.</Text>
            <View style={styles.actions}>
              <Button title="Get Started" onPress={() => setStep(1)} />
              <Button variant="secondary" onPress={() => setMessage("Gmail login is structured for the next auth stage.")}>
                <LogIn size={19} color={colors.mulberry} />
                <Text style={styles.secondaryText}>Login with Gmail</Text>
              </Button>
              <Button variant="soft" onPress={() => setStep(1)}>
                <Sparkles size={19} color={colors.mulberry} />
                <Text style={styles.secondaryText}>Run Setup Wizard</Text>
              </Button>
            </View>
            {message ? <Text style={styles.note}>{message}</Text> : null}
          </View>
        )}

        {step === 1 && (
          <View style={styles.step}>
            <Text style={styles.title}>Choose your age group</Text>
            <Text style={styles.copy}>This helps keep guidance age-aware without asking for your birth date.</Text>
            <SegmentedOptions options={ageOptions} value={ageGroup} onChange={setAgeGroup} />
            <Button title="Continue" onPress={() => setStep(2)} />
          </View>
        )}

        {step === 2 && (
          <View style={styles.step}>
            <Text style={styles.title}>Set up your cycle</Text>
            <Text style={styles.copy}>You can edit these anytime from tracking.</Text>
            <DatePickerField label="Last period date" value={lastPeriodDate} onChange={setLastPeriodDate} />
            <Field
              label="Average cycle length"
              value={averageCycleLength}
              onChangeText={setAverageCycleLength}
              keyboardType="number-pad"
              placeholder="28"
            />
            <Field
              label="Period duration"
              value={periodDuration}
              onChangeText={setPeriodDuration}
              keyboardType="number-pad"
              placeholder="5"
            />
            <ErrorList errors={errors} />
            <Button title="Continue" onPress={continueFromCycle} />
          </View>
        )}

        {step === 3 && (
          <View style={styles.step}>
            <View style={styles.privacyIcon}>
              <ShieldCheck size={30} color={colors.plum} />
            </View>
            <Text style={styles.title}>Your data stays on your device.</Text>
            <Text style={styles.copy}>HerSaathi stores cycle, mood, and symptom records locally first. Cloud sync and cloud AI are optional.</Text>
            <View style={styles.legalBox}>
              <Text style={styles.legalTitle}>Privacy, terms, and safety</Text>
              <Text style={styles.legalText}>
                By continuing, you accept the Privacy Policy and Terms of Use version {legalSummary.privacyVersion}. HerSaathi is wellness support only, not medical diagnosis or emergency care.
              </Text>
            </View>
            <View style={styles.switchRow}>
              <View style={styles.switchText}>
                <View style={styles.inlineTitle}>
                  <Bell size={18} color={colors.mulberry} />
                  <Text style={styles.switchLabel}>Enable notifications</Text>
                </View>
                <Text style={styles.switchHelp}>Daily check-ins, period reminders, and wellness tips.</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: colors.border, true: colors.roseSoft }}
                thumbColor={notificationsEnabled ? colors.rose : colors.white}
              />
            </View>
            <Button title="Continue" onPress={finish} />
          </View>
        )}
      </Card>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    padding: layout.screenPadding,
    justifyContent: "space-between"
  },
  topBar: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 26
  },
  backButton: {
    width: 46,
    height: 46,
    paddingHorizontal: 0
  },
  progress: {
    ...typography.small,
    fontFamily: fonts.uiSemiBold,
    color: colors.mulberry
  },
  hero: {
    alignItems: "center",
    gap: 10
  },
  logo: {
    width: 124,
    height: 124,
    borderRadius: 24
  },
  brand: {
    ...typography.brand,
    color: colors.mulberry
  },
  panel: {
    marginBottom: 18
  },
  step: {
    gap: 16
  },
  title: {
    ...typography.h2
  },
  copy: {
    ...typography.body,
    color: colors.muted
  },
  actions: {
    gap: 10
  },
  secondaryText: {
    color: colors.mulberry,
    fontFamily: fonts.uiMedium,
    fontSize: 15
  },
  note: {
    ...typography.small,
    color: colors.plum
  },
  privacyIcon: {
    width: 56,
    height: 56,
    borderRadius: layout.radius,
    backgroundColor: colors.roseSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.radius,
    backgroundColor: colors.white
  },
  legalBox: {
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.radius,
    backgroundColor: colors.white,
    gap: 4
  },
  legalTitle: {
    ...typography.bodyMedium,
    color: colors.ink
  },
  legalText: {
    ...typography.small,
    color: colors.muted
  },
  switchText: {
    flex: 1,
    gap: 4
  },
  inlineTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  switchLabel: {
    color: colors.ink,
    fontFamily: fonts.uiSemiBold,
    fontSize: 15
  },
  switchHelp: {
    ...typography.small
  }
});
