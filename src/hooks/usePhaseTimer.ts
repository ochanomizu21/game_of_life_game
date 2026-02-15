import { useReducer, useEffect, useRef, useCallback } from 'react'
import {
  phaseReducer,
  createInitialPhaseState,
  type PhaseAction,
  type PhaseState,
} from '../lib/phase'

export function usePhaseTimer(hasCells: () => boolean) {
  const [phaseState, dispatch] = useReducer(
    (state: PhaseState, action: PhaseAction) => phaseReducer(state, action, hasCells()),
    createInitialPhaseState()
  )

  const timerIntervalRef = useRef<number | undefined>(undefined)
  const hiddenTimestampRef = useRef<number | undefined>(undefined)
  const elapsedWhileHiddenRef = useRef<number>(0)

  const startTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      window.clearInterval(timerIntervalRef.current)
    }

    timerIntervalRef.current = window.setInterval(() => {
      if (phaseState.current === 'COUNTDOWN') {
        dispatch({ type: 'DECREMENT_COUNTDOWN' })
      } else if (phaseState.current === 'RUNNING') {
        dispatch({ type: 'DECREMENT_TIMER' })
      } else if (phaseState.current === 'FINISHED' && phaseState.timerRemaining > 0) {
        dispatch({ type: 'DECREMENT_TIMER' })
      }
    }, 1000)
  }, [phaseState.current])

  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      hiddenTimestampRef.current = Date.now()
      if (timerIntervalRef.current) {
        window.clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = undefined
      }
    } else {
      if (hiddenTimestampRef.current) {
        const elapsed = Date.now() - hiddenTimestampRef.current
        elapsedWhileHiddenRef.current += elapsed
        hiddenTimestampRef.current = undefined

        const totalElapsedSeconds = Math.floor(elapsedWhileHiddenRef.current / 1000)

        if (phaseState.current === 'COUNTDOWN' && totalElapsedSeconds > 0) {
          for (let i = 0; i < totalElapsedSeconds; i++) {
            dispatch({ type: 'DECREMENT_COUNTDOWN' })
          }
        } else if (phaseState.current === 'RUNNING' && totalElapsedSeconds > 0) {
          for (let i = 0; i < totalElapsedSeconds; i++) {
            dispatch({ type: 'DECREMENT_TIMER' })
          }
        }

        elapsedWhileHiddenRef.current = 0
      }

      startTimer()
    }
  }, [phaseState, startTimer])

  const startCountdown = useCallback(() => {
    dispatch({ type: 'START_COUNTDOWN' })
  }, [])

  const startRunning = useCallback((duration: number) => {
    dispatch({ type: 'START_RUNNING', duration })
  }, [])

  const finishPhase = useCallback(() => {
    dispatch({ type: 'FINISH_PHASE' })
  }, [])

  const resetPhase = useCallback(() => {
    dispatch({ type: 'RESET_PHASE' })
  }, [])

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (timerIntervalRef.current) {
        window.clearInterval(timerIntervalRef.current)
      }
    }
  }, [handleVisibilityChange])

  useEffect(() => {
    if (
      phaseState.current === 'COUNTDOWN' ||
      phaseState.current === 'RUNNING' ||
      (phaseState.current === 'FINISHED' && phaseState.timerRemaining > 0)
    ) {
      startTimer()
    } else {
      if (timerIntervalRef.current) {
        window.clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = undefined
      }
    }
  }, [phaseState.current, startTimer])

  useEffect(() => {
    if (phaseState.current === 'COUNTDOWN' && phaseState.canTransition) {
      startRunning(45)
    }
  }, [phaseState.canTransition, phaseState, startRunning])

  useEffect(() => {
    if (phaseState.current === 'RUNNING' && phaseState.canTransition) {
      finishPhase()
    }
  }, [phaseState.canTransition, phaseState, finishPhase])

  useEffect(() => {
    if (phaseState.current === 'FINISHED' && phaseState.canTransition) {
      resetPhase()
    }
  }, [phaseState.canTransition, phaseState, resetPhase])

  return {
    phaseState,
    startCountdown,
    startRunning,
    finishPhase,
    resetPhase,
  }
}
