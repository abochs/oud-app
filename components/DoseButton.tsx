// components/DoseButton.tsx
import { Pressable, Text } from 'react-native';

export default function DoseButton({
  label,
  mg,
  onPress,
}: {
  label: string;
  mg: number;
  onPress: (mg: number) => void;
}) {
  return (
    <Pressable
      onPress={() => onPress(mg)}
      style={{ padding: 14, borderRadius: 12, backgroundColor: '#eee', margin: 6 }}
    >
      <Text>
        {label} ({mg} mg)
      </Text>
    </Pressable>
  );
}
