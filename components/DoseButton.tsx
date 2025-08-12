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
  let bgColor = '#eee';
  if (mg === 2) bgColor = '#22c55e'; // green-500
  else if (mg === 4) bgColor = '#a21caf'; // purple-700
  else if (mg === 8) bgColor = '#2563eb'; // blue-600
  else if (mg === 12) bgColor = '#f97316'; // orange-500

  let textColor = '#fff';
  if (mg === 4) textColor = '#fff';
  if (mg === 2) textColor = '#fff';
  if (mg === 8) textColor = '#fff';
  if (mg === 12) textColor = '#fff';

  return (
    <Pressable
      onPress={() => onPress(mg)}
      style={{ padding: 14, borderRadius: 12, backgroundColor: bgColor, margin: 6 }}
    >
      <Text style={{ color: textColor, fontWeight: '600' }}>
        {label}
      </Text>
    </Pressable>
  );
}
