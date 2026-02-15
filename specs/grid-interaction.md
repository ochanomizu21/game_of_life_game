# Spec: Grid Interaction

## Overview
Direct manipulation interface for placing and removing cells on the Game of Life grid during PLANNING phase.

## Functional Requirements

### Placement Mode (PLANNING Phase)
- **Click to Place**: Single click on empty grid cell places a live cell
- **Click to Remove**: Single click on existing live cell removes it and refunds Flux
- **Visual Feedback**: Cursor changes to indicate placeable vs non-placeable areas
- **Minimum Cells Rule**: START button disabled until at least 1 cell has been placed

### Interaction Constraints
- Disabled entirely during RUNNING phase
- Disabled during FINISHED phase
- Grid cells must be clickable on both desktop (mouse) and mobile (touch)
- Touch targets minimum 44x44px for mobile accessibility

### Coordinate System
```typescript
interface GridInteraction {
  cellX: number;        // 0 to gridWidth-1
  cellY: number;        // 0 to gridHeight-1
  isPlaceable: boolean; // Calculated based on Flux and existing cell
}
```

## UI/UX Requirements

### Cursor States
- **Default**: Standard cursor
- **Over Empty Cell (Placeable)**: Crosshair or cell preview outline
- **Over Empty Cell (Unplaceable)**: Forbidden symbol (Flux = 0)
- **Over Live Cell (Removable)**: Minus icon or highlight

### Visual Feedback
- **Cell Preview**: Ghost/outline of cell follows cursor when hovering over grid
- **Cell Placement**: Fade-in animation (0.1s duration)
- **Cell Removal**: Shrink animation (0.15s duration)
- **Invalid Action**: Brief red flash on cursor location

### Mobile Considerations
- Pinch-to-zoom disabled on game grid
- Touch-and-hold to drag not needed (single click only)
- Prevent accidental browser zoom on double-tap
- Visual ripple effect on touch

## Edge Cases

1. **Rapid Clicking**: User might click faster than animation - ensure state consistency
2. **Edge of Grid**: Clicking exactly on grid boundary should round to nearest cell
3. **Overlapping with UI**: Ensure grid doesn't extend under HUD elements
4. **Window Resize**: Grid cells must maintain aspect ratio on resize

## Implementation Notes

- Use event delegation for grid click handling
- Calculate cell coordinates from mouse/touch position: `cellX = Math.floor((x - gridOffsetX) / cellSize)`
- Consider using CSS Grid or Canvas for rendering - Canvas may be better for performance with many cells
- Implement hit testing to distinguish between grid cells and gaps
