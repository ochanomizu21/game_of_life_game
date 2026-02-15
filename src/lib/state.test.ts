import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createActionCreator,
  createActionCreatorWithPayload,
  createReducer,
  createAsyncAction,
  combineReducers,
  dispatchMultiple,
  saveToLocalStorage,
  loadFromLocalStorage,
  removeFromLocalStorage,
} from './state'

describe('createActionCreator', () => {
  it('should create action without payload', () => {
    const increment = createActionCreator<'INCREMENT'>('INCREMENT')
    const action = increment()

    expect(action).toEqual({ type: 'INCREMENT' })
  })
})

describe('createActionCreatorWithPayload', () => {
  it('should create action with payload', () => {
    const setValue = createActionCreatorWithPayload<'SET_VALUE', number>('SET_VALUE')
    const action = setValue(42)

    expect(action).toEqual({ type: 'SET_VALUE', payload: 42 })
  })
})

describe('createReducer', () => {
  it('should create reducer with action handlers', () => {
    const initialState = { count: 0 }
    const increment = createActionCreator<'INCREMENT'>('INCREMENT')
    const decrement = createActionCreator<'DECREMENT'>('DECREMENT')

    const reducer = createReducer(initialState, {
      INCREMENT: (state) => ({ ...state, count: state.count + 1 }),
      DECREMENT: (state) => ({ ...state, count: state.count - 1 }),
    })

    expect(reducer(initialState as any, increment())).toEqual({ count: 1 })
    expect(reducer({ count: 1 }, decrement())).toEqual({ count: 0 })
  })

  it('should return current state for unknown actions', () => {
    const initialState = { count: 0 }
    const reducer = createReducer(initialState, {})

    expect(reducer(initialState, { type: 'UNKNOWN' })).toBe(initialState)
  })
})

describe('createAsyncAction', () => {
  it('should create async action creators', () => {
    const asyncAction = createAsyncAction<'FETCH_DATA', string>('FETCH_DATA')

    expect(asyncAction.request()).toEqual({ type: 'FETCH_DATA_REQUEST' })
    expect(asyncAction.success('data')).toEqual({ type: 'FETCH_DATA_SUCCESS', payload: 'data' })
    expect(asyncAction.failure(new Error('error'))).toEqual({
      type: 'FETCH_DATA_FAILURE',
      error: expect.any(Error),
    })
  })

  it('should handle request with optional payload', () => {
    const asyncAction = createAsyncAction<'FETCH_DATA', { id: number }>('FETCH_DATA')

    expect(asyncAction.request({ id: 1 })).toEqual({
      type: 'FETCH_DATA_REQUEST',
      payload: { id: 1 },
    })
    expect(asyncAction.request()).toEqual({ type: 'FETCH_DATA_REQUEST' })
  })
})

describe('combineReducers', () => {
  it('should combine multiple reducers', () => {
    const counter = (state = 0, action: { type: string }) => {
      if (action.type === 'INC') return state + 1
      return state
    }

    const text = (state = '', action: { type: string }) => {
      if (action.type === 'SET_TEXT') return 'hello'
      return state
    }

    const rootReducer = combineReducers({ counter, text })

    expect(rootReducer({ counter: 0, text: '' } as any, { type: 'INIT' })).toEqual({
      counter: 0,
      text: '',
    })
    expect(rootReducer({ counter: 0, text: '' } as any, { type: 'INC' })).toEqual({
      counter: 1,
      text: '',
    })
    expect(rootReducer({ counter: 1, text: '' }, { type: 'SET_TEXT' })).toEqual({
      counter: 1,
      text: 'hello',
    })
  })

  it('should only update state when reducer returns new value', () => {
    const counter = (state = 0, action: { type: string }) => {
      if (action.type === 'INC') return state + 1
      return state
    }

    const rootReducer = combineReducers({ counter })
    const prevState = { counter: 0 }
    const newState = rootReducer(prevState, { type: 'UNKNOWN' })

    expect(newState).toBe(prevState)
  })

  it('should create new state object when any reducer changes', () => {
    const counter = (state = 0, action: { type: string }) => {
      if (action.type === 'INC') return state + 1
      return state
    }

    const rootReducer = combineReducers({ counter })
    const prevState = { counter: 0 }
    const newState = rootReducer(prevState, { type: 'INC' })

    expect(newState).toEqual({ counter: 1 })
    expect(newState).not.toBe(prevState)
  })
})

describe('dispatchMultiple', () => {
  it('should dispatch multiple actions', () => {
    const dispatch = vi.fn()
    const actions = [{ type: 'ACTION_1' }, { type: 'ACTION_2' }, { type: 'ACTION_3' }]

    dispatchMultiple(dispatch, actions)

    expect(dispatch).toHaveBeenCalledTimes(3)
    expect(dispatch).toHaveBeenCalledWith({ type: 'ACTION_1' })
    expect(dispatch).toHaveBeenCalledWith({ type: 'ACTION_2' })
    expect(dispatch).toHaveBeenCalledWith({ type: 'ACTION_3' })
  })

  it('should handle empty array of actions', () => {
    const dispatch = vi.fn()

    dispatchMultiple(dispatch, [])

    expect(dispatch).not.toHaveBeenCalled()
  })
})

describe('localStorage helpers', () => {
  const testKey = 'test-key'
  const fullKey = `gol-${testKey}`

  beforeEach(() => {
    try {
      localStorage.clear()
    } catch {}
  })

  describe('saveToLocalStorage', () => {
    it('should save value to localStorage', () => {
      const result = saveToLocalStorage(testKey, { value: 42 })

      expect(result).toBe(true)
      expect(localStorage.getItem(fullKey)).toBe(JSON.stringify({ value: 42 }))
    })

    it('should handle errors gracefully', () => {
      const setItemSpy = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('Storage error')
      })

      const result = saveToLocalStorage(testKey, { value: 42 })

      expect(result).toBe(false)

      setItemSpy.mockRestore()
    })
  })

  describe('loadFromLocalStorage', () => {
    it('should load value from localStorage', () => {
      localStorage.setItem(fullKey, JSON.stringify({ value: 42 }))
      const result = loadFromLocalStorage(testKey, { value: 0 })

      expect(result).toEqual({ value: 42 })
    })

    it('should return default value when key not found', () => {
      const defaultValue = { value: 0 }
      const result = loadFromLocalStorage(testKey, defaultValue)

      expect(result).toBe(defaultValue)
    })

    it('should return default value on parse error', () => {
      localStorage.setItem(fullKey, 'invalid json')
      const defaultValue = { value: 0 }
      const result = loadFromLocalStorage(testKey, defaultValue)

      expect(result).toBe(defaultValue)
    })

    it('should handle errors gracefully', () => {
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage error')
      })

      const defaultValue = { value: 0 }
      const result = loadFromLocalStorage(testKey, defaultValue)

      expect(result).toBe(defaultValue)

      getItemSpy.mockRestore()
    })
  })

  describe('removeFromLocalStorage', () => {
    it('should remove value from localStorage', () => {
      localStorage.setItem(fullKey, JSON.stringify({ value: 42 }))
      const result = removeFromLocalStorage(testKey)

      expect(result).toBe(true)
      expect(localStorage.getItem(fullKey)).toBeNull()
    })

    it('should handle errors gracefully', () => {
      const removeItemSpy = vi.spyOn(localStorage, 'removeItem').mockImplementation(() => {
        throw new Error('Storage error')
      })

      const result = removeFromLocalStorage(testKey)

      expect(result).toBe(false)

      removeItemSpy.mockRestore()
    })
  })
})
