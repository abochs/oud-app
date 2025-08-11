
import { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, TextInput } from 'react-native';
import { insertDose, listRecentDoses, deleteDose, updateDose } from '../lib/db';
import DoseButton from '../components/DoseButton';

type Row = { id:number; amount_mg:number; ts:string };
const STUDY_ID = 'demo-0001';

export default function DoseScreen() {
  const [rows, setRows] = useState<Row[]>([]);
  const [editingId, setEditingId] = useState<number|null>(null);
  const [editAmount, setEditAmount] = useState<string>('');
  const [editTs, setEditTs] = useState<string>('');

  async function load() {
    const r = await listRecentDoses(STUDY_ID, 20);
    setRows(r);
  }

  async function add(mg:number) {
    await insertDose(STUDY_ID, mg);
    await load();
  }

  async function handleDelete(id:number) {
    if (deleteDose) {
      await deleteDose(id);
      await load();
    }
  }

  function startEdit(row:Row) {
    setEditingId(row.id);
    setEditAmount(String(row.amount_mg));
    setEditTs(row.ts);
  }

  async function handleEditSave() {
    if (editingId && updateDose) {
      await updateDose(editingId, Number(editAmount), editTs);
      setEditingId(null);
      await load();
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <View style={{padding:16}}>
      <Text style={{fontSize:20, fontWeight:'600', marginBottom:12}}>Quick add</Text>
      <View style={{flexDirection:'row', flexWrap:'wrap'}}>
        <DoseButton label="2 mg" mg={2} onPress={add}/>
        <DoseButton label="4 mg" mg={4} onPress={add}/>
        <DoseButton label="8 mg" mg={8} onPress={add}/>
      </View>

      <Text style={{marginTop:20, fontWeight:'600'}}>Recent doses</Text>
      <FlatList
        data={rows}
        keyExtractor={(r)=>String(r.id)}
        renderItem={({item})=>(
          editingId === item.id ? (
            <View style={{marginBottom:8}}>
              <Text>Edit Dose</Text>
              <TextInput
                style={{borderWidth:1, borderColor:'#ccc', borderRadius:6, padding:4, width:60, marginRight:8}}
                keyboardType="numeric"
                value={editAmount}
                onChangeText={setEditAmount}
              />
              <TextInput
                style={{borderWidth:1, borderColor:'#ccc', borderRadius:6, padding:4, width:180, marginRight:8}}
                value={editTs}
                onChangeText={setEditTs}
              />
              <Button title="Save" onPress={handleEditSave} />
              <Button title="Cancel" onPress={()=>setEditingId(null)} />
            </View>
          ) : (
            <View style={{flexDirection:'row', alignItems:'center', marginBottom:8}}>
              <Text style={{flex:1}}>{new Date(item.ts).toLocaleString()} — {item.amount_mg} mg</Text>
              <Button title="Edit" onPress={()=>startEdit(item)} />
              <Button title="Delete" color="#c00" onPress={()=>handleDelete(item.id)} />
            </View>
          )
        )}
      />
    </View>
  );
}
