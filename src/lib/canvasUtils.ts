const CELL_COLORS: Record<number, { color: string; blur: number }> = {
  0: { color: '#00ffff', blur: 15 },
  1: { color: '#61dafb', blur: 8 },
  2: { color: '#61dafb', blur: 8 },
  3: { color: '#ff00ff', blur: 4 },
  4: { color: '#ff00ff', blur: 4 },
  5: { color: '#ff00ff', blur: 4 },
}

const BACKGROUND_COLOR = '#0a0a0f'
const GRID_LINE_COLOR = '#1a1a2e'

export function getCellColor(age: number): string {
  if (age <= 5) return CELL_COLORS[age as keyof typeof CELL_COLORS].color
  return '#4a00ff'
}

export function getCellBlur(age: number): number {
  if (age <= 5) return CELL_COLORS[age as keyof typeof CELL_COLORS].blur
  return 2
}

export function getResponsiveCellSize(): number {
  return window.innerWidth < 768 ? 18 : 20
}

export const CELL_CORNER_RADIUS = 2

export { BACKGROUND_COLOR, GRID_LINE_COLOR }

export function drawRoundedRect(
  ctx: any,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  if ('roundRect' in ctx && typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, width, height, radius)
  } else {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
  }
}
