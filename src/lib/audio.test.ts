import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SoundEngine, createInitialAudioParams, validateAudioParams } from './audio'
import type { AudioParams } from '../types'

describe('audio', () => {
  let mockAudioContext: any
  let AudioContextMock: any

  beforeEach(() => {
    mockAudioContext = {
      state: 'running',
      createOscillator: vi.fn().mockReturnValue({
        frequency: { value: 0 },
        type: 'sine',
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      }),
      createGain: vi.fn().mockReturnValue({
        gain: {
          setValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
      }),
      resume: vi.fn().mockResolvedValue(undefined),
      currentTime: 0,
    }

    AudioContextMock = vi.fn(() => mockAudioContext)
    ;(window as any).AudioContext = AudioContextMock
    ;(window as any).webkitAudioContext = AudioContextMock
  })

  describe('SoundEngine', () => {
    it('should create a SoundEngine instance', () => {
      const engine = new SoundEngine()
      expect(engine).toBeDefined()
    })

    it('should set enabled state', () => {
      const engine = new SoundEngine()
      engine.setEnabled(true)
      engine.setEnabled(false)
    })

    it('should set volume', () => {
      const engine = new SoundEngine()
      engine.setVolume(0.25)
      engine.setVolume(0.0)
      engine.setVolume(0.5)
    })

    it('should set waveform', () => {
      const engine = new SoundEngine()
      engine.setWaveform('sine')
      engine.setWaveform('triangle')
      engine.setWaveform('square')
      engine.setWaveform('sawtooth')
    })

    it('should not play generation sound when disabled', () => {
      const engine = new SoundEngine()
      engine.setEnabled(false)
      engine.playGenerationSound(5, 10, 20)
      expect(mockAudioContext.createOscillator).not.toHaveBeenCalled()
    })

    it('should not play generation sound when bornCount is 0', () => {
      const engine = new SoundEngine()
      engine.setEnabled(true)
      engine.playGenerationSound(0, 10, 20)
      expect(mockAudioContext.createOscillator).not.toHaveBeenCalled()
    })

    it('should not play interaction sound when disabled', () => {
      const engine = new SoundEngine()
      engine.setEnabled(false)
      engine.playInteractionSound('draw')
      expect(mockAudioContext.createOscillator).not.toHaveBeenCalled()
    })

    it('should not play flux error sound when disabled', () => {
      const engine = new SoundEngine()
      engine.setEnabled(false)
      engine.playFluxErrorSound()
      expect(mockAudioContext.createOscillator).not.toHaveBeenCalled()
    })

    it('should not throw error when playing flux error sound', () => {
      const engine = new SoundEngine()
      engine.setEnabled(true)
      expect(() => engine.playFluxErrorSound()).not.toThrow()
    })
  })

  describe('createInitialAudioParams', () => {
    it('should create initial audio params with correct defaults', () => {
      const params = createInitialAudioParams()

      expect(params.enabled).toBe(false)
      expect(params.volume).toBe(0.1)
      expect(params.waveform).toBe('sine')
    })
  })

  describe('validateAudioParams', () => {
    it('should validate correct audio params', () => {
      const params: AudioParams = {
        enabled: true,
        volume: 0.1,
        waveform: 'sine',
      }

      expect(validateAudioParams(params)).toBe(true)
    })

    it('should reject invalid enabled type', () => {
      const params = {
        enabled: 'true' as any,
        volume: 0.1,
        waveform: 'sine' as const,
      }

      expect(validateAudioParams(params)).toBe(false)
    })

    it('should reject invalid volume type', () => {
      const params = {
        enabled: true,
        volume: '0.1' as any,
        waveform: 'sine' as const,
      }

      expect(validateAudioParams(params)).toBe(false)
    })

    it('should reject volume out of range (too low)', () => {
      const params = {
        enabled: true,
        volume: -0.1,
        waveform: 'sine' as const,
      }

      expect(validateAudioParams(params)).toBe(false)
    })

    it('should reject volume out of range (too high)', () => {
      const params = {
        enabled: true,
        volume: 0.6,
        waveform: 'sine' as const,
      }

      expect(validateAudioParams(params)).toBe(false)
    })

    it('should accept volume at boundary (0)', () => {
      const params = {
        enabled: true,
        volume: 0,
        waveform: 'sine' as const,
      }

      expect(validateAudioParams(params)).toBe(true)
    })

    it('should accept volume at boundary (0.5)', () => {
      const params = {
        enabled: true,
        volume: 0.5,
        waveform: 'sine' as const,
      }

      expect(validateAudioParams(params)).toBe(true)
    })

    it('should reject invalid waveform', () => {
      const params = {
        enabled: true,
        volume: 0.1,
        waveform: 'invalid' as any,
      }

      expect(validateAudioParams(params)).toBe(false)
    })

    it('should accept all valid waveforms', () => {
      const waveforms: Array<'sine' | 'triangle' | 'square' | 'sawtooth'> = [
        'sine',
        'triangle',
        'square',
        'sawtooth',
      ]

      waveforms.forEach((waveform) => {
        const params = {
          enabled: true,
          volume: 0.1,
          waveform,
        }

        expect(validateAudioParams(params)).toBe(true)
      })
    })
  })
})
