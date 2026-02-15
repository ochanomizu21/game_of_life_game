# Spec: Level Progression

## Overview
Progressive difficulty system where players advance through levels with increasing time limits and limited Flux. The goal is to maximize points within each level's time limit and Flux budget.

## Functional Requirements

### Level Configuration Schema
```typescript
interface LevelConfig {
  levelNumber: number;
  timeLimitSeconds: number;    // Increases with each level
  initialFlux: number;          // Flux available for the level
}

interface LevelProgression {
  currentLevel: number;
  maxUnlockedLevel: number;      // For future: level select screen
  totalScore: number;            // Cumulative score across all levels
  levels: LevelConfig[];         // Array of level definitions
}
```

### Difficulty Scaling (Expert Settings Configurable)
Default strategy: **Increase time for difficulty**

```typescript
const defaultLevelGeneration = (levelNum: number): LevelConfig => ({
  levelNumber: levelNum,
  timeLimitSeconds: 45 + (levelNum - 1) * 15,  // 45, 60, 75, 90...
  initialFlux: 20                            // Constant for now
});
```

Alternative strategies (selectable in Expert Settings):
- **Time Only**: Increase time, constant Flux
- **Resource Only**: Constant time, decrease Flux
- **Mixed**: Both time and Flux adjusted
- **Extreme**: Increase time slightly but aggressively reduce Flux

### Progression Flow
1. Player completes level N (timer reaches 0 or all cells die)
2. Screen fades out over 2.0s
3. Loading/interstitial (2.0s)
4. Screen fades in to level N+1 with fresh grid
5. Reset to PLANNING phase with fresh Flux
6. Score accumulated across all levels

### Game Objective
- **Goal**: Maximize points within time limit and Flux budget
- **Score Calculation**: Based on kinetic energy, cell activity, and survival (see scoring-system.md)
- **Level Completion**: Timer reaches 0 OR all cells die (score stops accumulating)
- **No Lose Condition**: Game always advances to next level; only score accumulation varies

## UI/UX Requirements

### Level Display
- **Current Level**: Show "Level X" in corner of screen
- **Progress**: Optional progress bar showing X of Y levels
- **Level Complete**: Brief "Level X Complete" message during transition

### Transition Effects
- **Fade Out**: 2.0s ease-out to black
- **Interstitial**: Level number display (2.0s)
- **Fade In**: 2.0s ease-in from black
- **Sound**: Transition whoosh/complete sound effect
- **Skip**: Press Space/ESC to skip to next level immediately

### End of Game
- After final level (configurable, default 10), show victory screen
- Display total accumulated score across all levels
- Option to restart from level 1 or return to menu

## Edge Cases

1. **Level 0 or Invalid**: Default to level 1 if undefined
2. **Last Level**: Show victory screen with total score
3. **Browser Refresh**: Save progress in localStorage? (Optional persistence)
4. **All Cells Die Early**: Level ends immediately, score stops accumulating, game advances to next level

## Implementation Notes

- Store level configs in JSON or TypeScript object
- Generate levels dynamically or use static array
- Total levels configurable in Expert Settings
- Level progression increments on level completion (no win/lose condition)
- Score accumulates across all levels (totalScore tracked separately)
- Fade transitions use CSS opacity with 2s duration
- Simulation stops when level ends, starts fresh for next level (no carryover)
