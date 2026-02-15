import { useState, useCallback, useEffect, useRef } from 'react'
import { createGrid, GRID_SIZE_PRESETS, type GridSizePreset } from '../lib/simulation'
import {
  type GridType,
  type FluxState,
  type InteractionMode,
  type TrackedCluster,
  type ExpertSettings,
  type LevelProgression,
} from '../types'
import { createInitialFluxState } from '../lib/flux'
import { GridInteraction } from './GridInteraction'
import { usePhaseTimer } from '../hooks/usePhaseTimer'
import { useTransition } from '../hooks/useTransition'
import { stepSimulation, CONWAY_RULES } from '../lib/simulation'
import { findConnectedComponents, trackClusters } from '../lib/movement'
import { createInitialScoreState, updateScore, calculateGenerationScore } from '../lib/scoring'
import { ScoreDisplay } from './ScoreDisplay'
import { GlassHUD } from './GlassHUD'
import { SettingsPanel } from './SettingsPanel'
import { TransitionOverlay } from './TransitionOverlay'
import { VictoryScreen } from './VictoryScreen'
import { UIToggleButton } from './UIToggleButton'
import {
  createInitialExpertSettings,
  saveToLocalStorage,
  loadFromLocalStorage,
} from '../lib/settings'
import {
  generateProgression,
  getCurrentLevelConfig,
  advanceLevel,
  isFinalLevel,
  resetProgression,
  saveHighScore,
  getHighScore,
} from '../lib/level'
import { SoundEngine } from '../lib/audio'

