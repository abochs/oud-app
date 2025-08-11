import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { insertCows } from '../lib/db';
import CowsItem from '../components/CowsItem';
import { COWS_ITEMS, CowsScores, CowsItemKey, cowsSeverity, cowsTotal } from '../lib/cows';


const STUDY_ID = 'demo-0001';

export default function CowsScreen(){
  const [scores, setScores] = useState<CowsScores>(
    Object.fromEntries(COWS_ITEMS.map(k=>[k,0])) as CowsScores
  );

  const total = cowsTotal(scores);
  const severity = cowsSeverity(total);

  async function save(){
    await insertCows(STUDY_ID, scores, total, severity);
    Alert.alert('Saved', `COWS: ${total} (${severity})`);
  }

  return (
    <ScrollView contentContainerStyle={{padding:16}}>
      {COWS_ITEMS.map(k=>(
        <CowsItem key={k} label={k} value={scores[k]} setValue={(v)=>setScores(s=>({...s,[k]:v}))}/>
      ))}
      <Text style={{marginTop:12, fontWeight:'600'}}>Total: {total} ({severity})</Text>
      <Pressable onPress={save} style={{marginTop:12, padding:14, backgroundColor:'#000', borderRadius:10}}>
        <Text style={{color:'#fff', textAlign:'center'}}>Save Check-in</Text>
      </Pressable>
    </ScrollView>
  );
}
