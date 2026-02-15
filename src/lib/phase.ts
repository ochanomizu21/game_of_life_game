import type { GamePhase } from '../types'

export interface PhaseState {
  current: GamePhase
  countdownValue: number
  timerRemaining: number
  canTransition: boolean
  blockers: string[]
}

export type PhaseAction =
  | { type: 'START_COUNTDOWN' }
  | { type: 'DECREMENT_COUNTDOWN' }
  | { type: 'START_RUNNING'; duration: number }
  | { type: 'DECREMENT_TIMER' }
  | { type: 'FINISH_PHASE' }
  | { type: 'RESET_PHASE' }

const COUNTDOWN_SECONDS = 3
const FINISHED_DELAY_SECONDS = 2

const PHASE_TRANSITIONS: Record<GamePhase, GamePhase[]> = {
  PLANNING: ['COUNTDOWN'],
  COUNTDOWN: ['RUNNING'],
  RUNNING: ['FINISHED'],
  FINISHED: ['PLANNING'],
}

export function canTransition(from: GamePhase, to: GamePhase): boolean {
  return PHASE_TRANSITIONS[from].includes(to)
}

export function getBlockers(currentPhase: GamePhase, hasCells: boolean): string[] {
  const blockers: string[] = []

  if (currentPhase === 'PLANNING' && !hasCells) {
    blockers.push('Need at least 1 cell to start')
  }

  if (currentPhase === 'COUNTDOWN') {
    blockers.push('Cannot interact during countdown')
  }

  return blockers
}

export function createInitialPhaseState(): PhaseState {
  return {
    current: 'PLANNING',
    countdownValue: COUNTDOWN_SECONDS,
    timerRemaining: 0,
    canTransition: false,
    blockers: [],
  }
}

export function phaseReducer(
  state: PhaseState,
  action: PhaseAction,
  hasCells: boolean
): PhaseState {
  switch (action.type) {
    case 'START_COUNTDOWN': {
      if (!canTransition(state.current, 'COUNTDOWN')) {
        return state
      }

      const blockers = getBlockers(state.current, hasCells)
      if (blockers.length > 0) {
        return { ...state, canTransition: false, blockers }
      }

      return {
        current: 'COUNTDOWN',
        countdownValue: COUNTDOWN_SECONDS,
        timerRemaining: 0,
        canTransition: false,
        blockers: [],
      }
    }

    case 'DECREMENT_COUNTDOWN': {
      if (state.current !== 'COUNTDOWN') {
        return state
      }

      const newValue = state.countdownValue - 1

      if (newValue <= 0) {
        return {
          ...state,
          countdownValue: 0,
          canTransition: true,
        }
      }

      return {
        ...state,
        countdownValue: newValue,
      }
    }

    case 'START_RUNNING': {
      if (!canTransition(state.current, 'RUNNING')) {
        return state
      }

      return {
        current: 'RUNNING',
        countdownValue: 0,
        timerRemaining: action.duration,
        canTransition: false,
        blockers: [],
      }
    }

    case 'DECREMENT_TIMER': {
      if (state.current !== 'RUNNING') {
        return state
      }

      const newValue = state.timerRemaining - 1

      if (newValue <= 0) {
        return {
          ...state,
          timerRemaining: 0,
          canTransition: true,
        }
      }

      return {
        ...state,
        timerRemaining: newValue,
      }
    }

    case 'FINISH_PHASE': {
      if (!canTransition(state.current, 'FINISHED')) {
        return state
      }

      return {
        current: 'FINISHED',
        countdownValue: 0,
        timerRemaining: FINISHED_DELAY_SECONDS,
        canTransition: false,
        blockers: [],
      }
    }

    case 'RESET_PHASE': {
      return {
        current: 'PLANNING',
        countdownValue: COUNTDOWN_SECONDS,
        timerRemaining: 0,
        canTransition: false,
        blockers: [],
      }
    }

    default:
      return state
  }
}
