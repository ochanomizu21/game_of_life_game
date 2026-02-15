# Spec: Audio Sonification System

## Overview
The audio sonification system generates real-time sounds based on simulation birth events and user interactions using the Web Audio API, providing audio feedback for cellular automaton behavior.

## Functional Requirements

### Sound Engine Interface

```typescript
interface SoundEngine {
  setEnabled(enabled: boolean): void;
  setVolume(volume: number): void;
  setWaveform(waveform: OscillatorType): void;
  playGenerationSound(bornCount: number, avgRow: number, totalRows: number): void;
  playInteractionSound(type: 'draw' | 'erase'): void;
}
```

### Generation Sounds

**Trigger**: After each simulation step with bornCount > 0

**Pitch Mapping**:
- Based on average row position of new births
- Formula: `pitch = (1 - avgRow / totalRows) * frequencyRange`
- Higher rows (top) = higher pitch
- Lower rows (bottom) = lower pitch

**Intensity Mapping**:
- Based on number of births: bornCount
- More births = louder/more prominent sound

**Waveform Types**:
- `sine`: Smooth, pure tone (default)
- `triangle`: Slightly richer harmonics
- `square`: Harsh, buzzy tone
- `sawtooth`: Bright, brassy tone

### Interaction Sounds

**Draw Sound**:
- Triggered when placing a cell
- Higher pitch, short duration

**Erase Sound**:
- Triggered when removing a cell
- Lower pitch, short duration

### Volume Control

- **Range**: 0.0 to 0.5
- **Default**: 0.1 (10%)
- **UI Slider**: 10ms steps, displays percentage (volume * 200%)

## Implementation Architecture

### Audio Context

```typescript
class SoundEngine {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.1;
  private waveform: OscillatorType = 'sine';

  // ... methods
}
```

### Sound Generation Process

1. **Initialize Context**: Create on first user interaction (browser requirement)
2. **Create Oscillator**: Generate sound with configured waveform
3. **Create Gain Node**: Control volume and envelope
4. **Connect Nodes**: Oscillator → Gain → Destination
5. **Set Parameters**: Frequency based on data, volume from setting
6. **Envelope**: Quick attack, exponential decay
7. **Cleanup**: Stop and disconnect after sound completes

### Lazy Initialization

- AudioContext created on first sound play
- Handles browser autoplay policies
- Resumes context if suspended

## Audio Parameters

### Generation Sound
```typescript
interface GenerationSoundParams {
  frequency: number;    // Derived from row position
  duration: number;     // Short, ~100-200ms
  volume: number;       // baseVolume * bornCount scaling
  waveform: OscillatorType;
}
```

### Interaction Sound
```typescript
interface InteractionSoundParams {
  drawFrequency: number;    // Higher pitch (~880Hz)
  eraseFrequency: number;   // Lower pitch (~440Hz)
  duration: number;         // Very short (~50ms)
  volume: number;          // baseVolume
  waveform: OscillatorType;
}
```

## Edge Cases

1. **No Births**: Sound not triggered
2. **Suspended Context**: Resume on next interaction
3. **Volume = 0**: Sounds generated but at 0 gain
4. **Disabled**: Engine returns early without generating sounds
5. **Multiple Events**: Concurrent sounds allowed (polyphonic)

## Browser Compatibility

- Requires Web Audio API support
- Modern browsers: Chrome, Firefox, Safari, Edge
- iOS: Requires user gesture to start
- Autoplay policy: Context starts suspended

## Dependencies

- Core simulation engine: Provides birth statistics
- User interaction system: Triggers draw/erase sounds
- UI/overlay system: Volume, waveform, enabled settings
