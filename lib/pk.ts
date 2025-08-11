// lib/pk.ts
export type Dose = { ts: number; amount_mg: number };

export default function exposureSeries(
  doses: Dose[],
  halfLifeH: number,
  now: number,
  horizonH = 72,
  stepH = 1
) {
  const k = Math.log(2) / (halfLifeH * 3600);
  const start = now - horizonH * 3600;
  const pts: { t: number; y: number }[] = [];
  for (let t = start; t <= now; t += stepH * 3600) {
    let y = 0;
    for (const d of doses) if (t >= d.ts) y += d.amount_mg * Math.exp(-k * (t - d.ts));
    pts.push({ t, y });
  }
  const max = pts.reduce((m, p) => Math.max(m, p.y), 0) || 1;
  return pts.map((p) => ({ t: p.t, y: (p.y / max) * 100 }));
}
