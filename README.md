# Conway's Game of Life

A strategic cellular automaton puzzle game built with React, TypeScript, and Vite. Experience Conway's classic rules enhanced with scoring, level progression, audio sonification, and expert customization.

[![Tests](https://img.shields.io/badge/tests-364%20passing-brightgreen)](https://github.com/ochanomizu21/game_of_life_game)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-blue)](https://react.dev/)
[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)

## Overview

This implementation of Conway's Game of Life transforms the classic cellular automaton into a strategic puzzle game with:

- **Progressive Levels**: 10 levels with increasing difficulty and time constraints
- **Resource Management**: Strategic Flux system for cell placement
- **Pattern Scoring**: Points for moving and oscillating patterns
- **Audio Sonification**: Real-time sounds based on cellular activity
- **Expert Customization**: Tunable parameters for advanced players
- **Cinematic Experience**: Smooth transitions, animations, and polished UI

## Installation

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/ochanomizu21/game_of_life_game.git
cd game_of_life_game

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## Controls

### Keyboard Shortcuts

| Key            | Action                                    |
| -------------- | ----------------------------------------- |
| ` ` (backtick) | Toggle Expert Settings panel              |
| `G`            | Toggle grid lines (during PLANNING phase) |
| `Space`        | Skip transition phase                     |
| `ESC`          | Skip transition phase                     |

### Mouse/Touch Controls

- **Click/Tap**: Place cell on empty grid cell (DRAW mode)
- **Click/Tap**: Remove cell on live cell with Flux refund (PLANNING phase)
- **Drag**: Draw multiple cells continuously
- **Settings Gear**: Open Expert Settings panel
- **UI Toggle Button**: Show/hide all UI elements

### Mobile Gestures

- **Triple-tap (top-left corner)**: Open Expert Settings panel

## Game Mechanics

### Game Phases

#### 1. PLANNING Phase

- **Duration**: Unlimited
- **Actions**: Place/remove cells using Flux
- **Goal**: Create patterns that will maximize your score
- **Flux**: Starts at 20, refunds on removal

#### 2. COUNTDOWN Phase

- **Duration**: 3 seconds (3... 2... 1...)
- **Actions**: No input allowed
- **Purpose**: Final preparation before simulation starts

#### 3. RUNNING Phase

- **Duration**: Level-specific time limit (starts at 45s)
- **Actions**: Place cells using saved Flux (add-only)
- **Simulation**: Conway's rules execute automatically
- **Scoring**: Points awarded per generation for active patterns

#### 4. FINISHED Phase

- **Duration**: 2 seconds
- **Actions**: View-only
- **Outcome**: Final score and statistics
- **Next Level**: Auto-advance after fade transition

### Conway's Rules

1. **Birth**: Dead cell with exactly 3 neighbors becomes alive
2. **Survival**: Live cell with 2 or 3 neighbors stays alive
3. **Death**: Live cell with fewer than 2 or more than 3 neighbors dies

### Pattern Classification

The game classifies cellular patterns by tracking centroids over time:

- **MOVER**: Pattern that translates across the grid (e.g., gliders)
  - 10 points per generation
- **OSCILLATOR**: Pattern that cycles through states (e.g., blinkers, pulsars)
  - 2 points per generation
- **STATIC**: Pattern that remains unchanged (e.g., blocks, beehives)
  - 0 points per generation

### Flux System

- **Initial Flux**: 20 per level (configurable: 5-50)
- **Placement Cost**: 1 Flux per cell
- **Refund**: 1 Flux refunded when removing cells (PLANNING phase only)
- **Strategy**: Balance Flux between planning and play phases

### Level Progression

- **Levels**: 10 levels with increasing difficulty
- **Difficulty Scaling** (Expert Settings):
  - **TIME_ONLY**: Decreasing time, constant Flux
  - **RESOURCE_ONLY**: Constant time, decreasing Flux
  - **MIXED**: Both time and Flux decrease
  - **EXTREME**: Aggressive decrease in both

## Configuration Options

### Basic Settings (Glass HUD)

- **Grid Size**: Small (20×30), Medium (40×50), Large (60×80)
- **Show Grid Lines**: Toggle grid visibility (G key)
- **Simulation Speed**: 10ms to 500ms between steps
- **Audio**: Enable/disable sonification

### Expert Settings

Access via:

- Keyboard: ` (backtick)
- HUD: Gear icon button (⚙️)
- Mobile: Triple-tap top-left corner

#### Movement Detection Parameters

- **Centroid History Length**: Generations to track (3-10, default: 5)
- **Movement Threshold**: Cells to be considered "moving" (0.1-2.0, default: 0.5)
- **Minimum Cluster Size**: Minimum cells to track (1-5, default: 1)

#### Scoring Parameters

- **Mover Points**: Points per generation (1-100, default: 10)
- **Oscillator Points**: Points per generation (0-20, default: 2)
- **Score Multiplier**: Global score scaling (0.1-5.0, default: 1.0)

#### Level Generation Parameters

- **Base Time**: Initial level time (10-120s, default: 45s)
- **Time Increment**: Time added per level (0-60s, default: 15s)
- **Base Flux**: Initial Flux per level (5-50, default: 20)
- **Difficulty Mode**: TIME_ONLY, RESOURCE_ONLY, MIXED, EXTREME

#### Grid Sizing Parameters

- **Mobile Cell Size**: 14-24px (default: 18px)
- **Desktop Cell Size**: 16-28px (default: 20px)

#### Audio Parameters

- **Enable**: Enable/disable sonification
- **Volume**: 0.0-0.5 (default: 0.1)
- **Waveform**: Sine, Triangle, Square, Sawtooth

#### Presets

- **EASY**: Generous resources, longer time limits
- **NORMAL**: Balanced gameplay (default)
- **HARD**: Limited resources, shorter time
- **CHAOS**: Extreme parameters, unpredictable

#### Danger Zone

- **Chaos Multiplier**: Scoring difficulty scaling (0.5-10.0x)
- **Timer Speed**: Level time countdown speed (0.5-5.0x)

#### Persistence

- Settings automatically saved to localStorage
- Export settings as JSON for sharing
- Import settings from JSON file
- Reset to defaults button

## Development

### Project Structure

```
src/
├── components/      # React UI components
│   ├── CanvasGrid.tsx          # Game grid rendering
│   ├── GlassHUD.tsx            # Main UI controls
│   ├── SettingsPanel.tsx       # Expert settings
│   ├── ScoreDisplay.tsx        # Score display with animations
│   ├── FluxDisplay.tsx          # Flux counter display
│   ├── GridInteraction.tsx      # Cell placement/removal
│   ├── IntroOverlay.tsx         # Cinematic intro
│   ├── VictoryScreen.tsx        # End of game screen
│   ├── TransitionOverlay.tsx    # Level transitions
│   ├── LevelStats.tsx           # End-of-level statistics
│   ├── UIToggleButton.tsx       # UI visibility toggle
│   └── ErrorBoundary.tsx       # Global error handling
├── lib/              # Core game logic
│   ├── simulation.ts            # Conway's Game of Life rules
│   ├── phase.ts                 # Phase state machine
│   ├── flux.ts                  # Flux management
│   ├── interaction.ts           # Mouse/touch handling
│   ├── movement.ts              # Pattern classification
│   ├── scoring.ts               # Score calculation
│   ├── level.ts                 # Level generation
│   ├── audio.ts                 # Audio sonification
│   ├── canvasUtils.ts          # Canvas rendering utilities
│   ├── validation.ts           # Input validation
│   ├── logger.ts               # Logging utility
│   ├── state.ts                # State management
│   ├── settings.ts             # Expert settings
│   └── presets.ts             # Preset configurations
├── hooks/            # React custom hooks
│   ├── usePhaseTimer.ts         # Phase timer management
│   ├── useTransition.ts         # Transition state machine
│   └── useTripleTapGesture.ts  # Mobile gesture detection
├── types/            # TypeScript type definitions
│   └── index.ts
└── main.tsx          # Application entry point
```

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript type checking
npm run format       # Format code with Prettier

# Testing
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage report
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- src/lib/simulation.test.ts

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

Current test coverage: **364 tests passing** across 26 test files.

### Tech Stack

- **Framework**: React 19.2 with TypeScript 5.9
- **Build Tool**: Vite 7.3
- **Testing**: Vitest 4.0 with React Testing Library
- **Styling**: CSS with CSS variables for theming
- **Audio**: Web Audio API for sonification
- **Rendering**: HTML5 Canvas for high-performance grid rendering

## Architecture Highlights

### Performance Optimizations

- **Canvas Rendering**: Hardware-accelerated rendering with DPR scaling
- **React Refs**: Grid state stored in refs to avoid re-renders
- **Optimized Algorithms**: Precomputed neighbor offsets, circular buffers
- **Lazy Initialization**: AudioContext initialized on first interaction
- **Reduced Motion**: Respects `prefers-reduced-motion` media query

### State Management

- **React Hooks**: useState, useReducer, useRef for all state
- **Phase Machine**: Guarded transitions between game phases
- **Transition System**: State machine for level transitions
- **Local Storage**: Persistent settings and high scores

### Accessibility

- **Reduced Motion**: All animations respect motion preferences
- **Touch Targets**: Minimum 44×44px for mobile
- **Gesture Support**: Triple-tap for mobile settings access
- **Keyboard Shortcuts**: Quick access to settings and UI toggles

## Known Issues and Limitations

- **Browser Compatibility**: Requires modern browsers with Web Audio API and Canvas support
- **Touch Ripple Effect**: Not yet implemented (marked as optional)
- **Screen Reader Support**: ARIA labels partially implemented (WIP)
- **Keyboard Navigation**: Basic keyboard support exists, comprehensive navigation pending
- **High Contrast Mode**: Not yet implemented

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Run tests before submitting: `npm test`
2. Run linting: `npm run lint`
3. Run type checking: `npm run typecheck`
4. Follow the existing code style
5. Add tests for new features
6. Update documentation as needed

## License

ISC License - see LICENSE file for details

## Credits

- **Conway's Game of Life**: Invented by John Conway in 1970
- **Implementation**: Built with modern web technologies
- **Design**: Cyberpunk aesthetic with neon glow effects

## Resources

- [Conway's Game of Life Wikipedia](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [Vitest Documentation](https://vitest.dev/)

## Support

For issues, questions, or suggestions:

- Open an issue on [GitHub Issues](https://github.com/ochanomizu21/game_of_life_game.git/issues)
- Check existing documentation in `specs/` directory
- Review `IMPLEMENTATION_PLAN.md` for implementation details

---

**Version**: 0.1.7  
**Last Updated**: 2026-02-16  
**Status**: Production-ready core game with 364 passing tests
