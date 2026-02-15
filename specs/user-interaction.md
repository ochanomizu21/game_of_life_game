# Spec: User Interaction System

## Overview
The user interaction system handles mouse and touch input for drawing and erasing cells on the grid with real-time visual feedback and sound generation.

## Functional Requirements

### Interaction Modes
```typescript
type InteractionMode = 'draw' | 'erase';
```

**Draw Mode**: Click/drag to place live cells (age=1)
**Erase Mode**: Click/drag to remove cells (set to 0)

### Mouse Interaction

#### Mouse Down
1. Capture mouse position relative to canvas
2. Convert to grid coordinates: `c = floor(x / (canvasWidth / numCols))`
3. Trigger interaction handler with type='down'

#### Mouse Move (while pressed)
1. Capture mouse position
2. Convert to grid coordinates
3. Trigger interaction handler with type='enter'

#### Mouse Up (global)
1. Set `isMouseDown` state to false
2. Prevent stale drag state

### Touch Interaction

#### Touch Start
1. Prevent default (stop scrolling)
2. Capture first touch position
3. Convert to grid coordinates
4. Trigger interaction handler with type='down'

#### Touch Move
1. Prevent default (stop scrolling)
2. Capture first touch position
3. Convert to grid coordinates
4. Trigger interaction handler with type='enter'

#### Touch End / Cancel
1. Set `isMouseDown` state to false

## Implementation Architecture

### Coordinate Mapping
```typescript
interface GridCoordinates {
  row: number; // 0 to numRows-1
  col: number; // 0 to numCols-1
}

function getCellFromEvent(
  event: MouseEvent | TouchEvent,
  canvas: HTMLCanvasElement,
  numRows: number,
  numCols: number
): GridCoordinates
```

### Interaction Handler
```typescript
function handleCellInteract(
  row: number,
  col: number,
  type: 'down' | 'enter'
): void
```

- **type='down'**: Modify cell(s)
- **type='enter'**: Only modify if mouse down

### Sound Integration
- **Draw/Erase**: Play interaction sound (different tones)
- **Sound Engine**: Called per cell interaction

## Edge Cases

1. **Boundary Coordinates**: Math.floor() ensures valid indices
2. **Rapid Clicking**: Multiple clicks allowed
3. **Canvas Resize**: Grid dimensions update, coordinates recalculate
4. **Touch Conflicts**: PreventDefault() blocks browser zoom/scroll
5. **Mouse Leave Canvas**: Set isMouseDown to false to stop drag

## Mobile Considerations

- **Touch Action**: `touch-action: none` on canvas element
- **Target Size**: Responsive cell size (18px mobile, 20px desktop) meets minimum touch target
- **Prevent Default**: Stop scrolling while drawing
- **Multi-touch**: Only first touch used (ignore additional touches)

## Visual Feedback

- **Cursor**: `crosshair` style over canvas
- **Hover Effects**: None (draw directly on grid)
- **Selection Feedback**: No preview shown (immediate drawing)

## Dependencies

- Core simulation engine: Grid ref and dimensions
- Audio sonification system: Play interaction sounds
- Canvas rendering system: Redraw on state change
