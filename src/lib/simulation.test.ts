import { describe, it, expect } from 'vitest'
import {
  createGrid,
  countNeighbors,
  applyRules,
  stepSimulation,
  setCell,
  clearGrid,
  randomFill,
  countAliveCells,
  CONWAY_RULES,
  getGridSize,
  isGridEmpty,
  GRID_SIZE_PRESETS,
} from '../lib/simulation'
import type { SimulationState } from '../types'

describe('createGrid', () => {
  it('should create a grid with correct dimensions', () => {
    const grid = createGrid(3, 4)
    expect(grid).toHaveLength(3)
    expect(grid[0]).toHaveLength(4)
  })

  it('should initialize all cells to 0 (dead)', () => {
    const grid = createGrid(5, 5)
    for (const row of grid) {
      for (const cell of row) {
        expect(cell).toBe(0)
      }
    }
  })
})

describe('countNeighbors', () => {
  it('should count neighbors for a cell in the middle', () => {
    const grid = createGrid(3, 3)
    grid[0][1] = 1
    grid[1][0] = 1
    grid[1][2] = 1
    grid[2][1] = 1
    const count = countNeighbors(grid, 1, 1)
    expect(count).toBe(4)
  })

  it('should handle toroidal boundaries (wrap around)', () => {
    const grid = createGrid(3, 3)
    grid[0][0] = 1
    grid[2][0] = 1
    grid[0][2] = 1
    const count = countNeighbors(grid, 0, 0)
    expect(count).toBe(2)
  })

  it('should count only alive cells (age > 0)', () => {
    const grid = createGrid(3, 3)
    grid[0][1] = 1
    grid[1][0] = 0
    grid[1][2] = 2
    const count = countNeighbors(grid, 1, 1)
    expect(count).toBe(2)
  })
})

describe('applyRules', () => {
  it('should apply Conway rules correctly - block pattern', () => {
    const grid = createGrid(4, 4)
    grid[1][1] = 1
    grid[1][2] = 1
    grid[2][1] = 1
    grid[2][2] = 1

    const result = applyRules(grid, CONWAY_RULES)

    expect(result.newGrid[1][1]).toBe(2)
    expect(result.newGrid[1][2]).toBe(2)
    expect(result.newGrid[2][1]).toBe(2)
    expect(result.newGrid[2][2]).toBe(2)
    expect(result.bornCount).toBe(0)
  })

  it('should apply Conway rules correctly - glider pattern (generation 0 to 1)', () => {
    const grid = createGrid(10, 10)
    grid[1][2] = 1
    grid[2][3] = 1
    grid[3][1] = 1
    grid[3][2] = 1
    grid[3][3] = 1

    const result = applyRules(grid, CONWAY_RULES)

    expect(result.newGrid[2][1]).toBe(1)
    expect(result.newGrid[2][3]).toBe(2)
    expect(result.newGrid[3][2]).toBe(2)
    expect(result.newGrid[3][3]).toBe(2)
    expect(result.newGrid[4][2]).toBe(1)
    expect(result.bornCount).toBe(2)
  })

  it('should increment age for surviving cells', () => {
    const grid = createGrid(4, 4)
    grid[1][1] = 2
    grid[1][2] = 2
    grid[2][1] = 2
    grid[2][2] = 2

    const result = applyRules(grid, CONWAY_RULES)

    expect(result.newGrid[1][1]).toBe(3)
    expect(result.newGrid[1][2]).toBe(3)
    expect(result.newGrid[2][1]).toBe(3)
    expect(result.newGrid[2][2]).toBe(3)
  })

  it('should set age to 1 for born cells', () => {
    const grid = createGrid(10, 10)
    grid[1][2] = 1
    grid[2][3] = 1
    grid[3][1] = 1
    grid[3][2] = 1
    grid[3][3] = 1

    const result = applyRules(grid, CONWAY_RULES)

    expect(result.newGrid[2][1]).toBe(1)
    expect(result.newGrid[4][2]).toBe(1)
  })

  it('should calculate average row position for births', () => {
    const grid = createGrid(10, 10)
    grid[1][2] = 1
    grid[2][3] = 1
    grid[3][1] = 1
    grid[3][2] = 1
    grid[3][3] = 1

    const result = applyRules(grid, CONWAY_RULES)

    expect(result.averageRow).toBe(3)
  })

  it('should handle no births', () => {
    const grid = createGrid(4, 4)
    grid[1][1] = 1

    const result = applyRules(grid, CONWAY_RULES)

    expect(result.bornCount).toBe(0)
    expect(result.averageRow).toBe(0)
  })
})

