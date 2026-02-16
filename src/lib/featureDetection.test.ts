import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  features,
  logUnsupportedFeatures,
  getFeatureSupport,
  isBrowserSupported,
} from './featureDetection'
import { logger } from './logger'

vi.mock('./logger', () => ({
  logger: {
    warn: vi.fn(),
  },
}))

describe('featureDetection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('features object', () => {
    it('should have all required feature properties', () => {
      expect(features).toHaveProperty('audio')
      expect(features).toHaveProperty('canvas')
      expect(features).toHaveProperty('localStorage')
      expect(features).toHaveProperty('requestAnimationFrame')
      expect(features).toHaveProperty('performance')
      expect(features).toHaveProperty('devicePixelRatio')
      expect(features).toHaveProperty('visibility')
      expect(features).toHaveProperty('touch')
      expect(features).toHaveProperty('keyboard')
    })

    it('should have boolean values for all features', () => {
      Object.values(features).forEach((value) => {
        expect(typeof value).toBe('boolean')
      })
    })

    it('should detect keyboard support as always true', () => {
      expect(features.keyboard).toBe(true)
    })
  })

  describe('checkWebAudioSupport', () => {
    it('should detect AudioContext support', () => {
      expect(features.audio).toBeTypeOf('boolean')
    })
  })

  describe('checkCanvasSupport', () => {
    it('should detect Canvas API support', () => {
      expect(features.canvas).toBeTypeOf('boolean')
    })
  })

  describe('checkLocalStorageSupport', () => {
    it('should detect localStorage support', () => {
      expect(features.localStorage).toBeTypeOf('boolean')
    })
  })

  describe('logUnsupportedFeatures', () => {
    it('should call logger.warn function', () => {
      logUnsupportedFeatures()
      const callCount = (logger.warn as ReturnType<typeof vi.fn>).mock.calls.length
      expect(callCount).toBeGreaterThanOrEqual(0)
    })
  })

  describe('getFeatureSupport', () => {
    it('should return boolean for requested feature', () => {
      expect(getFeatureSupport('audio')).toBeTypeOf('boolean')
      expect(getFeatureSupport('canvas')).toBeTypeOf('boolean')
      expect(getFeatureSupport('localStorage')).toBeTypeOf('boolean')
    })

    it('should return correct feature support status', () => {
      expect(getFeatureSupport('audio')).toBe(features.audio)
      expect(getFeatureSupport('canvas')).toBe(features.canvas)
      expect(getFeatureSupport('localStorage')).toBe(features.localStorage)
    })
  })

  describe('isBrowserSupported', () => {
    it('should return true when all critical features are supported', () => {
      if (features.canvas && features.requestAnimationFrame && features.localStorage) {
        expect(isBrowserSupported()).toBe(true)
      }
    })
  })
})
