import { useState, useEffect, useRef, useCallback } from 'react'
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

interface TransitionTimer {
  timeoutId: number | null
  startTime: number | null
  remainingTime: number
}

export function useTransition(
  config: TransitionConfig = DEFAULT_CONFIG,
  onTransitionComplete?: () => void,
  onTransitionSound?: (state: 'fade-out' | 'fade-in') => void
) {
  const [transitionState, setTransitionState] = useState<TransitionStateInternal>({
    current: 'PLAYING',
    canTransition: false,
  })

  const timeoutRef = useRef<number | null>(null)
  const transitionTimers = useRef<Map<TransitionState, TransitionTimer>>(new Map())
  const isTabHidden = useRef(false)

  const clearTimeoutRef = () => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  const startTransition = () => {
    clearTimeoutRef()
    setTransitionState({ current: 'FADING_OUT', canTransition: false })
    onTransitionSound?.('fade-out')

    const runTransitionSequence = () => {
      if (isTabHidden.current) {
        transitionTimers.current.set('FADING_OUT', {
          timeoutId: null,
          startTime: null,
          remainingTime: config.fadeOutDuration,
        })
        return
      }

      timeoutRef.current = window.setTimeout(() => {
        setTransitionState({ current: 'INTERSTITIAL', canTransition: false })

        timeoutRef.current = window.setTimeout(() => {
          setTransitionState({ current: 'FADING_IN', canTransition: false })
          onTransitionSound?.('fade-in')

          timeoutRef.current = window.setTimeout(() => {
            setTransitionState({ current: 'READY', canTransition: true })
            onTransitionComplete?.()
          }, config.fadeInDuration)
        }, config.interstitialDuration)
      }, config.fadeOutDuration)
    }

    runTransitionSequence()
  }

  const skipTransition = () => {
    clearTimeoutRef()
    transitionTimers.current.clear()
    setTransitionState({ current: 'READY', canTransition: true })
    onTransitionComplete?.()
  }

  const resetTransition = () => {
    clearTimeoutRef()
    transitionTimers.current.clear()
    setTransitionState({ current: 'PLAYING', canTransition: false })
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (config.skipEnabled && (e.code === 'Space' || e.code === 'Escape')) {
      if (transitionState.current !== 'PLAYING' && transitionState.current !== 'READY') {
        skipTransition()
      }
    }
  }

  const resumeTransition = useCallback(() => {
    const timer = transitionTimers.current.get(transitionState.current)
    if (timer && timer.remainingTime > 0) {
      clearTimeoutRef()

      const runResumeSequence = () => {
        timeoutRef.current = window.setTimeout(() => {
          if (transitionState.current === 'FADING_OUT') {
            setTransitionState({ current: 'INTERSTITIAL', canTransition: false })

            timeoutRef.current = window.setTimeout(() => {
              setTransitionState({ current: 'FADING_IN', canTransition: false })
              onTransitionSound?.('fade-in')

              timeoutRef.current = window.setTimeout(() => {
                setTransitionState({ current: 'READY', canTransition: true })
                onTransitionComplete?.()
              }, config.fadeInDuration)
            }, config.interstitialDuration)
          } else if (transitionState.current === 'INTERSTITIAL') {
            setTransitionState({ current: 'FADING_IN', canTransition: false })
            onTransitionSound?.('fade-in')

            timeoutRef.current = window.setTimeout(() => {
              setTransitionState({ current: 'READY', canTransition: true })
              onTransitionComplete?.()
            }, config.fadeInDuration)
          } else if (transitionState.current === 'FADING_IN') {
            setTransitionState({ current: 'READY', canTransition: true })
            onTransitionComplete?.()
          }
        }, timer.remainingTime)
      }

      runResumeSequence()
      transitionTimers.current.delete(transitionState.current)
    }
  }, [transitionState, config, onTransitionComplete])

  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      isTabHidden.current = true
      clearTimeoutRef()

      const timer: TransitionTimer = {
        timeoutId: null,
        startTime: Date.now(),
        remainingTime: 0,
      }

      switch (transitionState.current) {
        case 'FADING_OUT':
          timer.remainingTime = config.fadeOutDuration
          break
        case 'INTERSTITIAL':
          timer.remainingTime = config.interstitialDuration
          break
        case 'FADING_IN':
          timer.remainingTime = config.fadeInDuration
          break
        default:
          return
      }

      transitionTimers.current.set(transitionState.current, timer)
    } else {
      isTabHidden.current = false
      resumeTransition()
    }
  }, [transitionState, config, resumeTransition])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('visibilitychange', handleVisibilityChange)
      clearTimeoutRef()
    }
  }, [config.skipEnabled, transitionState.current, skipTransition, handleVisibilityChange])

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
