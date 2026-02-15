# Spec: Canvas Rendering System

## Overview
The canvas rendering system draws the Game of Life grid with age-based neon color gradients and glow effects using HTML5 Canvas for high-performance rendering.

## Functional Requirements

### Rendering Theme
**Dark Neon Theme**:
- Background: `#0a0a0f` (very dark blue-black)
- Grid lines: `#1a1a2e` (subtle, only during PLANNING phase)

**Cell Age-Based Colors**:
- Age 0 (just born): `#00ffff` (bright cyan, intense glow)
- Age 1-2: `#61dafb` (React blue, medium glow)
- Age 3-5: `#ff00ff` (magenta/pink, subtle glow)
- Age 6+: `#4a00ff` (deep purple, minimal glow)

**Glow Effects**:
- Age 0: Shadow blur = 15px (highly visible)
- Age 1-2: Shadow blur = 8px
- Age 3-5: Shadow blur = 4px
- Age 6+: Shadow blur = 2px

### Cell Rendering
- **Cell Size**: Responsive (18px mobile, 20px desktop)
- **Age-Based Colors**: Color computed from cell state value
- **Glow Effects**: Shadow blur and shadow color applied
- **Shape**: Square with slight corner radius (2px)

### Grid Lines
- **Visibility**: Toggleable (keyboard shortcut: 'G' key), only shown when not running
- **Color**: `#1a1a2e` (subtle)
- **Stroke Width**: 1px
- **Position**: Around each cell
- **Default**: Hidden during RUNNING phase, visible during PLANNING phase

## Implementation Architecture

### Canvas Setup
```typescript
interface CanvasConfig {
  width: number;  // numCols * cellSize
  height: number; // numRows * cellSize
  dpr: number;   // window.devicePixelRatio
  cellSize: number; // 18px (mobile) or 20px (desktop)
}
```

### Responsive Cell Sizing
- Mobile devices (screen width < 768px): 18px cells
- Desktop devices (screen width >= 768px): 20px cells
- Cell size updates on window resize
- Grid dimensions recalculate based on cell size

### Rendering Pipeline
1. **Canvas Resize**: Update width/height if dimensions changed
2. **Transform Reset**: Clear and apply DPR scaling
3. **Draw Loop**:
   - Clear canvas with background color
   - Draw grid lines (if enabled)
   - Draw live cells with age-based styling and glow
4. **Intensity Update**: Set CSS variable `--life-intensity`

### Performance Optimizations
- **DPR Scaling**: Use `window.devicePixelRatio` for sharp rendering
- **Transform Reset**: Clear transform before resize
- **Optimized Draws**: Minimize context state changes
- **Dependency Tracking**: useCallback on [numRows, numCols, cellSize]

## Visual Effects

### Glow/Shadows
```typescript
interface CellShadow {
  blur: number;    // 2px to 15px based on age
  color: string;  // Matches cell color
}
```

### Intensity Metric
```typescript
const intensity = Math.min(activeCount / 500, 1);
document.documentElement.style.setProperty('--life-intensity', intensity.toString());
```
- Used for CSS-based ambient effects
- Scaled from 0-500 cells

## Edge Cases

1. **Canvas Resize**: Must handle width/height update, DPR scaling, and cell size recalculation together
2. **Empty Grid**: Draws only grid lines (if enabled)
3. **High Cell Count**: May have performance issues with 500+ cells
4. **Rapid Cell Size Changes**: Color computations cached per frame

## Mobile Considerations

- Touch coordinates mapped to canvas space
- Prevent browser zoom on canvas interaction
- Maintain 18px cell size on mobile
- Ensure minimum 10 cells visible in smallest dimension

## Dependencies

- Core simulation engine: Provides grid state and dimensions
- UI/overlay system: Grid line toggle setting
- User interaction system: Triggers redraws on cell changes
