export type ChessboardCell = {
  id: number
  x: number
  y: number
  width: number
  height: number
  variant: "light" | "dark"
}

export type ChessboardPattern = {
  cells: ChessboardCell[]
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

/** ตารางหมากรุก (ช่องสลับสี) — สุ่มขนาดช่องใหม่ทุกครั้งที่ reload */
export function generateChessboardBackground(seed: number): ChessboardPattern {
  const rng = mulberry32(seed)
  const cellWidth = 52 + Math.floor(rng() * 40)
  const cellHeight = 52 + Math.floor(rng() * 40)
  const originX = -Math.floor(rng() * cellWidth)
  const originY = -Math.floor(rng() * cellHeight)

  const viewW = 1440
  const viewH = 900
  const cols = Math.ceil((viewW - originX) / cellWidth) + 1
  const rows = Math.ceil((viewH - originY) / cellHeight) + 1
  const cells: ChessboardCell[] = []
  let id = 0

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      cells.push({
        id: id++,
        x: originX + col * cellWidth,
        y: originY + row * cellHeight,
        width: cellWidth,
        height: cellHeight,
        variant: (row + col) % 2 === 0 ? "light" : "dark",
      })
    }
  }

  return { cells }
}
