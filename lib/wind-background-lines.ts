export type WindBackgroundLine = {
  id: number
  d: string
  opacity: number
  strokeWidth: number
  duration: number
  delay: number
  strokeDuration: number
  sway: number
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

function createWindPath(rng: () => number, laneIndex: number, laneCount: number): string {
  const spread = 900 / Math.max(laneCount - 1, 1)
  let x = -140 + laneIndex * spread * 0.55 + rng() * spread * 0.45
  let y = 940 + rng() * 90
  const segmentCount = 3 + Math.floor(rng() * 3)
  let path = `M ${x.toFixed(1)} ${y.toFixed(1)}`

  for (let segment = 0; segment < segmentCount; segment += 1) {
    const rise = 130 + rng() * 170
    const run = 150 + rng() * 210
    const targetX = x + run + (rng() - 0.5) * 80
    const targetY = Math.max(-120, y - rise)

    const cp1x = x + run * (0.25 + rng() * 0.2)
    const cp1y = y - rise * (0.35 + rng() * 0.25)
    const cp2x = targetX - run * (0.2 + rng() * 0.2)
    const cp2y = targetY + rise * (0.15 + rng() * 0.2)

    path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${targetX.toFixed(1)} ${targetY.toFixed(1)}`
    x = targetX
    y = targetY
  }

  if (rng() > 0.35) {
    const tailX = x + 120 + rng() * 160
    const tailY = Math.max(-160, y - 90 - rng() * 120)
    const smoothX = x + 70 + rng() * 90
    const smoothY = y - 40 - rng() * 70
    path += ` S ${smoothX.toFixed(1)} ${smoothY.toFixed(1)}, ${tailX.toFixed(1)} ${tailY.toFixed(1)}`
  }

  return path
}

export function generateWindBackgroundLines(seed: number, count = 16): WindBackgroundLine[] {
  const rng = mulberry32(seed)
  const lines: WindBackgroundLine[] = []

  for (let index = 0; index < count; index += 1) {
    lines.push({
      id: index,
      d: createWindPath(rng, index, count),
      opacity: 0.14 + rng() * 0.24,
      strokeWidth: 0.9 + rng() * 1.4,
      duration: 11 + rng() * 13,
      delay: rng() * 8,
      strokeDuration: 16 + rng() * 18,
      sway: 0.6 + rng() * 1.4,
    })
  }

  return lines
}
