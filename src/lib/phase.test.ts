import { describe, it, expect } from 'vitest'
import {
  PhaseState,
  canTransition,
  getBlockers,
  createInitialPhaseState,
  phaseReducer,
  type PhaseAction,
} from './phase'

describe('canTransition', () => {
  it('should allow valid transitions', () => {
    expect(canTransition('PLANNING', 'COUNTDOWN')).toBe(true)
    expect(canTransition('COUNTDOWN', 'RUNNING')).toBe(true)
    expect(canTransition('RUNNING', 'FINISHED')).toBe(true)
    expect(canTransition('FINISHED', 'PLANNING')).toBe(true)
  })

  it('should disallow invalid transitions', () => {
    expect(canTransition('PLANNING', 'RUNNING')).toBe(false)
    expect(canTransition('PLANNING', 'FINISHED')).toBe(false)
    expect(canTransition('COUNTDOWN', 'PLANNING')).toBe(false)
    expect(canTransition('COUNTDOWN', 'FINISHED')).toBe(false)
    expect(canTransition('RUNNING', 'PLANNING')).toBe(false)
    expect(canTransition('RUNNING', 'COUNTDOWN')).toBe(false)
    expect(canTransition('FINISHED', 'RUNNING')).toBe(false)
    expect(canTransition('FINISHED', 'COUNTDOWN')).toBe(false)
  })
})

describe('getBlockers', () => {
  it('should return empty array when no blockers', () => {
    expect(getBlockers('PLANNING', true)).toEqual([])
    expect(getBlockers('RUNNING', false)).toEqual([])
    expect(getBlockers('FINISHED', false)).toEqual([])
  })

  it('should return blocker when no cells placed in PLANNING', () => {
    const blockers = getBlockers('PLANNING', false)
    expect(blockers).toEqual(['Need at least 1 cell to start'])
  })

  it('should return blocker during COUNTDOWN phase', () => {
    const blockers = getBlockers('COUNTDOWN', true)
    expect(blockers).toEqual(['Cannot interact during countdown'])
  })
})

describe('createInitialPhaseState', () => {
  it('should create initial phase state', () => {
    const state = createInitialPhaseState()

    expect(state.current).toBe('PLANNING')
    expect(state.countdownValue).toBe(3)
    expect(state.timerRemaining).toBe(0)
    expect(state.canTransition).toBe(false)
    expect(state.blockers).toEqual([])
  })
})

