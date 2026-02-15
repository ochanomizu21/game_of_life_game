# Spec: Scoring System

## Overview
Real-time score calculation based on cellular pattern classifications, with points awarded per generation.

## Functional Requirements

### Scoring Formula
```typescript
interface ScoringConfig {
  moverPointsPerGeneration: number;      // Default: 10, range: 1-100
  oscillatorPointsPerGeneration: number;   // Default: 2, range: 0-20
  staticPointsPerGeneration: number;     // Always 0
  scoreMultiplier: number;                 // Default: 1.0, range: 0.1-5.0
}

interface ScoreState {
  currentScore: number;
  generationScore: number;      // Score earned this generation
  totalPatternsTracked: number; // Stats: total patterns ever detected
}
```

### Per-Generation Calculation
For each generation during RUNNING phase:

```typescript
function calculateGenerationScore(
  trackedClusters: TrackedCluster[],
  config: ScoringConfig
): number {
  let generationScore = 0;
  
  for (const cluster of trackedClusters) {
    switch (cluster.classification) {
      case 'MOVER':
        generationScore += config.moverPointsPerGeneration;
        break;
      case 'OSCILLATOR':
        generationScore += config.oscillatorPointsPerGeneration;
        break;
      case 'STATIC':
        // No points for static patterns
        break;
    }
  }
  
  return generationScore * config.scoreMultiplier;
}

// Update score each generation
scoreState.currentScore += calculateGenerationScore(clusters, config);
```

### Scoring Visibility
- Real-time: Score updates every generation during RUNNING phase
- Smooth animation: Number counting up effect (lerp over 0.2s)
- Milestones: Brief flash every 100 points (optional)

## UI/UX Requirements

### Score Display
- **Location**: Top-left of screen
- **Format**: Large number with "PTS" label
- **Animation**: 
  - Smooth increment when score changes
  - Brief pulse/flash on point gain
  - Color: White/bright, stands out from grid

### Pattern Breakdown (Optional)
- Small sub-display showing:
  - Active Movers: [count]
  - Active Oscillators: [count]
  - Current Rate: [points/gen]

### End-of-Level Stats
Display on FINISHED phase:
- Final Score: [number]
- Time Survived: [seconds]
- Patterns Created: [count]

## Edge Cases

1. **Score Overflow**: Cap score at MAX_SAFE_INTEGER (9,007,199,254,740,991) to prevent overflow issues
2. **Negative Multiplier**: Expert settings validation should prevent negative multipliers
3. **Zero Points Generation**: Possible if no patterns active - ensure UI handles gracefully
4. **Score Calculation Lag**: If tracking takes >16ms, could delay score update - decouple from render

## Score Persistence

**Per-Level Reset**: Score resets to 0 at the start of each level (no carry-over)
**High Score Tracking**: Save highest score achieved per level to localStorage for player progress tracking

## Implementation Notes

- Scoring must be deterministic (same patterns = same score)
- Calculate in separate thread or use requestIdleCallback if heavy
- Store config in expert settings with defaults:
  - moverPointsPerGeneration: 10 (high reward for movement)
  - oscillatorPointsPerGeneration: 2 (small reward for activity)
  - staticPointsPerGeneration: 0 (no reward)
  - scoreMultiplier: 1.0
