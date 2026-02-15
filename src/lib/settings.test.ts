import { describe, it, expect } from 'vitest'
import {
  createInitialLevelGenerationParams,
  createInitialGridSizingParams,
  createInitialExpertSettings,
  validateExpertSettings,
} from './settings'

describe('settings', () => {
  describe('createInitialLevelGenerationParams', () => {
    it('should create initial level generation params with correct defaults', () => {
      const params = createInitialLevelGenerationParams()

      expect(params.baseTimeSeconds).toBe(45)
      expect(params.timeIncrementPerLevel).toBe(15)
      expect(params.baseFlux).toBe(20)
      expect(params.difficultyScalingMode).toBe('TIME_ONLY')
    })
  })

  describe('createInitialGridSizingParams', () => {
    it('should create initial grid sizing params with correct defaults', () => {
      const params = createInitialGridSizingParams()

      expect(params.mobileCellSize).toBe(18)
      expect(params.desktopCellSize).toBe(20)
      expect(params.minVisibleCells).toBe(10)
    })
  })

  describe('createInitialExpertSettings', () => {
    it('should create initial expert settings with all sections', () => {
      const settings = createInitialExpertSettings()

      expect(settings.movementDetection).toBeDefined()
      expect(settings.scoring).toBeDefined()
      expect(settings.levelGeneration).toBeDefined()
      expect(settings.gridSizing).toBeDefined()
      expect(settings.audio).toBeDefined()
    })

    it('should create initial expert settings with correct defaults', () => {
      const settings = createInitialExpertSettings()

      expect(settings.movementDetection.centroidHistoryLength).toBe(5)
      expect(settings.movementDetection.movementThreshold).toBe(0.5)
      expect(settings.movementDetection.minClusterSize).toBe(1)

      expect(settings.scoring.moverPointsPerGeneration).toBe(10)
      expect(settings.scoring.oscillatorPointsPerGeneration).toBe(2)
      expect(settings.scoring.scoreMultiplier).toBe(1.0)

      expect(settings.levelGeneration.baseTimeSeconds).toBe(45)
      expect(settings.levelGeneration.timeIncrementPerLevel).toBe(15)
      expect(settings.levelGeneration.baseFlux).toBe(20)
      expect(settings.levelGeneration.difficultyScalingMode).toBe('TIME_ONLY')

      expect(settings.gridSizing.mobileCellSize).toBe(18)
      expect(settings.gridSizing.desktopCellSize).toBe(20)
      expect(settings.gridSizing.minVisibleCells).toBe(10)

      expect(settings.audio.enabled).toBe(false)
      expect(settings.audio.volume).toBe(0.1)
      expect(settings.audio.waveform).toBe('sine')
    })
  })

  describe('validateExpertSettings', () => {
    it('should validate correct expert settings', () => {
      const settings = createInitialExpertSettings()

      expect(validateExpertSettings(settings)).toBe(true)
    })

    it('should reject invalid movementDetection', () => {
      const settings = createInitialExpertSettings()
      settings.movementDetection = null as any

      expect(validateExpertSettings(settings)).toBe(false)
    })

    it('should reject centroidHistoryLength out of range (too low)', () => {
      const settings = createInitialExpertSettings()
      settings.movementDetection.centroidHistoryLength = 2

      expect(validateExpertSettings(settings)).toBe(false)
    })

    it('should reject centroidHistoryLength out of range (too high)', () => {
      const settings = createInitialExpertSettings()
      settings.movementDetection.centroidHistoryLength = 11

      expect(validateExpertSettings(settings)).toBe(false)
    })

    it('should accept centroidHistoryLength at boundaries', () => {
      const settings = createInitialExpertSettings()

      settings.movementDetection.centroidHistoryLength = 3
      expect(validateExpertSettings(settings)).toBe(true)

      settings.movementDetection.centroidHistoryLength = 10
      expect(validateExpertSettings(settings)).toBe(true)
    })

    it('should reject movementThreshold out of range (too low)', () => {
      const settings = createInitialExpertSettings()
      settings.movementDetection.movementThreshold = 0.05

      expect(validateExpertSettings(settings)).toBe(false)
    })

    it('should reject movementThreshold out of range (too high)', () => {
      const settings = createInitialExpertSettings()
      settings.movementDetection.movementThreshold = 2.5

      expect(validateExpertSettings(settings)).toBe(false)
    })

    it('should reject minClusterSize out of range (too low)', () => {
      const settings = createInitialExpertSettings()
      settings.movementDetection.minClusterSize = 0

      expect(validateExpertSettings(settings)).toBe(false)
    })

    it('should reject minClusterSize out of range (too high)', () => {
      const settings = createInitialExpertSettings()
      settings.movementDetection.minClusterSize = 6

      expect(validateExpertSettings(settings)).toBe(false)
    })

    it('should reject scoring out of range', () => {
      const settings = createInitialExpertSettings()

      settings.scoring.moverPointsPerGeneration = 101
      expect(validateExpertSettings(settings)).toBe(false)

      settings.scoring.moverPointsPerGeneration = 0
      expect(validateExpertSettings(settings)).toBe(false)
    })

    it('should reject levelGeneration baseTimeSeconds out of range', () => {
      const settings = createInitialExpertSettings()

      settings.levelGeneration.baseTimeSeconds = 9
      expect(validateExpertSettings(settings)).toBe(false)

      settings.levelGeneration.baseTimeSeconds = 121
      expect(validateExpertSettings(settings)).toBe(false)
    })

    it('should reject levelGeneration timeIncrementPerLevel out of range', () => {
      const settings = createInitialExpertSettings()

      settings.levelGeneration.timeIncrementPerLevel = 61
      expect(validateExpertSettings(settings)).toBe(false)
    })

    it('should reject levelGeneration baseFlux out of range', () => {
      const settings = createInitialExpertSettings()

      settings.levelGeneration.baseFlux = 4
      expect(validateExpertSettings(settings)).toBe(false)

      settings.levelGeneration.baseFlux = 51
      expect(validateExpertSettings(settings)).toBe(false)
    })

    it('should reject invalid difficultyScalingMode', () => {
      const settings = createInitialExpertSettings()
      settings.levelGeneration.difficultyScalingMode = 'INVALID' as any

      expect(validateExpertSettings(settings)).toBe(false)
    })

    it('should accept all valid difficultyScalingModes', () => {
      const modes: Array<'TIME_ONLY' | 'RESOURCE_ONLY' | 'MIXED' | 'EXTREME'> = [
        'TIME_ONLY',
        'RESOURCE_ONLY',
        'MIXED',
        'EXTREME',
      ]

      modes.forEach((mode) => {
        const settings = createInitialExpertSettings()
        settings.levelGeneration.difficultyScalingMode = mode
        expect(validateExpertSettings(settings)).toBe(true)
      })
    })

    it('should reject gridSizing mobileCellSize out of range', () => {
      const settings = createInitialExpertSettings()

      settings.gridSizing.mobileCellSize = 13
      expect(validateExpertSettings(settings)).toBe(false)

      settings.gridSizing.mobileCellSize = 25
      expect(validateExpertSettings(settings)).toBe(false)
    })

    it('should reject gridSizing desktopCellSize out of range', () => {
      const settings = createInitialExpertSettings()

      settings.gridSizing.desktopCellSize = 15
      expect(validateExpertSettings(settings)).toBe(false)

      settings.gridSizing.desktopCellSize = 29
      expect(validateExpertSettings(settings)).toBe(false)
    })

    it('should reject gridSizing minVisibleCells out of range', () => {
      const settings = createInitialExpertSettings()

      settings.gridSizing.minVisibleCells = 0
      expect(validateExpertSettings(settings)).toBe(false)
    })

    it('should reject audio enabled not boolean', () => {
      const settings = createInitialExpertSettings()
      settings.audio.enabled = 'true' as any

      expect(validateExpertSettings(settings)).toBe(false)
    })

    it('should reject audio volume out of range', () => {
      const settings = createInitialExpertSettings()

      settings.audio.volume = -0.1
      expect(validateExpertSettings(settings)).toBe(false)

      settings.audio.volume = 0.6
      expect(validateExpertSettings(settings)).toBe(false)
    })

    it('should reject audio invalid waveform', () => {
      const settings = createInitialExpertSettings()
      settings.audio.waveform = 'invalid' as any

      expect(validateExpertSettings(settings)).toBe(false)
    })
  })
})
