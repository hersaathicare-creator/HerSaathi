import React, { useMemo, useRef, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Lock, Send, Sparkles } from "lucide-react-native";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { HealthDisclaimer } from "../components/Feedback";
import { Screen } from "../components/Screen";
import { colors, fonts, typography } from "../constants/theme";
import { askHerSaathiAI } from "../services/firebase";
import {
  assistantCharacters,
  assistantModes,
  buildAiContext,
  getAssistantReply,
  getCharacterForMode,
  suggestedQuestions
} from "../utils/ai";
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
            characterKey: "saathi",
            characterName: "Saathi",
            text: "Hi, I'm Saathi, your daily HerSaathi companion. Ask about cramps, mood, food, movement, remedies, or your records."
          }
        ]
  );
  const [sending, setSending] = useState(false);
  const [remoteUsage, setRemoteUsage] = useState(null);
  const scrollRef = useRef(null);

  const cycleInfo = useMemo(() => getCycleInfo(appState.cycle), [appState.cycle]);
  const context = useMemo(() => buildAiContext(appState, cycleInfo), [appState, cycleInfo]);
  const subscriptionTier = appState.profile?.subscription === "premium" ? "premium" : "free";
  const activeCharacter = useMemo(() => getCharacterForMode(mode), [mode]);
  const premiumModeLocked = activeCharacter.key === "pragya" && subscriptionTier !== "premium";
  const remaining = Math.max(0, freeDailyLimit - (appState.aiUsage?.count || 0));
  const cloudReady = appState.account?.status === "signed-in";
  const subtitle = cloudReady
    ? `${activeCharacter.name} ready. ${remaining} free messages left today.`
    : `${activeCharacter.name} selected. Sign in for Gemini cloud AI.`;

  const sendQuestion = async (text = question) => {
    const trimmed = text.trim();
    if (!trimmed || remaining <= 0 || sending) return;

    const userMessage = { id: `${Date.now()}-u`, role: "user", text: trimmed };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setQuestion("");
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));

    setSending(true);
    try {
      const reply = await getAssistantReply(trimmed, mode, context, {
        askCloud: cloudReady ? askHerSaathiAI : null,
        subscriptionTier
      });
      const aiMessage = {
        id: `${Date.now()}-a`,
        role: "ai",
        text: reply.text,
        source: reply.source,
        characterKey: reply.characterKey,
        characterName: reply.characterName,
        usage: reply.usage || null
      };
      const finalMessages = [...nextMessages, aiMessage];
      setMessages(finalMessages);
      if (reply.usage) setRemoteUsage(reply.usage);
      await saveAiMessages(finalMessages);
      if (reply.countUsage !== false) {
        await incrementAiUsage();
      }
      await refreshAppState();
    } finally {
      setSending(false);
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    }
  };

  return (
    <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Screen title="Ask AI" subtitle={subtitle} contentContainerStyle={styles.screen}>
        <View style={styles.characterRow}>
          {assistantCharacters.map((character) => {
            const active = character.key === activeCharacter.key;
            const locked = character.key === "pragya" && subscriptionTier !== "premium";
            return (
              <View
                key={character.key}
                style={[styles.characterPanel, active && styles.characterPanelActive, locked && styles.characterPanelLocked]}
              >
                <View style={styles.characterTitleRow}>
                  <Text style={[styles.characterName, active && styles.characterNameActive]}>{character.name}</Text>
                  {locked ? <Lock size={14} color={colors.muted} /> : null}
                </View>
                <Text style={styles.characterMeta}>
                  {character.tier} - {character.provider}
                </Text>
                <Text style={styles.characterPurpose}>{character.purpose}</Text>
              </View>
            );
          })}
        </View>

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
          {remoteUsage ? (
            <Text style={styles.cloudUsage}>
              {activeCharacter.name} cloud usage today: {remoteUsage.count}/{remoteUsage.limit}
            </Text>
          ) : null}
          {premiumModeLocked ? (
            <Text style={styles.lockedText}>Pragya appears with Premium. Saathi remains available for free support.</Text>
          ) : null}
        </Card>

        <HealthDisclaimer compact />

        <View style={styles.suggestionRow}>
          {suggestedQuestions.map((item) => (
            <Button
              key={item}
              title={item}
              variant="soft"
              style={styles.suggestButton}
              disabled={sending || remaining <= 0}
              onPress={() => sendQuestion(item)}
            />
          ))}
        </View>

        <Card style={styles.chatCard}>
          <ScrollView ref={scrollRef} style={styles.chatScroll} contentContainerStyle={styles.chatContent}>
            {messages.map((message) => (
              <View key={message.id} style={[styles.bubble, message.role === "user" ? styles.userBubble : styles.aiBubble]}>
                <Text style={[styles.bubbleText, message.role === "user" && styles.userText]}>{message.text}</Text>
                {message.source ? (
                  <Text style={styles.sourceText}>
                    {message.characterName ? `${message.characterName} - ` : ""}
                    {message.source}
                    {message.usage ? ` ${message.usage.count}/${message.usage.limit}` : ""}
                  </Text>
                ) : null}
              </View>
            ))}
            {sending ? (
              <View style={[styles.bubble, styles.aiBubble, styles.thinkingBubble]}>
                <ActivityIndicator size="small" color={colors.plum} />
                <Text style={styles.sourceText}>Thinking...</Text>
              </View>
            ) : null}
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
              disabled={sending || !question.trim() || remaining <= 0}
              onPress={() => sendQuestion()}
              accessibilityLabel="Send message"
            >
              {sending ? <ActivityIndicator size="small" color={colors.white} /> : <Send size={20} color={colors.white} />}
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
  characterRow: {
    flexDirection: "row",
    gap: 10
  },
  characterPanel: {
    flex: 1,
    minHeight: 118,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white,
    padding: 12
  },
  characterPanelActive: {
    borderColor: colors.plum,
    backgroundColor: colors.roseSoft
  },
  characterPanelLocked: {
    opacity: 0.72
  },
  characterTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8
  },
  characterName: {
    ...typography.h3,
    color: colors.ink
  },
  characterNameActive: {
    color: colors.plum
  },
  characterMeta: {
    ...typography.smallMedium,
    marginTop: 4,
    color: colors.mulberry
  },
  characterPurpose: {
    ...typography.small,
    marginTop: 8
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
  cloudUsage: {
    ...typography.smallMedium,
    marginTop: 8,
    color: colors.mulberry
  },
  lockedText: {
    ...typography.smallMedium,
    marginTop: 8,
    color: colors.warning
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
  thinkingBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
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
