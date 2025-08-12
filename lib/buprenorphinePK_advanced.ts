// lib/buprenorphinePK_advanced.ts

// ---------- Types ----------
export type Dose = { amount_mg: number; ts: number }; // mg, Unix ms
export type PatientParams = {
  weight_kg?: number;            // default 70
  hepatic?: "none" | "mild" | "moderate" | "severe"; // CL reduction
  cyp3a?: "none" | "inhibitor" | "inducer";          // CL mod
  formulation?: "film" | "tablet"; // calibrates to film by default
};

export type PKSeriesPoint = { x: Date; y: number }; // time, ng/mL

// ---------- Model Notes ----------
// 1-compartment, first-order absorption; superposition across doses.
// C(t) = F * Dose / V * (ka/(ka - k)) * (e^{-k * dt} - e^{-ka * dt})
// where dt = (t - dose.ts) in hours, k = CL/V, ka is absorption constant.
// We calibrate to label (8 mg film) Cmax/Tmax to solve for F given V, CL, ka.

// ---------- Tunable Population Anchors (70-kg adult) ----------
const POP = {
  // We choose V70 and CL70 so t1/2 ≈ 33 h (label); k = CL/V.
  V70_L: 800,               // apparent V/F at 70 kg (L); large for buprenorphine
  CL70_L_per_h: 0.693 * 800 / 33, // ≈ 16.8 L/h -> t1/2 ≈ 33 h
  ka_per_h: 1.0,            // absorption rate constant (first-order)
  // Label anchor (SUBOXONE® film): 8 mg Cmax/Tmax
  label: { dose_mg: 8, Cmax_ng_per_mL: 3.37, Tmax_h: 1.53 },
};

// Hepatic effect on clearance (simple multipliers; conservative)
const HEPATIC_CL_MULT: Record<NonNullable<PatientParams["hepatic"]>, number> = {
  none: 1.0,
  mild: 0.85,
  moderate: 0.65,
  severe: 0.5,
};

// CYP3A effect on clearance (rough, user-adjustable)
const CYP3A_CL_MULT: Record<NonNullable<PatientParams["cyp3a"]>, number> = {
  none: 1.0,
  inhibitor: 0.75, // ↓CL
  inducer: 1.25,   // ↑CL
};

// Formulation tweak (optionally nudge F after calibration; keep small)
const FORMULATION_F_MULT: Record<NonNullable<PatientParams["formulation"]>, number> = {
  film: 1.0,
  tablet: 0.9, // tablets tend to have slightly lower exposure than film, small nudge
};

// ---------- Helpers ----------
function hoursBetween(msLater: number, msEarlier: number): number {
  return (msLater - msEarlier) / (1000 * 60 * 60);
}

// Allometric scaling from 70 kg
function scaleCL(CL70: number, wt: number): number {
  return CL70 * Math.pow(wt / 70, 0.75);
}
function scaleV(V70: number, wt: number): number {
  return V70 * (wt / 70);
}

// Calibrate F (bioavailability) to match label’s 8 mg Cmax at Tmax for a 70-kg adult
function calibrateF(CL: number, V: number, ka: number): number {
  const { dose_mg, Cmax_ng_per_mL, Tmax_h } = POP.label;

  // Rearranged from model equation at t = Tmax:
  // Cmax(ng/mL) = [F * Dose/V * (ka/(ka-k)) * (e^{-k*T} - e^{-ka*T})] * 1000
  const k = CL / V;
  const mg_per_L =
    (dose_mg / V) *
    (ka / (ka - k)) *
    (Math.exp(-k * Tmax_h) - Math.exp(-ka * Tmax_h));
  const factor = 1000; // mg/L -> ng/mL

  const F = Cmax_ng_per_mL / (mg_per_L * factor);
  return F;
}

// Compute concentration (ng/mL) at time t for a single dose using current params
function concForDose(
  t_ms: number,
  dose: Dose,
  F: number,
  CL: number,
  V: number,
  ka: number
): number {
  const dt_h = hoursBetween(t_ms, dose.ts);
  if (dt_h <= 0) return 0;

  const k = CL / V;
  // Guard against ka ≈ k numerical instability
  const eps = 1e-6;
  const denom = Math.max(Math.abs(ka - k), eps);
  const mg_per_L = (F * dose.amount_mg / V) * (ka / (Math.sign(ka - k) * denom)) *
    (Math.exp(-k * dt_h) - Math.exp(-ka * dt_h));
  const ng_per_mL = mg_per_L * 1000;
  return Math.max(0, ng_per_mL);
}

// ---------- Public: Advanced, Personalized Series ----------
export function calculateCpSeriesAdvanced(
  doses: Dose[],
  patient: PatientParams,
  startTime_ms: number,
  hours: number,
  intervalMinutes = 30
): PKSeriesPoint[] {
  const wt = patient.weight_kg ?? 70;

  // Base (70-kg) parameters
  let CL = scaleCL(POP.CL70_L_per_h, wt);
  let V  = scaleV(POP.V70_L, wt);
  let ka = POP.ka_per_h;

  // Hepatic / CYP3A effects on CL
  const hepMult = HEPATIC_CL_MULT[patient.hepatic ?? "none"];
  const cypMult = CYP3A_CL_MULT[patient.cyp3a ?? "none"];
  CL = CL * hepMult * cypMult;

  // Calibrate F to label anchor at 70-kg baseline, then adjust for formulation.
  // We calibrate to the patient’s *current* CL & V so k reflects weight/impairment.
  let F = calibrateF(CL, V, ka) * FORMULATION_F_MULT[patient.formulation ?? "film"];

  const n = Math.ceil((hours * 60) / intervalMinutes);
  const out: PKSeriesPoint[] = [];

  for (let i = 0; i <= n; i++) {
    const t = startTime_ms + i * intervalMinutes * 60 * 1000;
    let Cp_ng_per_mL = 0;

    for (const d of doses) {
      if (d.ts > t) continue; // future dose
      Cp_ng_per_mL += concForDose(t, d, F, CL, V, ka);
    }

    out.push({ x: new Date(t), y: Cp_ng_per_mL });
  }

  return out;
}
