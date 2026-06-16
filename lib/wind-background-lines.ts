export type WindBackgroundLine = {
  id: number
  d: string
  opacity: number
  strokeWidth: number
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

/** สร้างเส้นโค้ง bezier แบบกระแสลม — สุ่มใหม่ทุกครั้งที่ reload */
function createWindPath(rng: () => number, laneIndex: number, laneCount: number): string {
  const spread = 920 / Math.max(laneCount - 1, 1)
  const drift = (rng() - 0.5) * 2
  let x = -120 + laneIndex * spread * 0.52 + (rng() - 0.5) * spread * 0.55
  let y = 930 + rng() * 95
  const segmentCount = 4 + Math.floor(rng() * 3)
  let path = `M ${x.toFixed(1)} ${y.toFixed(1)}`

  for (let segment = 0; segment < segmentCount; segment += 1) {
    const rise = 95 + rng() * 155
    const run = 130 + rng() * 195 + drift * 45
    const wave = Math.sin(segment * 1.35 + laneIndex * 0.55 + rng()) * (35 + rng() * 55)
    const targetX = x + run + wave
    const targetY = Math.max(-150, y - rise)

    const cp1x = x + run * (0.28 + rng() * 0.18) + drift * 30
    const cp1y = y - rise * (0.28 + rng() * 0.22)
    const cp2x = targetX - run * (0.22 + rng() * 0.18) + wave * 0.45
    const cp2y = targetY + rise * (0.18 + rng() * 0.16)

    path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${targetX.toFixed(1)} ${targetY.toFixed(1)}`
    x = targetX
    y = targetY
  }

  if (rng() > 0.2) {
    const tailRun = 100 + rng() * 150
    const tailRise = 70 + rng() * 110
    const tailX = x + tailRun + drift * 35
    const tailY = Math.max(-180, y - tailRise)
    const smoothX = x + tailRun * 0.45 + waveOffset(rng, laneIndex)
    const smoothY = y - tailRise * 0.35
    path += ` S ${smoothX.toFixed(1)} ${smoothY.toFixed(1)}, ${tailX.toFixed(1)} ${tailY.toFixed(1)}`
  }

  return path
}

function waveOffset(rng: () => number, laneIndex: number): number {
  return Math.sin(laneIndex * 0.7 + rng() * 2) * (20 + rng() * 40)
}

export function generateWindBackgroundLines(seed: number, count = 16): WindBackgroundLine[] {
  const rng = mulberry32(seed)
  const lines: WindBackgroundLine[] = []

  for (let index = 0; index < count; index += 1) {
    lines.push({
      id: index,
      d: createWindPath(rng, index, count),
      opacity: 0.16 + rng() * 0.22,
      strokeWidth: 0.95 + rng() * 1.25,
    })
  }

  return lines
}
