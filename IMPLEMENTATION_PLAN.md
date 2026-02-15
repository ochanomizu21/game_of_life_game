# Implementation Plan

This plan prioritizes building a playable, enjoyable game first, then incrementally enhances with advanced features. All requirements from 14 specification files are included with proper dependencies and priorities.

---

## Sprint 1: Foundation (MVP Core)

_Goal: Basic Game of Life with visualization, interaction, and game flow_

### 1.1 Project Setup & Build System (CRITICAL - FIRST PRIORITY)

- [x] Choose and initialize framework (React/Vite recommended for performance) - React + Vite initialized
- [x] Initialize TypeScript project with strict mode - tsconfig.json created with strict mode
- [x] Configure Vite build system - vite.config.ts configured
- [x] Set up ESLint and Prettier - eslint.config.js and .prettierrc.json created
- [x] Create project structure:
  - src/components/ - React components
  - src/lib/ - Shared utilities and core logic
  - src/types/ - TypeScript type definitions
  - src/hooks/ - Custom React hooks
  - src/styles/ - CSS/styling
- [x] Configure paths and aliases in tsconfig.json - All aliases configured
- [x] Create package.json with dependencies - package.json configured with all scripts and dependencies

**Dependencies**: None
**Enables**: All development

### 1.2 Type Definitions (CRITICAL)

- [x] Create core types (src/types/index.ts)
  - [x] GridType (number[][]) - Age-based cell storage
  - [x] GamePhase enum (PLANNING | COUNTDOWN | RUNNING | FINISHED)
  - [x] InteractionMode enum (DRAW | ERASE)
  - [x] CellCluster interface (cells, centroid, generation)
  - [x] TrackedCluster interface (extends CellCluster with history, velocity, classification)
  - [x] SimulationState interface (grid, generation, running, speed, selectedRule)
  - [x] RuleSet interface (born[], survive[])
  - [x] FluxState interface (current, initial, placed, removed)
  - [x] LevelConfig interface (levelNumber, timeLimitSeconds, initialFlux)
  - [x] ScoringConfig interface (moverPointsPerGeneration, oscillatorPointsPerGeneration, scoreMultiplier)
  - [x] TransitionState enum (PLAYING | FADING_OUT | INTERSTITIAL | FADING_IN | READY)
  - [x] TransitionConfig interface (fade durations, interstitial, auto-advance, skip enabled)
  - [x] SoundEngine interface - Replaced with AudioParams interface (enabled, volume, waveform)
  - [x] Various configuration interfaces (DifficultyScalingMode, LevelGenerationParams, MovementDetectionParams, GridSizingParams, AudioParams, ExpertSettings)

**Dependencies**: Project setup
**Enables**: All type-safe development

### 1.3 Shared Utilities (CRITICAL)

- [x] Implement validation utilities (src/lib/validation.ts)
  - Grid bounds checking functions
  - Coordinate validation
  - Range checking for parameters
  - Type guards for configuration objects
- [x] Implement logging utility (src/lib/logger.ts)
  - Debug/warning/error levels
  - Environment-aware (development vs production)
  - Timestamp and context support
- [x] Implement state management utilities (src/lib/state.ts)
  - useReducer patterns for complex state
  - Action creators and reducers
  - State persistence helpers

**Dependencies**: Type definitions
**Enables**: All other systems

### 1.4 Simulation Engine (CRITICAL - Core Gameplay)

- [x] Implement core Game of Life rules (src/lib/simulation.ts)
  - RuleSet interface with born/survive arrays
  - Conway's rules: born=[3], survive=[2,3]
  - Neighbor counting with Moore neighborhood (8 cells)
  - Toroidal boundary handling (wrap edges with modulo arithmetic)
  - Age tracking for cells (increment on survival, 1 for birth)
  - Double-buffer pattern for state updates
- [x] Implement performance optimizations
  - React ref for grid state (avoid re-renders)
  - Precomputed neighbor offset array [[0,1], [0,-1], [1,-1], [-1,1], [1,1], [-1,-1], [1,0], [-1,0]]
  - requestAnimationFrame with delta time control
  - Speed ref to avoid state dependency in animation loop
- [x] Add generation counter
  - Triggers React render on generation change
- [x] Implement grid resizing
  - Clear and reset on dimension changes
  - Support three grid sizes:
    - Small: 20 rows × 30 columns
    - Medium: 40 rows × 50 columns
    - Large: 60 rows × 80 columns
- [x] Track birth statistics for audio
  - Count born cells and average row position

**Dependencies**: Type definitions, validation utilities
**Enables**: canvas-rendering, user-interaction, audio-sonification, phase-management

### 1.5 Phase Management (CRITICAL - Game Flow)

- [x] Implement phase state machine (src/lib/phase.ts)
  - Phase enum: PLANNING | COUNTDOWN | RUNNING | FINISHED
  - State machine with guarded transitions
  - Transition map: PLANNING→COUNTDOWN→RUNNING→FINISHED→PLANNING
  - Blockers array for transition validation
- [x] Implement COUNTDOWN phase
  - 3-2-1 countdown display
  - No input allowed during countdown
  - Simulation NOT running until countdown completes
- [x] Implement countdown timer
  - Accurate timing with Date.now()/performance.now()
  - Countdown display UI
- [x] Implement RUNNING phase timer
  - Level-specific duration (default 45s)
  - Real-time countdown display
  - Exit condition: timer reaches 0 OR all cells die
- [x] Implement FINISHED phase
  - Pause simulation completely
  - 2.0s delay before level transition
  - Score finalization and display
- [x] Implement phase guard conditions
  - START button disabled until ≥1 cell placed
  - Prevent START button spam
  - No input during COUNTDOWN phase
  - Validate minimum 1 cell before START
- [x] Add browser tab handling
  - During gameplay: Timer continues running when tab inactive
  - During transitions: Pause timer to prevent level advancing unseen
  - Resume when tab becomes active

**Dependencies**: Type definitions, state management utilities
**Enables**: grid-interaction, level-progression, ui-overlay, transitions

### 1.6 Canvas Rendering (CRITICAL - Visualization)

- [x] Implement canvas setup (src/components/CanvasGrid.tsx)
  - DPR scaling for sharp rendering (window.devicePixelRatio)
  - Responsive cell sizing (18px mobile, 20px desktop)
  - Window resize handling with coordinate recalculation
  - Set touch-action: none on canvas element for mobile
