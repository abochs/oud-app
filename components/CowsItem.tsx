// components/CowsItem.tsx
import { View, Text } from 'react-native';
import Slider from '@react-native-community/slider';

export default function CowsItem({
  label,
  value,
  setValue,
}: {
  label: string;
  value: number;
  setValue: (n: number) => void;
}) {
  // Color scale from green (0) to red (5)
  const colors = [
    'rgba(34,197,94,0.18)',   // 0: green-500
    'rgba(132,204,22,0.18)',  // 1: lime-400
    'rgba(253,224,71,0.18)',  // 2: yellow-300
    'rgba(251,191,36,0.18)',  // 3: amber-400
    'rgba(239,68,68,0.18)',   // 4: red-500
    'rgba(220,38,38,0.18)',   // 5: red-700
  ];
  const textColors = [
    '#22c55e', '#84cc16', '#eab308', '#f59e42', '#ef4444', '#dc2626'
  ];
  return (
    <View style={{ marginVertical: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ fontWeight: '500', fontSize: 15, color: '#222' }}>{label}</Text>
        <Text style={{ color: textColors[value], fontWeight: '700', marginLeft: 10, fontSize: 15 }}>{value}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
        <Text style={{ color: textColors[0], fontWeight: '700', marginRight: 10, fontSize: 13 }}>0</Text>
        <Slider
          style={{ flex: 1, height: 32 }}
          minimumValue={0}
          maximumValue={5}
          step={1}
          value={value}
          minimumTrackTintColor={'#888'}
          maximumTrackTintColor={'#ddd'}
          thumbTintColor={'#1976d2'}
          onValueChange={setValue}
        />
  <Text style={{ color: textColors[5], fontWeight: '700', marginLeft: 10, fontSize: 13 }}>5</Text>
      </View>
    </View>
  );
}
