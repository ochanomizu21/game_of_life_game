import { describe, it, expect } from 'vitest'
import {
  createInitialProgression,
  generateProgression,
  getCurrentLevelConfig,
  advanceLevel,
  isFinalLevel,
  resetProgression,
  regenerateProgression,
} from './level'
import { createInitialLevelGenerationParams } from './settings'

describe('level', () => {
  describe('createInitialProgression', () => {
    it('should create initial progression with correct defaults', () => {
      const progression = createInitialProgression()

      expect(progression.currentLevel).toBe(1)
      expect(progression.maxUnlockedLevel).toBe(1)
      expect(progression.totalScore).toBe(0)
      expect(progression.levels).toHaveLength(10)
    })

    it('should create progression with custom total levels', () => {
      const progression = createInitialProgression(5)

      expect(progression.levels).toHaveLength(5)
    })

    it('should generate levels with correct defaults', () => {
      const progression = createInitialProgression(10)

      expect(progression.levels[0]).toEqual({
        levelNumber: 1,
        timeLimitSeconds: 45,
        initialFlux: 20,
      })

      expect(progression.levels[1]).toEqual({
        levelNumber: 2,
        timeLimitSeconds: 60,
        initialFlux: 20,
      })

      expect(progression.levels[9]).toEqual({
        levelNumber: 10,
        timeLimitSeconds: 180,
        initialFlux: 20,
      })
    })
  })

  describe('generateProgression', () => {
    it('should generate progression with TIME_ONLY difficulty', () => {
      const params = {
        ...createInitialLevelGenerationParams(),
        difficultyScalingMode: 'TIME_ONLY' as const,
      }
      const progression = generateProgression(params, 5)

      expect(progression.levels[0]).toEqual({
        levelNumber: 1,
        timeLimitSeconds: 45,
        initialFlux: 20,
      })

      expect(progression.levels[1]).toEqual({
        levelNumber: 2,
        timeLimitSeconds: 60,
        initialFlux: 20,
      })

      expect(progression.levels[4]).toEqual({
        levelNumber: 5,
        timeLimitSeconds: 105,
        initialFlux: 20,
      })
    })

    it('should generate progression with RESOURCE_ONLY difficulty', () => {
      const params = {
        ...createInitialLevelGenerationParams(),
        difficultyScalingMode: 'RESOURCE_ONLY' as const,
      }
      const progression = generateProgression(params, 5)

      expect(progression.levels[0]).toEqual({
        levelNumber: 1,
        timeLimitSeconds: 45,
        initialFlux: 20,
      })

      expect(progression.levels[1]).toEqual({
        levelNumber: 2,
        timeLimitSeconds: 45,
        initialFlux: 18,
      })

      expect(progression.levels[4]).toEqual({
        levelNumber: 5,
        timeLimitSeconds: 45,
        initialFlux: 14,
      })
    })

    it('should generate progression with MIXED difficulty', () => {
      const params = {
        ...createInitialLevelGenerationParams(),
        difficultyScalingMode: 'MIXED' as const,
      }
      const progression = generateProgression(params, 5)

      expect(progression.levels[0]).toEqual({
        levelNumber: 1,
        timeLimitSeconds: 45,
        initialFlux: 20,
      })

      expect(progression.levels[1]).toEqual({
        levelNumber: 2,
        timeLimitSeconds: 52,
        initialFlux: 19,
      })

      expect(progression.levels[4]).toEqual({
        levelNumber: 5,
        timeLimitSeconds: 73,
        initialFlux: 18,
      })
    })

    it('should generate progression with EXTREME difficulty', () => {
      const params = {
        ...createInitialLevelGenerationParams(),
        difficultyScalingMode: 'EXTREME' as const,
      }
      const progression = generateProgression(params, 5)

      expect(progression.levels[0]).toEqual({
        levelNumber: 1,
        timeLimitSeconds: 45,
        initialFlux: 20,
      })

      expect(progression.levels[1]).toEqual({
        levelNumber: 2,
        timeLimitSeconds: 50,
        initialFlux: 18,
      })

      expect(progression.levels[4]).toEqual({
        levelNumber: 5,
        timeLimitSeconds: 65,
        initialFlux: 12,
      })
    })

    it('should respect custom base parameters', () => {
      const params = {
        baseTimeSeconds: 30,
        timeIncrementPerLevel: 10,
        baseFlux: 15,
        difficultyScalingMode: 'TIME_ONLY' as const,
      }
      const progression = generateProgression(params, 5)

      expect(progression.levels[0]).toEqual({
        levelNumber: 1,
        timeLimitSeconds: 30,
        initialFlux: 15,
      })

      expect(progression.levels[4]).toEqual({
        levelNumber: 5,
        timeLimitSeconds: 70,
        initialFlux: 15,
      })
    })
  })

  describe('getCurrentLevelConfig', () => {
    it('should return correct level config for current level', () => {
      const progression = createInitialProgression(5)
      progression.currentLevel = 3

      const config = getCurrentLevelConfig(progression)

      expect(config).toEqual({
        levelNumber: 3,
        timeLimitSeconds: 75,
        initialFlux: 20,
      })
    })

    it('should return null for invalid level', () => {
      const progression = createInitialProgression(5)
      progression.currentLevel = 10

      const config = getCurrentLevelConfig(progression)

      expect(config).toBeNull()
    })

    it('should return null for level 0', () => {
      const progression = createInitialProgression(5)
      progression.currentLevel = 0

      const config = getCurrentLevelConfig(progression)

      expect(config).toBeNull()
    })
  })

  describe('advanceLevel', () => {
    it('should advance to next level and add score', () => {
      const progression = createInitialProgression(5)
      progression.currentLevel = 2
      progression.totalScore = 100

      const newProgression = advanceLevel(progression, 50)

      expect(newProgression.currentLevel).toBe(3)
      expect(newProgression.totalScore).toBe(150)
      expect(newProgression.maxUnlockedLevel).toBe(3)
    })

    it('should update max unlocked level', () => {
      const progression = createInitialProgression(5)
      progression.currentLevel = 3
      progression.maxUnlockedLevel = 3

      const newProgression = advanceLevel(progression, 100)

      expect(newProgression.maxUnlockedLevel).toBe(4)
    })

    it('should keep max unlocked level if not advancing', () => {
      const progression = createInitialProgression(5)
      progression.currentLevel = 2
      progression.maxUnlockedLevel = 4

      const newProgression = advanceLevel(progression, 100)

      expect(newProgression.maxUnlockedLevel).toBe(4)
    })
  })

  describe('isFinalLevel', () => {
    it('should return true for final level', () => {
      const progression = createInitialProgression(5)
      progression.currentLevel = 5

      expect(isFinalLevel(progression)).toBe(true)
    })

    it('should return false for non-final level', () => {
      const progression = createInitialProgression(5)
      progression.currentLevel = 3

      expect(isFinalLevel(progression)).toBe(false)
    })

    it('should return true for level beyond total (victory state)', () => {
      const progression = createInitialProgression(5)
      progression.currentLevel = 6

      expect(isFinalLevel(progression)).toBe(true)
    })
  })

  describe('resetProgression', () => {
    it('should reset progression to initial state', () => {
      const progression = createInitialProgression(5)
      progression.currentLevel = 5
      progression.totalScore = 1000
      progression.maxUnlockedLevel = 5

      const reset = resetProgression(5)

      expect(reset.currentLevel).toBe(1)
      expect(reset.totalScore).toBe(0)
      expect(reset.maxUnlockedLevel).toBe(1)
    })

    it('should create progression with custom total levels', () => {
      const reset = resetProgression(7)

      expect(reset.levels).toHaveLength(7)
    })
  })

  describe('regenerateProgression', () => {
    it('should regenerate levels with new parameters', () => {
      const progression = createInitialProgression(5)
      const newParams = {
        baseTimeSeconds: 30,
        timeIncrementPerLevel: 5,
        baseFlux: 10,
        difficultyScalingMode: 'TIME_ONLY' as const,
      }

      const newProgression = regenerateProgression(progression, newParams)

      expect(newProgression.currentLevel).toBe(1)
      expect(newProgression.levels[0].timeLimitSeconds).toBe(30)
      expect(newProgression.levels[0].initialFlux).toBe(10)
    })

    it('should preserve current level and max unlocked', () => {
      const progression = createInitialProgression(5)
      progression.currentLevel = 3
      progression.maxUnlockedLevel = 4
      progression.totalScore = 500

      const newParams = createInitialLevelGenerationParams()
      const newProgression = regenerateProgression(progression, newParams)

      expect(newProgression.currentLevel).toBe(3)
      expect(newProgression.maxUnlockedLevel).toBe(4)
      expect(newProgression.totalScore).toBe(500)
    })

    it('should preserve total score', () => {
      const progression = createInitialProgression(5)
      progression.totalScore = 2500

      const newParams = createInitialLevelGenerationParams()
      const newProgression = regenerateProgression(progression, newParams)

      expect(newProgression.totalScore).toBe(2500)
    })
  })
})
