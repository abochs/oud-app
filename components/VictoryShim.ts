// components/VictoryShim.ts
import * as VN from 'victory-native';

// Force value exports so Metro can't tree-shake them away
export const VictoryChart = (VN as any).VictoryChart;
export const VictoryLine  = (VN as any).VictoryLine;
export const VictoryAxis  = (VN as any).VictoryAxis;
