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

/** ตารางเส้นตรงแนวนอน + แนวตั้ง — สุ่ม spacing ใหม่ทุกครั้งที่ reload */
export function generateWindBackgroundLines(seed: number): WindBackgroundLine[] {
  const rng = mulberry32(seed)
  const rowCount = 11 + Math.floor(rng() * 4)
  const colCount = 14 + Math.floor(rng() * 5)
  const lines: WindBackgroundLine[] = []
  let id = 0

  const xStart = -60
  const xEnd = 1500
  const yStart = 280
  const yEnd = 920

  for (let row = 0; row <= rowCount; row += 1) {
    const y = yStart + (row / rowCount) * (yEnd - yStart)
    const depth = row / rowCount
    lines.push({
      id: id++,
      d: `M ${xStart.toFixed(1)} ${y.toFixed(1)} L ${xEnd.toFixed(1)} ${y.toFixed(1)}`,
      opacity: 0.09 + depth * 0.2 + rng() * 0.05,
      strokeWidth: 0.7 + rng() * 0.55,
    })
  }

  for (let col = 0; col <= colCount; col += 1) {
    const x = xStart + (col / colCount) * (xEnd - xStart)
    const depth = col / colCount
    lines.push({
      id: id++,
      d: `M ${x.toFixed(1)} ${yStart.toFixed(1)} L ${x.toFixed(1)} ${yEnd.toFixed(1)}`,
      opacity: 0.08 + depth * 0.18 + rng() * 0.05,
      strokeWidth: 0.65 + rng() * 0.5,
    })
  }

  return lines
}
