export type WindBackgroundLine = {
  id: number
  d: string
  opacity: number
  strokeWidth: number
}

type WaveParams = {
  freq1: number
  freq2: number
  freq3: number
  amp1: number
  amp2: number
  amp3: number
  phase1: number
  phase2: number
  phase3: number
  lineBias: number
}

function mulberry32(seed: number) {
  let state = seed
  return () => {
    state += 0x6d2b79f5
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function waveY(x: number, baseY: number, lineIndex: number, params: WaveParams): number {
  return (
    baseY +
    Math.sin(x * params.freq1 + params.phase1 + lineIndex * params.lineBias) * params.amp1 +
    Math.sin(x * params.freq2 + params.phase2 - lineIndex * 0.22) * params.amp2 +
    Math.sin(x * params.freq3 + params.phase3 + lineIndex * 0.11) * params.amp3
  )
}

/** เส้นโค้งแนวนอนแบบคลื่นน้ำ — สุ่มใหม่ทุกครั้งที่ reload */
function createWavePath(rng: () => number, lineIndex: number, lineCount: number): string {
  const params: WaveParams = {
    freq1: 0.0028 + rng() * 0.0055,
    freq2: 0.0055 + rng() * 0.009,
    freq3: 0.0012 + rng() * 0.0028,
    amp1: 22 + rng() * 48,
    amp2: 12 + rng() * 32,
    amp3: 6 + rng() * 18,
    phase1: rng() * Math.PI * 2,
    phase2: rng() * Math.PI * 2,
    phase3: rng() * Math.PI * 2,
    lineBias: 0.18 + rng() * 0.22,
  }

  const t = lineIndex / Math.max(lineCount - 1, 1)
  const baseY = 320 + t * 560 + (rng() - 0.5) * 28
  const startX = -120
  const endX = 1560
  const steps = 36

  let path = ""
  for (let step = 0; step <= steps; step += 1) {
    const x = startX + (step / steps) * (endX - startX)
    const y = waveY(x, baseY, lineIndex, params)
    path += step === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : ` L ${x.toFixed(1)} ${y.toFixed(1)}`
  }

  return path
}

export function generateWindBackgroundLines(seed: number, count = 20): WindBackgroundLine[] {
  const rng = mulberry32(seed)
  const lineCount = count + Math.floor(rng() * 6)
  const lines: WindBackgroundLine[] = []

  for (let index = 0; index < lineCount; index += 1) {
    const depth = index / Math.max(lineCount - 1, 1)
    lines.push({
      id: index,
      d: createWavePath(rng, index, lineCount),
      opacity: 0.1 + depth * 0.22 + rng() * 0.06,
      strokeWidth: 0.75 + rng() * 0.9,
    })
  }

  return lines
}
