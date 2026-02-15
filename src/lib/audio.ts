import type { AudioParams } from '../types'

export function createInitialAudioParams(): AudioParams {
  return {
    enabled: false,
    volume: 0.1,
    waveform: 'sine',
  }
}

export function validateAudioParams(params: AudioParams): boolean {
  if (typeof params.enabled !== 'boolean') return false
  if (typeof params.volume !== 'number') return false
  if (params.volume < 0 || params.volume > 0.5) return false
  if (!['sine', 'triangle', 'square', 'sawtooth'].includes(params.waveform)) {
    return false
  }
  return true
}

export class SoundEngine {
  private audioContext: AudioContext | null = null
  private enabled: boolean = false
  private volume: number = 0.1
  private waveform: OscillatorType = 'sine'
  private readonly FREQUENCY_RANGE = 880
  private readonly DRAW_FREQUENCY = 880
  private readonly ERASE_FREQUENCY = 440

  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  setVolume(volume: number): void {
    this.volume = volume
  }

  setWaveform(waveform: 'sine' | 'triangle' | 'square' | 'sawtooth'): void {
    this.waveform = waveform
  }

  playGenerationSound(bornCount: number, avgRow: number, totalRows: number): void {
    if (!this.enabled || bornCount <= 0) return

    this.ensureAudioContext()

    if (!this.audioContext) return

    try {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      const frequency = (1 - avgRow / totalRows) * this.FREQUENCY_RANGE
      oscillator.frequency.value = frequency
      oscillator.type = this.waveform

      const volume = Math.min(this.volume * Math.sqrt(bornCount), 0.5)
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15)

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + 0.15)
    } catch (error) {
      console.error('Error playing generation sound:', error)
    }
  }

  playInteractionSound(type: 'draw' | 'erase'): void {
    if (!this.enabled) return

    this.ensureAudioContext()

    if (!this.audioContext) return

    try {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      const frequency = type === 'draw' ? this.DRAW_FREQUENCY : this.ERASE_FREQUENCY
      oscillator.frequency.value = frequency
      oscillator.type = this.waveform

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.005)
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.05)

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + 0.05)
    } catch (error) {
      console.error('Error playing interaction sound:', error)
    }
  }

  playLevelCompleteSound(): void {
    if (!this.enabled) return

    this.ensureAudioContext()

    if (!this.audioContext) return

    try {
      const oscillator1 = this.audioContext.createOscillator()
      const oscillator2 = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator1.frequency.value = 523.25
      oscillator2.frequency.value = 659.25
      oscillator1.type = this.waveform
      oscillator2.type = this.waveform

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3)

      oscillator1.connect(gainNode)
      oscillator2.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator1.start(this.audioContext.currentTime)
      oscillator2.start(this.audioContext.currentTime)
      oscillator1.stop(this.audioContext.currentTime + 0.3)
      oscillator2.stop(this.audioContext.currentTime + 0.3)
    } catch (error) {
      console.error('Error playing level complete sound:', error)
    }
  }

  playLevelStartSound(): void {
    if (!this.enabled) return

    this.ensureAudioContext()

    if (!this.audioContext) return

    try {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.frequency.value = 440
      oscillator.type = this.waveform

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2)

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + 0.2)
    } catch (error) {
      console.error('Error playing level start sound:', error)
    }
  }

  playTransitionSound(type: 'fade-out' | 'fade-in'): void {
    if (!this.enabled) return

    this.ensureAudioContext()

    if (!this.audioContext) return

    try {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      const frequency = type === 'fade-out' ? 300 : 400
      oscillator.frequency.value = frequency
      oscillator.type = this.waveform

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(this.volume * 0.5, this.audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15)

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + 0.15)
    } catch (error) {
      console.error('Error playing transition sound:', error)
    }
  }

  playSimulationStartSound(): void {
    if (!this.enabled) return

    this.ensureAudioContext()

    if (!this.audioContext) return

    try {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.frequency.value = 330
      oscillator.type = this.waveform

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.005)
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1)

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + 0.1)
    } catch (error) {
      console.error('Error playing simulation start sound:', error)
    }
  }

  private ensureAudioContext(): void {
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      } catch (error) {
        console.error('Error creating AudioContext:', error)
      }
    } else if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch((error) => {
        console.error('Error resuming AudioContext:', error)
      })
    }
  }

  getContextState(): AudioContextState | null {
    return this.audioContext?.state ?? null
  }
}
