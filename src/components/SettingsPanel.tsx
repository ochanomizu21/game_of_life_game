import { useState } from 'react'
import type { ExpertSettings } from '../types'
import '../styles/SettingsPanel.css'

interface SettingsPanelProps {
  isOpen: boolean
  settings: ExpertSettings
  onClose: () => void
  onUpdateSettings: (settings: ExpertSettings) => void
}

export function SettingsPanel({ isOpen, settings, onClose, onUpdateSettings }: SettingsPanelProps) {
  const [localSettings, setLocalSettings] = useState(settings)

  const handleUpdate = (path: string, value: any) => {
    const newSettings = { ...localSettings }
    const keys = path.split('.')
    let target: any = newSettings

    for (let i = 0; i < keys.length - 1; i++) {
      target = target[keys[i]]
    }

    target[keys[keys.length - 1]] = value
    setLocalSettings(newSettings)
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
    }
    setLocalSettings(defaultSettings)
  }

  if (!isOpen) return null

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="settings-content">
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
          </section>
        </div>

        <div className="settings-footer">
          <button className="settings-button secondary" onClick={handleReset}>
            Reset to Defaults
          </button>
          <button className="settings-button primary" onClick={handleSave}>
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}
