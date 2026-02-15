import { describe, it, expect } from 'vitest'
import {
  isValidCoordinate,
  clamp,
  isInRange,
  isPositiveNumber,
  isNonNegativeNumber,
  isInteger,
  isValidRuleSet,
  validateGridDimensions,
} from './validation'

describe('isValidCoordinate', () => {
  it('should return true for valid coordinates', () => {
    expect(isValidCoordinate(0, 0, 10, 10)).toBe(true)
    expect(isValidCoordinate(5, 5, 10, 10)).toBe(true)
    expect(isValidCoordinate(9, 9, 10, 10)).toBe(true)
  })

  it('should return false for out of bounds coordinates', () => {
    expect(isValidCoordinate(-1, 0, 10, 10)).toBe(false)
    expect(isValidCoordinate(0, -1, 10, 10)).toBe(false)
    expect(isValidCoordinate(10, 0, 10, 10)).toBe(false)
    expect(isValidCoordinate(0, 10, 10, 10)).toBe(false)
  })
})

describe('clamp', () => {
  it('should return value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5)
  })

  it('should return min when value is below min', () => {
    expect(clamp(-5, 0, 10)).toBe(0)
  })

  it('should return max when value is above max', () => {
    expect(clamp(15, 0, 10)).toBe(10)
  })

  it('should handle edge cases', () => {
    expect(clamp(0, 0, 10)).toBe(0)
    expect(clamp(10, 0, 10)).toBe(10)
  })
})

describe('isInRange', () => {
  it('should return true for value within range', () => {
    expect(isInRange(5, 0, 10)).toBe(true)
    expect(isInRange(0, 0, 10)).toBe(true)
    expect(isInRange(10, 0, 10)).toBe(true)
  })

  it('should return false for value outside range', () => {
    expect(isInRange(-1, 0, 10)).toBe(false)
    expect(isInRange(11, 0, 10)).toBe(false)
  })
})

describe('isPositiveNumber', () => {
  it('should return true for positive numbers', () => {
    expect(isPositiveNumber(1)).toBe(true)
    expect(isPositiveNumber(0.5)).toBe(true)
    expect(isPositiveNumber(100)).toBe(true)
  })

  it('should return false for non-positive numbers', () => {
    expect(isPositiveNumber(0)).toBe(false)
    expect(isPositiveNumber(-1)).toBe(false)
    expect(isPositiveNumber(-0.5)).toBe(false)
  })

  it('should return false for non-number types', () => {
    expect(isPositiveNumber('1' as unknown)).toBe(false)
    expect(isPositiveNumber(null as unknown)).toBe(false)
    expect(isPositiveNumber(undefined as unknown)).toBe(false)
    expect(isPositiveNumber(NaN)).toBe(false)
  })
})

describe('isNonNegativeNumber', () => {
  it('should return true for non-negative numbers', () => {
    expect(isNonNegativeNumber(0)).toBe(true)
    expect(isNonNegativeNumber(1)).toBe(true)
    expect(isNonNegativeNumber(0.5)).toBe(true)
    expect(isNonNegativeNumber(100)).toBe(true)
  })

  it('should return false for negative numbers', () => {
    expect(isNonNegativeNumber(-1)).toBe(false)
    expect(isNonNegativeNumber(-0.5)).toBe(false)
  })

  it('should return false for non-number types', () => {
    expect(isNonNegativeNumber('0' as unknown)).toBe(false)
    expect(isNonNegativeNumber(null as unknown)).toBe(false)
    expect(isNonNegativeNumber(undefined as unknown)).toBe(false)
    expect(isNonNegativeNumber(NaN)).toBe(false)
  })
})

describe('isInteger', () => {
  it('should return true for integers', () => {
    expect(isInteger(0)).toBe(true)
    expect(isInteger(1)).toBe(true)
    expect(isInteger(-1)).toBe(true)
    expect(isInteger(100)).toBe(true)
  })

  it('should return false for non-integers', () => {
    expect(isInteger(0.5)).toBe(false)
    expect(isInteger(1.5)).toBe(false)
    expect(isInteger(-0.5)).toBe(false)
  })

  it('should return false for non-number types', () => {
    expect(isInteger('1' as unknown)).toBe(false)
    expect(isInteger(null as unknown)).toBe(false)
    expect(isInteger(undefined as unknown)).toBe(false)
  })
})

describe('isValidRuleSet', () => {
  it('should return true for valid Conway rules', () => {
    const ruleSet = { born: [3], survive: [2, 3] }
    expect(isValidRuleSet(ruleSet)).toBe(true)
  })

  it('should return true for valid custom rules', () => {
    const ruleSet = { born: [2, 3], survive: [1, 2, 3, 4] }
    expect(isValidRuleSet(ruleSet)).toBe(true)
  })

  it('should return false for non-object', () => {
    expect(isValidRuleSet(null)).toBe(false)
    expect(isValidRuleSet(undefined as unknown)).toBe(false)
    expect(isValidRuleSet('rules' as unknown)).toBe(false)
  })

  it('should return false for missing born or survive arrays', () => {
    expect(isValidRuleSet({ born: [3] } as unknown)).toBe(false)
    expect(isValidRuleSet({ survive: [2, 3] } as unknown)).toBe(false)
  })

  it('should return false for non-array born or survive', () => {
    expect(isValidRuleSet({ born: '3', survive: [2, 3] } as unknown)).toBe(false)
    expect(isValidRuleSet({ born: [3], survive: '2,3' } as unknown)).toBe(false)
  })

  it('should return false for non-integer values', () => {
    expect(isValidRuleSet({ born: [3.5], survive: [2, 3] } as unknown)).toBe(false)
  })

  it('should return false for negative values', () => {
    expect(isValidRuleSet({ born: [-1], survive: [2, 3] } as unknown)).toBe(false)
  })
})

describe('validateGridDimensions', () => {
  it('should return valid for positive dimensions', () => {
    expect(validateGridDimensions(20, 30)).toEqual({ valid: true })
    expect(validateGridDimensions(1, 1)).toEqual({ valid: true })
  })

  it('should return error for non-positive dimensions', () => {
    expect(validateGridDimensions(0, 30)).toEqual({
      valid: false,
      error: 'Grid dimensions must be positive numbers',
    })
    expect(validateGridDimensions(20, 0)).toEqual({
      valid: false,
      error: 'Grid dimensions must be positive numbers',
    })
    expect(validateGridDimensions(-1, 30)).toEqual({
      valid: false,
      error: 'Grid dimensions must be positive numbers',
    })
  })

  it('should return error for dimensions exceeding maximum', () => {
    expect(validateGridDimensions(1001, 30)).toEqual({
      valid: false,
      error: 'Grid dimensions cannot exceed 1000x1000',
    })
    expect(validateGridDimensions(20, 1001)).toEqual({
      valid: false,
      error: 'Grid dimensions cannot exceed 1000x1000',
    })
  })
})
