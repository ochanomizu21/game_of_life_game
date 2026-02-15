# Spec: Auto-Advance Transitions

## Overview
Seamless level progression system with cinematic fade transitions between completed levels.

## Functional Requirements

### Transition Trigger
```typescript
interface TransitionConfig {
  fadeOutDuration: number;        // Default: 2.0s
  fadeInDuration: number;         // Default: 2.0s
  interstitialDuration: number;   // Default: 2.0s (black screen)
  autoAdvanceDelay: number;       // Default: 2.0s (time on finished screen)
  skipEnabled: boolean;            // Allow skipping transitions (Space/ESC)
}
```

```typescript
type TransitionState = 
  | 'PLAYING'           // Normal gameplay
  | 'FADING_OUT'        // Fade to black
  | 'INTERSTITIAL'      // Black screen, show level info
  | 'FADING_IN'         // Fade from black
  | 'READY';            // Next level loaded, waiting for input
```

### Transition Sequence

#### FINISHED → Next Level (Success)
1. **FINISHED Phase Display** (2.0s):
   - Show final score
   - Show "Level Complete" text
   - Continue rendering simulation (visual only, no scoring)
   - **SKIP**: Press Space/ESC to skip to fade out immediately

2. **Fade Out** (2.0s):
   - Full-screen black overlay opacity 0→1
   - Easing: ease-in-out
   - Simulation continues but hidden
   - **SKIP**: Press Space/ESC to skip to interstitial immediately

3. **Interstitial** (2.0s):
   - Full black screen
   - Center: "Level X Complete" (fading out)
   - Center: "Level X+1" (fading in)
   - Load next level configuration
   - Reset game state (Flux, Score resets - no carryover between levels)
   - **SKIP**: Press Space/ESC to skip to fade in immediately

4. **Fade In** (2.0s):
   - Black overlay opacity 1→0
   - New level visible with fresh grid
   - Simulation stopped, waiting for countdown to finish
   - PLANNING phase ready after countdown
   - **SKIP**: Press Space/ESC to skip to READY immediately

5. **READY**:
   - Player can immediately start placing cells

#### FINISHED → Game Over (Failure)
- Similar fade sequence but to "Game Over" screen
- Option to "Retry Level" or "Return to Menu"
- No auto-advance on failure (wait for input)

## UI/UX Requirements

### Fade Overlay
- **Element**: Fixed position div covering viewport
- **Color**: Black (#000000)
- **Z-Index**: Above all game elements, below modals
- **Pointer Events**: None (let clicks pass through if needed)

### Interstitial Display
- **Level Complete Text**: "Level X Complete" - fade out during fade-to-black
- **Next Level Text**: "Level X+1" - fade in during fade-from-black
- **Font**: Large, bold, centered
- **Optional**: Show quick stats ("Score: Y")

### Skip Indicator
- **Prompt**: "Press Space or ESC to skip" (small text at bottom)
- **Visibility**: Shown during all transition phases
- **Fade out**: Hide during READY state

### Audio
- **Fade Out**: "Level Complete" chime/sound
- **Interstitial**: Brief ambient or silence
- **Fade In**: "Level Start" sound (distinct from first level)

### Visual Effects
- **Blur**: Slight blur on game during fade (optional polish)
- **Progress**: Optional progress bar showing "X of Y levels"

## Edge Cases

 1. **Browser Tab During Transition**: If user switches tabs mid-transition:
     - Pause transition timer to prevent level from advancing unseen
     - Resume when tab becomes active again
     - Note: This only applies to transitions - during gameplay, the game timer continues running when tab is inactive

 2. **Rapid Success**: Player beating levels very quickly:
     - Skip mechanism prevents transitions from feeling tedious
     - Allow holding Space/ESC to skip all transitions

 3. **Last Level**: After final level:
     - Fade to "Victory" screen instead of next level
     - Show total score accumulated across all levels
     - Provide "Play Again" or "Return to Level 1"

 4. **Interruption**: Player presses key during transition:
     - Space/Escape: Skip to end of transition (immediately jump to READY state)
     - Skip works at any point during transition sequence

 5. **Performance**: Low-end devices might struggle with opacity animations:
     - Use CSS `will-change: opacity`
     - Consider reducing animation complexity

## Implementation Notes

- Use CSS transitions for smooth 60fps fades
- React state machine for transition phases
- Preload next level assets during fade-out if possible
- Audio: Fade volume during transition (not abrupt cut)
- Mobile: Ensure transitions work with reduced motion preferences (accessibility)
- Skip transitions configurable in Expert Settings
- Test with all browser zoom levels to ensure overlay covers fully