- [x] Implement grid rendering
  - Background color (#0a0a0f)
  - Grid lines toggle (G key, only during PLANNING)
  - Line color (#1a1a2e), 1px stroke
- [x] Implement cell rendering with age-based colors
  - Age 0: #00ffff (bright cyan, 15px glow)
  - Age 1-2: #61dafb (React blue, 8px glow)
  - Age 3-5: #ff00ff (magenta, 4px glow)
  - Age 6+: #4a00ff (deep purple, 2px glow)
  - Square cells with 2px corner radius
- [x] Implement glow effects
  - Shadow blur based on age
  - Shadow color matches cell color
- [x] Implement intensity metric
  - CSS variable --life-intensity
  - Scaled from 0-500 cells
- [x] Optimize rendering pipeline
  - Minimize context state changes
  - useCallback dependency tracking

**Dependencies**: simulation-engine (needs grid state), type definitions
**Enables**: grid-interaction, ui-overlay

### 1.7 User Interaction (CRITICAL - Input Handling)

- [x] Implement mouse event handling (src/lib/interaction.ts)
  - Mouse down/move/up tracking
  - Coordinate mapping to grid cells with Math.floor()
  - Handle canvas scaling and DPR
  - Drag-to-draw support
- [x] Implement touch event handling
  - Touch start/move/end/cancel tracking
  - Prevent default (disable scroll/zoom) on all touch events
  - Multi-touch handling (use first touch only)
  - touch-action: none on canvas element
- [x] Implement coordinate mapping
  - Screen to grid conversion: c = floor(x / (canvasWidth / numCols))
  - Handle canvas scaling and DPR
- [x] Implement interaction modes
  - Draw mode (place cells, age=1)
  - Erase mode (remove cells, set to 0)
- [x] Implement cursor state management
  - Default cursor
  - Crosshair over empty placeable cell
  - Forbidden symbol when Flux=0
  - Minus icon over removable cell
- [x] Add event delegation
  - Efficient click handling on canvas
- [x] Implement boundary handling
  - Clamp coordinates to valid range
  - Prevent out-of-bounds access

**Dependencies**: simulation-engine (needs grid ref and dimensions), type definitions
**Enables**: grid-interaction, audio-sonification

### 1.8 Flux Management (CRITICAL - Resource System)

- [x] Implement flux state (src/lib/flux.ts)
  - current, initial, placed, removed tracking
  - React state or useReducer
  - Reset on each level (no carryover)
  - Default initial Flux: 20 (configurable 5-50)
- [x] Implement placement logic
  - Deduct 1 Flux per cell placement
  - Validate Flux >= 1 before placement
  - Visual feedback for insufficient Flux (red flash)
  - Queue placements if player clicks mid-simulation step
- [x] Implement refund mechanic (PLANNING phase only)
  - Refund 1 Flux when removing cells
  - No refunds during RUNNING phase
- [x] Implement play phase placement
  - Allow placement using saved Flux
  - Add-only (no removal during RUNNING)
  - Coordinate with simulation step timing
- [x] Implement Flux counter UI with color coding
  - Green/Yellow when plenty remaining (>30%)
  - Orange when <30% remaining
  - Red when 0 remaining
  - Smooth value transitions
- [x] Add audio feedback (pending - not yet implemented)
  - Placement: soft "plop" sound
  - Insufficient Flux: error/denied sound
  - Removal: suction/remove sound

**Dependencies**: Type definitions, state management utilities
**Enables**: grid-interaction

### 1.9 Grid Interaction (MVP Integration - PLAYABLE GAME)

- [x] Implement click-to-place/erase (src/components/GridInteraction.tsx)
  - Single click places live cell on empty cell
  - Single click removes live cell with Flux refund (PLANNING only)
  - Validate Flux before placement
- [x] Implement cell preview ghost outline
  - Show ghost outline of cell when hovering over grid
  - Visual feedback for placeable vs non-placeable
- [ ] Implement cell animations (pending - not yet implemented)
  - Fade-in animation (0.1s) for placement
  - Shrink animation (0.15s) for removal
  - Red flash for invalid actions
- [x] Implement minimum cells rule (ALREADY IMPLEMENTED in Game.tsx:376 and phase.ts:36-38)
  - START button disabled until ≥1 cell placed
  - Validation implemented via canStart={aliveCount > 0} in GlassHUD
- [x] Add interaction constraints
  - Disabled during COUNTDOWN phase
  - Disabled during RUNNING phase
  - Disabled during FINISHED phase
  - Touch targets 44×44px minimum for mobile
- [x] Integrate with phase management
  - Enable placement based on current phase
  - Coordinate with timer during RUNNING phase

**Dependencies**: canvas-rendering (for rendering), user-interaction (for input), flux-management (for resource logic), phase-management (for rules)
**Result**: Playable MVP (can place cells and watch simulation run)

---

## Sprint 2: Core Game Mechanics & UI

_Goal: Add scoring, progression, full UI, and polish_

### 2.1 Intro Overlay (HIGH - First Impression)

- [x] Implement cinematic intro (src/components/IntroOverlay.tsx)
  - Shows on app load
  - "CONWAY'S GAME OF LIFE" title with glitch effect
  - "ENTER VOID" CTA button
  - Background game rendering (attract mode)
  - Exit animation: 1.2s fade/scale transition
- [x] Implement intro state management
  - isIntro: showing intro overlay
  - isExiting: playing exit animation
  - enableUI: false during intro, true after exit
- [x] Handle interaction
  - Click "ENTER VOID" to start exit animation
  - Wait 1.2s for animation to complete
  - Enable UI and show game

**Dependencies**: Canvas rendering (for background), UI state management
**Enables**: Clean first impression

**Implementation Summary:**

- Implemented IntroOverlay component with cinematic presentation
- Implemented glitch effect on title using CSS animations
- Implemented attract mode simulation running in background
- Implemented exit animation with 1.2s fade and scale transition
- Implemented intro state management with three states: isIntro, isExiting, enableUI
- Integrated with Game component to control UI visibility
- Added responsive design for mobile and desktop

**Technical Decisions:**

- Used CSS keyframe animations for glitch effect (skew, translate, clip-path)
- Background simulation runs at reduced speed (200ms) for attract mode
- Used setTimeout for exit animation timing (1.2s)
- Props-based state management (onIntroComplete callback)
- Glitch effect uses text-shadow and RGB split for visual impact
- Title styled with cyberpunk aesthetic (neon colors, glitch effects)

**Test Coverage: 4 tests**

- IntroOverlay component renders correctly
- "ENTER VOID" button triggers exit animation
- Background simulation runs during intro
- UI hidden during intro, shown after completion

### 2.2 Main UI Controls (HIGH - Full Interface)

- [x] Implement glass HUD container (src/components/GlassHUD.tsx)
  - Semi-transparent glass effect (backdrop-filter: blur(10px))
  - Floating overlay on bottom of screen
  - Groups: Main controls, interaction modes, status
- [x] Implement main control buttons
  - PLAY/PAUSE toggle
  - [x] STEP button (disabled while running, only available during PLANNING phase)
  - RANDOM fill (15% density)
  - CLEAR button (red text)
- [x] Implement interaction mode buttons
  - DRAW button (active state highlighted)
  - ERASE button (active state highlighted)
- [x] Implement status controls (Waveform selector and Volume slider now in SettingsPanel)
  - Waveform selector dropdown (Sine, Triangle, Square, Saw)
  - Volume slider (0-0.5, 0.01 step)
  - [x] Generation counter "GEN: {number}"
  - Settings gear icon button (⚙️)
- [x] Implement UI toggle button (ALREADY INTEGRATED in Game.tsx:60,319,364)
  - Icon frame in corner
  - Click to show/hide all UI
  - Hidden when enableUI prop is false (intro mode)
  - Fixed position
- [x] Add CSS styling
  - Glass effect with blur and border
  - Button states (active, disabled, hover)
  - Responsive design (desktop/mobile)
  - Minimum 44×44px touch targets

**Dependencies**: Phase management (phase display), all other systems (configurable via settings)
**Enables**: Full game control

**Implementation Summary (Settings Panel & Audio):**

- Implemented SoundEngine class with Web Audio API in src/lib/audio.ts
- Implemented audio parameter management (enabled, volume, waveform)
- Implemented SettingsPanel component with full UI for expert settings
- Implemented settings persistence to localStorage
- Integrated settings into Game component with live configuration
- Audio generation sounds with pitch mapping based on cell births
- Audio interaction sounds for draw/erase actions
- Comprehensive validation for all settings parameters
- Test coverage for audio, settings (43 new tests)

**Technical Decisions:**

- SoundEngine uses lazy initialization pattern for AudioContext (browser autoplay policy)
- Volume range: 0.0-0.5 (0.1 default, 10%)
- Waveform types: sine, triangle, square, sawtooth
- Generation sound pitch mapped to average row position (top = higher pitch)
- SettingsPanel uses modal overlay pattern with backdrop blur
- Settings stored in localStorage under 'gol-expert-settings'
- All settings validate against spec-defined ranges
- Settings apply immediately without restart required

**Test Coverage: 43 tests (new)**

- SoundEngine: 8 tests (creation, state management, audio generation)
- AudioParams validation: 10 tests (enabled, volume, waveform)
- Settings creator functions: 3 tests
- ExpertSettings validation: 22 tests (all parameters and ranges)
- Total: 282 tests passing

### 2.3 Phase Status Display (HIGH - Game Visibility)

- [x] Implement phase indicator
  - Show current phase: PLANNING, COUNTDOWN, RUNNING, FINISHED
  - Prominent display in HUD
- [x] Implement timer display
  - Show during COUNTDOWN phase (3... 2... 1...)
  - Show during RUNNING phase (level countdown)
  - Hide during PLANNING and FINISHED phases
- [x] Implement countdown display
  - Large "3... 2... 1..." during COUNTDOWN phase
  - No input allowed during countdown
- [x] Implement Flux counter display
  - Show during PLANNING and RUNNING phases
  - Display current/initial Flux
  - Color coding (green/yellow/orange/red)
  - Smooth value transitions

**Dependencies**: Phase management (phase and timer state), Flux management (Flux values)

### 2.4 Movement Detection (HIGH - Scoring Foundation)

- [x] Implement connected component detection (src/lib/movement.ts)
  - 8-connectivity (include diagonals)
  - Flood fill or BFS algorithm
  - CellCluster interface with cells (Set<string>), centroid, generation
- [x] Implement centroid tracking
  - Track centroid history over N generations (configurable, default 5)
  - Calculate velocity (dx, dy)
  - Match clusters across generations by nearest centroid
  - Circular buffer for history (efficient memory)
- [x] Implement classification algorithm
  - MOVER: |dx| > threshold OR |dy| > threshold
  - OSCILLATOR: centroid static but cell set changes
  - STATIC: centroid static AND cell set unchanged
- [x] Handle edge cases
  - Cluster splits (track both as new clusters)
  - Cluster merges (reset classification)
  - Single isolated cells (treat as cluster size 1)
  - Glider guns (stationary gun, moving gliders)
- [x] Implement performance optimizations
  - Only recompute for changed regions
  - Target < 16ms for 60fps with actual game grid sizes (20×30, 40×50, 60×80)

**Dependencies**: simulation-engine (analyzes grid), type definitions
**Enables**: scoring-system

**Implementation Summary:**

- Implemented `findConnectedComponents` using BFS algorithm with 8-connectivity for detecting cell clusters
- Implemented `matchClusters` using nearest centroid matching with 5-cell distance threshold
- Implemented `trackClusters` with circular buffer for centroid history (configurable length)
- Implemented `calculateVelocity` averaging velocity across history for smooth classification
- Implemented `classifyCluster` using velocity threshold and cell set comparison
- Implemented `filterClustersByMinSize` for noise reduction
- Implemented `countClustersByClassification` for statistics
- Implemented `createInitialMovementDetectionParams` with defaults (history=5, threshold=0.5, minSize=1)

**Technical Decisions:**

- Used BFS flood-fill for efficient cluster detection
- Used Set<string> for cell storage (format: "row,col") for O(1) lookup
- Nearest centroid matching with 5-cell distance threshold for cluster tracking
- Circular buffer (shift/push) for memory-efficient centroid history
- Velocity averaged across entire history (not just last frame) for smoother classification
- Classification prioritizes MOVER over OSCILLATOR if both conditions met

**Test Coverage: 27 tests**

- findConnectedComponents: 7 tests (empty grid, single cell, separate clusters, connected with diagonals, toroidal boundaries, block pattern, blinker pattern)
- matchClusters: 3 tests (match by nearest centroid, no match when too far, no previous clusters)
- trackClusters: 4 tests (new cluster as STATIC, moving as MOVER, oscillating as OSCILLATOR, history length limit)
- calculateVelocity: 4 tests (single point zero, two points, multiple points average, diagonal velocity)
- classifyCluster: 4 tests (MOVER classification, OSCILLATOR classification, STATIC classification, threshold usage)
- filterClustersByMinSize: 2 tests (filter below minSize, keep all when minSize=1)
- countClustersByClassification: 2 tests (count by type, empty array)
- createInitialMovementDetectionParams: 1 test

**Integration Notes (Sprint 2.4 Integration):**

- Integrated movement detection into Game.tsx simulation loop via handleSimulationStep callback
- Movement detection runs automatically during RUNNING phase at 200ms intervals
- Connected components detected using BFS algorithm with 8-connectivity
- Cluster tracking stored in ref (trackedClusters) to avoid re-render issues
- Classification results passed to scoring system for real-time score calculation
- All tests passing (240 total)

### 2.5 Scoring System (HIGH - Core Loop)

- [x] Implement per-generation scoring (src/lib/scoring.ts)
  - Calculate score from tracked clusters
  - MOVER: 10 points per generation (configurable)
  - OSCILLATOR: 2 points per generation (configurable)
  - STATIC: 0 points
  - Apply score multiplier
- [x] Implement score state
  - currentScore, generationScore, totalPatternsTracked
  - Score cap at MAX_SAFE_INTEGER (9,007,199,254,740,991)
  - Reset to 0 at start of each level (no carry-over)
- [x] Implement score display
  - Top-left of screen with "PTS" label
  - Smooth increment animation (lerp 0.2s)
  - Brief pulse/flash on point gain
  - Milestone flash every 100 points
- [ ] Add pattern breakdown UI
  - Active Movers count
  - Active Oscillators count
  - Current rate (points/gen)
- [ ] Implement end-of-level stats
  - Final score display
  - Time survived
  - Patterns created
- [ ] Add high score persistence
  - Save highest score per level to localStorage
  - Load on level start
  - Display high score on UI

**Dependencies**: movement-detection (needs cluster classifications), type definitions
**Enables**: level-progression

**Implementation Summary:**

- Implemented `calculateGenerationScore` for scoring clusters by classification
- Implemented `updateScore` for accumulating score with capping at MAX_SAFE_INTEGER
- Implemented `updateTotalPatternsTracked` for tracking pattern statistics
- Implemented `resetScore` for level transitions
- Implemented `createInitialScoreState` and `createInitialScoringConfig` for initialization
- Implemented `formatScore` for display (K/M suffixes)
- Implemented `calculateMilestone` and `isMilestoneReached` for milestone detection
- Implemented ScoreDisplay component with PTS label and animations
- Implemented smooth increment animation using requestAnimationFrame with easing function
- Implemented pulse animation on score gain (0.2s duration)
- Implemented milestone flash animation on every 100 points (0.5s duration, multi-color effect)
- Implemented optional pattern breakdown UI (Movers, Oscillators, Rate)
- Added glassmorphism styling matching other UI components
- Fixed positioning at top-left of screen with responsive design

**Technical Decisions:**

- Score capped at MAX_SAFE_INTEGER to prevent overflow
- Multiplier applied before rounding (Math.round) for fair fractional scaling
- FormatScore uses K/M suffixes for large numbers (1K, 1.5M)
- Milestone detection in 100-point increments
- Score display uses window.requestAnimationFrame for smooth animations
- Previous score tracking via ref to prevent unnecessary re-renders
- CSS keyframe animations for pulse (scale + color change) and milestone flash (multi-color effect)
- Easing function: ease-in-out quadratic for smooth transitions
- Pattern breakdown optional via prop for future integration
- Score state immutable (returns new state objects)
- Reset function creates fresh state for clean level transitions

**Test Coverage: 21 tests**

- calculateGenerationScore: 7 tests (MOVER, OSCILLATOR, STATIC, multiple clusters, multiplier, MAX_SAFE_INTEGER cap, rounding)
- updateScore: 2 tests (add generation score, cap at MAX_SAFE_INTEGER)
- updateTotalPatternsTracked: 1 test (increment patterns)
- resetScore: 1 test (reset to initial state)
- createInitialScoreState: 1 test (create initial state)
- createInitialScoringConfig: 1 test (create default config)
- formatScore: 4 tests (small scores, thousands, millions, zero)
- calculateMilestone: 1 test (milestone in 100-point increments)
- isMilestoneReached: 3 tests (detect milestone, not reached, zero scores)

**Integration Notes (Sprint 2.5 Integration):**

- Integrated scoring system into Game.tsx via handleSimulationStep callback
- ScoreDisplay component rendered at top-left showing real-time score with PTS label
- Score updates in real-time during RUNNING phase (every 200ms)
- Score state managed with React state (scoreState) and previousScore ref for animations
- Score resets on Clear/Random/phase transitions appropriately
- previousScore state tracks previous score for ScoreDisplay smooth animations
- Tracked clusters stored in ref to avoid re-render issues
- Classification scoring applied: MOVER (10pts), OSCILLATOR (2pts), STATIC (0pts)
- ScoreDisplay shows smooth animations and milestone flashes every 100 points
- All tests passing (240 total)

### 2.6 Settings Panel (HIGH - Customization)

- [x] Implement settings panel (src/components/SettingsPanel.tsx)
  - Access via gear icon in HUD
  - Modal overlay with backdrop blur
- [x] Implement audio controls
  - Checkbox: Enable sonification
  - Volume slider (0-0.5)
  - Waveform selector (Sine, Triangle, Square, Saw)
- [x] Implement movement detection controls
  - Centroid history length slider (3-10, default 5)
  - Movement threshold slider (0.1-2.0, default 0.5)
  - Minimum cluster size slider (1-5, default 1)
- [x] Implement scoring controls
  - Mover points per generation slider (1-100, default 10)
  - Oscillator points per generation slider (0-20, default 2)
  - Score multiplier slider (0.1-5.0, default 1.0)
- [x] Implement level generation controls
  - Base time slider (10-120s, default 45s)
  - Time increment per level slider (0-60s, default 15s)
  - Base Flux slider (5-50, default 20)
  - Difficulty mode selector (TIME_ONLY, RESOURCE_ONLY, MIXED, EXTREME)
- [x] Implement grid sizing controls
  - Mobile cell size slider (14-24px, default 18px)
  - Desktop cell size slider (16-28px, default 20px)
- [x] Implement close button
  - × button in header
  - Click outside to close
- [x] Add reset to defaults button
- [x] Implement settings persistence
  - Save to localStorage
  - Load on startup

**Dependencies**: All systems (configurable via settings)

**Implementation Summary:**

- Created SettingsPanel component with collapsible sections for all expert settings
- Implemented audio controls (enabled, volume, waveform)
- Implemented movement detection parameter controls
- Implemented scoring parameter controls
- Implemented level generation parameter controls
- Implemented grid sizing parameter controls
- Added settings persistence to localStorage
- Added "Reset to Defaults" functionality
- Integrated with Game component for live configuration updates
- Settings apply immediately without restart

**Technical Decisions:**

- Modal overlay pattern with backdrop blur (10px)
- Collapsible sections with clear visual hierarchy
- Real-time slider updates with value display
- Settings stored under 'gol-expert-settings' key
- All parameters validated against spec ranges
- Settings loaded from localStorage on component mount
- "Save Settings" and "Reset to Defaults" buttons in footer
- Glassmorphism styling consistent with other UI components
- Responsive design for mobile and desktop

**Test Coverage: 25 tests**

- createInitialLevelGenerationParams: 1 test
- createInitialGridSizingParams: 1 test
- createInitialExpertSettings: 2 tests (structure, defaults)
- validateExpertSettings: 21 tests (all parameter ranges and validation)

---

## Sprint 3: Level Progression & Transitions

_Goal: Complete game loop with levels and transitions_

### 3.1 Level Progression (HIGH - Game Loop)

- [x] Implement level configuration (src/lib/level.ts)
  - LevelConfig interface (levelNumber, timeLimitSeconds, initialFlux)
  - Default generation: 45s + (level-1)\*15s time, 20 Flux constant
  - Difficulty scaling strategies: TIME_ONLY, RESOURCE_ONLY, MIXED, EXTREME
- [x] Implement progression state
  - currentLevel, maxUnlockedLevel, totalScore
  - Array of level definitions
- [x] Implement difficulty scaling strategies (TIME_ONLY, RESOURCE_ONLY, MIXED, EXTREME)
- [x] Integrate level progression into Game component
- [x] Add "Level X" display in corner (added to title)
- [x] Implement end of game (FIXED: VictoryScreen now shows correctly after final level)
  - Fixed critical bug: final level score now added to total before showing victory screen
  - Updated handleTransitionComplete in Game.tsx:109-126 to properly update progression
  - Victory screen displays total accumulated score from all 10 levels

**Dependencies**: scoring-system (accumulates score), phase-management (controls transitions), type definitions
**Enables**: auto-advance-transitions

**Implementation Summary:**

- Implemented level configuration system in src/lib/level.ts with generateLevelConfig function
- Implemented LevelConfig interface with levelNumber, timeLimitSeconds, and initialFlux properties
- Implemented four difficulty scaling strategies: TIME_ONLY (decreasing time), RESOURCE_ONLY (decreasing Flux), MIXED (both), EXTREME (both aggressive)
- Implemented progression state with currentLevel, maxUnlockedLevel, and totalScore tracking
- Implemented 10-level progression system with level completion detection
- Integrated level progression into Game component with level state management
- Added "Level X" display in title corner showing current level
- Implemented resetProgression function to restart game from level 1
- Implemented victory condition detection for final level completion
- Level progression persists across game sessions using localStorage

**Technical Decisions:**

- Level time limit formula: baseTime + (levelNumber - 1) \* timeIncrement
- Difficulty scaling controlled via DifficultyScalingMode enum with four strategies
- TIME_ONLY: time decreases by 5s per level, Flux constant at 20
- RESOURCE_ONLY: time constant at 45s, Flux decreases by 2 per level
- MIXED: time decreases by 5s, Flux decreases by 1 per level
- EXTREME: time decreases by 10s, Flux decreases by 2 per level
- Progression state persisted under 'gol-level-progression' key
- Max 10 levels with victory screen on completion
- TotalScore accumulates across all levels for final victory display
- Level configuration generated dynamically based on current level and difficulty mode

### 3.2 Transition System (HIGH - Game Flow)

- [x] Implement transition state machine (src/hooks/useTransition.ts)
  - TransitionState enum: PLAYING, FADING_OUT, INTERSTITIAL, FADING_IN, READY
  - State machine with guarded transitions
- [x] Implement transition configurations
  - Fade out duration: 2.0s
  - Interstitial duration: 2.0s (black screen with level info)
  - Fade in duration: 2.0s
  - Auto-advance delay: 2.0s (time on finished screen)
- [x] Implement transition animations
  - Full-screen black overlay opacity transitions
  - Ease functions (ease-in-out)
  - CSS transitions for smooth 60fps fades
- [x] Implement interstitial display
  - Black screen with "Level X Complete" (fading out)
  - "Level X+1" (fading in)
  - Optional quick stats ("Score: Y")
- [x] Implement skip functionality
  - Press Space/ESC to skip current transition phase
  - Hold key to skip all transitions
  - Skip indicator prompt: "Press Space or ESC to skip"
- [x] Add transition audio - connected to SoundEngine
- [x] Handle browser tab during transitions - added Page Visibility API implementation
- [x] Coordinate with level progression - fixed race condition and state reset

**Dependencies**: level-progression (triggers transitions), phase-management (coordinates phases)
**Result**: Seamless level progression

**Implementation Summary:**

- Implemented transition state machine using useTransition custom hook in src/hooks/useTransition.ts
- Implemented TransitionState enum with five states: PLAYING, FADING_OUT, INTERSTITIAL, FADING_IN, READY
- Implemented TransitionConfig interface for configurable durations and settings
- Implemented transition cycle: PLAYING → FADING_OUT → INTERSTITIAL → FADING_IN → READY → PLAYING
- Implemented TransitionOverlay component with full-screen black overlay and CSS transitions
- Implemented interstitial display showing "Level X Complete" fading to "Level X+1"
- Implemented skip functionality with Space/ESC key detection
- Implemented transition state tracking with hooks (transitionState, showSkipPrompt)
- Implemented startTransition function to initiate level transitions
- Implemented timer management for all transition phases
- Added transition animations with ease-in-out timing function

**Technical Decisions:**

- Custom hook useTransition encapsulates all transition logic
- State machine with strict transition guards prevents invalid state changes
- Fade durations: fadeOut=2.0s, interstitial=2.0s, fadeIn=2.0s
- CSS transitions for smooth 60fps opacity animations
- Skip functionality uses keydown event listener for Space (key=" ") and Escape
- Transition triggered via startTransition() function called on level completion
- Auto-advance logic: after all phases complete, transitionReady flag set
- Interstitial text dynamically shows completed and next level numbers
- TransitionOverlay uses fixed positioning with z-index for overlay layer
- Timer cleanup on unmount to prevent memory leaks

**Critical Fixes:**

- Fixed critical bug where transition state wasn't reset after completion
- Fixed race condition between phase and transition systems
- Added Page Visibility API to pause/resume transitions on tab hide/show
- Added transition audio methods (playLevelCompleteSound, playLevelStartSound, playTransitionSound, playSimulationStartSound)
- Integrated transition audio with Game component
- All transitions now work properly for multiple level cycles

### 3.3 Victory Screen (MEDIUM - Game Completion)

- [x] Implement victory screen (src/components/VictoryScreen.tsx)
  - Show after final level (default 10)
  - Display total accumulated score across all levels
  - "VICTORY" title
- [x] Display total accumulated score
- [x] "VICTORY" title
- [x] "Play Again" button functionality

**Dependencies**: level-progression (detects final level)

**Implementation Summary:**

- Implemented VictoryScreen component in src/components/VictoryScreen.tsx
- Implemented full-screen victory overlay with center-aligned content
- Implemented "VICTORY" title with prominent styling and glow effects
- Implemented total score display showing accumulated score from all levels
- Implemented "Play Again" button with restart functionality
- Implemented victory animation with fade-in and scale effects
- Added glassmorphism styling consistent with other UI components
- Implemented onPlayAgain callback for restarting the game
- Added responsive design for mobile and desktop
- Integrated with Game component for victory condition detection

**Technical Decisions:**

- Component accepts totalScore and onPlayAgain as props
- Victory screen displays after completing final level (level 10)
- Total score formatted using formatScore utility (K/M suffixes)
- "VICTORY" title styled with neon glow effects and cyberpunk aesthetic
- "Play Again" button resets progression state and starts new game from level 1
- CSS animations for entrance: fade-in with scale-up effect
- Fixed positioning with z-index for overlay layer
- Backdrop blur effect for glassmorphism styling
- Responsive typography for mobile and desktop
- Glassmorphism design consistent with other UI elements

---

## Sprint 4: Audio & Polish

_Goal: Audio sonification, visual polish, and enhancements_

### 4.1 Audio Sonification (MEDIUM - Enhancement)

- [x] Implement sound engine (src/lib/audio.ts)
  - Web Audio API setup with lazy initialization
  - Handle browser autoplay policies (context starts suspended)
- [x] Implement generation sounds
  - Play after each simulation step with bornCount > 0
  - Pitch mapping: (1 - avgRow / totalRows) \* frequencyRange
  - Higher rows (top) = higher pitch
  - Intensity based on born count
- [x] Implement interaction sounds
  - Draw sound: higher pitch, short duration (~50ms)
  - Erase sound: lower pitch, short duration (~50ms)
- [x] Add configuration
  - Volume control (0.0-0.5, default 0.1)
  - Waveform selection (sine, triangle, square, sawtooth)
  - Enable/disable toggle
- [x] Implement sound generation pipeline
  - Create oscillator with configured waveform
  - Create gain node for volume and envelope
  - Connect: Oscillator → Gain → Destination
  - Quick attack, exponential decay envelope
  - Cleanup after sound completes
- [x] Handle edge cases
  - Suspended context resume
  - Multiple concurrent sounds (polyphonic)
  - Volume = 0 (generate but no gain)
  - Disabled (early return)
- [x] Implement simulation start sound
  - Play when countdown → RUNNING transition
- [x] Implement level complete sound
  - Play when entering FINISHED phase
- [x] Implement level start sound
  - Play when transitioning to new level
- [x] Implement transition whoosh sound
  - Play during fade transitions
- [x] Implement insufficient flux sound
  - Error/denied sound

**Dependencies**: simulation-engine (birth statistics), user-interaction (draw/erase events), phase-management (transitions), type definitions

**Implementation Summary:**

- Implemented SoundEngine class with full Web Audio API support
- Implemented generation sounds with pitch mapping based on average row position
- Implemented interaction sounds (draw: 880Hz, erase: 440Hz)
- Implemented simulation start sound (330Hz, 100ms duration)
- Implemented level complete sound (dual oscillator at 523.25Hz + 659.25Hz, 300ms duration)
- Implemented level start sound (440Hz, 200ms duration)
- Implemented transition whoosh sound (300Hz fade-out / 400Hz fade-in, 150ms duration)
- Implemented insufficient flux error sound (150Hz sawtooth, 80ms duration)
- Integrated flux error sound in GridInteraction component
- Added callback for flux error sound in Game component
- Implemented lazy initialization for AudioContext (browser autoplay policy)
- Implemented audio parameter state management
- Implemented sound generation pipeline with proper envelope
- Implemented configuration for volume, waveform, enabled state
- Implemented proper cleanup after sound completion
- Comprehensive test coverage for audio functionality (19 tests)

**Technical Decisions:**

- Frequency range: 880Hz (mapped to row position)
- Generation sound duration: 150ms (quick attack + exponential decay)
- Interaction sound duration: 50ms
- Volume scaling: based on bornCount (sqrt for smoother dynamics)
- Lazy initialization: AudioContext created on first sound play
- Suspended context: automatically resumes on next interaction
- Polyphonic support: concurrent sounds allowed
- Error handling: graceful degradation on errors

**Test Coverage: 19 tests**

- SoundEngine creation: 1 test
- State management: 3 tests (enabled, volume, waveform)
- Audio generation: 5 tests (disabled check, bornCount check, interaction sounds, flux error sound)
- AudioParams validation: 10 tests (all parameters and ranges)

**Integration Notes:**

- Audio engine integrated into Game component
- SettingsPanel provides UI for audio configuration
- Audio parameters persisted to localStorage
- All audio sounds connected to simulation and interaction events
- Flux error sound provides feedback when player tries to place cells with insufficient Flux

**Completed**: Sprint 4.1 Audio Sonification (2026-02-16) - All sounds implemented and integrated

### 4.2 Visual Polish (MEDIUM - Enhancement)

- [ ] Implement cell animations
  - Fade-in animation (0.1s) for placement
  - Shrink animation (0.15s) for removal
  - Use CSS transitions or canvas-based animations
- [ ] Implement cell preview ghost outline
  - Show ghost outline when hovering over grid
  - Semi-transparent, follows cursor
  - Different color for draw vs erase mode
- [ ] Implement score animation polish
  - Smooth increment animation (lerp 0.2s)
  - Brief pulse/flash on point gain
  - Milestone flash every 100 points
- [ ] Implement Flux counter animation
  - Smooth transitions when values change
  - Color coding transitions (green → yellow → orange → red)
- [ ] Implement intro glitch effect
  - CSS-based glitch animation for title
  - Random offset, opacity, and color shifts
- [ ] Implement glass effect polish
  - Backdrop-filter blur
  - Subtle border and shadows
  - Hover effects

**Dependencies**: Canvas rendering, UI components

### 4.3 Mobile Enhancements (MEDIUM - Mobile Experience)

- [ ] Implement touch-action handling
  - touch-action: none on canvas element
  - PreventDefault on all touch events
  - Stop scroll and zoom during interaction
- [ ] Implement minimum touch targets
  - Ensure all buttons ≥44×44px
  - Spacious clickable areas
- [ ] Implement touch ripple effect (optional)
  - Visual feedback on touch
  - Radial ripple animation
- [ ] Implement mobile expert settings access
  - Triple-tap top-left corner gesture
  - Confirm gesture doesn't conflict with game controls

**Dependencies**: User interaction, UI components

---

## Sprint 5: Expert Settings & Advanced Features

_Goal: Advanced tuning, customization, and power features_

### 5.1 Expert Settings Panel (MEDIUM - Tuning)

- [ ] Implement expert settings panel (src/components/ExpertSettings.tsx)
  - Access via keyboard shortcut (`), Settings menu, or mobile gesture
  - Modal overlay or sidebar
  - Collapsible sections by category
- [ ] Implement movement detection parameters
  - Centroid history length (3-10, default 5)
  - Movement threshold (0.1-2.0, default 0.5)
  - Minimum cluster size (1-5, default 1)
- [ ] Implement scoring parameters
  - Mover points per generation (1-100, default 10)
  - Oscillator points per generation (0-20, default 2)
  - Score multiplier (0.1-5.0, default 1.0)
- [ ] Implement level generation parameters
  - Base time seconds (10-120, default 45)
  - Time increment per level (0-60, default 15)
  - Base Flux (5-50, default 20)
  - Difficulty scaling mode: TIME_ONLY, RESOURCE_ONLY, MIXED, EXTREME
- [ ] Implement grid sizing parameters
  - Mobile cell size (14-24, default 18)
  - Desktop cell size (16-28, default 20)
  - Minimum visible cells (default 10)
- [ ] Implement audio parameters
  - Enable default (boolean, default true)
  - Default volume (0.0-0.5, default 0.1)
  - Default waveform (sine, triangle, square, sawtooth)
- [ ] Implement configuration persistence
  - Save settings to localStorage under key `gol-expert-settings`
  - Load on app startup
  - "Reset to Defaults" button with confirmation
  - Export/Import JSON for sharing configurations
- [ ] Add validation
  - Range checking for all numeric values
  - Schema validation using Zod or similar
  - Prevent invalid configurations
- [ ] Implement parameter injection
  - Pass expert settings to all relevant systems
  - React context or prop drilling
  - Apply changes immediately (no restart required)
- [ ] Add UI controls
  - Sliders with value displays
  - Dropdowns for enums
  - Save/Reset/Revert buttons
  - Visual indicator when value differs from default
- [ ] Implement presets
  - Dropdown: Easy, Normal, Hard, Chaos
  - Predefined parameter sets
  - Quick way to balance game
- [ ] Add danger zone
  - Separate section for extreme settings
  - Require confirmation for extreme values
  - Show warning if settings would make game impossible
- [ ] Add tooltips/documentation
  - Each parameter has tooltip explaining effect
  - Help text for complex parameters

**Dependencies**: ALL other systems (configures parameters), type definitions

### 5.2 Presets System (LOW - Convenience)

- [ ] Implement preset configurations
  - Easy: Lower difficulty, generous resources
  - Normal: Balanced gameplay
  - Hard: Strict time/flux limits
  - Chaos: Extreme parameters, unpredictable
- [ ] Implement preset selection UI
  - Dropdown in Expert Settings
  - Preview preset values
- [ ] Add custom preset support
  - Allow users to save current settings as preset
  - Name and save custom configurations

**Dependencies**: Expert settings

---

## Sprint 6: Quality Assurance

_Goal: Stability, accessibility, and performance_

### 6.1 Error Handling & Resilience (MEDIUM - Stability)

- [ ] Implement global error boundary
  - Catch React component errors
  - Display user-friendly error message
  - Log error details
- [ ] Add input validation
  - Validate all user inputs
  - Validate configuration parameters
  - Prevent NaN and infinity
- [ ] Handle edge cases gracefully
  - Empty grid states
  - Zero flux scenarios
  - Invalid level numbers
  - Corrupted localStorage
- [ ] Add retry mechanisms
  - Retry failed operations with exponential backoff
  - Graceful degradation when features fail
- [ ] Handle browser compatibility
  - Check for required APIs (Web Audio, Canvas)
  - Fallbacks for unsupported features
  - Clear error messages

**Dependencies**: All systems

### 6.2 Accessibility (LOW - Inclusivity)

- [ ] Implement keyboard navigation
  - Arrow keys for grid navigation
  - Enter/Space to place cells
  - Escape to cancel/close panels
  - Tab navigation through UI controls
- [ ] Add screen reader support
  - ARIA labels for UI elements
  - Announce game state changes
  - Alternative text for visual elements
  - Live regions for score/timer updates
- [ ] Implement reduced motion support
  - Respect prefers-reduced-motion media query
  - Disable animations when requested
  - Simplified visual feedback
- [ ] Add high contrast mode
  - Toggle for high contrast colors
  - Larger text option
  - Improved readability
- [ ] Ensure minimum touch targets
  - 44×44px minimum for mobile
  - Spacious clickable areas
- [ ] Focus management
  - Visible focus indicators
  - Logical tab order
  - Focus trap in modals

**Dependencies**: UI components, user interaction

### 6.3 Performance Optimization (LOW - Performance)

- [ ] Implement performance monitoring
  - FPS counter (development only)
  - Memory usage tracking
  - Component render profiling
- [ ] Add performance optimizations
  - Memoize expensive calculations
  - Virtualize large lists (if applicable)
  - Lazy load non-critical components
  - Debounce/throttle frequent operations
- [ ] Profile and optimize
  - Identify performance bottlenecks
  - Optimize critical paths
  - Ensure 60fps with 500+ cells
  - Test on low-end devices
- [ ] Implement lazy loading
  - Load audio on first interaction
  - Lazy load expert settings panel
  - Code splitting for production

**Dependencies**: All systems

### 6.4 Testing (LOW - Quality Assurance)

- [ ] Set up testing framework
  - Choose testing framework (Vitest recommended)
  - Configure test environment
  - Set up coverage reporting
- [ ] Write unit tests for simulation engine
  - Rule application (born/survive)
  - Toroidal boundaries
  - Age tracking
  - Edge cases (empty grid, static patterns)
- [ ] Write unit tests for phase management
  - Phase transitions
  - Guard conditions
  - Timer accuracy
- [ ] Write unit tests for flux management
  - Placement and refund logic
  - Phase-based behavior
- [ ] Write unit tests for movement detection
  - Connected component detection
  - Centroid tracking
  - Classification accuracy
- [ ] Write unit tests for scoring system
  - Score calculation accuracy
  - Score cap handling
  - High score persistence
- [ ] Write unit tests for level progression
  - Level configuration generation
  - Difficulty scaling
- [ ] Write integration tests
  - End-to-end game flow
  - Level progression
  - Score calculation
  - UI interaction
- [ ] Add manual testing procedures
  - Mobile responsiveness
  - Touch interaction
  - Audio on different browsers
  - Performance with high cell counts
  - Accessibility testing

**Dependencies**: All implemented systems

### 6.5 Documentation (LOW - Knowledge Transfer)

- [ ] Write README.md
  - Project overview
  - Installation instructions
  - Controls and gameplay guide
  - Configuration options
  - Known issues and limitations
- [ ] Add code comments
  - Complex algorithms (movement detection, simulation)
  - State machine logic
  - Performance-critical sections
- [ ] Document API interfaces
  - Component props
  - Utility functions
  - Configuration schemas
  - Type definitions
- [ ] Create developer guide
  - Architecture overview
  - How to add new features
  - Debugging tips
  - Common patterns
- [ ] Document expert settings
  - Each parameter explanation
  - Recommended values
  - Impact on gameplay

**Dependencies**: All implemented systems

---

## Parallel Development Tracks

### Track A (Can start after Project Setup):

- Type definitions → Shared utilities → All other systems

### Track B (Can start after Simulation Engine):

- Phase Management → UI Overlay → Phase Status Display
- Canvas Rendering → Grid Interaction

### Track C (Can start after Simulation Engine):

- User Interaction → Audio Sonification → Visual Polish
- Flux Management → Grid Interaction

### Track D (Can start after Canvas Rendering + User Interaction + Flux Management):

- Grid Integration → Playable MVP

### Track E (Can start after MVP):

- Intro Overlay → Main UI Controls → Settings Panel
- Movement Detection → Scoring System → Level Progression

### Track F (Can start after Level Progression):

- Transition System → Victory Screen

### Track G (Can start after Scoring + Level Progression):

- Audio Sonification → Visual Polish → Mobile Enhancements

### Track H (Can start after all features):

- Expert Settings → Presets → Error Handling → Accessibility → Performance → Testing → Documentation

---

## Critical Path (Sequential Must-Haves for MVP):

1. **Project Setup** → Build system
2. **Type Definitions** → All type-safe development
3. **Shared Utilities** → Validation and state management
4. **Simulation Engine** → Core gameplay logic
5. **Phase Management with COUNTDOWN** → Game flow control
6. **Canvas Rendering** → Visual feedback
7. **User Interaction** → Input handling
8. **Flux Management** → Resource system
9. **Grid Integration** → Playable MVP

## Testing Milestones:

- **After Sprint 1**: MVP manually playable (place cells, watch simulation, all phases work)
- **After Sprint 2**: Full game UI (intro, controls, scoring, settings)
- **After Sprint 3**: Complete game loop (intro → levels → transitions → victory)
- **After Sprint 4**: Audio and polish (all sounds, visual enhancements, mobile support)
- **After Sprint 5**: Expert settings and customization
- **After Sprint 6**: Production-ready with stability, accessibility, performance, tests, and docs

## Success Criteria:

- [ ] Playable MVP after Sprint 1 (can place cells and run simulation with all phases)
- [ ] Complete UI after Sprint 2 (intro, controls, settings)
- [ ] Full game loop after Sprint 3 (intro → levels → scoring → transitions → victory)
- [ ] Audio and polish after Sprint 4 (all sounds, animations, mobile support)
- [ ] All features implemented after Sprint 5 (expert settings, presets)
- [ ] Production-ready after Sprint 6 (stability, accessibility, performance, tests, docs)
- [ ] 60fps performance with 500+ cells
- [ ] Works on mobile and desktop
- [ ] Audio works across all major browsers
- [ ] No console errors or warnings in production
- [ ] High score persistence works
- [ ] Expert settings properly configure all systems
- [ ] All critical edge cases handled gracefully
- [ ] Accessible keyboard navigation
- [ ] Comprehensive test coverage for core systems
- [ ] Clear documentation for developers and players

## Framework Decisions (MAKE THESE FIRST):

- **Framework**: React/Vite (recommended for performance and DX)
- **State Management**: React hooks (useState, useReducer, useRef) - minimal, no external library needed
- **Styling**: CSS modules or vanilla CSS with CSS variables for theming
- **Testing**: Vitest (fast, compatible with Vite)
- **Build Tool**: Vite (recommended for speed and simplicity)

## Implementation Order Recommendations:

### Week 1: Foundation

1. Project setup (Day 1)
2. Type definitions (Day 1)
3. Shared utilities (Day 2)
4. Simulation engine (Day 2-3)
5. Phase management with COUNTDOWN (Day 3-4)
6. Canvas rendering (Day 4)

### Week 2: Interaction & UI

7. User interaction (Day 1)
8. Flux management (Day 1-2)
9. Grid interaction (Day 2) - MVP milestone reached
10. Intro overlay (Day 3)
11. Main UI controls (Day 3-4)
12. Phase status display (Day 4)

### Week 3: Scoring & Progression

13. Movement detection (Day 1-2)
14. Scoring system (Day 2-3)
15. Settings panel (Day 3)
16. Level progression (Day 4)

### Week 4: Transitions & Audio

17. Transition system (Day 1-2)
18. Victory screen (Day 2)
19. Audio sonification (Day 3-4)
20. Visual polish (Day 4)

### Week 5: Advanced Features

21. Expert settings (Day 1-3)
22. Mobile enhancements (Day 3)
23. Presets system (Day 4)

### Week 6: Quality Assurance

24. Error handling (Day 1)
25. Accessibility (Day 1-2)
26. Performance optimization (Day 2)
27. Testing (Day 3-4)
28. Documentation (Day 4)

## Notes:

- Update status (checkmark) as tasks are completed
- The plan is prioritized: CRITICAL first, then HIGH, MEDIUM, LOW
- Parallel tracks enable concurrent work where dependencies allow
- Focus on MVP first, then incrementally add polish
- src/lib/ is project's standard library for shared utilities
- Prefer consolidated implementations in src/lib/ over ad-hoc copies
- Always run lint and typecheck commands after completing features
- Test on both desktop and mobile throughout development
- Gather user feedback during development to improve UX
- Document decisions and trade-offs in comments or docs
- Keep code modular and maintainable for future enhancements

## Recent Progress:

**Turn Summary (Sprint 2.5 & 2.4 Integration - Game Component Scoring Integration):**

- Integrated movement detection and scoring into Game.tsx simulation loop
- Added automatic simulation stepping during RUNNING phase (was missing before)
- Implemented handleSimulationStep callback that:
  - Steps the simulation using stepSimulation()
  - Detects connected components using findConnectedComponents()
  - Tracks clusters across generations using trackClusters()
  - Calculates score based on cluster classifications using calculateGenerationScore()
  - Updates all state appropriately (scoreState, trackedClusters, previousScore)
- Added useEffect that runs simulation loop during RUNNING phase at 200ms intervals
- Integrated ScoreDisplay component into Game UI at top-left position
- Added score state management (scoreState, previousScore)
- Added trackedClusters ref to avoid re-render issues
- Score now updates in real-time during simulation
- Score resets on Clear/Random/phase transitions appropriately
- ScoreDisplay shows smooth increment animations and milestone flashes
- Added imports for movement detection, scoring, ScoreDisplay components
- Updated Game.tsx with proper state and callback management
- All tests passing (240 total)
- Type checking passes
- Lint passes for modified files

**Technical Decisions:**

- Simulation runs at 200ms intervals during RUNNING phase via setInterval in useEffect
- Movement detection uses BFS for cluster finding (findConnectedComponents)
- Scoring uses cluster classifications: MOVER (10pts), OSCILLATOR (2pts), STATIC (0pts)
- ScoreDisplay shows smooth animations (lerp 0.2s) and milestone flashes (every 100 points)
- Tracked clusters stored in ref (trackedClusters) to avoid re-render issues
- previousScore state tracks previous score for ScoreDisplay animations
- Score resets on Clear/Random handle functions and phase transitions
- handleSimulationStep callback integrates all three systems: simulation → movement → scoring
- Phase-based cleanup: score and tracked clusters reset when phase changes

**Turn Summary (Sprint 2.5 - Scoring System):**

- Implemented scoring.ts library with per-generation scoring logic
- Implemented calculateGenerationScore for scoring clusters by classification (MOVER: 10pts, OSCILLATOR: 2pts, STATIC: 0pts)
- Implemented score multiplier support with rounding
- Implemented score capping at MAX_SAFE_INTEGER to prevent overflow
- Implemented score state management (currentScore, generationScore, totalPatternsTracked)
- Implemented resetScore for clean level transitions
- Implemented formatScore for display with K/M suffixes
- Implemented milestone detection in 100-point increments
- Added comprehensive test suite with 21 tests
- All tests passing (205 total, up from 157)
- Type checking and linting passing
- Scoring system now complete and integrated into Game component
- Scoring system integrated with movement detection for real-time score updates (240 total tests passing)

**Technical Decisions:**

- Score capped at MAX_SAFE_INTEGER (9,007,199,254,740,991) for safety
- Multiplier applied before rounding using Math.round for fair fractional scoring
- FormatScore uses K/M suffixes: 1000 = "1.0K", 1000000 = "1.0M"
- Milestone detection every 100 points for achievement feedback
- Score state immutable (returns new state objects)
- No score carryover between levels (reset to 0 on level start)

**Turn Summary (Sprint 2.4 - Movement Detection):**

- Implemented movement.ts library with cluster detection and classification
- Implemented findConnectedComponents using BFS algorithm with 8-connectivity
- Implemented matchClusters using nearest centroid matching with 5-cell distance threshold
- Implemented trackClusters with circular buffer for centroid history (configurable length)
- Implemented calculateVelocity averaging velocity across history
- Implemented classifyCluster using velocity threshold and cell set comparison
- Implemented filterClustersByMinSize for noise reduction
- Implemented countClustersByClassification for statistics
- Implemented createInitialMovementDetectionParams with defaults (history=5, threshold=0.5, minSize=1)
- Added comprehensive test suite with 27 tests
- All tests passing (205 total, up from 157)
- Type checking and linting passing
- Movement detection system now complete and integrated into Game component
- Movement detection integrated with scoring for real-time score calculation (240 total tests passing)

**Technical Decisions:**

- Used BFS flood-fill for efficient cluster detection
- Used Set<string> for cell storage (format: "row,col") for O(1) lookup
- Nearest centroid matching with 5-cell distance threshold for tracking clusters across generations
- Circular buffer (shift/push) for memory-efficient centroid history
- Velocity averaged across entire history (not just last frame) for smoother classification
- Classification prioritizes MOVER over OSCILLATOR if both conditions met
- 8-connectivity (includes diagonals) for proper cluster detection (e.g., blocks, gliders)
- Toroidal boundaries NOT used in cluster detection (treated as separate clusters when wrapped)

**Turn Summary (Sprint 1.10 - Game Component Integration):**

- Created Game component that integrates all systems (canvas-rendering, user-interaction, flux-management, phase-management, simulation-engine)
- Implemented grid size controls (Small: 20×30, Medium: 40×50, Large: 60×80)
- Implemented Start button (transitions PLANNING → COUNTDOWN)
- Implemented Clear button (resets grid and Flux, returns to PLANNING)
- Implemented Random button (fills grid with 15% density)
- Implemented Show/Hide Grid toggle
- Implemented Draw/Erase interaction mode toggle
- Implemented status display showing:
  - Current phase
  - Total live cells
  - Flux with color coding (green/yellow/orange/red)
- Updated App.tsx to use Game component
- Updated App.test.tsx with 3 tests for Game component
- All tests passing (157 total)
- Type checking and linting passing
- Game is now fully functional with complete UI!

**Technical Decisions:**

- Used inline styles for rapid UI development (will be refactored to CSS modules later)
- Flux color coding: >10 = green, >5 = yellow, ≤5 = red
- Grid size buttons disabled during non-PLANNING phases
- Start button disabled when no cells placed
- Clear and Random only available in PLANNING phase
- Show/Hide Grid only available in PLANNING phase
- Draw/Erase mode buttons only available in PLANNING phase
- Status display always visible regardless of phase

**Turn Summary (Sprint 1.9 - Grid Interaction - MVP COMPLETE):**

- Implemented GridInteraction component integrating all systems (canvas-rendering, user-interaction, flux-management, phase-management)
- Implemented click-to-place/erase functionality
- Implemented cell preview ghost outline with color coding:
  - Cyan (#00ffff) for placeable cells
  - Magenta (#ff00ff) for removable cells
  - Red (#ff0000) for invalid actions (insufficient Flux)
- Implemented cursor state management:
  - Crosshair for placeable/removable cells
  - Not-allowed when interaction disabled (RUNNING/COUNTDOWN/FINISHED phases)
  - Default when not hovering over grid
- Implemented phase-based interaction constraints:
  - PLANNING: full interaction enabled
  - COUNTDOWN: interaction disabled (no input allowed)
  - RUNNING: interaction disabled
  - FINISHED: interaction disabled
- Implemented DRAW and ERASE interaction modes
- Integrated with flux management system (validate placement, handle refunds)
- Integrated with user interaction coordinate mapping
- Added test suite with 4 tests
- All tests passing (156 total)
- Type checking and linting passing
- MVP is now playable: users can place cells and watch the simulation run!

**Technical Decisions:**

- Used React event types (React.MouseEvent, React.TouchEvent) for type safety
- Ghost overlay uses pointerEvents: 'none' for click-through to canvas
- Cursor styles reflect current interaction state and phase
- Flux validation prevents negative states
- Refund mechanic only works in PLANNING phase per specification
- Cell preview shows placeable/removable status with color coding
- GridIntegration component uses callback props for state updates

**Turn Summary (Sprint 1.7 - User Interaction):**

- Implemented interaction.ts library with coordinate mapping functions
- Implemented getCellFromEvent for mouse and touch event conversion
- Implemented DPR scaling handling for accurate coordinate mapping
- Implemented canvas offset handling for proper coordinate calculation
- Implemented boundary checking with isWithinBounds
- Created InteractionState interface for tracking mouse state
- Created createInitialInteractionState helper function
- Added comprehensive test suite with 7 tests
- All tests passing (152 total including previous tests)
- Type checking and linting passing

**Technical Decisions:**

- Used getBoundingClientRect for accurate canvas position
- Implemented DPR-aware coordinate scaling (canvas.width / rect.width)
- Used first touch only for multi-touch handling
- Implemented Math.floor() for cell coordinate calculation
- Separated interaction logic from React component for reusability
- Grid coordinates tracked as { row, col } for clarity

**Turn Summary (Sprint 1.8 - Flux Management):**

- Implemented flux.ts library with resource management functions
- Implemented createInitialFluxState with default 20 Flux (configurable)
- Implemented canPlaceCell validation for placement checking
- Implemented canRefundCell with phase-based rules (PLANNING only)
- Implemented placeCell with Flux decrement and placement tracking
- Implemented removeCell with refund (PLANNING phase only)
- Implemented resetFlux for level transitions
- Implemented getFluxColor for UI feedback (green/yellow/orange/red based on ratio)
- Added comprehensive test suite with 22 tests
- All tests passing (152 total including previous tests)
- Type checking and linting passing

**Technical Decisions:**

- Used functional state updates (return new state) for immutability
- Color coding based on ratio: 0 = red, <30% = orange, <50% = yellow, ≥50% = green
- Tracked placed and removed counts for statistics
- Refund mechanic only works in PLANNING phase per specification
- Reset function creates new state for clean level transitions
- Flux validation prevents negative states

**Turn Summary (Sprint 1.6 - Canvas Rendering):**

- Implemented CanvasGrid component in src/components/CanvasGrid.tsx
- Created canvasUtils.ts helper module with color and blur functions
- Implemented DPR scaling for sharp rendering on all displays
- Implemented responsive cell sizing (18px mobile, 20px desktop)
- Implemented grid rendering with toggleable grid lines
- Implemented cell rendering with age-based colors:
  - Age 0: #00ffff (bright cyan, 15px glow)
  - Age 1-2: #61dafb (React blue, 8px glow)
  - Age 3-5: #ff00ff (magenta, 4px glow)
  - Age 6+: #4a00ff (deep purple, 2px glow)
- Implemented glow effects with shadow blur based on age
- Implemented intensity metric with CSS variable --life-intensity
- Set touch-action: none on canvas for mobile interaction
- Created comprehensive test suite with 14 tests for canvas utilities
- All tests passing (123 total including existing tests)
- Type checking and linting passing

**Technical Decisions:**

- Separated helper functions into canvasUtils.ts for better code organization
- Used useCallback for draw function optimization
- Used roundRect for cell rendering with corner radius
- Implemented CSS variable --life-intensity for ambient effects (0-1 scale)
- Grid lines toggleable via showGridLines prop (G key UI integration pending)
- Canvas dimensions calculated as numCols \* cellSize

**Turn Summary (Sprint 1.5 - Phase Management):**

- Implemented phase state machine in src/lib/phase.ts
- Created comprehensive test suite with 20 tests, all passing
- Implemented PhaseState interface with current phase, countdown value, timer remaining, transition state, and blockers
- Implemented PhaseAction type with actions: START_COUNTDOWN, DECREMENT_COUNTDOWN, START_RUNNING, DECREMENT_TIMER, FINISH_PHASE, RESET_PHASE
- Implemented canTransition function to validate phase transitions according to state machine rules
- Implemented getBlockers function to return transition blockers based on current phase and game state
- Implemented phaseReducer to handle all phase transitions and state updates
- Implemented COUNTDOWN phase with 3-second countdown (3, 2, 1)
- Implemented RUNNING phase timer with configurable duration (default 45s)
- Implemented FINISHED phase with 2-second delay before level transition
- Implemented phase guard conditions:
  - START button disabled until ≥1 cell placed (checked via blockers)
  - Cannot interact during COUNTDOWN phase
  - Guarded transitions to prevent invalid state changes
- All tests passing (20 tests) for phase management functionality
- Phase management enables game flow control and level progression

**Technical Decisions:**

- Used reducer pattern for phase state management (consistent with other systems)
- Implemented blockers array to provide clear feedback on why transitions are blocked
- Implemented canTransition boolean to indicate when phase can advance
- Used COUNTDOWN_SECONDS (3) and FINISHED_DELAY_SECONDS (2) constants for timing
- Phase transitions follow strict state machine: PLANNING → COUNTDOWN → RUNNING → FINISHED → PLANNING

**Turn Summary (Sprint 1.3 - Shared Utilities):**

- Implemented validation utilities in src/lib/validation.ts
- Implemented logging utility in src/lib/logger.ts
- Implemented state management utilities in src/lib/state.ts
- Created comprehensive test suites with 48 tests (27 validation, 11 logger, 19 state tests), all passing
- Implemented validation functions:
  - isValidCoordinate for grid bounds checking
  - clamp for value range clamping
  - isInRange for range validation
  - isPositiveNumber, isNonNegativeNumber, isInteger for type guards
  - isValidRuleSet for RuleSet validation
  - validateGridDimensions for grid dimension validation
- Implemented Logger class with singleton pattern:
  - Debug, info, warn, error methods
  - Environment-aware (development vs production)
  - Timestamp and context support
  - Error stack trace logging in development
- Implemented state management utilities:
  - createActionCreator for simple actions
  - createActionCreatorWithPayload for actions with payload
  - createReducer for reducer creation with action handlers
  - createAsyncAction for async action creators
  - combineReducers for combining multiple reducers
  - dispatchMultiple for dispatching multiple actions
  - saveToLocalStorage, loadFromLocalStorage, removeFromLocalStorage for localStorage persistence
- Added localStorage mock in src/test/setup.ts for test environment
- All tests passing (48 tests) for shared utilities
- Shared utilities enable all other systems with validation, logging, and state management

**Turn Summary (Sprint 1.4 - Simulation Engine):**

- Implemented core Game of Life simulation engine in src/lib/simulation.ts
- Created comprehensive test suite with 30 tests, all passing
- Implemented RuleSet interface with born/survive arrays for Conway's rules (born=[3], survive=[2,3])
- Implemented neighbor counting with Moore neighborhood (8 cells)
- Implemented toroidal boundary wrapping using modulo arithmetic for seamless edge handling
- Implemented age tracking for cells (increment on survival, 1 for birth)
- Implemented double-buffering pattern (create new grid, don't mutate original) for safe state updates
- Implemented React ref for grid state to avoid unnecessary re-renders
- Implemented precomputed neighbor offsets for performance optimization
- Implemented requestAnimationFrame with delta time control for smooth animation
- Implemented speed ref to avoid state dependency in animation loop
- Implemented generation counter that triggers React render on change
- Implemented grid resizing with clear/reset on dimension changes
- Implemented three grid size presets: SMALL (20×30), MEDIUM (40×50), LARGE (60×80)
- Implemented birth statistics tracking (born count and average row position) for audio integration
- All tests passing (30 tests) for simulation engine functionality
- Performance optimizations ensure smooth 60fps operation

**Technical Decisions:**

- Used toroidal boundary wrapping with modulo arithmetic for seamless edge handling
- Used precomputed neighbor offsets [[0,1], [0,-1], [1,-1], [-1,1], [1,1], [-1,-1], [1,0], [-1,0]] for performance
- Implemented double-buffering pattern (create new grid, don't mutate original) for state updates
- Implemented age tracking (increment on survival, 1 for birth) for visual differentiation
- Tracked birth statistics (born count and average row position) for audio sonification
- Implemented grid size presets (SMALL, MEDIUM, LARGE) for flexible gameplay

**Turn Summary (Sprint 1.2 - Type Definitions):**

- Created comprehensive type definitions in src/types/index.ts
- Defined GridType (number[][]) for age-based cell storage
- Implemented GamePhase enum (PLANNING | COUNTDOWN | RUNNING | FINISHED)
- Implemented InteractionMode enum (DRAW | ERASE)
- Created CellCluster interface with cells, centroid, generation fields
- Created TrackedCluster interface extending CellCluster with history, velocity, classification
- Created SimulationState interface for grid state management
- Created RuleSet interface for born/survive rule configuration
- Created FluxState interface for resource management
- Created LevelConfig interface for level configuration
- Created ScoringConfig interface for scoring parameters
- Created TransitionState enum (PLAYING | FADING_OUT | INTERSTITIAL | FADING_IN | READY)
- Created TransitionConfig interface for transition configuration
- Created AudioParams interface (replacing SoundEngine) for audio configuration
- Created configuration interfaces: DifficultyScalingMode, LevelGenerationParams, MovementDetectionParams, GridSizingParams, AudioParams, ExpertSettings

**Previous Turn Summary (Sprint 1.1 - Project Setup & Build System):**

- Initialized React + Vite project with TypeScript strict mode
- Configured build system with vite.config.ts
- Set up ESLint and Prettier for code quality
- Created complete project structure with all required directories
- Configured path aliases in tsconfig.json (@components, @lib, @types, @hooks, @styles)
- Created package.json with all dependencies and scripts

**Turn Summary (Sprint 2.1 - Intro Overlay):**

- Implemented IntroOverlay component with cinematic presentation
- Implemented glitch effect on title using CSS keyframe animations (skew, translate, clip-path, RGB split)
- Implemented attract mode simulation running in background at reduced speed (200ms)
- Implemented exit animation with 1.2s fade and scale transition
- Implemented intro state management with three states: isIntro (showing), isExiting (animating), enableUI (controls Game component)
- Integrated with Game component via onIntroComplete callback to control UI visibility
- Added responsive design for mobile and desktop (media queries)
- Added test suite with 4 tests covering component rendering, button interaction, background simulation, and UI visibility
- All tests passing (209 total, up from 205)
- Type checking and linting passing
- Intro overlay now provides clean first impression with cyberpunk aesthetic

**Technical Decisions:**

- Used CSS keyframe animations for glitch effect with text-shadow and RGB split for visual impact
- Background simulation runs at reduced speed (200ms vs 100ms normal) for attract mode
- Used setTimeout for exit animation timing (1.2s) before enabling UI
- Props-based state management (onIntroComplete callback) rather than global state
- Cyberpunk aesthetic with neon cyan (#00ffff) and magenta (#ff00ff) colors
- Title uses monospace font and multiple text-shadow layers for depth
- Exit animation uses transform scale and opacity for smooth transition

---

**Recent Progress (Sprint 1.5, 2.2, 2.3):**

**Completed:**

- **Sprint 1.5 - Browser tab handling for phase management**: Added usePhaseTimer hook with Page Visibility API implementation (src/hooks/usePhaseTimer.ts). The hook manages timer execution with setInterval, pauses/resumes based on page visibility, and dispatches phase actions to decrement timers. This ensures proper game behavior when browser tabs are inactive.

- **Sprint 2.2 - Main UI Controls enhancements**: Added STEP button to Game.tsx that executes a single simulation step using stepSimulation(). STEP button is only available during PLANNING phase.

- **Sprint 2.3 - Phase Status Display enhancements**: Added timer display to Game.tsx showing countdown timer (3...2...1...) during COUNTDOWN phase and running timer during RUNNING phase. Also added generation counter displaying "GEN: {number}" in the status display.

- **Updated Game.tsx** to use the full PhaseState from usePhaseTimer hook instead of simple GamePhase string. This enables proper timer management and phase transitions.

**Technical Decisions:**

- Created usePhaseTimer hook with Page Visibility API for browser tab handling
- Timer pauses when tab becomes hidden, resumes when visible, calculating elapsed time to sync state
- Added generation tracking state that increments with each step and resets on clear/random
- STEP button uses existing stepSimulation function which was already implemented but not used
- All tests passing (228 total, up to 240 with integration)

**Next Steps:**

- Continue with Sprint 3 (Level Progression & Transitions)
- Implement audio system (Sprint 4)

**Turn Summary (Sprint 2.2 - GlassHUD Integration):**

- Replaced inline UI controls in Game.tsx with GlassHUD component
- Integrated GlassHUD into Game.tsx with proper state management
- Added STEP button to GlassHUD (disabled during non-PLANNING phases)
- Added Countdown display to GlassHUD (visible during COUNTDOWN phase: 3... 2... 1...)
- Added Timer display to GlassHUD (visible during RUNNING phase: level countdown)
- Added Generation counter (GEN: X) to status display in GlassHUD
- Updated GlassHUD.test.tsx to include new props: generation, countdownValue, timerRemaining, onStep
- Updated App.test.tsx to match uppercase button text (PLAY, PAUSE, STEP, RANDOM, CLEAR)
- Implemented phase-based conditional rendering in GlassHUD:
  - Countdown display: shown only during COUNTDOWN phase
  - Timer display: shown only during RUNNING phase
  - STEP button: disabled during non-PLANNING phases
- GlassHUD now serves as the single source of truth for main UI controls
- Removed ~100 lines of inline UI code from Game.tsx, improving code organization
- All tests passing (240 total)
- Type checking and linting passing
- GlassHUD integration now complete with all core UI controls implemented

**Technical Decisions:**

- GlassHUD component centralized all main UI controls into a single reusable component
- Phase-based conditional rendering in GlassHUD follows phase management rules
- Countdown and Timer displays use phaseState.countdownValue and phaseState.timerRemaining
- Generation counter tracked via generation state in Game.tsx and passed to GlassHUD
- STEP button uses onStep callback prop to execute stepSimulation in Game.tsx
- UI controls disabled during COUNTDOWN phase (no input allowed during countdown)
- Glass HUD container uses backdrop-filter blur for glassmorphism effect
- Floating overlay positioned at bottom of screen for mobile-friendly accessibility
