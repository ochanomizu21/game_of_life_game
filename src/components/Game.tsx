import { useState, useCallback } from 'react'
import { createGrid, GRID_SIZE_PRESETS, type GridSizePreset } from '../lib/simulation'
import { type GridType, type FluxState, type GamePhase, type InteractionMode } from '../types'
import { createInitialFluxState } from '../lib/flux'
import { GridInteraction } from './GridInteraction'

export function Game() {
  const [gridPreset, setGridPreset] = useState<GridSizePreset>('SMALL')
  const [grid, setGrid] = useState<GridType>(() => createGrid(20, 30))
  const [flux, setFlux] = useState<FluxState>(() => createInitialFluxState(20))
  const [phase, setPhase] = useState<GamePhase>('PLANNING')
  const [showGridLines, setShowGridLines] = useState(true)
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('DRAW')

  const handleStart = useCallback(() => {
    if (phase === 'PLANNING') {
      setPhase('COUNTDOWN')
    }
  }, [phase])

  const handleGridChange = useCallback((newGrid: GridType) => {
    setGrid(newGrid)
  }, [])

  const handleFluxChange = useCallback((newFlux: FluxState) => {
    setFlux(newFlux)
  }, [])

  const handleClear = useCallback(() => {
    const { rows, cols } = GRID_SIZE_PRESETS[gridPreset]
    setGrid(createGrid(rows, cols))
    setFlux(createInitialFluxState(20))
    setPhase('PLANNING')
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
    setPhase('PLANNING')
  }, [gridPreset])

  const aliveCount = grid.flat().filter((cell: number) => cell > 0).length

  return (
    <div style={{ padding: '20px', backgroundColor: '#0a0a0f', minHeight: '100vh', color: '#fff' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px', color: '#61dafb' }}>
        Conway's Game of Life
      </h1>

      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <div
          style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}
        >
          <button onClick={() => setGridPreset('SMALL')} disabled={phase !== 'PLANNING'}>
            Small
          </button>
          <button onClick={() => setGridPreset('MEDIUM')} disabled={phase !== 'PLANNING'}>
            Medium
          </button>
          <button onClick={() => setGridPreset('LARGE')} disabled={phase !== 'PLANNING'}>
            Large
          </button>
        </div>

        <div
          style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}
        >
          <button onClick={handleStart} disabled={phase !== 'PLANNING' || aliveCount === 0}>
            {phase === 'PLANNING' ? 'Start' : 'Running'}
          </button>
          <button onClick={handleClear} disabled={phase !== 'PLANNING'}>
            Clear
          </button>
          <button onClick={handleRandom} disabled={phase !== 'PLANNING'}>
            Random
          </button>
        </div>

        <div
          style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}
        >
          <button onClick={() => setShowGridLines(!showGridLines)} disabled={phase !== 'PLANNING'}>
            {showGridLines ? 'Hide Grid' : 'Show Grid'}
          </button>
        </div>

        <div
          style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}
        >
          <button
            onClick={() => setInteractionMode('DRAW')}
            disabled={phase !== 'PLANNING'}
            style={{ backgroundColor: interactionMode === 'DRAW' ? '#61dafb' : '#1a1a1a' }}
          >
            Draw
          </button>
          <button
            onClick={() => setInteractionMode('ERASE')}
            disabled={phase !== 'PLANNING'}
            style={{ backgroundColor: interactionMode === 'ERASE' ? '#61dafb' : '#1a1a1a' }}
          >
            Erase
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <div
          style={{
            display: 'flex',
            gap: '30px',
            padding: '10px 20px',
            backgroundColor: 'rgba(26, 26, 46, 0.8)',
            borderRadius: '8px',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div>Phase: {phase}</div>
          <div>Cells: {aliveCount}</div>
          <div
            style={{
              color: flux.current > 10 ? '#00ff00' : flux.current > 5 ? '#ffaa00' : '#ff0000',
            }}
          >
            Flux: {flux.current}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <GridInteraction
          grid={grid}
          flux={flux}
          phase={phase}
          showGridLines={showGridLines}
          onGridChange={handleGridChange}
          onFluxChange={handleFluxChange}
          interactionMode={interactionMode}
        />
      </div>
    </div>
  )
}
