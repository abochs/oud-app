
import { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, TextInput, Modal, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { insertDose, listRecentDoses, deleteDose, updateDose } from '../lib/db';
import DoseButton from '../components/DoseButton';

type Row = { id:number; amount_mg:number; ts:string };
const STUDY_ID = 'demo-0001';

export default function DoseScreen() {
  const [rows, setRows] = useState<Row[]>([]);
  const [editingId, setEditingId] = useState<number|null>(null);
  const [editAmount, setEditAmount] = useState<string>('');
  const [editTs, setEditTs] = useState<string>('');
  const [modalVisible, setModalVisible] = useState(false);
  const [customDose, setCustomDose] = useState('');
  const [customTime, setCustomTime] = useState(new Date());
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [editPickerVisible, setEditPickerVisible] = useState(false);

  async function load() {
    const r = await listRecentDoses(STUDY_ID, 20);
    setRows(r);
  }

  async function add(mg:number, ts?:string) {
  await insertDose(STUDY_ID, mg, ts);
    await load();
  }
  function openCustomModal() {
  setCustomDose('');
  setCustomTime(new Date());
  setModalVisible(true);
  }

  async function handleCustomAdd() {
    if (customDose) {
      await add(Number(customDose), customTime.toISOString());
      setModalVisible(false);
    }
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
      {/* Quick Add Section */}
      <View style={{backgroundColor:'#f8fafc', borderRadius:16, padding:16, marginBottom:18, shadowColor:'#000', shadowOpacity:0.06, shadowRadius:8, elevation:2}}>
        <Text style={{fontSize:14, fontWeight:'500', color:'#64748B', marginBottom:10, letterSpacing:0.2}}>Quick Add Dose</Text>
        <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:8}}>
          <DoseButton label="2 mg" mg={2} onPress={add}/>
          <DoseButton label="4 mg" mg={4} onPress={add}/>
          <DoseButton label="8 mg" mg={8} onPress={add}/>
          <DoseButton label="12 mg" mg={12} onPress={add}/>
        </View>
      </View>

      {/* Custom Add Section */}
      <View style={{backgroundColor:'#f8fafc', borderRadius:16, padding:16, marginBottom:18, shadowColor:'#000', shadowOpacity:0.06, shadowRadius:8, elevation:2, flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
        <Text style={{fontSize:14, fontWeight:'500', color:'#64748B', letterSpacing:0.2}}>Custom Add Dose</Text>
        <TouchableOpacity
          style={{backgroundColor:'#e0f2f1', borderRadius:20, width:36, height:36, alignItems:'center', justifyContent:'center'}}
          onPress={openCustomModal}
        >
          <Ionicons name="add" size={24} color="#0F766E" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={()=>setModalVisible(false)}
      >
        <View style={{flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.2)'}}>
          <View style={{backgroundColor:'#fff', padding:20, borderRadius:12, width:300}}>
            <Text style={{fontWeight:'600', fontSize:18, marginBottom:10}}>Custom Dose</Text>
            <TextInput
              style={{borderWidth:1, borderColor:'#ccc', borderRadius:8, padding:10, marginBottom:14, fontSize:18, height:44}}
              placeholder="Dose (mg)"
              keyboardType="numeric"
              value={customDose}
              onChangeText={setCustomDose}
            />
            <DateTimePicker
              value={customTime || new Date()}
              mode="datetime"
              display={Platform.OS === 'ios' ? 'compact' : 'spinner'}
              style={{height: 60, minWidth: 160}}
              onChange={(event, date) => {
                if (date) setCustomTime(date);
              }}
            />
            <Button title="Add Dose" onPress={handleCustomAdd} color="#2563eb" />
            <Button title="Cancel" color="#888" onPress={()=>setModalVisible(false)} />
          </View>
        </View>
      </Modal>

  {/* Removed duplicate header */}
  <Text style={{marginTop:20, fontWeight:'700', fontSize:18, letterSpacing:0.2, color:'#222'}}>Recent doses</Text>
  <View style={{height:10}} />
  <FlatList
        data={rows}
        keyExtractor={(r)=>String(r.id)}
        renderItem={({item})=>(
          editingId === item.id ? (
            <View style={{marginBottom:12, backgroundColor:'#fff', borderRadius:10, padding:12, shadowColor:'#000', shadowOpacity:0.04, shadowRadius:4, elevation:1}}>
              <Text style={{fontWeight:'600', fontSize:16, marginBottom:6}}>Edit Dose</Text>
              <TextInput
                style={{borderWidth:1, borderColor:'#ccc', borderRadius:6, padding:6, width:70, marginRight:10, fontSize:16}}
                keyboardType="numeric"
                value={editAmount}
                onChangeText={setEditAmount}
              />
              <TouchableOpacity
                style={{borderWidth:1, borderColor:'#ccc', borderRadius:6, padding:6, width:120, marginRight:10}}
                onPress={()=>setEditPickerVisible(true)}
              >
                <Text style={{color:'#333', fontSize:16}}>
                  {editTs ? new Date(editTs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : 'Select Time'}
                </Text>
              </TouchableOpacity>
              {editPickerVisible && (
                <DateTimePicker
                  value={editTs ? new Date(editTs) : new Date()}
                  mode="datetime"
                  display="default"
                  onChange={(event, date) => {
                    setEditPickerVisible(false);
                    if (date) setEditTs(date.toISOString());
                  }}
                />
              )}
              <Button title="Save" onPress={handleEditSave} />
              <Button title="Cancel" onPress={()=>setEditingId(null)} />
            </View>
          ) : (
            <View style={{flexDirection:'row', alignItems:'center', marginBottom:14, backgroundColor:'#fff', borderRadius:10, paddingVertical:10, paddingHorizontal:12, shadowColor:'#000', shadowOpacity:0.04, shadowRadius:4, elevation:1}}>
              <Text style={{flex:1, fontSize:16}}>
                {new Date(item.ts).toLocaleDateString([], { month: '2-digit', day: '2-digit', year: 'numeric' })}, {new Date(item.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })} — {item.amount_mg} mg
              </Text>
              <TouchableOpacity onPress={()=>startEdit(item)}>
                <Text style={{color:'#2563eb', fontWeight:'600', fontSize:16, marginRight:12}}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={()=>handleDelete(item.id)}>
                <Text style={{color:'#c00', fontWeight:'600', fontSize:16}}>Delete</Text>
              </TouchableOpacity>
            </View>
          )
        )}
      />
    </View>
  );
}
