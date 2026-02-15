import { useState, useCallback, useEffect } from 'react'
import type { GridType } from '../types'
import { CanvasGrid } from './CanvasGrid'
import { getCellFromEvent, isWithinBounds } from '../lib/interaction'
import { canPlaceCell, placeCell, removeCell } from '../lib/flux'
import type { FluxState } from '../types'

interface GridInteractionProps {
  grid: GridType
  flux: FluxState
  phase: 'PLANNING' | 'COUNTDOWN' | 'RUNNING' | 'FINISHED'
  showGridLines: boolean
  cellSize?: number
  onGridChange: (newGrid: GridType) => void
  onFluxChange: (newFlux: FluxState) => void
  interactionMode: 'DRAW' | 'ERASE'
}

export function GridInteraction({
  grid,
  flux,
  phase,
  showGridLines,
  cellSize,
  onGridChange,
  onFluxChange,
  interactionMode,
}: GridInteractionProps) {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null)

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      const numRows = grid.length
      const numCols = grid[0].length

      if (!isWithinBounds(row, col, numRows, numCols)) return

      const cellExists = grid[row][col] > 0

      if (interactionMode === 'DRAW') {
        if (cellExists) {
          if (phase === 'PLANNING') {
            const newFlux = removeCell(flux, phase)
            const newGrid = grid.map((r, rIdx) =>
              r.map((cell, cIdx) => (rIdx === row && cIdx === col ? 0 : cell))
            )
            onFluxChange(newFlux)
            onGridChange(newGrid)
          }
        } else {
          if (canPlaceCell(flux)) {
            const newFlux = placeCell(flux)
            const newGrid = grid.map((r, rIdx) =>
              r.map((cell, cIdx) => (rIdx === row && cIdx === col ? 1 : cell))
            )
            onFluxChange(newFlux)
            onGridChange(newGrid)
          }
        }
      } else if (interactionMode === 'ERASE') {
        if (cellExists && phase === 'PLANNING') {
          const newFlux = removeCell(flux, phase)
          const newGrid = grid.map((r, rIdx) =>
            r.map((cell, cIdx) => (rIdx === row && cIdx === col ? 0 : cell))
          )
          onFluxChange(newFlux)
          onGridChange(newGrid)
        }
      }
    },
    [grid, flux, phase, interactionMode, onGridChange, onFluxChange]
  )

  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (phase !== 'PLANNING') return

      const canvas = event.currentTarget
      const numRows = grid.length
      const numCols = grid[0].length

      const nativeEvent = event.nativeEvent
      const { row, col } = getCellFromEvent(nativeEvent, canvas, numRows, numCols)
      handleCellClick(row, col)
    },
    [phase, grid, handleCellClick]
  )

  const handleCanvasMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      const canvas = event.currentTarget
      const numRows = grid.length
      const numCols = grid[0].length

      const nativeEvent = event.nativeEvent
      const { row, col } = getCellFromEvent(nativeEvent, canvas, numRows, numCols)

      if (isWithinBounds(row, col, numRows, numCols)) {
        setHoveredCell({ row, col })
      } else {
        setHoveredCell(null)
      }
    },
    [grid]
  )

  const handleCanvasLeave = useCallback(() => {
    setHoveredCell(null)
  }, [])

  const getCursor = useCallback(() => {
    if (phase !== 'PLANNING') return 'not-allowed'

    if (!hoveredCell) return 'default'

    const cellExists = grid[hoveredCell.row][hoveredCell.col] > 0

    if (cellExists) {
      if (phase === 'PLANNING') {
        return 'crosshair'
      }
      return 'not-allowed'
    }

    if (flux.current === 0) {
      return 'not-allowed'
    }

    return 'crosshair'
  }, [phase, hoveredCell, grid, flux])

  const isPlaceable = useCallback(() => {
    if (!hoveredCell) return false
    if (flux.current === 0) return false
    return grid[hoveredCell.row][hoveredCell.col] === 0
  }, [hoveredCell, flux, grid])

  const isRemovable = useCallback(() => {
    if (!hoveredCell) return false
    return grid[hoveredCell.row][hoveredCell.col] > 0
  }, [hoveredCell, grid])

  useEffect(() => {
    return () => {
      setHoveredCell(null)
    }
  }, [grid])

  return (
    <div style={{ position: 'relative', cursor: getCursor() }}>
      <CanvasGrid
        grid={grid}
        showGridLines={showGridLines}
        cellSize={cellSize}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMove}
        onMouseLeave={handleCanvasLeave}
      />
      {hoveredCell && phase === 'PLANNING' && (
        <div
          style={{
            position: 'absolute',
            left: `${hoveredCell.col * (cellSize || 20)}px`,
            top: `${hoveredCell.row * (cellSize || 20)}px`,
            width: `${cellSize || 20}px`,
            height: `${cellSize || 20}px`,
            pointerEvents: 'none',
            border: `2px solid ${isPlaceable() ? '#00ffff' : isRemovable() ? '#ff00ff' : '#ff0000'}`,
            opacity: 0.5,
            borderRadius: '2px',
          }}
        />
      )}
    </div>
  )
}
