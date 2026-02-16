import { useState } from 'react'
import type { ExpertSettings, Preset } from '../types'
import { applyPreset, getPresetDescription } from '../lib/presets'
import '../styles/SettingsPanel.css'

interface ValidationResult {
  valid: boolean
  errors: string[]
}

function validateExpertSettingsDetailed(settings: unknown): ValidationResult {
  const errors: string[] = []

  if (typeof settings !== 'object' || settings === null) {
    return { valid: false, errors: ['Invalid settings object'] }
  }

  const s = settings as ExpertSettings

  if (!s.movementDetection || typeof s.movementDetection !== 'object') {
    errors.push('Invalid movement detection settings')
  } else {
    if (typeof s.movementDetection.centroidHistoryLength !== 'number') {
      errors.push('centroidHistoryLength must be a number')
    } else if (
      s.movementDetection.centroidHistoryLength < 3 ||
      s.movementDetection.centroidHistoryLength > 10
    ) {
      errors.push('centroidHistoryLength must be between 3 and 10')
    }

    if (typeof s.movementDetection.movementThreshold !== 'number') {
      errors.push('movementThreshold must be a number')
    } else if (
      s.movementDetection.movementThreshold < 0.1 ||
      s.movementDetection.movementThreshold > 2.0
    ) {
      errors.push('movementThreshold must be between 0.1 and 2.0')
    }

    if (typeof s.movementDetection.minClusterSize !== 'number') {
      errors.push('minClusterSize must be a number')
    } else if (s.movementDetection.minClusterSize < 1 || s.movementDetection.minClusterSize > 5) {
      errors.push('minClusterSize must be between 1 and 5')
    }
  }

  if (!s.scoring || typeof s.scoring !== 'object') {
    errors.push('Invalid scoring settings')
  } else {
    if (typeof s.scoring.moverPointsPerGeneration !== 'number') {
      errors.push('moverPointsPerGeneration must be a number')
    } else if (s.scoring.moverPointsPerGeneration < 1 || s.scoring.moverPointsPerGeneration > 100) {
      errors.push('moverPointsPerGeneration must be between 1 and 100')
    }

    if (typeof s.scoring.oscillatorPointsPerGeneration !== 'number') {
      errors.push('oscillatorPointsPerGeneration must be a number')
    } else if (
      s.scoring.oscillatorPointsPerGeneration < 0 ||
      s.scoring.oscillatorPointsPerGeneration > 20
    ) {
      errors.push('oscillatorPointsPerGeneration must be between 0 and 20')
    }

    if (typeof s.scoring.scoreMultiplier !== 'number') {
      errors.push('scoreMultiplier must be a number')
    } else if (s.scoring.scoreMultiplier < 0.1 || s.scoring.scoreMultiplier > 5.0) {
      errors.push('scoreMultiplier must be between 0.1 and 5.0')
    }
  }

  if (!s.levelGeneration || typeof s.levelGeneration !== 'object') {
    errors.push('Invalid level generation settings')
  } else {
    if (typeof s.levelGeneration.baseTimeSeconds !== 'number') {
      errors.push('baseTimeSeconds must be a number')
    } else if (s.levelGeneration.baseTimeSeconds < 10 || s.levelGeneration.baseTimeSeconds > 120) {
      errors.push('baseTimeSeconds must be between 10 and 120')
    }

    if (typeof s.levelGeneration.timeIncrementPerLevel !== 'number') {
      errors.push('timeIncrementPerLevel must be a number')
    } else if (
      s.levelGeneration.timeIncrementPerLevel < 0 ||
      s.levelGeneration.timeIncrementPerLevel > 60
    ) {
      errors.push('timeIncrementPerLevel must be between 0 and 60')
    }

    if (typeof s.levelGeneration.baseFlux !== 'number') {
      errors.push('baseFlux must be a number')
    } else if (s.levelGeneration.baseFlux < 5 || s.levelGeneration.baseFlux > 50) {
      errors.push('baseFlux must be between 5 and 50')
    }

    if (
      !['TIME_ONLY', 'RESOURCE_ONLY', 'MIXED', 'EXTREME'].includes(
        s.levelGeneration.difficultyScalingMode
      )
    ) {
      errors.push('difficultyScalingMode must be one of: TIME_ONLY, RESOURCE_ONLY, MIXED, EXTREME')
    }
  }

  if (!s.gridSizing || typeof s.gridSizing !== 'object') {
    errors.push('Invalid grid sizing settings')
  } else {
    if (typeof s.gridSizing.mobileCellSize !== 'number') {
      errors.push('mobileCellSize must be a number')
    } else if (s.gridSizing.mobileCellSize < 14 || s.gridSizing.mobileCellSize > 24) {
      errors.push('mobileCellSize must be between 14 and 24')
    }

    if (typeof s.gridSizing.desktopCellSize !== 'number') {
      errors.push('desktopCellSize must be a number')
    } else if (s.gridSizing.desktopCellSize < 16 || s.gridSizing.desktopCellSize > 28) {
      errors.push('desktopCellSize must be between 16 and 28')
    }

    if (typeof s.gridSizing.minVisibleCells !== 'number') {
      errors.push('minVisibleCells must be a number')
    } else if (s.gridSizing.minVisibleCells < 1) {
      errors.push('minVisibleCells must be at least 1')
    }
  }

  if (!s.audio || typeof s.audio !== 'object') {
    errors.push('Invalid audio settings')
  } else {
    if (typeof s.audio.enabled !== 'boolean') {
      errors.push('audio.enabled must be a boolean')
    }

    if (typeof s.audio.volume !== 'number') {
      errors.push('audio.volume must be a number')
    } else if (s.audio.volume < 0 || s.audio.volume > 0.5) {
      errors.push('audio.volume must be between 0 and 0.5')
    }

    if (!['sine', 'triangle', 'square', 'sawtooth'].includes(s.audio.waveform)) {
      errors.push('audio.waveform must be one of: sine, triangle, square, sawtooth')
    }
  }

  if (s.chaosMultiplier !== undefined) {
    if (typeof s.chaosMultiplier !== 'number') {
      errors.push('chaosMultiplier must be a number')
    } else if (s.chaosMultiplier < 0.5 || s.chaosMultiplier > 10.0) {
      errors.push('chaosMultiplier must be between 0.5 and 10.0')
    }
  }

  if (s.timerSpeed !== undefined) {
    if (typeof s.timerSpeed !== 'number') {
      errors.push('timerSpeed must be a number')
    } else if (s.timerSpeed < 0.5 || s.timerSpeed > 5.0) {
      errors.push('timerSpeed must be between 0.5 and 5.0')
    }
  }

  if (s.highContrastMode !== undefined) {
    if (typeof s.highContrastMode !== 'boolean') {
      errors.push('highContrastMode must be a boolean')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

interface SettingsPanelProps {
  isOpen: boolean
  settings: ExpertSettings
  onClose: () => void
  onUpdateSettings: (settings: ExpertSettings) => void
}

export function SettingsPanel({ isOpen, settings, onClose, onUpdateSettings }: SettingsPanelProps) {
  const [localSettings, setLocalSettings] = useState(settings)
  const [importError, setImportError] = useState<string>('')

  const handleExport = () => {
    const dataStr = JSON.stringify(localSettings, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'gol-expert-settings.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string)
        const validation = validateExpertSettingsDetailed(json)
        if (validation.valid) {
          setLocalSettings(json as ExpertSettings)
          setImportError('')
        } else {
          setImportError(`Invalid settings: ${validation.errors.join(', ')}`)
        }
      } catch {
        setImportError('Failed to parse JSON file')
      }
    }
    reader.readAsText(file)
  }

  const handleUpdate = (path: string, value: string | number | boolean) => {
    const newSettings = { ...localSettings }
    const keys = path.split('.')
    let target: Record<string, unknown> = newSettings

    for (let i = 0; i < keys.length - 1; i++) {
      target = target[keys[i]] as Record<string, unknown>
    }

    target[keys[keys.length - 1]] = value

    const updatedSettings: ExpertSettings = {
      ...newSettings,
      preset: undefined,
    }
    setLocalSettings(updatedSettings)
  }

  const handlePresetChange = (preset: Preset) => {
    const presetSettings = applyPreset(preset)
    setLocalSettings(presetSettings)
  }

  const handleSave = () => {
    onUpdateSettings(localSettings)
    onClose()
  }

  const handleReset = () => {
    const defaultSettings = {
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
        difficultyScalingMode: 'TIME_ONLY' as const,
      },
      gridSizing: {
        mobileCellSize: 18,
        desktopCellSize: 20,
        minVisibleCells: 10,
      },
      audio: {
        enabled: false,
        volume: 0.1,
        waveform: 'sine' as const,
      },
      chaosMultiplier: 1.0,
      timerSpeed: 1.0,
    }
    setLocalSettings(defaultSettings)
  }

  if (!isOpen) return null

  return (
    <div className="settings-overlay" onClick={onClose} aria-hidden="true">
      <div
        className="settings-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Settings panel"
        id="settings-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-button" onClick={onClose} aria-label="Close settings">
            ×
          </button>
        </div>

        <div className="settings-content">
          <section className="settings-section preset-section">
            <h3>Game Preset</h3>
            <div className="preset-description">
              {getPresetDescription(localSettings.preset ?? 'NORMAL')}
            </div>
            <div className="settings-row">
              <label htmlFor="preset-select">Difficulty Preset</label>
              <select
                id="preset-select"
                value={localSettings.preset ?? 'NORMAL'}
                onChange={(e) => handlePresetChange(e.target.value as Preset)}
                className="settings-select"
              >
                <option value="EASY">Easy</option>
                <option value="NORMAL">Normal</option>
                <option value="HARD">Hard</option>
                <option value="CHAOS">Chaos</option>
              </select>
            </div>
            <div className="setting-help">
              Quickly apply balanced difficulty presets that adjust multiple settings at once
            </div>
          </section>
          <section className="settings-section">
            <h3>Audio</h3>
            <div className="settings-row">
              <label htmlFor="audio-enabled">
                <input
                  id="audio-enabled"
                  type="checkbox"
                  checked={localSettings.audio.enabled}
                  onChange={(e) => handleUpdate('audio.enabled', e.target.checked)}
                />
                Enable Sonification
              </label>
            </div>
            <div className="setting-help">
              Generate sounds based on cell births and user interactions
            </div>
            <div className="settings-row">
              <label htmlFor="audio-volume">
                Volume: {(localSettings.audio.volume * 100).toFixed(0)}%
              </label>
              <input
                id="audio-volume"
                type="range"
                min="0"
                max="0.5"
                step="0.01"
                value={localSettings.audio.volume}
                onChange={(e) => handleUpdate('audio.volume', parseFloat(e.target.value))}
                className="settings-slider"
              />
            </div>
            <div className="setting-help">Master volume for all game sounds (0-50%)</div>
            <div className="settings-row">
              <label htmlFor="audio-waveform">Waveform</label>
              <select
                id="audio-waveform"
                value={localSettings.audio.waveform}
                onChange={(e) =>
                  handleUpdate(
                    'audio.waveform',
                    e.target.value as 'sine' | 'triangle' | 'square' | 'sawtooth'
                  )
                }
                className="settings-select"
              >
                <option value="sine">Sine</option>
                <option value="triangle">Triangle</option>
                <option value="square">Square</option>
                <option value="sawtooth">Sawtooth</option>
              </select>
            </div>
            <div className="setting-help">
              Sound timbre: Sine (smooth), Triangle (rich), Square (harsh), Sawtooth (bright)
            </div>
          </section>

          <section className="settings-section">
            <h3>Movement Detection</h3>
            <div className="settings-row">
              <label htmlFor="movement-history">
                Centroid History Length: {localSettings.movementDetection.centroidHistoryLength}
              </label>
              <input
                id="movement-history"
                type="range"
                min="3"
                max="10"
                step="1"
                value={localSettings.movementDetection.centroidHistoryLength}
                onChange={(e) =>
                  handleUpdate('movementDetection.centroidHistoryLength', parseInt(e.target.value))
                }
                className="settings-slider"
              />
            </div>
            <div className="setting-help">
              Generations of cluster centroid history to track for movement analysis (3-10)
            </div>
            <div className="settings-row">
              <label htmlFor="movement-threshold">
                Movement Threshold: {localSettings.movementDetection.movementThreshold.toFixed(1)}
              </label>
              <input
                id="movement-threshold"
                type="range"
                min="0.1"
                max="2.0"
                step="0.1"
                value={localSettings.movementDetection.movementThreshold}
                onChange={(e) =>
                  handleUpdate('movementDetection.movementThreshold', parseFloat(e.target.value))
                }
                className="settings-slider"
              />
            </div>
            <div className="setting-help">
              Minimum distance (in cells) cluster must move to be classified as a MOVER (0.1-2.0)
            </div>
            <div className="settings-row">
              <label htmlFor="movement-min-size">
                Minimum Cluster Size: {localSettings.movementDetection.minClusterSize}
              </label>
              <input
                id="movement-min-size"
                type="range"
                min="1"
                max="5"
                step="1"
                value={localSettings.movementDetection.minClusterSize}
                onChange={(e) =>
                  handleUpdate('movementDetection.minClusterSize', parseInt(e.target.value))
                }
                className="settings-slider"
              />
            </div>
            <div className="setting-help">
              Minimum number of cells in a cluster to track for scoring (1-5)
            </div>
          </section>

          <section className="settings-section">
            <h3>Scoring</h3>
            <div className="settings-row">
              <label htmlFor="scoring-mover">
                Mover Points/Gen: {localSettings.scoring.moverPointsPerGeneration}
              </label>
              <input
                id="scoring-mover"
                type="range"
                min="1"
                max="100"
                step="1"
                value={localSettings.scoring.moverPointsPerGeneration}
                onChange={(e) =>
                  handleUpdate('scoring.moverPointsPerGeneration', parseInt(e.target.value))
                }
                className="settings-slider"
              />
            </div>
            <div className="setting-help">
              Points awarded per generation for each MOVER pattern (1-100)
            </div>
            <div className="settings-row">
              <label htmlFor="scoring-oscillator">
                Oscillator Points/Gen: {localSettings.scoring.oscillatorPointsPerGeneration}
              </label>
              <input
                id="scoring-oscillator"
                type="range"
                min="0"
                max="20"
                step="1"
                value={localSettings.scoring.oscillatorPointsPerGeneration}
                onChange={(e) =>
                  handleUpdate('scoring.oscillatorPointsPerGeneration', parseInt(e.target.value))
                }
                className="settings-slider"
              />
            </div>
            <div className="setting-help">
              Points awarded per generation for each OSCILLATOR pattern (0-20)
            </div>
            <div className="settings-row">
              <label htmlFor="scoring-multiplier">
                Score Multiplier: {localSettings.scoring.scoreMultiplier.toFixed(1)}x
              </label>
              <input
                id="scoring-multiplier"
                type="range"
                min="0.1"
                max="5.0"
                step="0.1"
                value={localSettings.scoring.scoreMultiplier}
                onChange={(e) =>
                  handleUpdate('scoring.scoreMultiplier', parseFloat(e.target.value))
                }
                className="settings-slider"
              />
            </div>
            <div className="setting-help">
              Global multiplier applied to all score calculations (0.1-5.0x)
            </div>
          </section>

          <section className="settings-section">
            <h3>Level Generation</h3>
            <div className="settings-row">
              <label htmlFor="level-time">
                Base Time (s): {localSettings.levelGeneration.baseTimeSeconds}
              </label>
              <input
                id="level-time"
                type="range"
                min="10"
                max="120"
                step="5"
                value={localSettings.levelGeneration.baseTimeSeconds}
                onChange={(e) =>
                  handleUpdate('levelGeneration.baseTimeSeconds', parseInt(e.target.value))
                }
                className="settings-slider"
              />
            </div>
            <div className="setting-help">Base time limit (in seconds) for level 1 (10-120s)</div>
            <div className="settings-row">
              <label htmlFor="level-increment">
                Time Increment/Level (s): {localSettings.levelGeneration.timeIncrementPerLevel}
              </label>
              <input
                id="level-increment"
                type="range"
                min="0"
                max="60"
                step="5"
                value={localSettings.levelGeneration.timeIncrementPerLevel}
                onChange={(e) =>
                  handleUpdate('levelGeneration.timeIncrementPerLevel', parseInt(e.target.value))
                }
                className="settings-slider"
              />
            </div>
            <div className="setting-help">
              Additional time (in seconds) added per level progression (0-60s)
            </div>
            <div className="settings-row">
              <label htmlFor="level-flux">
                Base Flux: {localSettings.levelGeneration.baseFlux}
              </label>
              <input
                id="level-flux"
                type="range"
                min="5"
                max="50"
                step="5"
                value={localSettings.levelGeneration.baseFlux}
                onChange={(e) => handleUpdate('levelGeneration.baseFlux', parseInt(e.target.value))}
                className="settings-slider"
              />
            </div>
            <div className="setting-help">Initial Flux resource budget for each level (5-50)</div>
            <div className="settings-row">
              <label htmlFor="level-difficulty">Difficulty Mode</label>
              <select
                id="level-difficulty"
                value={localSettings.levelGeneration.difficultyScalingMode}
                onChange={(e) =>
                  handleUpdate(
                    'levelGeneration.difficultyScalingMode',
                    e.target.value as 'TIME_ONLY' | 'RESOURCE_ONLY' | 'MIXED' | 'EXTREME'
                  )
                }
                className="settings-select"
              >
                <option value="TIME_ONLY">Time Only</option>
                <option value="RESOURCE_ONLY">Resource Only</option>
                <option value="MIXED">Mixed</option>
                <option value="EXTREME">Extreme</option>
              </select>
            </div>
            <div className="setting-help">
              Difficulty scaling strategy: TIME_ONLY (decrease time), RESOURCE_ONLY (decrease Flux),
              MIXED (both), EXTREME (both aggressive)
            </div>
          </section>

          <section className="settings-section">
            <h3>Grid Sizing</h3>
            <div className="settings-row">
              <label htmlFor="grid-mobile">
                Mobile Cell Size (px): {localSettings.gridSizing.mobileCellSize}
              </label>
              <input
                id="grid-mobile"
                type="range"
                min="14"
                max="24"
                step="2"
                value={localSettings.gridSizing.mobileCellSize}
                onChange={(e) =>
                  handleUpdate('gridSizing.mobileCellSize', parseInt(e.target.value))
                }
                className="settings-slider"
              />
            </div>
            <div className="setting-help">Size of each cell on mobile devices (14-24px)</div>
            <div className="settings-row">
              <label htmlFor="grid-desktop">
                Desktop Cell Size (px): {localSettings.gridSizing.desktopCellSize}
              </label>
              <input
                id="grid-desktop"
                type="range"
                min="16"
                max="28"
                step="2"
                value={localSettings.gridSizing.desktopCellSize}
                onChange={(e) =>
                  handleUpdate('gridSizing.desktopCellSize', parseInt(e.target.value))
                }
                className="settings-slider"
              />
            </div>
            <div className="setting-help">Size of each cell on desktop devices (16-28px)</div>
          </section>

          <section className="settings-section danger-zone">
            <h3>⚠️ Danger Zone</h3>
            <div className="danger-warning">
              Warning: These settings can make the game extremely difficult or impossible to play.
              Use with caution!
            </div>
            <div className="settings-row">
              <label htmlFor="danger-multiplier">
                Chaos Multiplier: {localSettings.chaosMultiplier ?? 1.0}x
              </label>
              <input
                id="danger-multiplier"
                type="range"
                min="0.5"
                max="10.0"
                step="0.5"
                value={localSettings.chaosMultiplier ?? 1.0}
                onChange={(e) => handleUpdate('chaosMultiplier', parseFloat(e.target.value))}
                className="settings-slider danger-slider"
              />
            </div>
            <div className="setting-help">
              Multiplies scoring difficulty (0.5-10.0x). Higher values make earning points much
              harder
            </div>
            <div className="settings-row">
              <label htmlFor="danger-timer">Timer Speed: {localSettings.timerSpeed ?? 1.0}x</label>
              <input
                id="danger-timer"
                type="range"
                min="0.5"
                max="5.0"
                step="0.5"
                value={localSettings.timerSpeed ?? 1.0}
                onChange={(e) => handleUpdate('timerSpeed', parseFloat(e.target.value))}
                className="settings-slider danger-slider"
              />
            </div>
            <div className="setting-help">
              Speed of game timer countdown (0.5-5.0x). Higher values make levels end much faster
            </div>
          </section>

          <section className="settings-section accessibility-section">
            <h3>Accessibility</h3>
            <div className="settings-row">
              <label htmlFor="high-contrast">High Contrast Mode</label>
              <input
                id="high-contrast"
                type="checkbox"
                checked={localSettings.highContrastMode ?? false}
                onChange={(e) => handleUpdate('highContrastMode', e.target.checked)}
                className="settings-checkbox"
              />
            </div>
            <div className="setting-help">
              Increases contrast and text size for improved readability and accessibility
            </div>
          </section>
        </div>

        <div className="settings-footer">
          <button className="settings-button secondary" onClick={handleReset}>
            Reset to Defaults
          </button>
          <button className="settings-button secondary" onClick={handleExport}>
            Export JSON
          </button>
          <button
            className="settings-button secondary"
            onClick={() => document.getElementById('import-file-input')?.click()}
          >
            Import JSON
          </button>
          <input
            id="import-file-input"
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleImport}
          />
          <button className="settings-button primary" onClick={handleSave}>
            Save Settings
          </button>
          {importError && <div className="settings-error">{importError}</div>}
        </div>
      </div>
    </div>
  )
}
