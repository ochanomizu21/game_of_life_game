import type { GamePhase, InteractionMode } from '../types'
import type { GridSizePreset } from '../lib/simulation'
import { FluxDisplay } from './FluxDisplay'
import '../styles/GlassHUD.css'

interface GlassHUDProps {
  phase: GamePhase
  aliveCount: number
  flux: number
  fluxMax: number
  interactionMode: InteractionMode
  gridPreset: GridSizePreset
  showGridLines: boolean
  generation: number
  countdownValue?: number
  timerRemaining?: number
  canStart: boolean
  canInteract: boolean
  disableFluxAnimation?: true
  onStart: () => void
  onStep: () => void
  onClear: () => void
  onRandom: () => void
  onToggleGrid: () => void
  onSetMode: (mode: InteractionMode) => void
  onSetGridPreset: (preset: GridSizePreset) => void
  onToggleSettings: () => void
}

export function GlassHUD({
  phase,
  aliveCount,
  flux,
  fluxMax,
  interactionMode,
  gridPreset,
  showGridLines,
  generation,
  countdownValue,
  timerRemaining,
  canStart,
  canInteract,
  disableFluxAnimation,
  onStart,
  onStep,
  onClear,
  onRandom,
  onToggleGrid,
  onSetMode,
  onSetGridPreset,
  onToggleSettings,
}: GlassHUDProps) {
  return (
    <div className="glass-hud-container">
      <div className="glass-hud">
        <div className="hud-controls">
          <div className="hud-group">
            <button
              className="hud-button"
              onClick={onStep}
              disabled={phase !== 'PLANNING' || !canInteract}
            >
              STEP
            </button>
            <button
              className="hud-button active"
              onClick={onStart}
              disabled={!canStart || !canInteract}
            >
              {phase === 'PLANNING' ? 'START' : 'RUNNING'}
            </button>
            <button className="hud-button" onClick={onRandom} disabled={!canInteract}>
              RANDOM
            </button>
            <button
              className="hud-button hud-button-danger"
              onClick={onClear}
              disabled={!canInteract}
            >
              CLEAR
            </button>
          </div>

          <div className="hud-group">
            <button
              className={`hud-button ${interactionMode === 'DRAW' ? 'active' : ''}`}
              onClick={() => onSetMode('DRAW')}
              disabled={!canInteract}
            >
              DRAW
            </button>
            <button
              className={`hud-button ${interactionMode === 'ERASE' ? 'active' : ''}`}
              onClick={() => onSetMode('ERASE')}
              disabled={!canInteract}
            >
              ERASE
            </button>
          </div>

          <div className="hud-group">
            <button
              className={`hud-button ${gridPreset === 'SMALL' ? 'active' : ''}`}
              onClick={() => onSetGridPreset('SMALL')}
              disabled={!canInteract}
            >
              Small
            </button>
            <button
              className={`hud-button ${gridPreset === 'MEDIUM' ? 'active' : ''}`}
              onClick={() => onSetGridPreset('MEDIUM')}
              disabled={!canInteract}
            >
              Medium
            </button>
            <button
              className={`hud-button ${gridPreset === 'LARGE' ? 'active' : ''}`}
              onClick={() => onSetGridPreset('LARGE')}
              disabled={!canInteract}
            >
              Large
            </button>
          </div>

          <div className="hud-group">
            <button className="hud-button" onClick={onToggleGrid} disabled={!canInteract}>
              {showGridLines ? 'Hide Grid' : 'Show Grid'}
            </button>
            <button className="hud-button" onClick={onToggleSettings}>
              ⚙️
            </button>
          </div>

          <div className="hud-status">
            <div className="hud-status-item">
              <span className="hud-status-label">Phase:</span>
              <span className="hud-status-value">{phase}</span>
            </div>
            {phase === 'COUNTDOWN' && (
              <div className="hud-status-item">
                <span className="hud-status-label">Countdown:</span>
                <span className="hud-status-value">{countdownValue}</span>
              </div>
            )}
            {phase === 'RUNNING' && (
              <div className="hud-status-item">
                <span className="hud-status-label">Timer:</span>
                <span className="hud-status-value">{timerRemaining}s</span>
              </div>
            )}
            <div className="hud-status-item">
              <span className="hud-status-label">GEN:</span>
              <span className="hud-status-value">{generation}</span>
            </div>
            <div className="hud-status-item">
              <span className="hud-status-label">Cells:</span>
              <span className="hud-status-value">{aliveCount}</span>
            </div>
            <div className="hud-status-item">
              <span className="hud-status-label">Flux:</span>
              <FluxDisplay flux={flux} fluxMax={fluxMax} disableAnimation={disableFluxAnimation} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
