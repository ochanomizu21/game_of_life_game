# Spec: Core Simulation Engine

## Overview
The simulation engine computes cellular automaton generations using Conway's Game of Life rules, tracking cell ages and managing grid state evolution with toroidal boundary conditions.

## Functional Requirements

### Rule Configuration
```typescript
interface RuleSet {
  name: string;
  born: number[];    // Neighbor counts that cause birth
  survive: number[]; // Neighbor counts that allow survival
}
```
**Available Rules**:
- Conway (Standard): born=[3], survive=[2,3]

### Grid Computation
- **Cell State**: Integer where 0 = dead, >0 = alive (value = age in generations)
- **Neighbor Counting**: Moore neighborhood (8 adjacent cells)
- **Boundary Conditions**: Toroidal (wraps edges)
- **Age Tracking**: Surviving cells increment age each generation

### Simulation Step Process
1. Create deep copy of current grid (double buffer)
2. Iterate through all cells
3. Count neighbors using modulo arithmetic for toroidal boundaries
4. Apply rule set (born/survive arrays)
5. Update cell state (0 for death, 1 for birth, age+1 for survival)
6. Swap buffers

### Performance Optimization
- **Direct Grid Access**: Uses React ref instead of state for render-avoidance
- **Precomputed Operations**: Neighbor offset array [[0,1], [0,-1], [1,-1], [-1,1], [1,1], [-1,-1], [1,0], [-1,0]]
- **Generation Counter**: Triggers React render only when needed

## Data Structures

```typescript
type GridType = number[][]; // Age-based cell storage

interface SimulationState {
  grid: GridType;
  generation: number;
  running: boolean;
  speed: number; // ms between steps
  selectedRule: RuleSet;
}
```

## Implementation Notes

### Neighbor Counting Algorithm
```typescript
for (let i = 0; i < rows; i++) {
  for (let k = 0; k < cols; k++) {
    let neighbors = 0;
    OPERATIONS.forEach(([x, y]) => {
      const newI = (i + x + rows) % rows;
      const newK = (k + y + cols) % cols;
      if (g[newI][newK] > 0) neighbors++;
    });
    // Apply rules...
  }
}
```

### Audio Integration
- Birth events tracked: count and row position
- Average row position passed to sound engine for pitch mapping

### Speed Control
- Uses `requestAnimationFrame` with delta time check
- Configurable speed: 10ms to 500ms between steps
- Speed ref used to avoid state dependency in animation loop

## Edge Cases

1. **Empty Grid**: Simulation continues running with no births
2. **Static Patterns**: Still lifes survive indefinitely (e.g., block, beehive)
3. **Grid Resizing**: Clears history and resets when dimensions change
4. **Rapid Speed Changes**: Speed ref updated immediately, no queue

## Dependencies

- Canvas rendering system: Receives grid state for visualization
- Audio sonification system: Receives birth statistics
- User interaction system: Modifies grid directly via ref