describe('phaseReducer', () => {
  const initialState: PhaseState = createInitialPhaseState()

  it('should handle START_COUNTDOWN action with valid transition', () => {
    const action: PhaseAction = { type: 'START_COUNTDOWN' }
    const newState = phaseReducer(initialState, action, true)

    expect(newState.current).toBe('COUNTDOWN')
    expect(newState.countdownValue).toBe(3)
    expect(newState.timerRemaining).toBe(0)
    expect(newState.canTransition).toBe(false)
  })

  it('should not handle START_COUNTDOWN when no cells placed', () => {
    const action: PhaseAction = { type: 'START_COUNTDOWN' }
    const newState = phaseReducer(initialState, action, false)

    expect(newState.current).toBe('PLANNING')
    expect(newState.canTransition).toBe(false)
    expect(newState.blockers).toContain('Need at least 1 cell to start')
  })

  it('should not handle START_COUNTDOWN from invalid phase', () => {
    const runningState: PhaseState = {
      current: 'RUNNING',
      countdownValue: 0,
      timerRemaining: 45,
      canTransition: false,
      blockers: [],
    }
    const action: PhaseAction = { type: 'START_COUNTDOWN' }
    const newState = phaseReducer(runningState, action, true)

    expect(newState.current).toBe('RUNNING')
  })

  it('should handle DECREMENT_COUNTDOWN action', () => {
    const countdownState: PhaseState = {
      current: 'COUNTDOWN',
      countdownValue: 3,
      timerRemaining: 0,
      canTransition: false,
      blockers: [],
    }
    const action: PhaseAction = { type: 'DECREMENT_COUNTDOWN' }
    const newState = phaseReducer(countdownState, action, true)

    expect(newState.current).toBe('COUNTDOWN')
    expect(newState.countdownValue).toBe(2)
  })

  it('should set canTransition to true when countdown reaches 0', () => {
    const countdownState: PhaseState = {
      current: 'COUNTDOWN',
      countdownValue: 1,
      timerRemaining: 0,
      canTransition: false,
      blockers: [],
    }
    const action: PhaseAction = { type: 'DECREMENT_COUNTDOWN' }
    const newState = phaseReducer(countdownState, action, true)

    expect(newState.countdownValue).toBe(0)
    expect(newState.canTransition).toBe(true)
  })

  it('should not handle DECREMENT_COUNTDOWN from invalid phase', () => {
    const action: PhaseAction = { type: 'DECREMENT_COUNTDOWN' }
    const newState = phaseReducer(initialState, action, true)

    expect(newState.current).toBe('PLANNING')
  })

  it('should handle START_RUNNING action', () => {
    const countdownState: PhaseState = {
      current: 'COUNTDOWN',
      countdownValue: 0,
      timerRemaining: 0,
      canTransition: true,
      blockers: [],
    }
    const action: PhaseAction = { type: 'START_RUNNING', duration: 45 }
    const newState = phaseReducer(countdownState, action, true)

    expect(newState.current).toBe('RUNNING')
    expect(newState.countdownValue).toBe(0)
    expect(newState.timerRemaining).toBe(45)
    expect(newState.canTransition).toBe(false)
  })

  it('should handle DECREMENT_TIMER action', () => {
    const runningState: PhaseState = {
      current: 'RUNNING',
      countdownValue: 0,
      timerRemaining: 45,
      canTransition: false,
      blockers: [],
    }
    const action: PhaseAction = { type: 'DECREMENT_TIMER' }
    const newState = phaseReducer(runningState, action, true)

    expect(newState.current).toBe('RUNNING')
    expect(newState.timerRemaining).toBe(44)
  })

  it('should set canTransition to true when timer reaches 0', () => {
    const runningState: PhaseState = {
      current: 'RUNNING',
      countdownValue: 0,
      timerRemaining: 1,
      canTransition: false,
      blockers: [],
    }
    const action: PhaseAction = { type: 'DECREMENT_TIMER' }
    const newState = phaseReducer(runningState, action, true)

    expect(newState.timerRemaining).toBe(0)
    expect(newState.canTransition).toBe(true)
  })

  it('should not handle DECREMENT_TIMER from invalid phase', () => {
    const action: PhaseAction = { type: 'DECREMENT_TIMER' }
    const newState = phaseReducer(initialState, action, true)

    expect(newState.current).toBe('PLANNING')
  })

  it('should handle FINISH_PHASE action', () => {
    const runningState: PhaseState = {
      current: 'RUNNING',
      countdownValue: 0,
      timerRemaining: 0,
      canTransition: true,
      blockers: [],
    }
    const action: PhaseAction = { type: 'FINISH_PHASE' }
    const newState = phaseReducer(runningState, action, true)

    expect(newState.current).toBe('FINISHED')
    expect(newState.countdownValue).toBe(0)
    expect(newState.timerRemaining).toBe(2)
    expect(newState.canTransition).toBe(false)
  })

  it('should not handle FINISH_PHASE from invalid phase', () => {
    const action: PhaseAction = { type: 'FINISH_PHASE' }
    const newState = phaseReducer(initialState, action, true)

    expect(newState.current).toBe('PLANNING')
  })

  it('should handle RESET_PHASE action', () => {
    const finishedState: PhaseState = {
      current: 'FINISHED',
      countdownValue: 0,
      timerRemaining: 2,
      canTransition: false,
      blockers: [],
    }
    const action: PhaseAction = { type: 'RESET_PHASE' }
    const newState = phaseReducer(finishedState, action, true)

    expect(newState.current).toBe('PLANNING')
    expect(newState.countdownValue).toBe(3)
    expect(newState.timerRemaining).toBe(0)
    expect(newState.canTransition).toBe(false)
  })

  it('should ignore unknown actions', () => {
    const action = { type: 'UNKNOWN_ACTION' } as unknown as PhaseAction
    const newState = phaseReducer(initialState, action, true)

    expect(newState).toEqual(initialState)
  })
})
