import React from "react";
import { Linking, StyleSheet, Text, View } from "react-native";
import { AlertTriangle, Mail, RefreshCcw } from "lucide-react-native";

import { Button } from "./Button";
import { appConfig } from "../constants/app";
import { colors, layout, typography } from "../constants/theme";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("HerSaathi runtime error", error, info);
  }

  reset = () => {
    this.setState({ error: null });
  };

  emailSupport = async () => {
    const subject = "HerSaathi app error report";
    const body = [
      "Hello HerSaathi Support,",
      "",
      "The app showed an error screen.",
      "",
      `App version: ${appConfig.version}`,
      `Android package: ${appConfig.androidPackage}`,
      `Error: ${this.state.error?.message || "Not available"}`,
      "",
      "What I was doing:"
    ].join("\n");

    try {
      await Linking.openURL(`mailto:${appConfig.officialEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    } catch {
      // The visible email address in the fallback is enough if the mail app cannot open.
    }
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <View style={styles.shell}>
        <View style={styles.iconWrap}>
          <AlertTriangle size={30} color={colors.warning} />
        </View>
        <Text style={styles.title}>Something needs a refresh.</Text>
        <Text style={styles.body}>
          HerSaathi hit an unexpected app error. Your saved wellness records should remain on this device.
        </Text>
        <View style={styles.actions}>
          <Button title="Try Again" onPress={this.reset}>
            <RefreshCcw size={18} color={colors.white} />
            <Text style={styles.primaryText}>Try Again</Text>
          </Button>
          <Button title="Email Support" variant="secondary" onPress={this.emailSupport}>
            <Mail size={18} color={colors.mulberry} />
            <Text style={styles.secondaryText}>Email Support</Text>
          </Button>
        </View>
        <Text selectable style={styles.email}>{appConfig.officialEmail}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    justifyContent: "center",
    padding: layout.screenPadding,
    gap: 14,
    backgroundColor: colors.background
  },
  iconWrap: {
    width: 58,
    height: 58,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.lemon
  },
  title: {
    ...typography.h2
  },
  body: {
    ...typography.body,
    color: colors.muted
  },
  actions: {
    gap: 10,
    marginTop: 6
  },
  primaryText: {
    color: colors.white,
    fontSize: 15
  },
  secondaryText: {
    color: colors.mulberry,
    fontSize: 15
  },
  email: {
    ...typography.small,
    color: colors.muted
  }
});
