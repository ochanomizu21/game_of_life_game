import type { GridType, RuleSet, SimulationState } from '../types'

const NEIGHBOR_OFFSETS = [
  [0, 1],
  [0, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
  [-1, -1],
  [1, 0],
  [-1, 0],
]

interface StepResult {
  newGrid: GridType
  bornCount: number
  averageRow: number
}

export const CONWAY_RULES: RuleSet = {
  name: 'Conway',
  born: [3],
  survive: [2, 3],
}

export function createGrid(rows: number, cols: number): GridType {
  return Array.from({ length: rows }, () => Array(cols).fill(0))
}

export function countNeighbors(grid: GridType, row: number, col: number): number {
  const rows = grid.length
  const cols = grid[0].length
  let count = 0

  for (const [dRow, dCol] of NEIGHBOR_OFFSETS) {
    const newRow = (row + dRow + rows) % rows
    const newCol = (col + dCol + cols) % cols
    if (grid[newRow][newCol] > 0) {
      count++
    }
  }

  return count
}

export function applyRules(grid: GridType, rules: RuleSet): StepResult {
  const rows = grid.length
  const cols = grid[0].length
  const newGrid = createGrid(rows, cols)
  let bornCount = 0
  let totalRow = 0

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const neighbors = countNeighbors(grid, row, col)
      const isAlive = grid[row][col] > 0

      if (isAlive) {
        if (rules.survive.includes(neighbors)) {
          newGrid[row][col] = grid[row][col] + 1
        }
      } else {
        if (rules.born.includes(neighbors)) {
          newGrid[row][col] = 1
          bornCount++
          totalRow += row
        }
      }
    }
  }

  const averageRow = bornCount > 0 ? totalRow / bornCount : 0
  return { newGrid, bornCount, averageRow }
}

export function stepSimulation(state: SimulationState): {
  newGrid: GridType
  bornCount: number
  averageRow: number
  newGeneration: number
} {
  const { newGrid, bornCount, averageRow } = applyRules(state.grid, state.selectedRule)
  return {
    newGrid,
    bornCount,
    averageRow,
    newGeneration: state.generation + 1,
  }
}

export function setCell(grid: GridType, row: number, col: number, age: number): GridType {
  const newGrid = grid.map((rowArr) => [...rowArr])
  newGrid[row][col] = age
  return newGrid
}

export function clearGrid(rows: number, cols: number): GridType {
  return createGrid(rows, cols)
}

export function randomFill(grid: GridType, density: number = 0.15): GridType {
  const newGrid = grid.map((rowArr) => [...rowArr])
  for (let row = 0; row < newGrid.length; row++) {
    for (let col = 0; col < newGrid[row].length; col++) {
      if (Math.random() < density) {
        newGrid[row][col] = 1
      }
    }
  }
  return newGrid
}

export function countAliveCells(grid: GridType): number {
  let count = 0
  for (const row of grid) {
    for (const cell of row) {
      if (cell > 0) count++
    }
  }
  return count
}

export type GridSizePreset = 'SMALL' | 'MEDIUM' | 'LARGE'

export const GRID_SIZE_PRESETS: Record<GridSizePreset, { rows: number; cols: number }> = {
  SMALL: { rows: 20, cols: 30 },
  MEDIUM: { rows: 40, cols: 50 },
  LARGE: { rows: 60, cols: 80 },
}

export function getGridSize(preset: GridSizePreset): { rows: number; cols: number } {
  return GRID_SIZE_PRESETS[preset]
}

export function isGridEmpty(grid: GridType): boolean {
  return countAliveCells(grid) === 0
}
