import type { GridType, CellCluster, TrackedCluster, MovementDetectionParams } from '../types'

const NEIGHBOR_OFFSETS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
]

function generateClusterId(cells: Set<string>): string {
  const sorted = Array.from(cells).sort()
  return sorted.join('|')
}

export function findConnectedComponents(grid: GridType, generation: number): CellCluster[] {
  const rows = grid.length
  const cols = grid[0].length
  const visited = new Set<string>()
  const clusters: CellCluster[] = []

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (grid[row][col] === 0) continue

      const key = `${row},${col}`
      if (visited.has(key)) continue

      const cells: Set<string> = new Set()
      const queue: [number, number][] = [[row, col]]
      let totalX = 0
      let totalY = 0
      let cellCount = 0

      while (queue.length > 0) {
        const [r, c] = queue.shift()!
        const cellKey = `${r},${c}`

        if (visited.has(cellKey)) continue
        if (grid[r][c] === 0) continue

        visited.add(cellKey)
        cells.add(cellKey)
        totalX += c
        totalY += r
        cellCount++

        for (const [dr, dc] of NEIGHBOR_OFFSETS) {
          const nr = r + dr
          const nc = c + dc

          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            const neighborKey = `${nr},${nc}`

            if (!visited.has(neighborKey) && grid[nr][nc] > 0) {
              queue.push([nr, nc])
            }
          }
        }
      }

      if (cellCount > 0) {
        const centroid = {
          x: totalX / cellCount,
          y: totalY / cellCount,
        }

        clusters.push({
          id: generateClusterId(cells),
          cells,
          centroid,
          generation,
        })
      }
    }
  }

  return clusters
}

function distanceBetween(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  const dx = p1.x - p2.x
  const dy = p1.y - p2.y
  return Math.sqrt(dx * dx + dy * dy)
}

export function matchClusters(
  currentClusters: CellCluster[],
  previousTrackedClusters: TrackedCluster[]
): Map<string, TrackedCluster> {
  const unmatchedPrevious = new Map<string, TrackedCluster>()
  for (const cluster of previousTrackedClusters) {
    unmatchedPrevious.set(cluster.id, cluster)
  }

  const matches = new Map<string, TrackedCluster>()

  for (const current of currentClusters) {
    let bestMatch: TrackedCluster | null = null
    let bestDistance = Infinity

    for (const previous of unmatchedPrevious.values()) {
      const dist = distanceBetween(current.centroid, previous.centroid)

      if (dist < bestDistance) {
        bestDistance = dist
        bestMatch = previous
      }
    }

    if (bestMatch && bestDistance <= 5) {
      matches.set(current.id, { ...bestMatch })
      unmatchedPrevious.delete(bestMatch.id)
    }
  }

  return matches
}

export function trackClusters(
  currentClusters: CellCluster[],
  previousTrackedClusters: TrackedCluster[],
  config: MovementDetectionParams
): TrackedCluster[] {
  const matches = matchClusters(currentClusters, previousTrackedClusters)
  const trackedClusters: TrackedCluster[] = []

  for (const current of currentClusters) {
    const previous = matches.get(current.id)

    if (previous) {
      const history = [...previous.centroidHistory]
      history.push(current.centroid)

      if (history.length > config.centroidHistoryLength) {
        history.shift()
      }

      const velocity = calculateVelocity(history)

      trackedClusters.push({
        ...current,
        centroidHistory: history,
        velocity,
        classification: classifyCluster(
          velocity,
          config.movementThreshold,
          previous.cells,
          current.cells
        ),
      })
    } else {
      trackedClusters.push({
        ...current,
        centroidHistory: [current.centroid],
        velocity: { dx: 0, dy: 0 },
        classification: 'STATIC',
      })
    }
  }

  return trackedClusters
}

export function calculateVelocity(history: { x: number; y: number }[]): { dx: number; dy: number } {
  if (history.length < 2) {
    return { dx: 0, dy: 0 }
  }

  const first = history[0]
  const last = history[history.length - 1]
  const timeSpan = history.length - 1

  return {
    dx: (last.x - first.x) / timeSpan,
    dy: (last.y - first.y) / timeSpan,
  }
}

export function classifyCluster(
  velocity: { dx: number; dy: number },
  threshold: number,
  previousCells: Set<string>,
  currentCells: Set<string>
): 'MOVER' | 'OSCILLATOR' | 'STATIC' {
  const isMoving = Math.abs(velocity.dx) > threshold || Math.abs(velocity.dy) > threshold

  if (isMoving) {
    return 'MOVER'
  }

  const hasChanged = !areCellSetsEqual(previousCells, currentCells)

  if (hasChanged) {
    return 'OSCILLATOR'
  }

  return 'STATIC'
}

function areCellSetsEqual(set1: Set<string>, set2: Set<string>): boolean {
  if (set1.size !== set2.size) return false

  for (const cell of set1) {
    if (!set2.has(cell)) return false
  }

  return true
}

export function filterClustersByMinSize(
  clusters: TrackedCluster[],
  minSize: number
): TrackedCluster[] {
  return clusters.filter((cluster) => cluster.cells.size >= minSize)
}

export function countClustersByClassification(clusters: TrackedCluster[]): {
  movers: number
  oscillators: number
  static: number
} {
  let movers = 0
  let oscillators = 0
  let staticCount = 0

  for (const cluster of clusters) {
    switch (cluster.classification) {
      case 'MOVER':
        movers++
        break
      case 'OSCILLATOR':
        oscillators++
        break
      case 'STATIC':
        staticCount++
        break
    }
  }

  return { movers, oscillators, static: staticCount }
}

export function createInitialMovementDetectionParams(): MovementDetectionParams {
  return {
    centroidHistoryLength: 5,
    movementThreshold: 0.5,
    minClusterSize: 1,
  }
}
