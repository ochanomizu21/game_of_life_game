import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  applyCustomPreset,
  applyPreset,
  deleteCustomPreset,
  getCustomPresets,
  getPresetDescription,
  isCustomPresetNameAvailable,
  saveCustomPreset,
} from '../lib/presets'
import { validateExpertSettings } from '../lib/settings'

const CUSTOM_PRESETS_STORAGE_KEY = 'gol-custom-presets'

describe('presets', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('applyPreset', () => {
    it('should apply EASY preset with generous settings', () => {
      const settings = applyPreset('EASY')

      expect(settings.movementDetection.centroidHistoryLength).toBe(5)
      expect(settings.movementDetection.movementThreshold).toBe(0.3)
      expect(settings.movementDetection.minClusterSize).toBe(1)

      expect(settings.scoring.moverPointsPerGeneration).toBe(15)
      expect(settings.scoring.oscillatorPointsPerGeneration).toBe(5)
      expect(settings.scoring.scoreMultiplier).toBe(1.5)

      expect(settings.levelGeneration.baseTimeSeconds).toBe(60)
      expect(settings.levelGeneration.timeIncrementPerLevel).toBe(20)
      expect(settings.levelGeneration.baseFlux).toBe(30)
      expect(settings.levelGeneration.difficultyScalingMode).toBe('TIME_ONLY')

      expect(settings.preset).toBe('EASY')
    })

    it('should apply NORMAL preset with balanced settings', () => {
      const settings = applyPreset('NORMAL')

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

      expect(settings.preset).toBe('NORMAL')
    })

    it('should apply HARD preset with strict settings', () => {
      const settings = applyPreset('HARD')

      expect(settings.movementDetection.centroidHistoryLength).toBe(5)
      expect(settings.movementDetection.movementThreshold).toBe(0.7)
      expect(settings.movementDetection.minClusterSize).toBe(2)

      expect(settings.scoring.moverPointsPerGeneration).toBe(8)
      expect(settings.scoring.oscillatorPointsPerGeneration).toBe(1)
      expect(settings.scoring.scoreMultiplier).toBe(0.8)

      expect(settings.levelGeneration.baseTimeSeconds).toBe(30)
      expect(settings.levelGeneration.timeIncrementPerLevel).toBe(10)
      expect(settings.levelGeneration.baseFlux).toBe(15)
      expect(settings.levelGeneration.difficultyScalingMode).toBe('MIXED')

      expect(settings.preset).toBe('HARD')
    })

    it('should apply CHAOS preset with extreme settings', () => {
      const settings = applyPreset('CHAOS')

      expect(settings.movementDetection.centroidHistoryLength).toBe(3)
      expect(settings.movementDetection.movementThreshold).toBe(1.0)
      expect(settings.movementDetection.minClusterSize).toBe(1)

      expect(settings.scoring.moverPointsPerGeneration).toBe(20)
      expect(settings.scoring.oscillatorPointsPerGeneration).toBe(5)
      expect(settings.scoring.scoreMultiplier).toBe(2.0)

      expect(settings.levelGeneration.baseTimeSeconds).toBe(20)
      expect(settings.levelGeneration.timeIncrementPerLevel).toBe(5)
      expect(settings.levelGeneration.baseFlux).toBe(10)
      expect(settings.levelGeneration.difficultyScalingMode).toBe('EXTREME')

      expect(settings.preset).toBe('CHAOS')
    })

    it('should create independent copies for each preset', () => {
      const easySettings = applyPreset('EASY')
      const normalSettings = applyPreset('NORMAL')

      easySettings.scoring.moverPointsPerGeneration = 999

      expect(normalSettings.scoring.moverPointsPerGeneration).toBe(10)
    })

    it('should create independent copies on repeated calls', () => {
      const settings1 = applyPreset('NORMAL')
      const settings2 = applyPreset('NORMAL')

      settings1.scoring.moverPointsPerGeneration = 999

      expect(settings2.scoring.moverPointsPerGeneration).toBe(10)
    })

    it('should validate all presets', () => {
      const presets = ['EASY', 'NORMAL', 'HARD', 'CHAOS'] as const

      presets.forEach((preset) => {
        const settings = applyPreset(preset)
        expect(validateExpertSettings(settings)).toBe(true)
      })
    })
  })

  describe('getPresetDescription', () => {
    it('should return correct description for EASY preset', () => {
      const description = getPresetDescription('EASY')
      expect(description).toBe('Generous resources and time limits for a relaxed experience')
    })

    it('should return correct description for NORMAL preset', () => {
      const description = getPresetDescription('NORMAL')
      expect(description).toBe('Balanced gameplay for standard challenge')
    })

    it('should return correct description for HARD preset', () => {
      const description = getPresetDescription('HARD')
      expect(description).toBe('Strict resources and shorter time limits for experienced players')
    })

    it('should return correct description for CHAOS preset', () => {
      const description = getPresetDescription('CHAOS')
      expect(description).toBe('Extreme settings with rapid changes and high scoring potential')
    })
  })

  describe('custom presets', () => {
    describe('getCustomPresets', () => {
      it('should return empty array when no custom presets exist', () => {
        const presets = getCustomPresets()
        expect(presets).toEqual([])
      })

      it('should return array of custom presets when they exist', () => {
        const testSettings = applyPreset('NORMAL')
        saveCustomPreset('Test Preset', testSettings)

        const presets = getCustomPresets()
        expect(presets).toHaveLength(1)
        expect(presets[0].name).toBe('Test Preset')
      })

      it('should return empty array when localStorage contains invalid data', () => {
        localStorage.setItem(CUSTOM_PRESETS_STORAGE_KEY, 'invalid json')

        const presets = getCustomPresets()
        expect(presets).toEqual([])
      })
    })

    describe('saveCustomPreset', () => {
      it('should save custom preset to localStorage', () => {
        const testSettings = applyPreset('NORMAL')
        saveCustomPreset('My Preset', testSettings)

        const presets = getCustomPresets()
        expect(presets).toHaveLength(1)
        expect(presets[0].name).toBe('My Preset')
        expect(presets[0].settings).toBeDefined()
        expect(presets[0].createdAt).toBeDefined()
      })

      it('should create deep copy of settings', () => {
        const originalSettings = applyPreset('NORMAL')
        saveCustomPreset('Test', originalSettings)

        originalSettings.scoring.moverPointsPerGeneration = 999

        const presets = getCustomPresets()
        expect(presets[0].settings.scoring.moverPointsPerGeneration).toBe(10)
      })

      it('should clear preset field from saved settings', () => {
        const testSettings = applyPreset('NORMAL')
        testSettings.preset = 'EASY'

        saveCustomPreset('Test', testSettings)

        const presets = getCustomPresets()
        expect(presets[0].settings.preset).toBeUndefined()
      })

      it('should update existing preset with same name', () => {
        const settings1 = applyPreset('EASY')
        const settings2 = applyPreset('HARD')

        saveCustomPreset('Test', settings1)
        saveCustomPreset('Test', settings2)

        const presets = getCustomPresets()
        expect(presets).toHaveLength(1)
        expect(presets[0].settings.scoring.moverPointsPerGeneration).toBe(8)
      })
    })

    describe('deleteCustomPreset', () => {
      it('should remove custom preset from localStorage', () => {
        const testSettings = applyPreset('NORMAL')
        saveCustomPreset('Test 1', testSettings)
        saveCustomPreset('Test 2', testSettings)

        deleteCustomPreset('Test 1')

        const presets = getCustomPresets()
        expect(presets).toHaveLength(1)
        expect(presets[0].name).toBe('Test 2')
      })

      it('should not throw when deleting non-existent preset', () => {
        expect(() => deleteCustomPreset('Non-existent')).not.toThrow()
      })
    })

    describe('applyCustomPreset', () => {
      it('should return null for non-existent preset', () => {
        const settings = applyCustomPreset('Non-existent')
        expect(settings).toBeNull()
      })

      it('should return settings for existing preset', () => {
        const testSettings = applyPreset('NORMAL')
        saveCustomPreset('Test', testSettings)

        const appliedSettings = applyCustomPreset('Test')
        expect(appliedSettings).not.toBeNull()
        expect(appliedSettings?.scoring.moverPointsPerGeneration).toBe(10)
      })

      it('should create deep copy of settings', () => {
        const testSettings = applyPreset('NORMAL')
        saveCustomPreset('Test', testSettings)

        const appliedSettings = applyCustomPreset('Test')
        appliedSettings!.scoring.moverPointsPerGeneration = 999

        const presets = getCustomPresets()
        expect(presets[0].settings.scoring.moverPointsPerGeneration).toBe(10)
      })
    })

    describe('isCustomPresetNameAvailable', () => {
      it('should return true when no presets exist', () => {
        expect(isCustomPresetNameAvailable('Test')).toBe(true)
      })

      it('should return true for new name when presets exist', () => {
        const testSettings = applyPreset('NORMAL')
        saveCustomPreset('Test 1', testSettings)

        expect(isCustomPresetNameAvailable('Test 2')).toBe(true)
      })

      it('should return false for existing name', () => {
        const testSettings = applyPreset('NORMAL')
        saveCustomPreset('Test', testSettings)

        expect(isCustomPresetNameAvailable('Test')).toBe(false)
      })
    })
  })
})
