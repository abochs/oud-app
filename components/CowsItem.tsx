// components/CowsItem.tsx
import { View, Text, Pressable } from 'react-native';

export default function CowsItem({
  label,
  value,
  setValue,
}: {
  label: string;
  value: number;
  setValue: (n: number) => void;
}) {
  return (
    <View style={{ marginVertical: 8 }}>
      <Text style={{ marginBottom: 6 }}>{label}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {[0, 1, 2, 3, 4, 5].map((v: number) => (
          <Pressable
            key={v}
            onPress={() => setValue(v)}
            style={{
              padding: 8,
              marginRight: 8,
              marginBottom: 8,
              borderWidth: 1,
              borderColor: value === v ? '#000' : '#ccc',
              borderRadius: 8,
            }}
          >
            <Text>{v}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
