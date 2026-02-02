import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView } from 'react-native';
import { listAllDosesAsc, getLatestCows } from '../lib/db';
import LineChart from '../components/LineChart';
import { calculateCpSeriesAdvanced } from '../lib/buprenorphinePK_advanced';
import { useFocusEffect } from 'expo-router';

const STUDY_ID = 'demo-0001';

export default function ProgressScreen() {
  const deviceWidth = typeof window !== 'undefined' && window.innerWidth
    ? window.innerWidth
    : 375;
  const visibleHours = 12;
  const totalHours = 48;
  const chartWidth = Math.round((deviceWidth - 32) * (totalHours / visibleHours));

  const scrollRef = useRef<ScrollView>(null);
  const [series, setSeries] = useState<{ x: Date; y: number }[]>([]);
  const [lastCows, setLastCows] = useState<{ total: number; severity: string } | null>(null);
  const [weight, setWeight] = useState<string>('70');

  async function load() {
    const doses = await listAllDosesAsc(STUDY_ID);
    const now = Date.now();
    const series = calculateCpSeriesAdvanced(
      doses.map(d => ({ amount_mg: d.amount_mg, ts: Date.parse(d.ts) })),
      { weight_kg: Number(weight) || 70, hepatic: "none", cyp3a: "none", formulation: "film" },
      now - 24 * 60 * 60 * 1000,
      48,
      6
    );
    setSeries(series);

    const latest = await getLatestCows(STUDY_ID);
    setLastCows(latest);
  }

  useEffect(() => {
    load();
    setTimeout(() => {
      if (scrollRef.current) {
        const offset = ((chartWidth * 0.5) - (deviceWidth - 32) / 2);
        scrollRef.current?.scrollTo({ x: offset, animated: false });
      }
    }, 100);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      load();
    }, [weight])
  );

  return (
    <View style={{ padding: 16 }}>
      <View style={{ marginBottom: 8 }} />
      <View style={{ marginVertical: 16 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          ref={scrollRef}
        >
          <View style={{ width: chartWidth }}>
            <LineChart data={series} />
          </View>
        </ScrollView>
      </View>
      <View style={{ marginTop: 16 }}>
        <Text style={{ fontWeight: '600' }}>Latest COWS:</Text>
        <Text>{lastCows ? `${lastCows.total} (${lastCows.severity})` : 'No check-ins yet'}</Text>
      </View>
    </View>
  );
}