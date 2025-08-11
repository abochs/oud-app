// components/YAxisChart.tsx
import React from 'react';
import { VictoryChart, VictoryAxis } from 'victory-native';

export default function YAxisChart() {
  return (
    <VictoryChart
      width={56}
      height={300}
      domain={{ y: [0, 5] }}
      padding={{ left: 40, right: 0, top: 8, bottom: 36 }}
    >
      <VictoryAxis
        dependentAxis
        label="Concentration (ng/mL)"
        tickFormat={(v) => `${v.toFixed(1)}`}
        orientation="left"
      />
    </VictoryChart>
  );
}
