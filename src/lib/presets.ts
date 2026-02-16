import type { CustomPreset, ExpertSettings, Preset } from '../types'

const CUSTOM_PRESETS_STORAGE_KEY = 'gol-custom-presets'

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
    chaosMultiplier: 0.5,
    timerSpeed: 0.8,
    highContrastMode: false,
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
    chaosMultiplier: 1.0,
    timerSpeed: 1.0,
    highContrastMode: false,
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
    chaosMultiplier: 1.5,
    timerSpeed: 1.5,
    highContrastMode: false,
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
    chaosMultiplier: 3.0,
    timerSpeed: 2.5,
    highContrastMode: false,
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

export function getCustomPresets(): CustomPreset[] {
  try {
    const data = localStorage.getItem(CUSTOM_PRESETS_STORAGE_KEY)
    if (!data) return []
    const presets = JSON.parse(data) as CustomPreset[]
    return Array.isArray(presets) ? presets : []
  } catch {
    return []
  }
}

export function saveCustomPreset(name: string, settings: ExpertSettings): void {
  const presets = getCustomPresets()
  const existingIndex = presets.findIndex((p) => p.name === name)

  const customPreset: CustomPreset = {
    name,
    settings: JSON.parse(JSON.stringify({ ...settings, preset: undefined })) as ExpertSettings,
    createdAt: Date.now(),
  }

  if (existingIndex >= 0) {
    presets[existingIndex] = customPreset
  } else {
    presets.push(customPreset)
  }

  localStorage.setItem(CUSTOM_PRESETS_STORAGE_KEY, JSON.stringify(presets))
}

export function deleteCustomPreset(name: string): void {
  const presets = getCustomPresets()
  const filtered = presets.filter((p) => p.name !== name)
  localStorage.setItem(CUSTOM_PRESETS_STORAGE_KEY, JSON.stringify(filtered))
}

export function applyCustomPreset(name: string): ExpertSettings | null {
  const presets = getCustomPresets()
  const preset = presets.find((p) => p.name === name)
  if (!preset) return null
  return JSON.parse(JSON.stringify(preset.settings)) as ExpertSettings
}

export function isCustomPresetNameAvailable(name: string): boolean {
  const presets = getCustomPresets()
  return !presets.some((p) => p.name === name)
}
