import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Bot, HeartPulse, Home, Settings, Stethoscope } from "lucide-react-native";
import { Poppins_400Regular } from "@expo-google-fonts/poppins/400Regular";
import { Poppins_500Medium } from "@expo-google-fonts/poppins/500Medium";
import { Poppins_600SemiBold } from "@expo-google-fonts/poppins/600SemiBold";
import { Poppins_700Bold } from "@expo-google-fonts/poppins/700Bold";
import { Poppins_800ExtraBold } from "@expo-google-fonts/poppins/800ExtraBold";
import { DMSans_400Regular } from "@expo-google-fonts/dm-sans/400Regular";
import { DMSans_500Medium } from "@expo-google-fonts/dm-sans/500Medium";
import { DMSans_600SemiBold } from "@expo-google-fonts/dm-sans/600SemiBold";
import { DMSans_700Bold } from "@expo-google-fonts/dm-sans/700Bold";

import { ErrorBoundary } from "./src/components/ErrorBoundary";
import AIAssistantScreen from "./src/screens/AIAssistantScreen";
import CareScreen from "./src/screens/CareScreen";
import DataManagementScreen from "./src/screens/DataManagementScreen";
import HomeScreen from "./src/screens/HomeScreen";
import LegalCenterScreen from "./src/screens/LegalCenterScreen";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import ReadinessScreen from "./src/screens/ReadinessScreen";
import ReliefModeScreen from "./src/screens/ReliefModeScreen";
import ReportsScreen from "./src/screens/ReportsScreen";
import TrackScreen from "./src/screens/TrackScreen";
import { Button } from "./src/components/Button";
import { colors, fonts, layout, typography } from "./src/constants/theme";
import { watchFirebaseUser } from "./src/services/firebase";
import { loadAppState, saveSignedInAccount } from "./src/utils/storage";

const logo = require("./image/logo.png");

const tabs = [
  { key: "home", label: "Home", icon: Home },
  { key: "track", label: "Track", icon: HeartPulse },
  { key: "care", label: "Care", icon: Stethoscope },
  { key: "ai", label: "AI", icon: Bot },
  { key: "profile", label: "Profile", icon: Settings }
];

function SplashScreen({ fontsLoaded = false }) {
  return (
    <LinearGradient colors={[colors.lavender, colors.blush, colors.white]} style={styles.splash}>
      <StatusBar style="dark" />
      <View style={styles.logoWrap}>
        <Image source={logo} resizeMode="contain" style={styles.logo} />
      </View>
      <ActivityIndicator color={colors.plum} />
      <Text style={fontsLoaded ? styles.splashText : styles.splashTextFallback}>Your wellness companion</Text>
    </LinearGradient>
  );
}

function BottomNav({ activeTab, onChange }) {
  return (
    <View style={styles.nav}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.key;
        return (
          <Button
            key={tab.key}
            variant={active ? "tabActive" : "tab"}
            style={styles.tabButton}
            textStyle={styles.tabText}
            onPress={() => onChange(tab.key)}
            accessibilityLabel={`${tab.label} tab`}
          >
            <Icon size={20} color={active ? colors.white : colors.mulberry} strokeWidth={2.4} />
            <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
          </Button>
        );
      })}
    </View>
  );
}

