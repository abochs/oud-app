// lib/buprenorphinePK.ts

export type Dose = { amount_mg: number; ts: number };
export type PatientParams = {
  weight_kg: number;
};

export function calculateCpSeries(
  doses: Dose[],
  patient: PatientParams,
  startTime: number,
  hours: number,
  intervalMinutes: number = 30
): { x: Date; y: number }[] {
  // PK parameters from package insert
  const bioavailability = 0.4;
  // Table values for 2mg and 8mg doses
  const doseParams: Record<number, { cmax: number; tmax: number; halfLife: number }> = {
    2: { cmax: 0.95, tmax: 1.72, halfLife: 33.4 }, // ng/mL, hr, hr
    8: { cmax: 3.37, tmax: 1.53, halfLife: 32.8 },
  };
  // Average for other doses
  const avgCmax = (0.95 + 3.37) / 2;
  const avgTmax = (1.72 + 1.53) / 2;
  const avgHalfLife = (33.4 + 32.8) / 2;

  const points: { x: Date; y: number }[] = [];
  const intervals = Math.ceil((hours * 60) / intervalMinutes);

  for (let i = 0; i <= intervals; i++) {
    const t = startTime + i * intervalMinutes * 60 * 1000;
    let Cp = 0;
    for (const dose of doses) {
      if (dose.ts <= t) {
        const doseMg = dose.amount_mg;
        // Get PK params for dose
  let params = doseParams[doseMg] || { cmax: avgCmax, tmax: avgTmax, halfLife: avgHalfLife };
        const tDoseHr = (t - dose.ts) / (60 * 60 * 1000);
        if (tDoseHr <= params.tmax) {
          // Linear rise to Cmax at Tmax
          Cp += params.cmax * bioavailability * (tDoseHr / params.tmax);
        } else {
          // Exponential decay after Tmax
          const k = Math.log(2) / params.halfLife;
          Cp += params.cmax * bioavailability * Math.exp(-k * (tDoseHr - params.tmax));
        }
      }
    }
    // Debug: log Cp for all future points between 0 and +6 hours
    const xHr = (t - Date.now()) / (60 * 60 * 1000);
    if (xHr >= 0 && xHr <= 6) {
      console.log(`Predicted Cp at +${xHr.toFixed(2)} hr: ${Cp.toFixed(3)} ng/mL`);
    }
    points.push({ x: new Date(t), y: Cp });
  }
  return points;
}
