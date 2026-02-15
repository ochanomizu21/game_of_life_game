# Spec: Phase Management

## Overview
State machine governing the three core game phases: PLANNING → RUNNING → FINISHED.

## Functional Requirements

### Phase Definitions

#### PLANNING Phase
- **Entry Condition**: Level initialization or restart
- **Duration**: Unlimited (player controls when to start)
- **Allowed Actions**: Place/remove cells using Flux
- **START Button**: Visible and enabled when ≥1 cell placed
- **Exit Condition**: Player clicks START button

#### RUNNING Phase
- **Entry Condition**: Countdown finishes (3, 2, 1...) after player clicked START
- **Duration**: Fixed countdown timer (level-specific, starts at 45s base)
- **Allowed Actions**: Cell placement using saved Flux (add-only)
- **Simulation**: Game of Life rules execute automatically
- **Exit Conditions**:
   - Timer reaches 0 → FINISHED (score finalization)
   - All cells die → FINISHED (score stops accumulating, level ends)

#### FINISHED Phase
- **Entry Condition**: Timer expires or all cells die
- **Duration**: Brief pause before auto-advance (2.0s)
- **Allowed Actions**: None (view-only)
- **Outcome Display**: Show score, cells alive
- **Exit Condition**: Auto-advance after 2.0s (fade transition to next level)
- **Simulation**: Stops completely, no carryover to next level

### State Machine
```typescript
type GamePhase = 'PLANNING' | 'RUNNING' | 'FINISHED';

interface PhaseState {
  current: GamePhase;
  canTransition: boolean;
  blockers: string[]; // Reasons why transition blocked
}

const transitions = {
  'PLANNING': ['COUNTDOWN', 'RUNNING'],
  'COUNTDOWN': ['RUNNING'],
  'RUNNING': ['FINISHED'],
  'FINISHED': ['PLANNING'] // Auto-triggered, circular to next level
};
```

## UI/UX Requirements

### Phase Indicators
- **PLANNING**:
   - "Place your cells" text or icon
   - START button prominent (enabled when ≥1 cell placed)
   - Flux counter visible
- **COUNTDOWN**:
   - Large "3... 2... 1..." display
   - No input accepted
   - Simulation NOT running yet
- **RUNNING**:
   - Timer prominently displayed (countdown)
   - "Simulation Running" indicator
   - Score ticking up in real-time
   - Flux counter visible (if any saved)
- **FINISHED**:
   - "Time's Up" or "Level Complete" message
   - Final score display
   - Brief stats (cells alive)
   - Auto-advance countdown indicator

### Phase Transitions
- **PLANNING → COUNTDOWN**:
   - Player clicks START button
   - Immediate transition to countdown
- **COUNTDOWN → RUNNING**:
   - "3, 2, 1" countdown completes
   - Simulation starts immediately
   - Sound effect: "Simulation starting"
- **RUNNING → FINISHED**:
   - Timer hits 0 OR all cells die
   - Simulation stops immediately
   - Sound effect: "Level complete" or timer expiration
- **FINISHED → PLANNING** (next level):
   - Fade out current screen (2.0s)
   - Fade in new level (2.0s)
   - Fresh grid, fresh Flux, no carryover

## Edge Cases

1. **Zero Cells at Start**: START button disabled until ≥1 cell placed
2. **All Cells Die Early**: Level ends immediately, score stops, advances to next level
3. **Browser Tab Switch**: Timer continues running when tab inactive
4. **Rapid Phase Switching**: Prevent clicking START multiple times rapidly
5. **Countdown Interrupted**: No input allowed during countdown phase
6. **Level Transition**: No simulation carryover between levels - fresh start each level

## Implementation Notes

- Use React useReducer for phase state management
- Add COUNTDOWN phase between PLANNING and RUNNING
- Phase transitions should be guarded (can't skip phases)
- Timer must use accurate timing (Date.now() or performance.now())
- Simulation must NOT start until countdown completes
- Level transition stops simulation completely - no carryover
- Consider using a state machine library like XState if complexity grows
- Log phase transitions for debugging
