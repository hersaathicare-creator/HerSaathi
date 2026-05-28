import React, { useEffect, useMemo, useState } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import { CalendarDays, CheckCircle2, Droplet, ListChecks, Pencil, Trash2, X } from "lucide-react-native";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { DatePickerField } from "../components/DatePickerField";
import { EmptyState, ErrorList } from "../components/Feedback";
import { CheckOption, SegmentedOptions } from "../components/FormControls";
import { Screen } from "../components/Screen";
import { colors, fonts, typography } from "../constants/theme";
import { getCycleInfo } from "../utils/cycle";
import { toDateKey } from "../utils/date";
import {
  deletePeriodEntry,
  deleteSymptomLog,
  savePeriodEntry,
  saveSymptomLog,
  updatePeriodEntry,
  updateSymptomLog
} from "../utils/storage";
import { validatePeriodEntry, validateSymptomLog } from "../utils/validation";

const flowOptions = [
  { label: "Light", value: "light" },
  { label: "Medium", value: "medium" },
  { label: "Heavy", value: "heavy" }
];

const symptoms = ["cramps", "acne", "bloating", "fatigue"];

export default function TrackScreen({ appState, refreshAppState, initialMode = "period", onModeHandled }) {
  const [mode, setMode] = useState(initialMode || "period");
  const [startDate, setStartDate] = useState(appState.cycle.lastPeriodDate || toDateKey());
  const [endDate, setEndDate] = useState(toDateKey());
  const [flow, setFlow] = useState("medium");
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [symptomDate, setSymptomDate] = useState(toDateKey());
  const [editingPeriodId, setEditingPeriodId] = useState(null);
  const [editingSymptomId, setEditingSymptomId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [savedMessage, setSavedMessage] = useState("");
  const [formErrors, setFormErrors] = useState([]);

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
      onModeHandled?.();
    }
  }, [initialMode, onModeHandled]);

  const latestEntry = appState.periodEntries?.[0];
  const latestSymptoms = appState.symptomLogs?.[0];
  const cycleInfo = useMemo(
    () => getCycleInfo(appState.cycle, latestSymptoms?.symptoms || latestEntry?.symptoms || [], appState.checkIns?.[0]?.mood),
    [appState.checkIns, appState.cycle, latestEntry, latestSymptoms]
  );
  const recentPeriods = (appState.periodEntries || []).slice(0, 5);
  const recentSymptomLogs = (appState.symptomLogs || []).slice(0, 5);

  const canSavePeriod = useMemo(() => Boolean(startDate && endDate), [endDate, startDate]);

  const toggleSymptom = (symptom) => {
    setSelectedSymptoms((current) =>
      current.includes(symptom) ? current.filter((item) => item !== symptom) : [...current, symptom]
    );
  };

  const resetPeriodForm = () => {
    setEditingPeriodId(null);
    setStartDate(appState.cycle.lastPeriodDate || toDateKey());
    setEndDate(toDateKey());
    setFlow("medium");
    setSelectedSymptoms([]);
    setFormErrors([]);
  };

  const resetSymptomForm = () => {
    setEditingSymptomId(null);
    setSymptomDate(toDateKey());
    setSelectedSymptoms([]);
    setFormErrors([]);
  };

  const handleSavePeriod = async () => {
    const entry = { startDate, endDate, flow, symptoms: selectedSymptoms };
    const nextErrors = validatePeriodEntry(entry);
    if (nextErrors.length) {
      setFormErrors(nextErrors);
      return;
    }

    if (editingPeriodId) {
      await updatePeriodEntry(editingPeriodId, entry);
      setSavedMessage("Period entry updated.");
    } else {
      await savePeriodEntry(entry);
      setSavedMessage("Period entry saved locally.");
    }
    resetPeriodForm();
    await refreshAppState();
  };

  const handleSaveSymptoms = async () => {
    const patch = { date: symptomDate, symptoms: selectedSymptoms };
    const nextErrors = validateSymptomLog(patch);
    if (nextErrors.length) {
      setFormErrors(nextErrors);
      return;
    }

    if (editingSymptomId) {
      await updateSymptomLog(editingSymptomId, patch);
      setSavedMessage("Symptom log updated.");
    } else {
      await saveSymptomLog(selectedSymptoms, null, symptomDate);
      setSavedMessage("Symptoms saved locally.");
    }
    resetSymptomForm();
    await refreshAppState();
  };

  const editPeriod = (entry) => {
    setMode("period");
    setEditingPeriodId(entry.id);
    setStartDate(entry.startDate || toDateKey());
    setEndDate(entry.endDate || entry.startDate || toDateKey());
    setFlow(entry.flow || "medium");
    setSelectedSymptoms(entry.symptoms || []);
    setSavedMessage("");
    setFormErrors([]);
  };

  const editSymptom = (entry) => {
    setMode("symptoms");
    setEditingSymptomId(entry.id);
    setSymptomDate(entry.date || toDateKey());
    setSelectedSymptoms(entry.symptoms || []);
    setSavedMessage("");
    setFormErrors([]);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    if (pendingDelete.type === "period") {
      await deletePeriodEntry(pendingDelete.id);
      if (editingPeriodId === pendingDelete.id) resetPeriodForm();
    } else {
      await deleteSymptomLog(pendingDelete.id);
      if (editingSymptomId === pendingDelete.id) resetSymptomForm();
    }
    setSavedMessage(`${pendingDelete.label} deleted.`);
    setPendingDelete(null);
    await refreshAppState();
  };

  return (
    <Screen title="Track" subtitle="Log periods and symptoms with local-only storage.">
      <View style={styles.modeRow}>
        <Button
          title="Period Entry"
          variant={mode === "period" ? "chipActive" : "chip"}
          onPress={() => {
            setMode("period");
            setFormErrors([]);
          }}
          style={styles.modeButton}
        />
        <Button
          title="Symptoms"
          variant={mode === "symptoms" ? "chipActive" : "chip"}
          onPress={() => {
            setMode("symptoms");
            setFormErrors([]);
          }}
          style={styles.modeButton}
        />
      </View>

      {mode === "period" && (
        <Card>
          <View style={styles.titleRow}>
            <Droplet size={20} color={colors.rose} />
            <Text style={styles.cardTitle}>{editingPeriodId ? "Edit period entry" : "Period entry"}</Text>
          </View>
          <DatePickerField label="Start date" value={startDate} onChange={setStartDate} />
          <DatePickerField label="End date" value={endDate} onChange={setEndDate} />
          <Text style={styles.label}>Flow</Text>
          <SegmentedOptions options={flowOptions} value={flow} onChange={setFlow} columns={3} />
          <Text style={styles.label}>Symptoms</Text>
          <View style={styles.checkGrid}>
            {symptoms.map((symptom) => (
              <CheckOption
                key={symptom}
                label={symptom}
                checked={selectedSymptoms.includes(symptom)}
                onPress={() => toggleSymptom(symptom)}
              />
            ))}
          </View>
          <ErrorList errors={formErrors} />
          <View style={styles.formActions}>
            {editingPeriodId ? (
              <Button title="Cancel" variant="secondary" onPress={resetPeriodForm} style={styles.formActionButton} />
            ) : null}
            <Button
              title={editingPeriodId ? "Update Period" : "Save Period"}
              disabled={!canSavePeriod}
              onPress={handleSavePeriod}
              style={styles.formActionButton}
            />
          </View>
        </Card>
      )}

      {mode === "symptoms" && (
        <Card>
          <View style={styles.titleRow}>
            <ListChecks size={20} color={colors.teal} />
            <Text style={styles.cardTitle}>{editingSymptomId ? "Edit symptom log" : "Symptom logging"}</Text>
          </View>
          <DatePickerField label="Log date" value={symptomDate} onChange={setSymptomDate} />
          <View style={styles.checkGrid}>
            {symptoms.map((symptom) => (
              <CheckOption
                key={symptom}
                label={symptom}
                checked={selectedSymptoms.includes(symptom)}
                onPress={() => toggleSymptom(symptom)}
              />
            ))}
          </View>
          <ErrorList errors={formErrors} />
          <View style={styles.formActions}>
            {editingSymptomId ? (
              <Button title="Cancel" variant="secondary" onPress={resetSymptomForm} style={styles.formActionButton} />
            ) : null}
            <Button
              title={editingSymptomId ? "Update Symptoms" : "Save Symptoms"}
              disabled={selectedSymptoms.length === 0}
              onPress={handleSaveSymptoms}
              style={styles.formActionButton}
            />
          </View>
        </Card>
      )}

      {savedMessage ? (
        <View style={styles.savedRow}>
          <CheckCircle2 size={18} color={colors.success} />
          <Text style={styles.savedText}>{savedMessage}</Text>
        </View>
      ) : null}

      <Card>
        <View style={styles.titleRow}>
          <CalendarDays size={20} color={colors.plum} />
          <Text style={styles.cardTitle}>Cycle forecast</Text>
        </View>
        <View style={styles.forecastGrid}>
          <View style={styles.forecastItem}>
            <Text style={styles.forecastValue}>{cycleInfo.currentDay ? `Day ${cycleInfo.currentDay}` : "Setup"}</Text>
            <Text style={styles.forecastLabel}>Current cycle</Text>
          </View>
          <View style={styles.forecastItem}>
            <Text style={styles.forecastValue}>{cycleInfo.nextPeriodCountdown ? `${cycleInfo.nextPeriodCountdown}d` : "--"}</Text>
            <Text style={styles.forecastLabel}>Next period</Text>
          </View>
        </View>
        <Text style={styles.historyText}>{cycleInfo.nextPeriodDate ? `Expected start: ${cycleInfo.nextPeriodDate}` : cycleInfo.insight}</Text>
      </Card>

      <Card style={styles.historyCard}>
        <View style={styles.titleRow}>
          <CalendarDays size={20} color={colors.plum} />
          <Text style={styles.cardTitle}>Manage records</Text>
        </View>

        <Text style={styles.recordSectionTitle}>Period entries</Text>
        {recentPeriods.length ? (
          recentPeriods.map((entry) => (
            <RecordRow
              key={entry.id}
              title={`${entry.startDate} to ${entry.endDate}`}
              detail={`${entry.flow} flow${entry.symptoms?.length ? ` - ${entry.symptoms.join(", ")}` : ""}`}
              onEdit={() => editPeriod(entry)}
              onDelete={() => setPendingDelete({ type: "period", id: entry.id, label: "Period entry" })}
            />
          ))
        ) : (
          <EmptyState
            icon={CalendarDays}
            title="No period entries yet"
            body="Saved periods will appear here for editing and reports."
          />
        )}

        <Text style={styles.recordSectionTitle}>Symptom logs</Text>
        {recentSymptomLogs.length ? (
          recentSymptomLogs.map((entry) => (
            <RecordRow
              key={entry.id}
              title={entry.date}
              detail={entry.symptoms.join(", ")}
              onEdit={() => editSymptom(entry)}
              onDelete={() => setPendingDelete({ type: "symptom", id: entry.id, label: "Symptom log" })}
            />
          ))
        ) : (
          <EmptyState
            icon={ListChecks}
            title="No symptom logs yet"
            body="Symptoms you log will appear here for editing and trends."
          />
        )}
      </Card>

      <ConfirmDeleteModal
        pendingDelete={pendingDelete}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </Screen>
  );
}

