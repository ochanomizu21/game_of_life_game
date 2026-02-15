import { useRef, useEffect, useCallback } from 'react'
import type { GridType } from '../types'
import {
  getCellColor,
  getCellBlur,
  getResponsiveCellSize,
  CELL_CORNER_RADIUS,
  BACKGROUND_COLOR,
  GRID_LINE_COLOR,
} from '../lib/canvasUtils'

interface CanvasGridProps {
  grid: GridType
  showGridLines: boolean
  cellSize?: number
  onClick?: (
    event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => void
  onMouseMove?: (
    event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => void
  onMouseLeave?: () => void
}

export function CanvasGrid({
  grid,
  showGridLines,
  cellSize,
  onClick,
  onMouseMove,
  onMouseLeave,
}: CanvasGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const actualCellSize = cellSize ?? getResponsiveCellSize()

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const numCols = grid[0].length
    const numRows = grid.length

    const width = numCols * actualCellSize
    const height = numRows * actualCellSize

    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    ctx.scale(dpr, dpr)

    ctx.fillStyle = BACKGROUND_COLOR
    ctx.fillRect(0, 0, width, height)

    if (showGridLines) {
      ctx.strokeStyle = GRID_LINE_COLOR
      ctx.lineWidth = 1

      for (let col = 0; col <= numCols; col++) {
        const x = col * actualCellSize
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }

      for (let row = 0; row <= numRows; row++) {
        const y = row * actualCellSize
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }
    }

    let activeCount = 0

    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        const age = grid[row][col]
        if (age > 0) {
          activeCount++
          const x = col * actualCellSize
          const y = row * actualCellSize
          const color = getCellColor(age)
          const blur = getCellBlur(age)

          ctx.save()
          ctx.shadowColor = color
          ctx.shadowBlur = blur
          ctx.fillStyle = color

          const radius = CELL_CORNER_RADIUS

          ctx.beginPath()
          ctx.roundRect(x + 1, y + 1, actualCellSize - 2, actualCellSize - 2, radius)
          ctx.fill()
          ctx.restore()
        }
      }
    }

    const intensity = Math.min(activeCount / 500, 1)
    document.documentElement.style.setProperty('--life-intensity', intensity.toString())
  }, [grid, showGridLines, actualCellSize])

  useEffect(() => {
    draw()
  }, [draw])

  return (
    <canvas
      ref={canvasRef}
      style={{ touchAction: 'none' }}
      onClick={onClick}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    />
  )
}