describe('stepSimulation', () => {
  it('should increment generation counter', () => {
    const state: SimulationState = {
      grid: createGrid(3, 3),
      generation: 5,
      running: false,
      speed: 100,
      selectedRule: CONWAY_RULES,
    }

    const result = stepSimulation(state)

    expect(result.newGeneration).toBe(6)
  })

  it('should apply rules and return new grid', () => {
    const grid = createGrid(10, 10)
    grid[1][2] = 1
    grid[2][3] = 1
    grid[3][1] = 1
    grid[3][2] = 1
    grid[3][3] = 1

    const state: SimulationState = {
      grid,
      generation: 0,
      running: false,
      speed: 100,
      selectedRule: CONWAY_RULES,
    }

    const result = stepSimulation(state)

    expect(result.newGrid[2][1]).toBe(1)
    expect(result.newGrid[4][2]).toBe(1)
    expect(result.bornCount).toBe(2)
    expect(result.newGeneration).toBe(1)
  })
})

describe('setCell', () => {
  it('should set a cell to specified age', () => {
    const grid = createGrid(3, 3)
    const newGrid = setCell(grid, 1, 1, 5)

    expect(newGrid[1][1]).toBe(5)
    expect(newGrid).not.toBe(grid)
  })

  it('should create a new grid (not mutate)', () => {
    const grid = createGrid(3, 3)
    const newGrid = setCell(grid, 1, 1, 1)

    expect(newGrid).not.toBe(grid)
    expect(grid[1][1]).toBe(0)
  })
})

describe('clearGrid', () => {
  it('should create a new empty grid', () => {
    const grid = createGrid(3, 3)
    grid[1][1] = 1
    const newGrid = clearGrid(3, 3)

    expect(newGrid[1][1]).toBe(0)
    expect(newGrid).toHaveLength(3)
  })
})

describe('randomFill', () => {
  it('should fill grid with random cells', () => {
    const grid = createGrid(10, 10)
    const filled = randomFill(grid, 0.5)

    const aliveCount = countAliveCells(filled)
    expect(aliveCount).toBeGreaterThan(0)
    expect(aliveCount).toBeLessThan(100)
  })

  it('should not mutate original grid', () => {
    const grid = createGrid(3, 3)
    const filled = randomFill(grid, 0.5)

    expect(filled).not.toBe(grid)
    expect(grid[0][0]).toBe(0)
  })

  it('should use default density of 0.15', () => {
    const grid = createGrid(100, 100)
    const filled = randomFill(grid)

    const aliveCount = countAliveCells(filled)
    expect(aliveCount).toBeGreaterThan(0)
    expect(aliveCount).toBeLessThan(2000)
  })
})

describe('countAliveCells', () => {
  it('should count all alive cells', () => {
    const grid = createGrid(3, 3)
    grid[0][0] = 1
    grid[0][1] = 2
    grid[1][0] = 5

    const count = countAliveCells(grid)
    expect(count).toBe(3)
  })

  it('should return 0 for empty grid', () => {
    const grid = createGrid(3, 3)
    const count = countAliveCells(grid)
    expect(count).toBe(0)
  })

  it('should count cells with any age > 0', () => {
    const grid = createGrid(2, 2)
    grid[0][0] = 0
    grid[0][1] = 1
    grid[1][0] = 100
    grid[1][1] = 2

    const count = countAliveCells(grid)
    expect(count).toBe(3)
  })
})

describe('isGridEmpty', () => {
  it('should return true for empty grid', () => {
    const grid = createGrid(3, 3)
    expect(isGridEmpty(grid)).toBe(true)
  })

  it('should return false for grid with alive cells', () => {
    const grid = createGrid(3, 3)
    grid[1][1] = 1
    expect(isGridEmpty(grid)).toBe(false)
  })
})

describe('GRID_SIZE_PRESETS', () => {
  it('should have correct SMALL preset', () => {
    expect(GRID_SIZE_PRESETS.SMALL).toEqual({ rows: 20, cols: 30 })
  })

  it('should have correct MEDIUM preset', () => {
    expect(GRID_SIZE_PRESETS.MEDIUM).toEqual({ rows: 40, cols: 50 })
  })

  it('should have correct LARGE preset', () => {
    expect(GRID_SIZE_PRESETS.LARGE).toEqual({ rows: 60, cols: 80 })
  })
})

describe('getGridSize', () => {
  it('should return correct size for SMALL preset', () => {
    const size = getGridSize('SMALL')
    expect(size).toEqual({ rows: 20, cols: 30 })
  })

  it('should return correct size for MEDIUM preset', () => {
    const size = getGridSize('MEDIUM')
    expect(size).toEqual({ rows: 40, cols: 50 })
  })

  it('should return correct size for LARGE preset', () => {
    const size = getGridSize('LARGE')
    expect(size).toEqual({ rows: 60, cols: 80 })
  })
})
