import { describe, it, expect } from 'vitest'
import {
  createInitialFluxState,
  canPlaceCell,
  canRefundCell,
  placeCell,
  removeCell,
  resetFlux,
  getFluxColor,
} from './flux'

describe('createInitialFluxState', () => {
  it('creates flux state with default initial Flux', () => {
    const state = createInitialFluxState()

    expect(state.current).toBe(20)
    expect(state.initial).toBe(20)
    expect(state.placed).toBe(0)
    expect(state.removed).toBe(0)
  })

  it('creates flux state with custom initial Flux', () => {
    const state = createInitialFluxState(50)

    expect(state.current).toBe(50)
    expect(state.initial).toBe(50)
    expect(state.placed).toBe(0)
    expect(state.removed).toBe(0)
  })
})

describe('canPlaceCell', () => {
  it('returns true when Flux >= 1', () => {
    const state = createInitialFluxState(20)

    expect(canPlaceCell(state)).toBe(true)
  })

  it('returns false when Flux is 0', () => {
    const state = createInitialFluxState(0)

    expect(canPlaceCell(state)).toBe(false)
  })
})

describe('canRefundCell', () => {
  it('returns true during PLANNING phase', () => {
    expect(canRefundCell('PLANNING')).toBe(true)
  })

  it('returns false during COUNTDOWN phase', () => {
    expect(canRefundCell('COUNTDOWN')).toBe(false)
  })

  it('returns false during RUNNING phase', () => {
    expect(canRefundCell('RUNNING')).toBe(false)
  })

  it('returns false during FINISHED phase', () => {
    expect(canRefundCell('FINISHED')).toBe(false)
  })
})

describe('placeCell', () => {
  it('decrements Flux when placing a cell', () => {
    const state = createInitialFluxState(20)
    const newState = placeCell(state)

    expect(newState.current).toBe(19)
    expect(newState.initial).toBe(20)
    expect(newState.placed).toBe(1)
    expect(newState.removed).toBe(0)
  })

  it('does not modify state when Flux is 0', () => {
    const state = createInitialFluxState(0)
    const newState = placeCell(state)

    expect(newState).toEqual(state)
  })

  it('does not modify initial Flux', () => {
    const state = createInitialFluxState(20)
    const newState = placeCell(state)

    expect(newState.initial).toBe(20)
  })

  it('tracks total cells placed', () => {
    let state = createInitialFluxState(20)

    state = placeCell(state)
    expect(state.placed).toBe(1)

    state = placeCell(state)
    expect(state.placed).toBe(2)

    state = placeCell(state)
    expect(state.placed).toBe(3)
  })
})

describe('removeCell', () => {
  it('increments Flux and tracks removal during PLANNING phase', () => {
    const state = createInitialFluxState(20)
    const newState = removeCell(state, 'PLANNING')

    expect(newState.current).toBe(21)
    expect(newState.initial).toBe(20)
    expect(newState.placed).toBe(0)
    expect(newState.removed).toBe(1)
  })

  it('does not modify state during RUNNING phase', () => {
    const state = createInitialFluxState(20)
    const newState = removeCell(state, 'RUNNING')

    expect(newState).toEqual(state)
  })

  it('does not modify state during COUNTDOWN phase', () => {
    const state = createInitialFluxState(20)
    const newState = removeCell(state, 'COUNTDOWN')

    expect(newState).toEqual(state)
  })

  it('does not modify state during FINISHED phase', () => {
    const state = createInitialFluxState(20)
    const newState = removeCell(state, 'FINISHED')

    expect(newState).toEqual(state)
  })

  it('tracks total cells removed', () => {
    let state = createInitialFluxState(20)

    state = removeCell(state, 'PLANNING')
    expect(state.removed).toBe(1)

    state = removeCell(state, 'PLANNING')
    expect(state.removed).toBe(2)

    state = removeCell(state, 'PLANNING')
    expect(state.removed).toBe(3)
  })
})

describe('resetFlux', () => {
  it('resets Flux to initial value', () => {
    const resetState = resetFlux(30)

    expect(resetState.current).toBe(30)
    expect(resetState.initial).toBe(30)
    expect(resetState.placed).toBe(0)
    expect(resetState.removed).toBe(0)
  })
})

describe('getFluxColor', () => {
  it('returns green when Flux is plentiful', () => {
    const state = createInitialFluxState(20)
    expect(getFluxColor(state)).toBe('green')
  })

  it('returns yellow when Flux is moderate', () => {
    const state = createInitialFluxState(20)
    state.current = 8
    expect(getFluxColor(state)).toBe('yellow')
  })

  it('returns orange when Flux is low (<30%)', () => {
    const state = createInitialFluxState(20)
    state.current = 5
    expect(getFluxColor(state)).toBe('orange')
  })

  it('returns red when Flux is 0', () => {
    const state = createInitialFluxState(20)
    state.current = 0
    expect(getFluxColor(state)).toBe('red')
  })
})
