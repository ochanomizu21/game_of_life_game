# Spec: Movement Detection (Centroid Tracking)

## Overview
Algorithmic system to detect and classify cellular movement patterns by tracking centroids of connected cell clusters over time.

## Functional Requirements

### Connected Component Detection
Identify clusters of adjacent live cells using 8-connectivity (include diagonals):

```typescript
interface CellCluster {
  id: string;                    // Unique identifier (e.g., hash of coordinates)
  cells: Set<string>;             // Set of "x,y" coordinate strings
  centroid: { x: number; y: number };  // Average of all cell positions
  generation: number;             // When this cluster was first identified
}

function findConnectedComponents(grid: boolean[][]): CellCluster[];
```

### Centroid Tracking
Track cluster centroids across generations to calculate velocity:

```typescript
interface TrackedCluster extends CellCluster {
  centroidHistory: { x: number; y: number }[];  // Last N centroids
  velocity: { dx: number; dy: number };         // Calculated movement vector
  classification: 'MOVER' | 'OSCILLATOR' | 'STATIC';
}

interface TrackingConfig {
  historyLength: number;        // Generations to track (expert setting, default: 5)
  movementThreshold: number;      // Min distance to be considered moving (default: 0.5 cells)
}
```

### Classification Algorithm
For each cluster with sufficient history:

1. **Calculate Centroid Velocity**: 
   - `dx = (current.x - history[0].x) / historyLength`
   - `dy = (current.y - history[0].y) / historyLength`

2. **Classify**:
   - **MOVER**: `|dx| > threshold` OR `|dy| > threshold` (centroid is translating)
   - **OSCILLATOR**: Centroid static (within threshold) BUT cell set changes between generations (cells are moving locally)
   - **STATIC**: Centroid static AND cell set unchanged

3. **Cluster Persistence**:
   - Match clusters across generations by nearest centroid
   - Handle cluster splits/merges (edge case: when two gliders collide)

## UI/UX Requirements

### Performance Indicators
- Show "active patterns" count in HUD
- Highlight moving patterns with subtle glow effect

## Edge Cases

 1. **Cluster Split**: One cluster becomes two (e.g., glider collision) - track both as new clusters or attempt lineage?
 2. **Cluster Merge**: Two clusters become one - classification reset to avoid double-counting
 3. **Oscillator Period Detection**: Blinker has period 2, Pulsar has period 3 - centroid stays same but cells swap
 4. **Glider Guns**: Stationary structure producing moving gliders - gun is Static, produced gliders are Movers
 5. **Minimum Cluster Size**: Single isolated cell - treat as cluster of size 1 or ignore?
 6. **Large Grid Performance**: With 100x100 grid (performance benchmark, not a game configuration), expect ~50-200 clusters max - must process in < 16ms for 60fps

## Implementation Notes

- Run connected component analysis every generation during RUNNING phase
- Store cluster history in circular buffer (efficient memory usage)
- Use Manhattan distance or Euclidean for centroid matching
- Performance requirements must scale with actual game grid sizes (20×30, 40×50, 60×80)
- Optimization: Only recompute centroids for changed regions, not full grid
- Memory: Limit history buffer size to prevent unbounded growth
