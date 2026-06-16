export type WindBackgroundLine = {
  id: number
  d: string
  opacity: number
  strokeWidth: number
}

type GridWarp = {
  freqX: number
  freqY: number
  ampX: number
  ampY: number
  phaseX: number
  phaseY: number
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

function warpPoint(x: number, y: number, warp: GridWarp): { x: number; y: number } {
  const dx =
    Math.sin(y * warp.freqY + warp.phaseY) * warp.ampX +
    Math.sin(x * warp.freqX * 0.65 + warp.phaseX) * warp.ampX * 0.4
  const dy =
    Math.sin(x * warp.freqX + warp.phaseX) * warp.ampY +
    Math.sin(y * warp.freqY * 0.75 + warp.phaseY) * warp.ampY * 0.4
  return { x: x + dx, y: y + dy }
}

function buildPolylinePath(points: Array<{ x: number; y: number }>): string {
  return points
    .map((point, index) =>
      index === 0 ? `M ${point.x.toFixed(1)} ${point.y.toFixed(1)}` : ` L ${point.x.toFixed(1)} ${point.y.toFixed(1)}`
    )
    .join("")
}

function createHorizontalGridLine(logicalY: number, warp: GridWarp, steps = 32): string {
  const points: Array<{ x: number; y: number }> = []
  const startX = -100
  const endX = 1540

  for (let step = 0; step <= steps; step += 1) {
    const x = startX + (step / steps) * (endX - startX)
    points.push(warpPoint(x, logicalY, warp))
  }

  return buildPolylinePath(points)
}

function createVerticalGridLine(logicalX: number, warp: GridWarp, steps = 24): string {
  const points: Array<{ x: number; y: number }> = []
  const startY = 260
  const endY = 940

  for (let step = 0; step <= steps; step += 1) {
    const y = startY + (step / steps) * (endY - startY)
    points.push(warpPoint(logicalX, y, warp))
  }

  return buildPolylinePath(points)
}

/** ตารางเส้น (grid) โค้งเบาๆ แบบ mesh — สุ่มใหม่ทุกครั้งที่ reload */
export function generateWindBackgroundLines(seed: number): WindBackgroundLine[] {
  const rng = mulberry32(seed)
  const warp: GridWarp = {
    freqX: 0.0032 + rng() * 0.0048,
    freqY: 0.004 + rng() * 0.0055,
    ampX: 6 + rng() * 16,
    ampY: 8 + rng() * 20,
    phaseX: rng() * Math.PI * 2,
    phaseY: rng() * Math.PI * 2,
  }

  const rowCount = 11 + Math.floor(rng() * 4)
  const colCount = 14 + Math.floor(rng() * 5)
  const lines: WindBackgroundLine[] = []
  let id = 0

  const yStart = 280
  const yEnd = 920
  for (let row = 0; row <= rowCount; row += 1) {
    const logicalY = yStart + (row / rowCount) * (yEnd - yStart) + (rng() - 0.5) * 6
    const depth = row / rowCount
    lines.push({
      id: id++,
      d: createHorizontalGridLine(logicalY, warp),
      opacity: 0.09 + depth * 0.2 + rng() * 0.05,
      strokeWidth: 0.7 + rng() * 0.55,
    })
  }

  const xStart = -60
  const xEnd = 1500
  for (let col = 0; col <= colCount; col += 1) {
    const logicalX = xStart + (col / colCount) * (xEnd - xStart) + (rng() - 0.5) * 6
    const depth = col / colCount
    lines.push({
      id: id++,
      d: createVerticalGridLine(logicalX, warp),
      opacity: 0.08 + depth * 0.18 + rng() * 0.05,
      strokeWidth: 0.65 + rng() * 0.5,
    })
  }

  return lines
}