function RecordRow({ title, detail, onEdit, onDelete }) {
  return (
    <View style={styles.recordRow}>
      <View style={styles.recordText}>
        <Text style={styles.recordTitle}>{title}</Text>
        <Text style={styles.historyText}>{detail}</Text>
      </View>
      <View style={styles.recordActions}>
        <Button variant="secondary" style={styles.iconButton} onPress={onEdit} accessibilityLabel={`Edit ${title}`}>
          <Pencil size={16} color={colors.mulberry} />
        </Button>
        <Button variant="secondary" style={styles.iconButton} onPress={onDelete} accessibilityLabel={`Delete ${title}`}>
          <Trash2 size={16} color={colors.warning} />
        </Button>
      </View>
    </View>
  );
}

function ConfirmDeleteModal({ pendingDelete, onCancel, onConfirm }) {
  return (
    <Modal visible={Boolean(pendingDelete)} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.confirmPanel}>
          <View style={styles.confirmHeader}>
            <Text style={styles.cardTitle}>Delete record?</Text>
            <Button variant="ghost" style={styles.iconButton} onPress={onCancel} accessibilityLabel="Cancel delete">
              <X size={18} color={colors.mulberry} />
            </Button>
          </View>
          <Text style={styles.historyText}>
            This will permanently delete this {pendingDelete?.label?.toLowerCase() || "record"} from local storage.
          </Text>
          <View style={styles.formActions}>
            <Button title="Cancel" variant="secondary" onPress={onCancel} style={styles.formActionButton} />
            <Button title="Delete" onPress={onConfirm} style={styles.formActionButton} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modeRow: {
    flexDirection: "row",
    gap: 10
  },
  modeButton: {
    flex: 1
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14
  },
  cardTitle: {
    ...typography.h3
  },
  label: {
    ...typography.small,
    color: colors.mulberry,
    fontFamily: fonts.uiSemiBold,
    marginTop: 12,
    marginBottom: 8
  },
  checkGrid: {
    gap: 10,
    marginBottom: 14
  },
  formActions: {
    flexDirection: "row",
    gap: 10
  },
  formActionButton: {
    flex: 1
  },
  savedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 4
  },
  savedText: {
    ...typography.body,
    color: colors.success,
    fontFamily: fonts.uiSemiBold
  },
  forecastGrid: {
    flexDirection: "row",
    gap: 10
  },
  forecastItem: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white
  },
  forecastValue: {
    fontSize: 20,
    lineHeight: 26,
    fontFamily: fonts.premiumBold,
    color: colors.ink
  },
  forecastLabel: {
    ...typography.small,
    marginTop: 2
  },
  historyCard: {
    backgroundColor: colors.lemon
  },
  recordSectionTitle: {
    ...typography.smallMedium,
    color: colors.mulberry,
    marginTop: 8,
    textTransform: "uppercase"
  },
  recordRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: colors.border
  },
  recordText: {
    flex: 1
  },
  recordTitle: {
    ...typography.bodyMedium,
    color: colors.ink
  },
  recordActions: {
    flexDirection: "row",
    gap: 6
  },
  iconButton: {
    width: 40,
    minHeight: 40,
    paddingHorizontal: 0
  },
  historyText: {
    ...typography.body,
    color: colors.ink,
    marginTop: 6
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.24)",
    padding: 18,
    justifyContent: "center"
  },
  confirmPanel: {
    padding: 16,
    gap: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white
  },
  confirmHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10
  }
});
