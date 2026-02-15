# Spec: UI/Overlay System

## Overview
The UI system provides controls, configuration panels, and visual overlays including a cinematic intro, HUD controls, and responsive interface management for the Game of Life application.

## Functional Requirements

### Cinematic Intro Overlay

**Behavior**:
- Shows on app load
- Displays title: "CONWAY'S GAME OF LIFE" with glitch effect
- CTA button: "ENTER VOID"
- Exit animation: 1.2s fade/scale transition

**State**:
```typescript
interface IntroState {
  isIntro: boolean;    // Showing intro
  isExiting: boolean;  // Playing exit animation
}
```

**UI State During Intro**:
- Game renders in background
- UI controls hidden
- Audio may play (attract mode)

### Main Controls (HUD)

**Glass HUD Container**:
- Semi-transparent glass effect
- Floating overlay on bottom of screen
- Groups: Main controls, interaction modes, status

**Main Control Buttons**:
- **PLAY/PAUSE**: Toggle simulation running state
- **STEP**: Execute single generation (disabled while running)
- **RANDOM**: Fill grid randomly (15% cell density)
- **CLEAR**: Remove all cells, reset generation (red text color)

**Interaction Mode Buttons**:
- **DRAW**: Enable cell placement mode (active state highlighted)
- **ERASE**: Enable cell removal mode (active state highlighted)

**Status Controls**:
- **Waveform Selector**: Dropdown (Sine, Triangle, Square, Saw)
- **Volume Slider**: Range 0-0.5, 0.01 step
- **Generation Counter**: Display "GEN: {number}"
- **Settings Toggle**: Gear icon button (⚙️)

### Phase Status Display

**Visibility**: Always visible

**Layout**:
- Shows current phase: PLANNING, COUNTDOWN, RUNNING, FINISHED
- Timer display (visible during COUNTDOWN and RUNNING phases)
- Flux counter (visible during PLANNING and RUNNING phases)

### Settings Panel

**Access**: Click gear icon in HUD

**Configuration Options**:

1. **Speed**: Slider (10ms to 500ms)

2. **Grid Size**: Buttons for Small (20×30), Medium (40×50), Large (60×80)

3. **Visuals**:
   - Checkbox: Show grid lines

4. **Audio**:
   - Checkbox: Enable sonification

5. **Expert Settings**:
   - Access to Expert Settings panel (for tuning game parameters)

**Close**: × button in header

### UI Toggle

**Toggle Button**:
- Icon frame (minimal)
- Click to show/hide all UI
- Hidden when `enableUI` prop is false (intro mode)
- Position: Fixed corner

## Implementation Architecture

### State Management

```typescript
interface UIState {
  isUiVisible: boolean;        // Master visibility toggle
  isIntro: boolean;            // Intro overlay active
  isExiting: boolean;          // Intro exit animation
  showSettings: boolean;       // Settings panel open
  enableUI: boolean;           // Prop from App (false during intro)
}
```

### Component Hierarchy

```
App
├── IntroOverlay (conditional on isIntro)
├── GameOfLife
│   ├── CanvasGrid
│   ├── UIToggleButton
│   └── GlassHUDContainer (conditional on enableUI && isUiVisible)
│       ├── GlassHUD
│       └── SettingsPanel (conditional on showSettings)
```

## CSS Architecture

### Glass Effect
```css
.glass-hud {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
}
```

### Button States
- **Active**: Highlighted background/border
- **Disabled**: Opacity reduced, no pointer events
- **Hover**: Slight brightness increase

### Animations
- **Intro Exit**: Scale and fade out over 1.2s
- **Panel Open**: Slide in from side
- **Button Hover**: Scale/brightness transition

## Responsive Design

- **Desktop**: Full width HUD centered at bottom
- **Mobile**: Controls may stack or scroll
- **Touch**: Minimum 44px touch targets
- **Canvas**: Adapts to window size, grid scales accordingly

## Edge Cases

1. **Intro Exit**: Wait 1.2s for animation before removing component
2. **UI Hidden**: All controls invisible, toggle button still accessible
3. **Settings During Run**: Settings apply immediately, no pause required
4. **Grid Size Change**: Resets simulation
5. **Clear Grid**: Removes all cells, resets generation

## Dependencies

- All systems: Configurable via settings panel
- Core simulation: Speed and size settings affect simulation
- Audio system: Enable toggle controls sonification
- Canvas rendering: Grid line option
- User interaction: Mode buttons select draw/erase
- Phase management: Phase display shows current game state
