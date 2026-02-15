import { describe, it, expect } from 'vitest'
import {
  calculateGenerationScore,
  updateScore,
  updateTotalPatternsTracked,
  resetScore,
  createInitialScoreState,
  createInitialScoringConfig,
  formatScore,
  calculateMilestone,
  isMilestoneReached,
} from './scoring'
import type { TrackedCluster } from '../types'

describe('scoring system', () => {
  describe('calculateGenerationScore', () => {
    it('should calculate score for MOVER clusters', () => {
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
      ]
      const config = createInitialScoringConfig()

      const score = calculateGenerationScore(clusters, config)
      expect(score).toBe(10)
    })

    it('should calculate score for OSCILLATOR clusters', () => {
      const clusters: TrackedCluster[] = [
        {
          id: 'cluster1',
          cells: new Set(['0,0']),
          centroid: { x: 0, y: 0 },
          generation: 0,
          centroidHistory: [{ x: 0, y: 0 }],
          velocity: { dx: 0, dy: 0 },
          classification: 'OSCILLATOR',
        },
      ]
      const config = createInitialScoringConfig()

      const score = calculateGenerationScore(clusters, config)
      expect(score).toBe(2)
    })

    it('should calculate score for STATIC clusters', () => {
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
      const config = createInitialScoringConfig()

      const score = calculateGenerationScore(clusters, config)
      expect(score).toBe(0)
    })

    it('should sum scores for multiple clusters', () => {
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
          cells: new Set(['1,1']),
          centroid: { x: 1, y: 1 },
          generation: 0,
          centroidHistory: [{ x: 1, y: 1 }],
          velocity: { dx: 0, dy: 0 },
          classification: 'OSCILLATOR',
        },
      ]
      const config = createInitialScoringConfig()

      const score = calculateGenerationScore(clusters, config)
      expect(score).toBe(12)
    })

    it('should apply score multiplier', () => {
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
      ]
      const config = { ...createInitialScoringConfig(), scoreMultiplier: 2.0 }

      const score = calculateGenerationScore(clusters, config)
      expect(score).toBe(20)
    })

    it('should cap score at MAX_SAFE_INTEGER', () => {
      const clusters: TrackedCluster[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `cluster${i}`,
        cells: new Set([`${i},${i}`]),
        centroid: { x: i, y: i },
        generation: 0,
        centroidHistory: [{ x: i, y: i }],
        velocity: { dx: 1, dy: 0 },
        classification: 'MOVER' as const,
      }))
      const config = {
        moverPointsPerGeneration: Number.MAX_SAFE_INTEGER,
        oscillatorPointsPerGeneration: 0,
        scoreMultiplier: 1.0,
      }

      const score = calculateGenerationScore(clusters, config)
      expect(score).toBe(Number.MAX_SAFE_INTEGER)
    })

    it('should round score after multiplier', () => {
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
      ]
      const config = { ...createInitialScoringConfig(), scoreMultiplier: 1.5 }

      const score = calculateGenerationScore(clusters, config)
      expect(score).toBe(15)
    })
  })

  describe('updateScore', () => {
    it('should add generation score to current score', () => {
      const currentState = {
        currentScore: 100,
        generationScore: 10,
        totalPatternsTracked: 5,
      }
      const newState = updateScore(currentState, 20)

      expect(newState.currentScore).toBe(120)
      expect(newState.generationScore).toBe(20)
      expect(newState.totalPatternsTracked).toBe(5)
    })

    it('should cap score at MAX_SAFE_INTEGER', () => {
      const currentState = {
        currentScore: Number.MAX_SAFE_INTEGER - 10,
        generationScore: 5,
        totalPatternsTracked: 5,
      }
      const newState = updateScore(currentState, 20)

      expect(newState.currentScore).toBe(Number.MAX_SAFE_INTEGER)
    })
  })

  describe('updateTotalPatternsTracked', () => {
    it('should increment total patterns tracked', () => {
      const currentState = {
        currentScore: 100,
        generationScore: 10,
        totalPatternsTracked: 5,
      }
      const newState = updateTotalPatternsTracked(currentState, 3)

      expect(newState.totalPatternsTracked).toBe(8)
      expect(newState.currentScore).toBe(100)
    })
  })

  describe('resetScore', () => {
    it('should reset score to initial state', () => {
      const state = resetScore()
      expect(state).toEqual({
        currentScore: 0,
        generationScore: 0,
        totalPatternsTracked: 0,
      })
    })
  })

  describe('createInitialScoreState', () => {
    it('should create initial score state', () => {
      const state = createInitialScoreState()
      expect(state).toEqual({
        currentScore: 0,
        generationScore: 0,
        totalPatternsTracked: 0,
      })
    })
  })

  describe('createInitialScoringConfig', () => {
    it('should create default scoring config', () => {
      const config = createInitialScoringConfig()
      expect(config.moverPointsPerGeneration).toBe(10)
      expect(config.oscillatorPointsPerGeneration).toBe(2)
      expect(config.scoreMultiplier).toBe(1.0)
    })
  })

  describe('formatScore', () => {
    it('should format small scores as-is', () => {
      expect(formatScore(100)).toBe('100')
      expect(formatScore(999)).toBe('999')
    })

    it('should format thousands with K suffix', () => {
      expect(formatScore(1000)).toBe('1.0K')
      expect(formatScore(1500)).toBe('1.5K')
      expect(formatScore(999000)).toBe('999.0K')
    })

    it('should format millions with M suffix', () => {
      expect(formatScore(1000000)).toBe('1.0M')
      expect(formatScore(1500000)).toBe('1.5M')
      expect(formatScore(999000000)).toBe('999.0M')
    })

    it('should format zero', () => {
      expect(formatScore(0)).toBe('0')
    })
  })

  describe('calculateMilestone', () => {
    it('should calculate milestone in increments of 100', () => {
      expect(calculateMilestone(0)).toBe(0)
      expect(calculateMilestone(50)).toBe(0)
      expect(calculateMilestone(100)).toBe(100)
      expect(calculateMilestone(150)).toBe(100)
      expect(calculateMilestone(200)).toBe(200)
      expect(calculateMilestone(999)).toBe(900)
    })
  })

  describe('isMilestoneReached', () => {
    it('should detect when milestone is reached', () => {
      expect(isMilestoneReached(100, 99)).toBe(true)
      expect(isMilestoneReached(200, 150)).toBe(true)
      expect(isMilestoneReached(300, 299)).toBe(true)
    })

    it('should return false when milestone is not reached', () => {
      expect(isMilestoneReached(99, 98)).toBe(false)
      expect(isMilestoneReached(150, 140)).toBe(false)
      expect(isMilestoneReached(199, 198)).toBe(false)
    })

    it('should handle zero scores', () => {
      expect(isMilestoneReached(0, 0)).toBe(false)
      expect(isMilestoneReached(1, 0)).toBe(false)
    })
  })
})
