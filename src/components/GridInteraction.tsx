import { useState, useCallback, useEffect, useRef } from 'react'
import type { GridType } from '../types'
import { CanvasGrid, type CellAnimation } from './CanvasGrid'
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
  onInteractionSound?: (type: 'draw' | 'erase') => void
  onFluxErrorSound?: () => void
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
  onInteractionSound,
  onFluxErrorSound,
}: GridInteractionProps) {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null)
  const [focusedCell, setFocusedCell] = useState<{ row: number; col: number } | null>(null)
  const [animations, setAnimations] = useState<CellAnimation[]>([])
  const [showInvalidAction, setShowInvalidAction] = useState<{ row: number; col: number } | null>(
    null
  )
  const containerRef = useRef<HTMLDivElement>(null)

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      const numRows = grid.length
      const numCols = grid[0].length

      if (!isWithinBounds(row, col, numRows, numCols)) return

      const cellExists = grid[row][col] > 0

      if (interactionMode === 'DRAW') {
        if (cellExists) {
          if (phase === 'PLANNING') {
            onInteractionSound?.('erase')
            const newFlux = removeCell(flux, phase)
            const newGrid = grid.map((r, rIdx) =>
              r.map((cell, cIdx) => (rIdx === row && cIdx === col ? 0 : cell))
            )
            onFluxChange(newFlux)
            onGridChange(newGrid)

            const deathAnimation: CellAnimation = {
              row,
              col,
              type: 'death',
              startTime: window.performance.now(),
              duration: 150,
            }
            setAnimations((prev) => [...prev, deathAnimation])
          }
        } else {
          if (canPlaceCell(flux)) {
            onInteractionSound?.('draw')
            const newFlux = placeCell(flux)
            const newGrid = grid.map((r, rIdx) =>
              r.map((cell, cIdx) => (rIdx === row && cIdx === col ? 1 : cell))
            )
            onFluxChange(newFlux)
            onGridChange(newGrid)

            const birthAnimation: CellAnimation = {
              row,
              col,
              type: 'birth',
              startTime: window.performance.now(),
              duration: 100,
            }
            setAnimations((prev) => [...prev, birthAnimation])
          } else {
            onFluxErrorSound?.()
            setShowInvalidAction({ row, col })
            window.setTimeout(() => setShowInvalidAction(null), 200)
          }
        }
      } else if (interactionMode === 'ERASE') {
        if (cellExists && phase === 'PLANNING') {
          onInteractionSound?.('erase')
          const newFlux = removeCell(flux, phase)
          const newGrid = grid.map((r, rIdx) =>
            r.map((cell, cIdx) => (rIdx === row && cIdx === col ? 0 : cell))
          )
          onFluxChange(newFlux)
          onGridChange(newGrid)

          const deathAnimation: CellAnimation = {
            row,
            col,
            type: 'death',
            startTime: window.performance.now(),
            duration: 150,
          }
          setAnimations((prev) => [...prev, deathAnimation])
        }
      }
    },
    [
      grid,
      flux,
      phase,
      interactionMode,
      onGridChange,
      onFluxChange,
      onInteractionSound,
      onFluxErrorSound,
    ]
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

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (phase !== 'PLANNING') return

      const numRows = grid.length
      const numCols = grid[0].length

      const currentFocused = focusedCell || { row: 0, col: 0 }
      let newFocused = { ...currentFocused }

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault()
          newFocused.row = Math.max(0, currentFocused.row - 1)
          setFocusedCell(newFocused)
          break
        case 'ArrowDown':
          e.preventDefault()
          newFocused.row = Math.min(numRows - 1, currentFocused.row + 1)
          setFocusedCell(newFocused)
          break
        case 'ArrowLeft':
          e.preventDefault()
          newFocused.col = Math.max(0, currentFocused.col - 1)
          setFocusedCell(newFocused)
          break
        case 'ArrowRight':
          e.preventDefault()
          newFocused.col = Math.min(numCols - 1, currentFocused.col + 1)
          setFocusedCell(newFocused)
          break
        case 'Enter':
        case ' ':
          e.preventDefault()
          handleCellClick(newFocused.row, newFocused.col)
          break
        case 'Escape':
          e.preventDefault()
          setFocusedCell(null)
          break
      }
    },
    [phase, grid, focusedCell, handleCellClick]
  )

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
      setFocusedCell(null)
    }
  }, [grid])

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', cursor: getCursor() }}
      tabIndex={0}
      role="grid"
      aria-label="Game of Life grid. Use arrow keys to navigate, Enter or Space to place or remove cells."
      onKeyDown={handleKeyDown}
    >
      <CanvasGrid
        grid={grid}
        showGridLines={showGridLines}
        cellSize={cellSize}
        animations={animations}
        showInvalidAction={showInvalidAction}
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
      {focusedCell && (
        <div
          style={{
            position: 'absolute',
            left: `${focusedCell.col * (cellSize || 20)}px`,
            top: `${focusedCell.row * (cellSize || 20)}px`,
            width: `${cellSize || 20}px`,
            height: `${cellSize || 20}px`,
            pointerEvents: 'none',
            border: '3px solid #ffff00',
            boxShadow: '0 0 10px #ffff00',
            zIndex: 1000,
            borderRadius: '2px',
          }}
        />
      )}
    </div>
  )
}
