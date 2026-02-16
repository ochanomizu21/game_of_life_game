import { logger } from './logger'

export interface FeatureDetectionResult {
  audio: boolean
  canvas: boolean
  localStorage: boolean
  requestAnimationFrame: boolean
  performance: boolean
  devicePixelRatio: boolean
  visibility: boolean
  touch: boolean
  keyboard: boolean
}

export const features: FeatureDetectionResult = {
  audio: checkWebAudioSupport(),
  canvas: checkCanvasSupport(),
  localStorage: checkLocalStorageSupport(),
  requestAnimationFrame: 'requestAnimationFrame' in window,
  performance: 'performance' in window && 'now' in window.performance,
  devicePixelRatio: 'devicePixelRatio' in window,
  visibility: 'hidden' in document,
  touch: 'ontouchstart' in window,
  keyboard: true,
}

function checkWebAudioSupport(): boolean {
  return (
    'AudioContext' in window ||
    'webkitAudioContext' in (window as unknown as { webkitAudioContext?: unknown })
  )
}

function checkCanvasSupport(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext && canvas.getContext('2d'))
  } catch {
    return false
  }
}

function checkLocalStorageSupport(): boolean {
  try {
    const test = '__localStorage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

export function logUnsupportedFeatures(): void {
  const unsupported: string[] = []

  if (!features.audio) unsupported.push('Web Audio API')
  if (!features.canvas) unsupported.push('Canvas API')
  if (!features.localStorage) unsupported.push('localStorage')
  if (!features.requestAnimationFrame) unsupported.push('requestAnimationFrame')
  if (!features.performance) unsupported.push('performance.now()')
  if (!features.visibility) unsupported.push('Page Visibility API')

  if (unsupported.length > 0) {
    logger.warn(`Unsupported browser features detected: ${unsupported.join(', ')}`)
  }
}

export function getFeatureSupport(feature: keyof FeatureDetectionResult): boolean {
  return features[feature]
}

export function isBrowserSupported(): boolean {
  return features.canvas && features.requestAnimationFrame && features.localStorage
}
