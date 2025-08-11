// ...existing code...
  {/* Minor x-axis grid lines for displayed times */}
  {/* ...existing code... */}
  // ...existing code...
import { VictoryAxis, VictoryChart, VictoryLine, VictoryArea, VictoryLabel } from 'victory-native';
import React, { useEffect, useState } from 'react';
// components/LineChart.tsx
type Point = { x: Date; y: number };

export default function LineChart({ data }: { data: Point[] | undefined }) {
  const raw = data ?? [];
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 60000); // update every minute
    return () => clearInterval(interval);
  }, []);
  if (!raw.length) {
    return <></>;
  }

  // Shift all times so that 'now' is at x = 0
  const series = raw.map((d) => ({
    x: (d.x.getTime() - now) / (60 * 60 * 1000), // hours from now
    y: d.y,
  }));

  // X domain: -24 to +24 (scrollable region)
  const xMin = -24;
  const xMax = 24;
  // Y domain: 0 to 5 ng/mL (therapeutic range)
  const yMin = 0;
  const yMax = 5;

  // Dashed vertical line at current time (x = 0, 'Now')
  const nowLine = [
    { x: 0, y: yMin },
    { x: 0, y: yMax },
  ];

  // Get device width for full horizontal space
  const deviceWidth = typeof window !== 'undefined' && window.innerWidth
    ? window.innerWidth
    : 375; // fallback for iPhone
  // Chart width for -24 to +24 hours (48 hours), so scrolling is possible
  const visibleHours = 12; // -6 to +6
  const totalHours = 48; // -24 to +24
  const chartWidth = Math.round((deviceWidth - 32) * (totalHours / visibleHours));

  // Create shaded area for therapeutic window (2–3 ng/mL) for full scrollable region
  const therapeuticArea = Array.from({ length: 100 }, (_, i) => {
    const x = xMin + ((xMax - xMin) * i) / 99;
    return { x, y0: 2, y: 3 };
  });

  // Split series into past and future
  const solidSeries = series.filter((d) => d.x < 0 && d.x >= -24);
  const dashedSeries = series.filter((d) => d.x >= 0);

  return (
    <VictoryChart
      width={chartWidth}
      height={400}
      domain={{ x: [xMin, xMax], y: [yMin, yMax] }}
  padding={{ left: 0, right: 0, top: 0, bottom: 48 }}
    >
      <VictoryArea
        data={therapeuticArea}
        y0={(d) => 2}
        style={{ data: { fill: 'rgba(0, 128, 0, 0.15)', strokeWidth: 0 } }}
      />
      <VictoryAxis
        tickValues={[0]}
        tickFormat={() => ''}
        style={{
          tickLabels: { fill: 'transparent' },
          grid: { stroke: 'transparent' },
        }}
      />
      {/* Only show 'Now' label at x=0 */}
      <VictoryLabel
        text="Now"
        x={((0 - xMin) / (xMax - xMin)) * chartWidth}
        y={400 - 20}
        textAnchor="middle"
        style={{ fontSize: 14, fill: '#333' }}
      />

      {/* Minor x-axis: grid lines and tick labels at each next full hour after 'Now', showing 'HH:00' */}
      {(() => {
        // Use variables from main function scope
        const nowDate = new Date(now);
        const baseHourDate = new Date(nowDate);
        baseHourDate.setMinutes(0, 0, 0);
        const allowedTimes = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"];
        return Array.from({length: 49}, (_, i) => {
          const t = -24 + i;
          const tickDate = new Date(baseHourDate.getTime() + t * 60 * 60 * 1000);
          const hour = tickDate.getHours();
          const timeStr = `${hour.toString().padStart(2, '0')}:00`;
          if (!allowedTimes.includes(timeStr)) return null;
          const x = (tickDate.getTime() - nowDate.getTime()) / (60 * 60 * 1000);
          if (x < xMin || x > xMax) return null;
          return [
            <VictoryLine
              key={`minor-grid-${t}`}
              data={[{ x, y: yMin }, { x, y: yMax }]}
              style={{ data: { stroke: '#000', strokeWidth: 0.5, opacity: 0.2 } }}
            />,
            <VictoryLabel
              key={`minor-${t}`}
              text={timeStr}
              x={((x - xMin) / (xMax - xMin)) * chartWidth + 0} // 0 to the right of the grid line
              y={400 - 30}
              textAnchor="start"
              style={{ fontSize: 10, fill: '#888' }}
            />
          ];
        });
      })()}
      {/* Solid line for past Cp */}
      <VictoryLine
        interpolation="monotoneX"
        data={solidSeries}
        style={{ data: { strokeWidth: 2, stroke: '#007700' } }}
      />
      {/* Dashed line for predicted Cp */}
      <VictoryLine
        interpolation="monotoneX"
        data={dashedSeries}
        style={{ data: { strokeWidth: 2, strokeDasharray: '6,6', stroke: '#007700', opacity: 0.8 } }}
      />
      {/* Dashed vertical line at 'Now' */}
      <VictoryLine
        data={nowLine}
        style={{ data: { strokeDasharray: '6,6', stroke: '#888', opacity: 0.7 } }}
      />
    </VictoryChart>
  );
}
