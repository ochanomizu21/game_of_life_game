import { describe, it, expect } from 'vitest'
import { getCellFromEvent, isWithinBounds, createInitialInteractionState } from './interaction'

describe('getCellFromEvent', () => {
  it('converts mouse event to grid coordinates', () => {
    const canvas = {
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }),
      width: 100,
      height: 100,
    } as unknown as HTMLCanvasElement

    const event = new MouseEvent('mousedown', { clientX: 50, clientY: 50 })

    const coords = getCellFromEvent(event, canvas, 10, 10)

    expect(coords.row).toBe(5)
    expect(coords.col).toBe(5)
  })

  it('handles touch event', () => {
    const canvas = {
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }),
      width: 100,
      height: 100,
    } as unknown as HTMLCanvasElement

    const touch = {
      clientX: 25,
      clientY: 25,
    } as unknown as Touch

    const event = {
      touches: [touch],
      changedTouches: [touch],
    } as unknown as TouchEvent

    const coords = getCellFromEvent(event, canvas, 10, 10)

    expect(coords.row).toBe(2)
    expect(coords.col).toBe(2)
  })

  it('handles canvas offset', () => {
    const canvas = {
      getBoundingClientRect: () => ({ left: 10, top: 10, width: 100, height: 100 }),
      width: 100,
      height: 100,
    } as unknown as HTMLCanvasElement

    const event = new MouseEvent('mousedown', { clientX: 60, clientY: 60 })

    const coords = getCellFromEvent(event, canvas, 10, 10)

    expect(coords.row).toBe(5)
    expect(coords.col).toBe(5)
  })

  it('handles DPR scaling', () => {
    const canvas = {
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 50, height: 50 }),
      width: 100,
      height: 100,
    } as unknown as HTMLCanvasElement

    const event = new MouseEvent('mousedown', { clientX: 25, clientY: 25 })

    const coords = getCellFromEvent(event, canvas, 10, 10)

    expect(coords.row).toBe(5)
    expect(coords.col).toBe(5)
  })
})

describe('isWithinBounds', () => {
  it('returns true for valid coordinates', () => {
    expect(isWithinBounds(0, 0, 10, 10)).toBe(true)
    expect(isWithinBounds(5, 5, 10, 10)).toBe(true)
    expect(isWithinBounds(9, 9, 10, 10)).toBe(true)
  })

  it('returns false for out-of-bounds coordinates', () => {
    expect(isWithinBounds(-1, 0, 10, 10)).toBe(false)
    expect(isWithinBounds(0, -1, 10, 10)).toBe(false)
    expect(isWithinBounds(10, 0, 10, 10)).toBe(false)
    expect(isWithinBounds(0, 10, 10, 10)).toBe(false)
  })
})

describe('createInitialInteractionState', () => {
  it('creates initial state with mouse up', () => {
    const state = createInitialInteractionState()

    expect(state.isMouseDown).toBe(false)
    expect(state.currentCell).toBe(null)
  })
})