function MainApp({ appState, refreshAppState, completeOnboarding }) {
  const [activeTab, setActiveTab] = useState("home");
  const [reliefOpen, setReliefOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [dataManagementOpen, setDataManagementOpen] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);
  const [readinessOpen, setReadinessOpen] = useState(false);
  const [trackMode, setTrackMode] = useState(null);

  const navigate = useCallback((target, options = {}) => {
    if (target === "relief") {
      setReliefOpen(true);
      return;
    }
    if (target === "reports") {
      setReportsOpen(true);
      return;
    }
    if (target === "data-management") {
      setDataManagementOpen(true);
      return;
    }
    if (target === "legal") {
      setLegalOpen(true);
      return;
    }
    if (target === "readiness") {
      setReadinessOpen(true);
      return;
    }
    if (target === "track" && options.mode) {
      setTrackMode(options.mode);
    }
    setActiveTab(target);
  }, []);

  const screenProps = useMemo(
    () => ({ appState, refreshAppState, navigate }),
    [appState, navigate, refreshAppState]
  );

  if (!appState.onboardingComplete) {
    return <OnboardingScreen onComplete={completeOnboarding} refreshAppState={refreshAppState} />;
  }

  return (
    <SafeAreaView style={styles.appShell} edges={["top", "bottom"]}>
      <View style={styles.content}>
        {activeTab === "home" && <HomeScreen {...screenProps} />}
        {activeTab === "track" && (
          <TrackScreen {...screenProps} initialMode={trackMode} onModeHandled={() => setTrackMode(null)} />
        )}
        {activeTab === "care" && <CareScreen {...screenProps} />}
        {activeTab === "ai" && <AIAssistantScreen {...screenProps} />}
        {activeTab === "profile" && <ProfileScreen {...screenProps} />}
      </View>
      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
      {reliefOpen && <ReliefModeScreen appState={appState} onClose={() => setReliefOpen(false)} />}
      {reportsOpen && <ReportsScreen appState={appState} onClose={() => setReportsOpen(false)} />}
      {dataManagementOpen && (
        <DataManagementScreen
          appState={appState}
          refreshAppState={refreshAppState}
          onClose={() => setDataManagementOpen(false)}
        />
      )}
      {legalOpen && <LegalCenterScreen appState={appState} onClose={() => setLegalOpen(false)} />}
      {readinessOpen && <ReadinessScreen appState={appState} onClose={() => setReadinessOpen(false)} />}
    </SafeAreaView>
  );
}

function AppRoot() {
  const [booting, setBooting] = useState(true);
  const [appState, setAppState] = useState(null);
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold
  });

  const refreshAppState = useCallback(async () => {
    const nextState = await loadAppState();
    setAppState(nextState);
    return nextState;
  }, []);

  useEffect(() => {
    let mounted = true;
    const boot = async () => {
      const minimumSplash = new Promise((resolve) => setTimeout(resolve, 1300));
      const state = await loadAppState();
      await minimumSplash;
      if (mounted) {
        setAppState(state);
        setBooting(false);
      }
    };
    boot();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = watchFirebaseUser(async (user) => {
      if (!user) return;
      await saveSignedInAccount(user);
      await refreshAppState();
    });
    return unsubscribe;
  }, [refreshAppState]);

  const completeOnboarding = useCallback(
    async () => {
      const state = await loadAppState();
      setAppState({
        ...state,
        onboardingComplete: true
      });
      await refreshAppState();
    },
    [refreshAppState]
  );

  if (booting || !appState || !fontsLoaded) {
    return (
      <SafeAreaProvider>
        <SplashScreen fontsLoaded={fontsLoaded} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <MainApp appState={appState} refreshAppState={refreshAppState} completeOnboarding={completeOnboarding} />
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppRoot />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: layout.screenPadding
  },
  logoWrap: {
    width: 188,
    height: 188,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
    marginBottom: 24
  },
  logo: {
    width: 148,
    height: 148
  },
  splashText: {
    ...typography.body,
    color: colors.mulberry,
    position: "absolute",
    bottom: 44
  },
  splashTextFallback: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.mulberry,
    position: "absolute",
    bottom: 44
  },
  appShell: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    flex: 1
  },
  nav: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white
  },
  tabButton: {
    flex: 1,
    minHeight: 54,
    paddingHorizontal: 2
  },
  tabText: {
    fontSize: 11
  },
  tabLabel: {
    fontSize: 11,
    color: colors.mulberry,
    fontFamily: fonts.uiSemiBold
  },
  tabLabelActive: {
    color: colors.white
  }
});
