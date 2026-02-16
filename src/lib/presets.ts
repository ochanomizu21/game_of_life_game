import type { ExpertSettings, Preset } from '../types'

export const PRESET_CONFIGS: Record<Preset, Omit<ExpertSettings, 'preset'>> = {
  EASY: {
    movementDetection: {
      centroidHistoryLength: 5,
      movementThreshold: 0.3,
      minClusterSize: 1,
    },
    scoring: {
      moverPointsPerGeneration: 15,
      oscillatorPointsPerGeneration: 5,
      scoreMultiplier: 1.5,
    },
    levelGeneration: {
      baseTimeSeconds: 60,
      timeIncrementPerLevel: 20,
      baseFlux: 30,
      difficultyScalingMode: 'TIME_ONLY',
    },
    gridSizing: {
      mobileCellSize: 20,
      desktopCellSize: 22,
      minVisibleCells: 10,
    },
    audio: {
      enabled: false,
      volume: 0.1,
      waveform: 'sine',
    },
  } as Omit<ExpertSettings, 'preset'>,
  NORMAL: {
    movementDetection: {
      centroidHistoryLength: 5,
      movementThreshold: 0.5,
      minClusterSize: 1,
    },
    scoring: {
      moverPointsPerGeneration: 10,
      oscillatorPointsPerGeneration: 2,
      scoreMultiplier: 1.0,
    },
    levelGeneration: {
      baseTimeSeconds: 45,
      timeIncrementPerLevel: 15,
      baseFlux: 20,
      difficultyScalingMode: 'TIME_ONLY',
    },
    gridSizing: {
      mobileCellSize: 18,
      desktopCellSize: 20,
      minVisibleCells: 10,
    },
    audio: {
      enabled: false,
      volume: 0.1,
      waveform: 'sine',
    },
  } as Omit<ExpertSettings, 'preset'>,
  HARD: {
    movementDetection: {
      centroidHistoryLength: 5,
      movementThreshold: 0.7,
      minClusterSize: 2,
    },
    scoring: {
      moverPointsPerGeneration: 8,
      oscillatorPointsPerGeneration: 1,
      scoreMultiplier: 0.8,
    },
    levelGeneration: {
      baseTimeSeconds: 30,
      timeIncrementPerLevel: 10,
      baseFlux: 15,
      difficultyScalingMode: 'MIXED',
    },
    gridSizing: {
      mobileCellSize: 18,
      desktopCellSize: 20,
      minVisibleCells: 10,
    },
    audio: {
      enabled: false,
      volume: 0.1,
      waveform: 'sine',
    },
  } as Omit<ExpertSettings, 'preset'>,
  CHAOS: {
    movementDetection: {
      centroidHistoryLength: 3,
      movementThreshold: 1.0,
      minClusterSize: 1,
    },
    scoring: {
      moverPointsPerGeneration: 20,
      oscillatorPointsPerGeneration: 5,
      scoreMultiplier: 2.0,
    },
    levelGeneration: {
      baseTimeSeconds: 20,
      timeIncrementPerLevel: 5,
      baseFlux: 10,
      difficultyScalingMode: 'EXTREME',
    },
    gridSizing: {
      mobileCellSize: 18,
      desktopCellSize: 20,
      minVisibleCells: 10,
    },
    audio: {
      enabled: false,
      volume: 0.1,
      waveform: 'sawtooth',
    },
  } as Omit<ExpertSettings, 'preset'>,
}

export function applyPreset(preset: Preset): ExpertSettings {
  return JSON.parse(
    JSON.stringify({
      ...PRESET_CONFIGS[preset],
      preset,
    })
  ) as ExpertSettings
}

export function getPresetName(preset: Preset): string {
  const names: Record<Preset, string> = {
    EASY: 'Easy',
    NORMAL: 'Normal',
    HARD: 'Hard',
    CHAOS: 'Chaos',
  }
  return names[preset]
}

export function getPresetDescription(preset: Preset): string {
  const descriptions: Record<Preset, string> = {
    EASY: 'Generous resources and time limits for a relaxed experience',
    NORMAL: 'Balanced gameplay for standard challenge',
    HARD: 'Strict resources and shorter time limits for experienced players',
    CHAOS: 'Extreme settings with rapid changes and high scoring potential',
  }
  return descriptions[preset]
}
