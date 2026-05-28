import React, { useMemo, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Send, Sparkles } from "lucide-react-native";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { HealthDisclaimer } from "../components/Feedback";
import { Screen } from "../components/Screen";
import { colors, fonts, typography } from "../constants/theme";
import { assistantModes, buildAiContext, getAssistantReply, suggestedQuestions } from "../utils/ai";
import { getCycleInfo } from "../utils/cycle";
import { incrementAiUsage, saveAiMessages } from "../utils/storage";

const freeDailyLimit = 5;

export default function AIAssistantScreen({ appState, refreshAppState }) {
  const [mode, setMode] = useState(assistantModes[0]);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState(
    appState.aiMessages?.length
      ? appState.aiMessages
      : [
          {
            id: "welcome",
            role: "ai",
            text: "Hi, I’m your HerSaathi assistant. Ask about cramps, mood, food, movement, remedies, or your records."
          }
        ]
  );
  const scrollRef = useRef(null);

  const cycleInfo = useMemo(() => getCycleInfo(appState.cycle), [appState.cycle]);
  const context = useMemo(() => buildAiContext(appState, cycleInfo), [appState, cycleInfo]);
  const remaining = Math.max(0, freeDailyLimit - (appState.aiUsage?.count || 0));

  const sendQuestion = async (text = question) => {
    const trimmed = text.trim();
    if (!trimmed || remaining <= 0) return;

    const userMessage = { id: `${Date.now()}-u`, role: "user", text: trimmed };
    const reply = await getAssistantReply(trimmed, mode, context);
    const aiMessage = {
      id: `${Date.now()}-a`,
      role: "ai",
      text: reply.text,
      source: reply.source
    };
    const nextMessages = [...messages, userMessage, aiMessage];
    setMessages(nextMessages);
    setQuestion("");
    await saveAiMessages(nextMessages);
    await incrementAiUsage();
    await refreshAppState();
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  };

  return (
    <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Screen title="Ask AI" subtitle={`${remaining} free messages left today.`} contentContainerStyle={styles.screen}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modeScroller}>
          {assistantModes.map((item) => (
            <Button
              key={item}
              title={item}
              variant={mode === item ? "chipActive" : "chip"}
              style={styles.modeChip}
              onPress={() => setMode(item)}
            />
          ))}
        </ScrollView>

        <Card style={styles.contextCard}>
          <View style={styles.titleRow}>
            <Sparkles size={19} color={colors.plum} />
            <Text style={styles.contextTitle}>Private context</Text>
          </View>
          <Text style={styles.contextText}>{JSON.stringify(context)}</Text>
        </Card>

        <HealthDisclaimer compact />

        <View style={styles.suggestionRow}>
          {suggestedQuestions.map((item) => (
            <Button key={item} title={item} variant="soft" style={styles.suggestButton} onPress={() => sendQuestion(item)} />
          ))}
        </View>

        <Card style={styles.chatCard}>
          <ScrollView ref={scrollRef} style={styles.chatScroll} contentContainerStyle={styles.chatContent}>
            {messages.map((message) => (
              <View key={message.id} style={[styles.bubble, message.role === "user" ? styles.userBubble : styles.aiBubble]}>
                <Text style={[styles.bubbleText, message.role === "user" && styles.userText]}>{message.text}</Text>
                {message.source ? <Text style={styles.sourceText}>{message.source}</Text> : null}
              </View>
            ))}
            {remaining <= 0 ? <Text style={styles.limitText}>Daily free AI limit reached. Come back tomorrow.</Text> : null}
          </ScrollView>
          <View style={styles.inputRow}>
            <TextInput
              value={question}
              onChangeText={setQuestion}
              placeholder="Ask your question"
              placeholderTextColor={colors.placeholder}
              style={styles.input}
              multiline
            />
            <Button
              variant="primary"
              style={styles.sendButton}
              disabled={!question.trim() || remaining <= 0}
              onPress={() => sendQuestion()}
              accessibilityLabel="Send message"
            >
              <Send size={20} color={colors.white} />
            </Button>
          </View>
        </Card>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1
  },
  screen: {
    paddingBottom: 18
  },
  modeScroller: {
    gap: 8,
    paddingRight: 20
  },
  modeChip: {
    minHeight: 42
  },
  contextCard: {
    backgroundColor: colors.mint
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  contextTitle: {
    ...typography.h3
  },
  contextText: {
    ...typography.small,
    marginTop: 8,
    color: colors.ink
  },
  suggestionRow: {
    gap: 8
  },
  suggestButton: {
    alignItems: "stretch"
  },
  chatCard: {
    minHeight: 430,
    padding: 0,
    overflow: "hidden"
  },
  chatScroll: {
    maxHeight: 430
  },
  chatContent: {
    padding: 14,
    gap: 10
  },
  bubble: {
    maxWidth: "86%",
    padding: 12,
    borderRadius: 8
  },
  aiBubble: {
    alignSelf: "flex-start",
    backgroundColor: colors.roseSoft
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: colors.plum
  },
  bubbleText: {
    ...typography.body
  },
  userText: {
    color: colors.white
  },
  sourceText: {
    ...typography.small,
    marginTop: 5,
    color: colors.muted
  },
  limitText: {
    ...typography.body,
    color: colors.warning,
    fontFamily: fonts.uiSemiBold
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 96,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.ink,
    fontFamily: fonts.uiRegular,
    fontSize: 15
  },
  sendButton: {
    width: 52,
    minHeight: 48,
    paddingHorizontal: 0
  }
});
