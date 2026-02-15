import { describe, it, expect } from 'vitest'
import {
  findConnectedComponents,
  matchClusters,
  trackClusters,
  calculateVelocity,
  classifyCluster,
  filterClustersByMinSize,
  countClustersByClassification,
  createInitialMovementDetectionParams,
} from './movement'
import type { TrackedCluster } from '../types'

describe('movement detection', () => {
  describe('findConnectedComponents', () => {
    it('should find empty grid components', () => {
      const grid = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ]
      const clusters = findConnectedComponents(grid, 0)
      expect(clusters).toHaveLength(0)
    })

    it('should find single cell cluster', () => {
      const grid = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ]
      const clusters = findConnectedComponents(grid, 0)
      expect(clusters).toHaveLength(1)
      expect(clusters[0].cells.size).toBe(1)
      expect(clusters[0].centroid).toEqual({ x: 1, y: 1 })
      expect(clusters[0].generation).toBe(0)
    })

    it('should find multiple separate clusters', () => {
      const grid = [
        [1, 0, 1],
        [0, 0, 0],
        [1, 0, 1],
      ]
      const clusters = findConnectedComponents(grid, 0)
      expect(clusters).toHaveLength(4)
    })

    it('should find connected cluster with diagonals (8-connectivity)', () => {
      const grid = [
        [1, 0, 1],
        [0, 1, 0],
        [1, 0, 1],
      ]
      const clusters = findConnectedComponents(grid, 0)
      expect(clusters).toHaveLength(1)
      expect(clusters[0].cells.size).toBe(5)
      expect(clusters[0].centroid).toEqual({ x: 1, y: 1 })
    })

    it('should handle toroidal boundaries', () => {
      const grid = [
        [1, 0, 0],
        [0, 0, 0],
        [0, 0, 1],
      ]
      const clusters = findConnectedComponents(grid, 0)
      expect(clusters).toHaveLength(2)
    })

    it('should find block pattern', () => {
      const grid = [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
      ]
      const clusters = findConnectedComponents(grid, 0)
      expect(clusters).toHaveLength(1)
      expect(clusters[0].cells.size).toBe(4)
      expect(clusters[0].centroid).toEqual({ x: 1.5, y: 1.5 })
    })

    it('should find blinker pattern', () => {
      const grid = [
        [0, 0, 0],
        [1, 1, 1],
        [0, 0, 0],
      ]
      const clusters = findConnectedComponents(grid, 0)
      expect(clusters).toHaveLength(1)
      expect(clusters[0].cells.size).toBe(3)
      expect(clusters[0].centroid).toEqual({ x: 1, y: 1 })
    })
  })

  describe('matchClusters', () => {
    it('should match clusters by nearest centroid', () => {
      const currentClusters = [
        {
          id: 'cluster1',
          cells: new Set(['0,0']),
          centroid: { x: 0, y: 0 },
          generation: 1,
        },
      ]
      const previousTrackedClusters = [
        {
          ...currentClusters[0],
          centroidHistory: [{ x: 0.5, y: 0 }],
          velocity: { dx: -0.5, dy: 0 },
          classification: 'MOVER' as const,
        },
      ]

      const matches = matchClusters(currentClusters, previousTrackedClusters)
      expect(matches.size).toBe(1)
      expect(matches.has('cluster1')).toBe(true)
    })

    it('should not match clusters too far apart', () => {
      const currentClusters = [
        {
          id: 'cluster1',
          cells: new Set(['0,0']),
          centroid: { x: 0, y: 0 },
          generation: 1,
        },
      ]
      const previousTrackedClusters = [
        {
          id: 'cluster1',
          cells: new Set(['10,10']),
          centroid: { x: 10, y: 10 },
          generation: 0,
          centroidHistory: [{ x: 10, y: 10 }],
          velocity: { dx: 0, dy: 0 },
          classification: 'STATIC' as const,
        },
      ]

      const matches = matchClusters(currentClusters, previousTrackedClusters)
      expect(matches.size).toBe(0)
    })

    it('should handle no previous clusters', () => {
      const currentClusters = [
        {
          id: 'cluster1',
          cells: new Set(['0,0']),
          centroid: { x: 0, y: 0 },
          generation: 1,
        },
      ]
      const matches = matchClusters(currentClusters, [])
      expect(matches.size).toBe(0)
    })
  })

  describe('trackClusters', () => {
    it('should track new cluster as STATIC', () => {
      const currentClusters = [
        {
          id: 'cluster1',
          cells: new Set(['0,0']),
          centroid: { x: 0, y: 0 },
          generation: 1,
        },
      ]
      const config = createInitialMovementDetectionParams()

      const tracked = trackClusters(currentClusters, [], config)
      expect(tracked).toHaveLength(1)
      expect(tracked[0].centroidHistory).toEqual([{ x: 0, y: 0 }])
      expect(tracked[0].velocity).toEqual({ dx: 0, dy: 0 })
      expect(tracked[0].classification).toBe('STATIC')
    })

    it('should track moving cluster as MOVER', () => {
      const previous: TrackedCluster = {
        id: 'cluster1',
        cells: new Set(['0,0']),
        centroid: { x: 0, y: 0 },
        generation: 0,
        centroidHistory: [{ x: 0, y: 0 }],
        velocity: { dx: 0, dy: 0 },
        classification: 'STATIC',
      }
      const currentClusters = [
        {
          id: 'cluster1',
          cells: new Set(['0,1']),
          centroid: { x: 1, y: 0 },
          generation: 1,
        },
      ]
      const config = createInitialMovementDetectionParams()

      const tracked = trackClusters(currentClusters, [previous], config)
      expect(tracked).toHaveLength(1)
      expect(tracked[0].centroidHistory).toHaveLength(2)
      expect(tracked[0].classification).toBe('MOVER')
    })

    it('should track oscillating cluster as OSCILLATOR', () => {
      const previous: TrackedCluster = {
        id: 'cluster1',
        cells: new Set(['0,0', '0,1', '0,2']),
        centroid: { x: 1, y: 0 },
        generation: 0,
        centroidHistory: [{ x: 1, y: 0 }],
        velocity: { dx: 0, dy: 0 },
        classification: 'STATIC',
      }
      const currentClusters = [
        {
          id: 'cluster1',
          cells: new Set(['0,1', '1,1', '2,1']),
          centroid: { x: 1, y: 1 },
          generation: 1,
        },
      ]
      const config = { ...createInitialMovementDetectionParams(), movementThreshold: 10 }

      const tracked = trackClusters(currentClusters, [previous], config)
      expect(tracked).toHaveLength(1)
      expect(tracked[0].classification).toBe('OSCILLATOR')
    })

    it('should limit centroid history length', () => {
      const previous: TrackedCluster = {
        id: 'cluster1',
        cells: new Set(['0,0']),
        centroid: { x: 0, y: 0 },
        generation: 0,
        centroidHistory: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 2, y: 0 },
          { x: 3, y: 0 },
          { x: 4, y: 0 },
        ],
        velocity: { dx: 1, dy: 0 },
        classification: 'MOVER',
      }
      const currentClusters = [
        {
          id: 'cluster1',
          cells: new Set(['5,0']),
          centroid: { x: 5, y: 0 },
          generation: 5,
        },
      ]
      const config = { ...createInitialMovementDetectionParams(), centroidHistoryLength: 5 }

      const tracked = trackClusters(currentClusters, [previous], config)
      expect(tracked[0].centroidHistory).toHaveLength(5)
      expect(tracked[0].centroidHistory[0]).toEqual({ x: 1, y: 0 })
      expect(tracked[0].centroidHistory[4]).toEqual({ x: 5, y: 0 })
    })
  })

  describe('calculateVelocity', () => {
    it('should return zero velocity for single point', () => {
      const history = [{ x: 0, y: 0 }]
      const velocity = calculateVelocity(history)
      expect(velocity).toEqual({ dx: 0, dy: 0 })
    })

    it('should calculate velocity from two points', () => {
      const history = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
      ]
      const velocity = calculateVelocity(history)
      expect(velocity).toEqual({ dx: 1, dy: 0 })
    })

    it('should calculate average velocity over multiple points', () => {
      const history = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
      ]
      const velocity = calculateVelocity(history)
      expect(velocity.dx).toBeCloseTo(1)
      expect(velocity.dy).toBeCloseTo(0)
    })

    it('should calculate diagonal velocity', () => {
      const history = [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ]
      const velocity = calculateVelocity(history)
      expect(velocity.dx).toBeCloseTo(1)
      expect(velocity.dy).toBeCloseTo(1)
    })
  })

  describe('classifyCluster', () => {
    it('should classify as MOVER when velocity exceeds threshold', () => {
      const velocity = { dx: 1, dy: 0 }
      const previousCells = new Set(['0,0'])
      const currentCells = new Set(['1,0'])
      const classification = classifyCluster(velocity, 0.5, previousCells, currentCells)
      expect(classification).toBe('MOVER')
    })

    it('should classify as OSCILLATOR when cells change but centroid is static', () => {
      const velocity = { dx: 0, dy: 0 }
      const previousCells = new Set(['0,0', '0,1', '0,2'])
      const currentCells = new Set(['0,1', '1,1', '2,1'])
      const classification = classifyCluster(velocity, 0.5, previousCells, currentCells)
      expect(classification).toBe('OSCILLATOR')
    })

    it('should classify as STATIC when nothing changes', () => {
      const velocity = { dx: 0, dy: 0 }
      const previousCells = new Set(['0,0'])
      const currentCells = new Set(['0,0'])
      const classification = classifyCluster(velocity, 0.5, previousCells, currentCells)
      expect(classification).toBe('STATIC')
    })

    it('should use threshold for MOVER classification', () => {
      const velocity = { dx: 0.3, dy: 0 }
      const previousCells = new Set(['0,0'])
      const currentCells = new Set(['0,0'])
      const classification1 = classifyCluster(velocity, 0.5, previousCells, currentCells)
      const classification2 = classifyCluster(velocity, 0.2, previousCells, currentCells)
      expect(classification1).toBe('STATIC')
      expect(classification2).toBe('MOVER')
    })
  })

  describe('filterClustersByMinSize', () => {
    it('should filter clusters below minimum size', () => {
      const clusters: TrackedCluster[] = [
        {
          id: 'cluster1',
          cells: new Set(['0,0']),
          centroid: { x: 0, y: 0 },
          generation: 0,
          centroidHistory: [{ x: 0, y: 0 }],
          velocity: { dx: 0, dy: 0 },
          classification: 'STATIC',
        },
        {
          id: 'cluster2',
          cells: new Set(['0,0', '0,1']),
          centroid: { x: 0.5, y: 0 },
          generation: 0,
          centroidHistory: [{ x: 0.5, y: 0 }],
          velocity: { dx: 0, dy: 0 },
          classification: 'STATIC',
        },
      ]
      const filtered = filterClustersByMinSize(clusters, 2)
      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe('cluster2')
    })

    it('should keep all clusters when minSize is 1', () => {
      const clusters: TrackedCluster[] = [
        {
          id: 'cluster1',
          cells: new Set(['0,0']),
          centroid: { x: 0, y: 0 },
          generation: 0,
          centroidHistory: [{ x: 0, y: 0 }],
          velocity: { dx: 0, dy: 0 },
          classification: 'STATIC',
        },
      ]
      const filtered = filterClustersByMinSize(clusters, 1)
      expect(filtered).toHaveLength(1)
    })
  })

  describe('countClustersByClassification', () => {
    it('should count clusters by classification', () => {
      const clusters: TrackedCluster[] = [
        {
          id: 'cluster1',
          cells: new Set(['0,0']),
          centroid: { x: 0, y: 0 },
          generation: 0,
          centroidHistory: [{ x: 0, y: 0 }],
          velocity: { dx: 1, dy: 0 },
          classification: 'MOVER',
        },
        {
          id: 'cluster2',
          cells: new Set(['0,1']),
          centroid: { x: 0, y: 1 },
          generation: 0,
          centroidHistory: [{ x: 0, y: 1 }],
          velocity: { dx: 0, dy: 0 },
          classification: 'OSCILLATOR',
        },
        {
          id: 'cluster3',
          cells: new Set(['1,0']),
          centroid: { x: 1, y: 0 },
          generation: 0,
          centroidHistory: [{ x: 1, y: 0 }],
          velocity: { dx: 0, dy: 0 },
          classification: 'STATIC',
        },
      ]
      const counts = countClustersByClassification(clusters)
      expect(counts.movers).toBe(1)
      expect(counts.oscillators).toBe(1)
      expect(counts.static).toBe(1)
    })

    it('should handle empty array', () => {
      const counts = countClustersByClassification([])
      expect(counts.movers).toBe(0)
      expect(counts.oscillators).toBe(0)
      expect(counts.static).toBe(0)
    })
  })

  describe('createInitialMovementDetectionParams', () => {
    it('should create default params', () => {
      const params = createInitialMovementDetectionParams()
      expect(params.centroidHistoryLength).toBe(5)
      expect(params.movementThreshold).toBe(0.5)
      expect(params.minClusterSize).toBe(1)
    })
  })
})
