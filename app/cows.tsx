// app/cows.tsx
import { useMemo, useRef, useState } from "react";
import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator } from "react-native";
import * as Haptics from "expo-haptics";
import { insertCows } from "../lib/db";
import CowsItem from "../components/CowsItem";
import { COWS_ITEMS, CowsScores, CowsItemKey, cowsSeverity, cowsTotal } from "../lib/cows";

const STUDY_ID = "demo-0001";

const SEVERITY_COLORS: Record<ReturnType<typeof cowsSeverity>, string> = {
  "none": "#16a34a",          // green-600
  "mild": "#22c55e",          // green-500
  "moderate": "#f59e0b",      // amber-500
  "mod-severe": "#ef4444",    // red-500
  "severe": "#b91c1c",        // red-700
};

export default function CowsScreen() {
  const [scores, setScores] = useState<CowsScores>(
    Object.fromEntries(COWS_ITEMS.map((k) => [k, 0])) as CowsScores
  );
  const [saving, setSaving] = useState(false);

  const total = useMemo(() => cowsTotal(scores), [scores]);
  const severity = useMemo(() => cowsSeverity(total), [total]);
  const sevColor = SEVERITY_COLORS[severity] ?? "#64748B";

  // prevent double-taps while saving
  const lastSavedAt = useRef<number>(0);

  async function save() {
    const now = Date.now();
    if (saving || now - lastSavedAt.current < 800) return;

    try {
      setSaving(true);
      await insertCows(STUDY_ID, scores, total, severity);
      lastSavedAt.current = now;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Saved", `COWS: ${total} (${severity})`);
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Save failed", e?.message ?? "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    Alert.alert("Clear responses?", "This will reset all items to 0.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: () =>
          setScores(Object.fromEntries(COWS_ITEMS.map((k) => [k, 0])) as CowsScores),
      },
    ]);
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      {/* sticky header summary */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 8,
          borderBottomWidth: 1,
          borderBottomColor: "#e2e8f0",
          backgroundColor: "#fff",
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#0f172a" }}>
          Clinical Opiate Withdrawal Scale (COWS)
        </Text>

        <View
          style={{
            marginTop: 6,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 6,
              backgroundColor: sevColor,
              borderRadius: 999,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>
              {total} · {severity}
            </Text>
          </View>
          <Text style={{ color: "#334155" }}>Slide below to score</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {COWS_ITEMS.map((k) => (
          <CowsItem
            key={k}
            label={k}
            value={scores[k as CowsItemKey]}
            setValue={(v) =>
              setScores((s) => ({ ...s, [k]: v }))
            }
          />
        ))}

        {/* Actions */}
        <View style={{ height: 16 }} />

        <Pressable
          onPress={save}
          accessibilityRole="button"
          accessibilityLabel="Save COWS check-in"
          disabled={saving}
          style={{
            backgroundColor: saving ? "#94a3b8" : "#0f766e",
            paddingVertical: 14,
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontWeight: "700" }}>Save check‑in</Text>
          )}
        </Pressable>

        <View style={{ height: 10 }} />

        <Pressable
          onPress={resetForm}
          accessibilityRole="button"
          accessibilityLabel="Reset COWS responses"
          style={{
            backgroundColor: "#e2e8f0",
            paddingVertical: 12,
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#0f172a", fontWeight: "600" }}>Reset</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
