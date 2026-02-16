import { useRef, useEffect, useCallback } from 'react'
import type { GridType } from '../types'
import {
  getCellColor,
  getCellBlur,
  getResponsiveCellSize,
  CELL_CORNER_RADIUS,
  BACKGROUND_COLOR,
  GRID_LINE_COLOR,
  drawRoundedRect,
} from '../lib/canvasUtils'

export interface CellAnimation {
  row: number
  col: number
  type: 'birth' | 'death'
  startTime: number
  duration: number
}

interface CanvasGridProps {
  grid: GridType
  showGridLines: boolean
  cellSize?: number
  animations?: CellAnimation[]
  showInvalidAction?: { row: number; col: number } | null
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
  animations = [],
  showInvalidAction = null,
  onClick,
  onMouseMove,
  onMouseLeave,
}: CanvasGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)

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

    const now = window.performance.now()
    const animationMap = new Map(animations.map((a) => [`${a.row},${a.col}`, a]))

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

          const animation = animationMap.get(`${row},${col}`)
          if (animation && animation.type === 'birth') {
            const elapsed = now - animation.startTime
            const progress = Math.min(elapsed / animation.duration, 1)
            const easeProgress = 1 - Math.pow(1 - progress, 3)

            ctx.globalAlpha = easeProgress
            const scale = easeProgress
            const centerX = x + actualCellSize / 2
            const centerY = y + actualCellSize / 2
            ctx.translate(centerX, centerY)
            ctx.scale(scale, scale)
            ctx.translate(-centerX, -centerY)
          }

          const radius = CELL_CORNER_RADIUS

          ctx.beginPath()
          drawRoundedRect(ctx, x + 1, y + 1, actualCellSize - 2, actualCellSize - 2, radius)
          ctx.fill()
          ctx.restore()
        }
      }
    }

    for (const animation of animations) {
      if (animation.type === 'death') {
        const elapsed = now - animation.startTime
        const progress = Math.min(elapsed / animation.duration, 1)
        const easeProgress = Math.pow(progress, 2)

        if (progress < 1) {
          const x = animation.col * actualCellSize
          const y = animation.row * actualCellSize
          const scale = 1 - easeProgress

          ctx.save()
          ctx.fillStyle = '#00ffff'
          ctx.globalAlpha = 1 - easeProgress

          const centerX = x + actualCellSize / 2
          const centerY = y + actualCellSize / 2
          ctx.translate(centerX, centerY)
          ctx.scale(scale, scale)
          ctx.translate(-centerX, -centerY)

          const radius = CELL_CORNER_RADIUS

          ctx.beginPath()
          drawRoundedRect(ctx, x + 1, y + 1, actualCellSize - 2, actualCellSize - 2, radius)
          ctx.fill()
          ctx.restore()
        }
      }
    }

    if (showInvalidAction) {
      const x = showInvalidAction.col * actualCellSize
      const y = showInvalidAction.row * actualCellSize

      ctx.save()
      ctx.strokeStyle = '#ff0000'
      ctx.lineWidth = 2
      ctx.globalAlpha = 0.8

      ctx.beginPath()
      drawRoundedRect(ctx, x + 1, y + 1, actualCellSize - 2, actualCellSize - 2, 2)
      ctx.stroke()

      ctx.restore()
    }

    const intensity = Math.min(activeCount / 500, 1)
    document.documentElement.style.setProperty('--life-intensity', intensity.toString())
  }, [grid, showGridLines, actualCellSize, animations, showInvalidAction])

  useEffect(() => {
    const render = () => {
      draw()
      if (animations.length > 0) {
        animationFrameRef.current = window.requestAnimationFrame(render)
      }
    }

    render()

    return () => {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [draw, animations.length])

  return (
    <canvas
      ref={canvasRef}
      style={{ touchAction: 'none' }}
      onClick={onClick}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      role="img"
      aria-label={`Game of Life grid with ${grid.reduce((sum, row) => sum + row.filter((cell) => cell > 0).length, 0)} alive cells`}
    />
  )
}
