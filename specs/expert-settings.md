# Spec: Expert Settings / Dev Panel

## Overview
Hidden configuration interface for tuning game mechanics, balancing parameters, and debugging. Accessible during development and for advanced users to find optimal parametrization.

## Functional Requirements

### Access Methods
```typescript
interface ExpertSettingsAccess {
  keyboardShortcut: string;      // '`' (backtick) for quick access
  menuPath: string;              // "Settings → Advanced → Expert Mode" (if menu system exists)
  gesture: string;               // Mobile: triple-tap top-left corner
}
```

### Configurable Parameters

#### Movement Detection Parameters
```typescript
interface MovementDetectionParams {
  centroidHistoryLength: number;       // Generations to track (default: 5, range: 3-10)
  movementThreshold: number;           // Cells to be "moving" (default: 0.5, range: 0.1-2.0)
  minClusterSize: number;            // Minimum cells to track (default: 1, range: 1-5)
}
```

#### Scoring Parameters
```typescript
interface ScoringParams {
  moverPointsPerGeneration: number;      // Default: 10, range: 1-100
  oscillatorPointsPerGeneration: number;   // Default: 2, range: 0-20
  scoreMultiplier: number;                // Default: 1.0, range: 0.1-5.0
}
```

#### Level Generation Parameters
```typescript
interface LevelGenerationParams {
  baseTimeSeconds: number;                // Default: 45, range: 10-120
  timeIncrementPerLevel: number;          // Default: 15, range: 0-60
  baseFlux: number;                       // Default: 20, range: 5-50
  difficultyScalingMode: 'TIME_ONLY' | 'RESOURCE_ONLY' | 'MIXED' | 'EXTREME';
}
```

#### Grid Sizing Parameters
```typescript
interface GridSizingParams {
  mobileCellSize: number;                 // Default: 18, range: 14-24
  desktopCellSize: number;                // Default: 20, range: 16-28
  minVisibleCells: number;                // Default: 10, minimum cells visible
}
```

### Settings Persistence
- Save to localStorage under key `gol-expert-settings`
- Load on app startup
- "Reset to Defaults" button with confirmation
- Export/Import settings as JSON (for sharing configurations)

## UI/UX Requirements

### Panel Layout
- **Position**: Modal overlay, centered or right sidebar
- **Sections**: Collapsible groups by category (Movement, Scoring, Levels, Grid)
- **Controls**:
  - Sliders for numeric ranges
  - Number inputs for precise values
  - Dropdowns for mode selection

### Real-Time Updates
- Changes apply immediately (no restart required)
- Visual indicator when value differs from default
- "Revert" button per section
- Live preview: Show parameter effects in real-time if possible

### Danger Zone
- Separate section for "Break Things" settings
- Require confirmation for extreme values
- Show warning if settings would make game impossible

### Export/Import
- "Export JSON" button downloads current config
- "Import JSON" file picker loads config
- Validate imported JSON against schema

## Edge Cases

1. **Invalid Values**: Input validation prevents negative numbers, out-of-range values
2. **Settings While Running**: Changes to scoring apply immediately; level changes apply on next level
3. **Reset During Game**: Reset to defaults should warn if game in progress
4. **Corrupted Storage**: If localStorage has invalid JSON, fall back to defaults
5. **Mobile Access**: Ensure gesture detection doesn't conflict with game controls

## Implementation Notes

- Use React Context or Zustand for settings state
- Validate all inputs with constraints
- Schema validation using Zod or similar
- Default values should create balanced, playable game
- Consider "Presets" dropdown ("Easy", "Normal", "Hard", "Chaos")
- Expert settings should be accessible but not intrusive
- Document each parameter with tooltip explaining its effect