export function Game() {
  const [gridPreset, setGridPreset] = useState<GridSizePreset>('SMALL')
  const [grid, setGrid] = useState<GridType>(() => createGrid(20, 30))
  const [flux, setFlux] = useState<FluxState>(() => createInitialFluxState(20))
  const [showGridLines, setShowGridLines] = useState(true)
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('DRAW')
  const [generation, setGeneration] = useState(0)
  const [scoreState, setScoreState] = useState(() => createInitialScoreState())
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false)
  const [expertSettings, setExpertSettings] = useState<ExpertSettings>(() => {
    const saved = loadFromLocalStorage<ExpertSettings>(
      'gol-expert-settings',
      createInitialExpertSettings()
    )
    return saved
  })
  const [levelProgression, setLevelProgression] = useState<LevelProgression>(() =>
    generateProgression(createInitialExpertSettings().levelGeneration)
  )
  const [showVictory, setShowVictory] = useState(false)
  const [isUiVisible, setIsUiVisible] = useState(true)
  const [highScore, setHighScore] = useState(0)
  const [trackedClusters, setTrackedClusters] = useState<TrackedCluster[]>([])

  const previousTrackedClustersRef = useRef<TrackedCluster[]>([])
  const previousPhaseRef = useRef<'PLANNING' | 'COUNTDOWN' | 'RUNNING' | 'FINISHED'>('PLANNING')
  const simulationSpeed = 200
  const soundEngineRef = useRef<SoundEngine | null>(null)

  const {
    enabled: audioEnabled,
    volume: audioVolume,
    waveform: audioWaveform,
  } = expertSettings.audio

  const handleInteractionSound = useCallback((type: 'draw' | 'erase') => {
    soundEngineRef.current?.playInteractionSound(type)
  }, [])

  const handleTransitionSound = useCallback((type: 'fade-out' | 'fade-in') => {
    soundEngineRef.current?.playTransitionSound(type)
  }, [])

  const handleFluxErrorSound = useCallback(() => {
    soundEngineRef.current?.playFluxErrorSound()
  }, [])

  useEffect(() => {
    if (!soundEngineRef.current) {
      soundEngineRef.current = new SoundEngine()
    }
    soundEngineRef.current.setEnabled(audioEnabled)
    soundEngineRef.current.setVolume(audioVolume)
    soundEngineRef.current.setWaveform(audioWaveform)
  }, [audioEnabled, audioVolume, audioWaveform])

  const currentLevelConfig = getCurrentLevelConfig(levelProgression)

  useEffect(() => {
    if (currentLevelConfig) {
      window.requestAnimationFrame(() => {
        setHighScore(getHighScore(currentLevelConfig.levelNumber))
      })
    }
  }, [currentLevelConfig])

  const movementConfig = expertSettings.movementDetection
  const scoringConfig = expertSettings.scoring

  const handleTransitionComplete = useCallback(() => {
    soundEngineRef.current?.playLevelStartSound()

    if (isFinalLevel(levelProgression)) {
      const updatedProgression: LevelProgression = {
        ...levelProgression,
        totalScore: levelProgression.totalScore + scoreState.currentScore,
        currentLevel: levelProgression.currentLevel + 1,
        maxUnlockedLevel: Math.max(
          levelProgression.maxUnlockedLevel,
          levelProgression.currentLevel + 1
        ),
      }
      setLevelProgression(updatedProgression)
      setShowVictory(true)
    } else {
      const newProgression = advanceLevel(levelProgression, scoreState.currentScore)
      const newLevelConfig = getCurrentLevelConfig(newProgression)

      setLevelProgression(newProgression)
      const { rows, cols } = GRID_SIZE_PRESETS[gridPreset]
      setGrid(createGrid(rows, cols))
      setFlux(createInitialFluxState(newLevelConfig?.initialFlux ?? 20))
      setGeneration(0)
      setScoreState(createInitialScoreState())
      previousTrackedClustersRef.current = []
    }
  }, [levelProgression, scoreState.currentScore, gridPreset])

  const { transitionState, startTransition, resetTransition } = useTransition(
    {
      fadeOutDuration: 2000,
      fadeInDuration: 2000,
      interstitialDuration: 2000,
      autoAdvanceDelay: 2000,
      skipEnabled: true,
    },
    handleTransitionComplete,
    handleTransitionSound
  )

  const [previousScore, setPreviousScore] = useState(0)

  const hasCells = useCallback(() => {
    return grid.flat().filter((cell: number) => cell > 0).length > 0
  }, [grid])

  const { phaseState, startCountdown, startRunning } = usePhaseTimer(hasCells)

  useEffect(() => {
    if (previousPhaseRef.current === 'COUNTDOWN' && phaseState.current === 'RUNNING') {
      soundEngineRef.current?.playSimulationStartSound()
    }
    previousPhaseRef.current = phaseState.current
  }, [phaseState.current])

  useEffect(() => {
    if (phaseState.current === 'FINISHED') {
      window.setTimeout(() => {
        if (!showVictory) {
          startTransition()
          soundEngineRef.current?.playLevelCompleteSound()
        }
      }, 2000)
    }
  }, [phaseState, showVictory, startTransition])

  useEffect(() => {
    if (transitionState === 'READY') {
      window.setTimeout(() => {
        resetTransition()
      }, 100)
    }
  }, [transitionState, resetTransition])

  useEffect(() => {
    if (phaseState.current === 'FINISHED' && currentLevelConfig && scoreState.currentScore > 0) {
      saveHighScore(currentLevelConfig.levelNumber, scoreState.currentScore)
      window.requestAnimationFrame(() => {
        setHighScore(getHighScore(currentLevelConfig.levelNumber))
      })
    }
  }, [phaseState, currentLevelConfig, scoreState.currentScore])

  const handleSimulationStep = useCallback(() => {
    const currentState = {
      grid,
      generation,
      running: true,
      speed: simulationSpeed,
      selectedRule: CONWAY_RULES,
    }

    const result = stepSimulation(currentState)

    if (result.bornCount > 0) {
      const totalRows = grid.length
      soundEngineRef.current?.playGenerationSound(result.bornCount, result.averageRow, totalRows)
    }

    const currentClusters = findConnectedComponents(result.newGrid, result.newGeneration)
    const tracked = trackClusters(currentClusters, trackedClusters, movementConfig)

    const generationScore = calculateGenerationScore(tracked, scoringConfig)
    const newScoreState = updateScore(scoreState, generationScore)

    setPreviousScore(scoreState.currentScore)
    previousTrackedClustersRef.current = tracked
    setTrackedClusters(tracked)
    setScoreState(newScoreState)
    setGrid(result.newGrid)
    setGeneration(result.newGeneration)
  }, [
    grid,
    generation,
    simulationSpeed,
    scoreState,
    movementConfig,
    scoringConfig,
    trackedClusters,
  ])

  useEffect(() => {
    let interval: number | undefined

    if (phaseState.current === 'RUNNING') {
      interval = window.setInterval(() => {
        handleSimulationStep()
      }, simulationSpeed)
    }

    return () => {
      if (interval) {
        window.clearInterval(interval)
      }
    }
  }, [phaseState, simulationSpeed, handleSimulationStep, trackedClusters])

  const handleStart = useCallback(() => {
    if (phaseState.current === 'PLANNING' && hasCells() && currentLevelConfig) {
      startCountdown()
      startRunning(currentLevelConfig.timeLimitSeconds)
    }
  }, [phaseState, startCountdown, hasCells, currentLevelConfig, startRunning])

  const handleGridChange = useCallback((newGrid: GridType) => {
    setGrid(newGrid)
    setGeneration(0)
  }, [])

  const handleFluxChange = useCallback((newFlux: FluxState) => {
    setFlux(newFlux)
  }, [])

  const handleClear = useCallback(() => {
    const { rows, cols } = GRID_SIZE_PRESETS[gridPreset]
    setGrid(createGrid(rows, cols))
    setFlux(createInitialFluxState(20))
    setGeneration(0)
    setScoreState(createInitialScoreState())
    setTrackedClusters([])
  }, [gridPreset])

  const handleRandom = useCallback(() => {
    const { rows, cols } = GRID_SIZE_PRESETS[gridPreset]
    const newGrid = createGrid(rows, cols)
    const density = 0.15

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (Math.random() < density) {
          newGrid[row][col] = 1
        }
      }
    }

    setGrid(newGrid)
    setFlux(createInitialFluxState(20))
    setGeneration(0)
    setScoreState(createInitialScoreState())
    setTrackedClusters([])
  }, [gridPreset])

  const aliveCount = grid.flat().filter((cell: number) => cell > 0).length

  const handleToggleSettings = useCallback(() => {
    setSettingsPanelOpen((prev) => !prev)
  }, [])

  const handleUpdateSettings = useCallback((newSettings: ExpertSettings) => {
    setExpertSettings(newSettings)
    saveToLocalStorage('gol-expert-settings', newSettings)
  }, [])

  const handleStep = useCallback(() => {
    if (phaseState.current !== 'PLANNING') return

    const currentState = {
      grid,
      generation,
      running: false,
      speed: 100,
      selectedRule: CONWAY_RULES,
    }

    const result = stepSimulation(currentState)
    setGrid(result.newGrid)
    setGeneration(result.newGeneration)
  }, [phaseState, grid, generation])

  const canInteract = phaseState.current === 'PLANNING'

  const movers = trackedClusters.filter((c) => c.classification === 'MOVER').length
  const oscillators = trackedClusters.filter((c) => c.classification === 'OSCILLATOR').length
  const rate =
    scoringConfig.moverPointsPerGeneration * movers +
    scoringConfig.oscillatorPointsPerGeneration * oscillators

  return (
    <div style={{ padding: '20px', backgroundColor: '#0a0a0f', minHeight: '100vh', color: '#fff' }}>
      <UIToggleButton isVisible={isUiVisible} onToggle={() => setIsUiVisible(!isUiVisible)} />

      <ScoreDisplay
        score={scoreState.currentScore}
        previousScore={previousScore}
        showPatternBreakdown={true}
        movers={movers}
        oscillators={oscillators}
        rate={rate}
        highScore={highScore}
      />

      <SettingsPanel
        isOpen={settingsPanelOpen}
        settings={expertSettings}
        onClose={() => setSettingsPanelOpen(false)}
        onUpdateSettings={handleUpdateSettings}
      />

      <h1 style={{ textAlign: 'center', marginBottom: '20px', color: '#61dafb' }}>
        Level {levelProgression.currentLevel} - Conway's Game of Life
      </h1>

      <TransitionOverlay
        transitionState={transitionState}
        currentLevel={levelProgression.currentLevel}
      />

      {showVictory && (
        <VictoryScreen
          totalScore={levelProgression.totalScore}
          onPlayAgain={() => {
            const reset = resetProgression()
            setLevelProgression(reset)
            setShowVictory(false)
            const { rows, cols } = GRID_SIZE_PRESETS[gridPreset]
            setGrid(createGrid(rows, cols))
            setFlux(createInitialFluxState(reset.levels[0]?.initialFlux ?? 20))
            setGeneration(0)
            setScoreState(createInitialScoreState())
            previousTrackedClustersRef.current = []
          }}
        />
      )}

      {isUiVisible && (
        <GlassHUD
          phase={phaseState.current}
          aliveCount={aliveCount}
          flux={flux.current}
          fluxMax={flux.initial}
          interactionMode={interactionMode}
          gridPreset={gridPreset}
          showGridLines={showGridLines}
          generation={generation}
          countdownValue={phaseState.countdownValue}
          timerRemaining={phaseState.timerRemaining}
          canStart={aliveCount > 0}
          canInteract={canInteract}
          onStart={handleStart}
          onStep={handleStep}
          onClear={handleClear}
          onRandom={handleRandom}
          onToggleGrid={() => setShowGridLines(!showGridLines)}
          onSetMode={setInteractionMode}
          onSetGridPreset={setGridPreset}
          onToggleSettings={handleToggleSettings}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <GridInteraction
          grid={grid}
          flux={flux}
          phase={phaseState.current}
          showGridLines={showGridLines}
          onGridChange={handleGridChange}
          onFluxChange={handleFluxChange}
          interactionMode={interactionMode}
          onInteractionSound={handleInteractionSound}
          onFluxErrorSound={handleFluxErrorSound}
        />
      </div>
    </div>
  )
}
