// app/_layout.tsx
import 'react-native-reanimated'; // MUST be first

import { Stack } from 'expo-router';
import { Tabs } from 'expo-router';
import { useEffect } from 'react';
import { initDb, ensureDefaultParticipant } from '../lib/db';

export default function Layout() {
  useEffect(() => {
    (async () => {
      await initDb();
      await ensureDefaultParticipant();
    })();
  }, []);

  return (
    <Tabs>
      <Tabs.Screen name="dose" options={{ title: 'Log Dose' }}/>
      <Tabs.Screen name="cows" options={{ title: 'COWS' }}/>
      <Tabs.Screen name="progress" options={{ title: 'My Progress' }}/>
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}
