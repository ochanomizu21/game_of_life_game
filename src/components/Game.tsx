import { useState, useCallback, useEffect, useRef } from 'react'
import { createGrid, GRID_SIZE_PRESETS, type GridSizePreset } from '../lib/simulation'
import { type GridType, type FluxState, type InteractionMode, type TrackedCluster } from '../types'
import { createInitialFluxState } from '../lib/flux'
import { GridInteraction } from './GridInteraction'
import { usePhaseTimer } from '../hooks/usePhaseTimer'
import { stepSimulation, CONWAY_RULES } from '../lib/simulation'
import {
  findConnectedComponents,
  trackClusters,
  createInitialMovementDetectionParams,
} from '../lib/movement'
import {
  createInitialScoreState,
  createInitialScoringConfig,
  updateScore,
  calculateGenerationScore,
} from '../lib/scoring'
import { ScoreDisplay } from './ScoreDisplay'
import { GlassHUD } from './GlassHUD'

export function Game() {
  const [gridPreset, setGridPreset] = useState<GridSizePreset>('SMALL')
  const [grid, setGrid] = useState<GridType>(() => createGrid(20, 30))
  const [flux, setFlux] = useState<FluxState>(() => createInitialFluxState(20))
  const [showGridLines, setShowGridLines] = useState(true)
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('DRAW')
  const [generation, setGeneration] = useState(0)
  const [scoreState, setScoreState] = useState(() => createInitialScoreState())

  const previousTrackedClustersRef = useRef<TrackedCluster[]>([])
  const simulationSpeed = 200

  const movementConfig = createInitialMovementDetectionParams()
  const scoringConfig = createInitialScoringConfig()

  const [previousScore, setPreviousScore] = useState(0)

  const hasCells = useCallback(() => {
    return grid.flat().filter((cell: number) => cell > 0).length > 0
  }, [grid])

  const { phaseState, startCountdown } = usePhaseTimer(hasCells)

  const handleSimulationStep = useCallback(() => {
    const currentState = {
      grid,
      generation,
      running: true,
      speed: simulationSpeed,
      selectedRule: CONWAY_RULES,
    }

    const result = stepSimulation(currentState)

    const currentClusters = findConnectedComponents(result.newGrid, result.newGeneration)
    const tracked = trackClusters(
      currentClusters,
      previousTrackedClustersRef.current,
      movementConfig
    )

    const generationScore = calculateGenerationScore(tracked, scoringConfig)
    const newScoreState = updateScore(scoreState, generationScore)

    setPreviousScore(scoreState.currentScore)
    previousTrackedClustersRef.current = tracked
    setScoreState(newScoreState)
    setGrid(result.newGrid)
    setGeneration(result.newGeneration)
  }, [grid, generation, simulationSpeed, scoreState, movementConfig, scoringConfig])

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
  }, [phaseState, simulationSpeed, handleSimulationStep])

  const handleStart = useCallback(() => {
    if (phaseState.current === 'PLANNING' && hasCells()) {
      startCountdown()
    }
  }, [phaseState, startCountdown, hasCells])

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
    previousTrackedClustersRef.current = []
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
    previousTrackedClustersRef.current = []
  }, [gridPreset])

  const aliveCount = grid.flat().filter((cell: number) => cell > 0).length

  const handleToggleSettings = useCallback(() => {
    console.log('Settings panel toggled (not yet implemented)')
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
  const isUiVisible = true

  return (
    <div style={{ padding: '20px', backgroundColor: '#0a0a0f', minHeight: '100vh', color: '#fff' }}>
      <ScoreDisplay
        score={scoreState.currentScore}
        previousScore={previousScore}
        showPatternBreakdown={false}
      />

      <h1 style={{ textAlign: 'center', marginBottom: '20px', color: '#61dafb' }}>
        Conway's Game of Life
      </h1>

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
        />
      </div>
    </div>
  )
}
