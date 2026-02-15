import { useState, useEffect, useRef } from 'react'
import type { TransitionState, TransitionConfig } from '../types'

const DEFAULT_CONFIG: TransitionConfig = {
  fadeOutDuration: 2000,
  fadeInDuration: 2000,
  interstitialDuration: 2000,
  autoAdvanceDelay: 2000,
  skipEnabled: true,
}

interface TransitionStateInternal {
  current: TransitionState
  canTransition: boolean
}

export function useTransition(
  config: TransitionConfig = DEFAULT_CONFIG,
  onTransitionComplete?: () => void
) {
  const [transitionState, setTransitionState] = useState<TransitionStateInternal>({
    current: 'PLAYING',
    canTransition: false,
  })

  const timeoutRef = useRef<number | null>(null)

  const clearTimeoutRef = () => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  const startTransition = () => {
    setTransitionState({ current: 'FADING_OUT', canTransition: false })

    timeoutRef.current = window.setTimeout(() => {
      setTransitionState({ current: 'INTERSTITIAL', canTransition: false })

      timeoutRef.current = window.setTimeout(() => {
        setTransitionState({ current: 'FADING_IN', canTransition: false })

        timeoutRef.current = window.setTimeout(() => {
          setTransitionState({ current: 'READY', canTransition: true })
          onTransitionComplete?.()
        }, config.fadeInDuration)
      }, config.interstitialDuration)
    }, config.fadeOutDuration)
  }

  const skipTransition = () => {
    clearTimeoutRef()
    setTransitionState({ current: 'READY', canTransition: true })
    onTransitionComplete?.()
  }

  const resetTransition = () => {
    clearTimeoutRef()
    setTransitionState({ current: 'PLAYING', canTransition: false })
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (config.skipEnabled && (e.code === 'Space' || e.code === 'Escape')) {
      if (transitionState.current !== 'PLAYING' && transitionState.current !== 'READY') {
        skipTransition()
      }
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      clearTimeoutRef()
    }
  }, [config.skipEnabled, transitionState.current, skipTransition])

  return {
    transitionState: transitionState.current,
    isTransitioning: transitionState.current !== 'PLAYING' && transitionState.current !== 'READY',
    isFadingOut: transitionState.current === 'FADING_OUT',
    isInterstitial: transitionState.current === 'INTERSTITIAL',
    isFadingIn: transitionState.current === 'FADING_IN',
    isReady: transitionState.current === 'READY',
    startTransition,
    skipTransition,
    resetTransition,
  }
}
