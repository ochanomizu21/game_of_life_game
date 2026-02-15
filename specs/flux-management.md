# Spec: Flux Management

## Overview
Resource management system for strategic cell placement. Players have a limited pool of "Flux" to place cells during both PLANNING and PLAYING phases. Flux can be saved during planning for use during play phase.

## Functional Requirements

### Core Mechanics
- **Initial Allocation**: Each level starts with 20 Flux (configurable via expert settings, range: 5-50)
- **Placement Cost**: Each cell placed costs exactly 1 Flux (same cost in both phases)
- **Refund Mechanic**: Clicking an existing cell during PLANNING phase removes it and refunds 1 Flux (full refund)
- **No Refunds in Play Phase**: Cells placed during RUNNING phase cannot be removed
- **Zero State**: When Flux reaches 0, placement is disabled with visual/audio feedback
- **Strategic Choice**: Players decide how much Flux to use during planning vs save for play phase

### State Management
```typescript
interface FluxState {
  current: number;           // Available Flux
  initial: number;           // Starting amount for level
  placed: number;            // Total cells placed (for stats)
  removed: number;          // Total cells removed (for stats)
}
```

### Validation Rules
- Cannot place cell if Flux < 1
- Cannot place cell outside grid bounds
- Refund only applies during PLANNING phase
- No refunds during RUNNING or FINISHED phases
- Can place cells during RUNNING phase using saved Flux
- No remove functionality during RUNNING phase (add-only)

## UI/UX Requirements

### HUD Display
- **Location**: Bottom center of screen
- **Visual**: Bar or counter showing current/initial
- **Color Coding**:
   - Green/Yellow when plenty remaining
   - Orange when < 30% remaining
   - Red when 0 remaining
- **Animation**: Smooth transitions when values change
- **Phase Indication**: Always visible in both PLANNING and RUNNING phases

### Feedback
- **Insufficient Resources**: 
  - Audio: Error/denied sound
  - Visual: Brief red flash on Flux counter
- **Placement**: 
  - Audio: Soft "plop" sound
  - Visual: Cell appears with fade-in animation
- **Removal**: 
  - Audio: Suction/remove sound
  - Visual: Cell shrinks and disappears

## Edge Cases

1. **Zero Flux at Start**: If initial Flux is 0, game should warn or prevent level start
2. **Accidental Removal**: User might misclick during planning - no undo needed since they can just place again
3. **Lag Between Click and Update**: Ensure Flux decrement is atomic with cell placement to prevent race conditions
4. **Strategic Decisions**: Players must balance using Flux in planning vs saving for play phase
5. **Play Phase Placement**: Must coordinate with simulation step to prevent race conditions

## Implementation Notes

- Store Flux in React state (useState or useReducer)
- Flux changes should be logged for analytics/debugging
- Consider debouncing rapid clicks to prevent accidental over-spending
- Mobile: Ensure touch targets are large enough to prevent misclicks
- Play phase placement must use timing coordination with simulation step
- Queue placements if player clicks mid-simulation step
- Flux counter resets every level (no carryover between levels)

