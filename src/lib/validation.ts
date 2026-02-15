export function isValidCoordinate(
  row: number,
  col: number,
  numRows: number,
  numCols: number
): boolean {
  return row >= 0 && row < numRows && col >= 0 && col < numCols
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max
}

export function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && value > 0
}

export function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && value >= 0
}

export function isInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value)
}

export function isValidRuleSet(ruleSet: unknown): ruleSet is { born: number[]; survive: number[] } {
  if (typeof ruleSet !== 'object' || ruleSet === null) return false
  const { born, survive } = ruleSet as { born?: unknown; survive?: unknown }

  if (!Array.isArray(born) || !Array.isArray(survive)) return false

  return (
    born.every((v) => isInteger(v) && isNonNegativeNumber(v)) &&
    survive.every((v) => isInteger(v) && isNonNegativeNumber(v))
  )
}

export function validateGridDimensions(
  rows: number,
  cols: number
): { valid: boolean; error?: string } {
  if (!isPositiveNumber(rows) || !isPositiveNumber(cols)) {
    return { valid: false, error: 'Grid dimensions must be positive numbers' }
  }

  if (rows > 1000 || cols > 1000) {
    return { valid: false, error: 'Grid dimensions cannot exceed 1000x1000' }
  }

  return { valid: true }
}
