import { describe, it, expect, vi } from 'vitest'
import { getCellColor, getCellBlur, getResponsiveCellSize } from '../lib/canvasUtils'

describe('getCellColor', () => {
  it('returns correct color for age 0', () => {
    expect(getCellColor(0)).toBe('#00ffff')
  })

  it('returns correct color for age 1', () => {
    expect(getCellColor(1)).toBe('#61dafb')
  })

  it('returns correct color for age 2', () => {
    expect(getCellColor(2)).toBe('#61dafb')
  })

  it('returns correct color for age 3', () => {
    expect(getCellColor(3)).toBe('#ff00ff')
  })

  it('returns correct color for age 5', () => {
    expect(getCellColor(5)).toBe('#ff00ff')
  })

  it('returns correct color for age 6+', () => {
    expect(getCellColor(6)).toBe('#4a00ff')
    expect(getCellColor(10)).toBe('#4a00ff')
  })
})

describe('getCellBlur', () => {
  it('returns correct blur for age 0', () => {
    expect(getCellBlur(0)).toBe(15)
  })

  it('returns correct blur for age 1', () => {
    expect(getCellBlur(1)).toBe(8)
  })

  it('returns correct blur for age 2', () => {
    expect(getCellBlur(2)).toBe(8)
  })

  it('returns correct blur for age 3', () => {
    expect(getCellBlur(3)).toBe(4)
  })

  it('returns correct blur for age 5', () => {
    expect(getCellBlur(5)).toBe(4)
  })

  it('returns correct blur for age 6+', () => {
    expect(getCellBlur(6)).toBe(2)
    expect(getCellBlur(10)).toBe(2)
  })
})

describe('getResponsiveCellSize', () => {
  it('returns 20px for desktop', () => {
    vi.stubGlobal('window', {
      ...window,
      innerWidth: 800,
    })
    expect(getResponsiveCellSize()).toBe(20)
  })

  it('returns 18px for mobile', () => {
    vi.stubGlobal('window', {
      ...window,
      innerWidth: 767,
    })
    expect(getResponsiveCellSize()).toBe(18)
  })
})
