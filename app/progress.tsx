// progress.tsx
import React, { useRef } from 'react';
import { useEffect, useState } from 'react';
import { View, Text, TextInput, Switch, ScrollView } from 'react-native';
import { listAllDosesAsc, getLatestCows } from '../lib/db';
import LineChart from '../components/LineChart';
import YAxisChart from '../components/YAxisChart';
import { calculateCpSeriesAdvanced } from '../lib/buprenorphinePK_advanced';
import { useFocusEffect } from 'expo-router';

const STUDY_ID = 'demo-0001';
const HALF_LIFE_H = 37;

export default function ProgressScreen(){
  // Calculate chart width for scrollable region (-24 to +24 hours)
  const deviceWidth = typeof window !== 'undefined' && window.innerWidth
    ? window.innerWidth
    : 375; // fallback for iPhone
  const visibleHours = 12; // -6 to +6
  const totalHours = 48; // -24 to +24
  const chartWidth = Math.round((deviceWidth - 32) * (totalHours / visibleHours));

  // Ref for ScrollView to control initial scroll
  const scrollRef = useRef<ScrollView>(null);
  const [series, setSeries] = useState<{ x: Date; y: number }[]>([]);
  const [lastCows, setLastCows] = useState<{total:number; severity:string} | null>(null);
  // Patient parameters state
  const [weight, setWeight] = useState<string>('70');

  async function load(){
    const doses = await listAllDosesAsc(STUDY_ID);
    console.log("Loaded doses in ProgressScreen:", doses);
    // Use buprenorphine PK function
    const patient = {
      weight_kg: Number(weight) || 70,
    };
    // Removed kidney/liver impairment logic for clinical simplicity
      // Generate Cp series from -6 to +24 hours for scrollable graph
      const now = Date.now();
      const series = calculateCpSeriesAdvanced(
        doses.map(d => ({ amount_mg: d.amount_mg, ts: Date.parse(d.ts) })),
        { weight_kg: 70, hepatic: "none", cyp3a: "none", formulation: "film" },
        now - 24 * 60 * 60 * 1000,
        48,
        6
      );
      console.log("Graph points for LineChart:", series);
      setSeries(series);

    const latest = await getLatestCows(STUDY_ID);
    setLastCows(latest);
  }

  useEffect(() => {
    load();
    // Scroll to center on 'Now' (-6 to +6 visible)
    setTimeout(() => {
      if (scrollRef.current) {
        // Calculate offset so -6 to +6 is visible
        const offset = ((chartWidth * 0.5) - (deviceWidth - 32) / 2);
  scrollRef.current?.scrollTo({ x: offset, animated: false });
      }
    }, 100);
  }, []);  // initial mount

  useFocusEffect(
    React.useCallback(() => {
      load();
      }, [weight])
  );

  // UI for patient parameters
  return (
    <View style={{padding:16}}>
      <Text style={{fontSize:20, fontWeight:'600', marginBottom:8}}>
        Amount in system (ng/mL)
      </Text>
      <View style={{marginBottom:16}}>
        <Text style={{fontWeight:'600'}}>Patient Parameters</Text>
        <View style={{marginTop:8}}>
          <View style={{flexDirection:'row', alignItems:'center', marginBottom:8}}>
            <Text>Weight (kg): </Text>
            <TextInput
              style={{borderWidth:1, borderColor:'#ccc', borderRadius:6, padding:4, width:60, marginRight:12}}
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
            />
          </View>
        {/* Removed kidney/liver impairment toggles for clinical simplicity */}
        </View>
      </View>
      <View style={{flexDirection: 'row', alignItems: 'flex-start', marginVertical: 16}}>
        <YAxisChart />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          ref={scrollRef}
        >
          <View style={{width: chartWidth}}>
            <LineChart data={series} />
          </View>
        </ScrollView>
      </View>
      <View style={{marginTop:16}}>
        <Text style={{fontWeight:'600'}}>Latest COWS:</Text>
        <Text>{lastCows ? `${lastCows.total} (${lastCows.severity})` : 'No check-ins yet'}</Text>
      </View>
    </View>
  );
}
