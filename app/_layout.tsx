// app/_layout.tsx
import "react-native-reanimated"; // must be first

import { Tabs } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";
import { initDb, ensureDefaultParticipant } from "../lib/db";
import { Ionicons } from "@expo/vector-icons";

export default function Layout() {
  useEffect(() => {
    (async () => {
      await initDb();
      await ensureDefaultParticipant();
    })();
  }, []);

  // “Medical” palette: calm neutrals, high contrast for text
  const tint = "#0F766E";        // teal-700 for active elements
  const muted = "#64748B";       // slate-500
  const bg = "#F8FAFC";          // slate-50
  const border = "#E2E8F0";      // slate-200
  const headerBg = "#FFFFFF";
  const text = "#0F172A";        // slate-900

  return (
    <Tabs
      initialRouteName="progress"
      screenOptions={{
        headerTitleAlign: "center",
        headerStyle: { backgroundColor: headerBg },
        headerTitleStyle: {
          color: text,
          fontSize: 16,
          fontWeight: "700",
          letterSpacing: 0.2,
          marginVertical: 4,
        },
        headerShadowVisible: true,
        headerTintColor: tint,

        tabBarActiveTintColor: tint,
        tabBarInactiveTintColor: muted,
        tabBarStyle: {
          backgroundColor: bg,
          borderTopColor: border,
          height: 48,
          paddingBottom: Platform.select({ ios: 32, android: 28 }),
          paddingTop: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          letterSpacing: 0.2,
          paddingBottom: 36,
          paddingTop: 0,
        },
      }}
    >
      <Tabs.Screen
        name="dose"
        options={{
          title: "Log Dose",
          tabBarIcon: ({ color }) => (
            <Ionicons name="medkit-outline" size={20} color={color} />
          ),
          headerTitle: "Log Buprenorphine Dose",
        }}
      />
      <Tabs.Screen
        name="cows"
        options={{
          title: "COWS",
          tabBarIcon: ({ color }) => (
            <Ionicons name="pulse-outline" size={20} color={color} />
          ),
          headerTitle: "Withdrawal Check",
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "My Progress",
          tabBarIcon: ({ color }) => (
            <Ionicons name="analytics-outline" size={20} color={color} />
          ),
          headerTitle: "Amount in System (ng/mL)",
        }}
      />
      {/* Hidden routes (kept for navigation use if needed) */}
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}

