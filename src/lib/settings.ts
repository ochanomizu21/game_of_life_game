import type { LevelGenerationParams, GridSizingParams, ExpertSettings } from '../types'
import { createInitialMovementDetectionParams } from './movement'
import { createInitialScoringConfig } from './scoring'
import { createInitialAudioParams } from './audio'
import { saveToLocalStorage, loadFromLocalStorage } from './state'

export { saveToLocalStorage, loadFromLocalStorage }

export function createInitialLevelGenerationParams(): LevelGenerationParams {
  return {
    baseTimeSeconds: 45,
    timeIncrementPerLevel: 15,
    baseFlux: 20,
    difficultyScalingMode: 'TIME_ONLY',
  }
}

export function createInitialGridSizingParams(): GridSizingParams {
  return {
    mobileCellSize: 18,
    desktopCellSize: 20,
    minVisibleCells: 10,
  }
}

export function createInitialExpertSettings(): ExpertSettings {
  return {
    movementDetection: createInitialMovementDetectionParams(),
    scoring: createInitialScoringConfig(),
    levelGeneration: createInitialLevelGenerationParams(),
    gridSizing: createInitialGridSizingParams(),
    audio: createInitialAudioParams(),
  }
}

export function validateExpertSettings(settings: ExpertSettings): boolean {
  if (!settings.movementDetection) return false
  if (!settings.scoring) return false
  if (!settings.levelGeneration) return false
  if (!settings.gridSizing) return false
  if (!settings.audio) return false

  if (typeof settings.movementDetection.centroidHistoryLength !== 'number') return false
  if (
    settings.movementDetection.centroidHistoryLength < 3 ||
    settings.movementDetection.centroidHistoryLength > 10
  )
    return false

  if (typeof settings.movementDetection.movementThreshold !== 'number') return false
  if (
    settings.movementDetection.movementThreshold < 0.1 ||
    settings.movementDetection.movementThreshold > 2.0
  )
    return false

  if (typeof settings.movementDetection.minClusterSize !== 'number') return false
  if (
    settings.movementDetection.minClusterSize < 1 ||
    settings.movementDetection.minClusterSize > 5
  )
    return false

  if (typeof settings.scoring.moverPointsPerGeneration !== 'number') return false
  if (
    settings.scoring.moverPointsPerGeneration < 1 ||
    settings.scoring.moverPointsPerGeneration > 100
  )
    return false

  if (typeof settings.scoring.oscillatorPointsPerGeneration !== 'number') return false
  if (
    settings.scoring.oscillatorPointsPerGeneration < 0 ||
    settings.scoring.oscillatorPointsPerGeneration > 20
  )
    return false

  if (typeof settings.scoring.scoreMultiplier !== 'number') return false
  if (settings.scoring.scoreMultiplier < 0.1 || settings.scoring.scoreMultiplier > 5.0) return false

  if (typeof settings.levelGeneration.baseTimeSeconds !== 'number') return false
  if (
    settings.levelGeneration.baseTimeSeconds < 10 ||
    settings.levelGeneration.baseTimeSeconds > 120
  )
    return false

  if (typeof settings.levelGeneration.timeIncrementPerLevel !== 'number') return false
  if (
    settings.levelGeneration.timeIncrementPerLevel < 0 ||
    settings.levelGeneration.timeIncrementPerLevel > 60
  )
    return false

  if (typeof settings.levelGeneration.baseFlux !== 'number') return false
  if (settings.levelGeneration.baseFlux < 5 || settings.levelGeneration.baseFlux > 50) return false

  if (
    !['TIME_ONLY', 'RESOURCE_ONLY', 'MIXED', 'EXTREME'].includes(
      settings.levelGeneration.difficultyScalingMode
    )
  ) {
    return false
  }

  if (typeof settings.gridSizing.mobileCellSize !== 'number') return false
  if (settings.gridSizing.mobileCellSize < 14 || settings.gridSizing.mobileCellSize > 24)
    return false

  if (typeof settings.gridSizing.desktopCellSize !== 'number') return false
  if (settings.gridSizing.desktopCellSize < 16 || settings.gridSizing.desktopCellSize > 28)
    return false

  if (typeof settings.gridSizing.minVisibleCells !== 'number') return false
  if (settings.gridSizing.minVisibleCells < 1) return false

  if (typeof settings.audio.enabled !== 'boolean') return false
  if (typeof settings.audio.volume !== 'number') return false
  if (settings.audio.volume < 0 || settings.audio.volume > 0.5) return false
  if (!['sine', 'triangle', 'square', 'sawtooth'].includes(settings.audio.waveform)) {
    return false
  }

  return true
}
