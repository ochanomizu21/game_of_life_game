export interface GridCoordinates {
  row: number
  col: number
}

export function getCellFromEvent(
  event: MouseEvent | TouchEvent,
  canvas: HTMLCanvasElement,
  numRows: number,
  numCols: number
): GridCoordinates {
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height

  let clientX: number
  let clientY: number

  if (event instanceof MouseEvent) {
    clientX = event.clientX
    clientY = event.clientY
  } else {
    const touch = event.touches[0] || event.changedTouches[0]
    clientX = touch.clientX
    clientY = touch.clientY
  }

  const x = (clientX - rect.left) * scaleX
  const y = (clientY - rect.top) * scaleY

  const cellWidth = canvas.width / numCols
  const cellHeight = canvas.height / numRows

  return {
    row: Math.floor(y / cellHeight),
    col: Math.floor(x / cellWidth),
  }
}

export function isWithinBounds(
  row: number,
  col: number,
  numRows: number,
  numCols: number
): boolean {
  return row >= 0 && row < numRows && col >= 0 && col < numCols
}

export interface InteractionState {
  isMouseDown: boolean
  currentCell: GridCoordinates | null
}

export function createInitialInteractionState(): InteractionState {
  return {
    isMouseDown: false,
    currentCell: null,
  }
}
