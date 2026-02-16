import type { Dispatch } from 'react'

export function createActionCreator<T extends string>(type: T): () => { type: T } {
  return () => ({ type })
}

export function createActionCreatorWithPayload<T extends string, P>(
  type: T
): (payload: P) => { type: T; payload: P } {
  return (payload: P) => ({ type, payload })
}

export type Action<T extends string, P = undefined> = P extends undefined
  ? { type: T }
  : { type: T; payload: P }

export type Reducer<S, A> = (state: S, action: A) => S

export function createReducer<S, A extends { type: string }>(
  initialState: S,
  actionHandlers: Record<string, (state: S, action: A) => S>
): Reducer<S, A> {
  return (state: S = initialState, action: A): S => {
    const handler = actionHandlers[action.type]
    if (handler) {
      return handler(state, action)
    }
    return state
  }
}

export function createAsyncAction<T extends string, P = void>(
  name: T
): {
  request: (payload?: P) => { type: `${T}_REQUEST`; payload?: P }
  success: (payload: P) => { type: `${T}_SUCCESS`; payload: P }
  failure: (error: Error) => { type: `${T}_FAILURE`; error: Error }
} {
  return {
    request: (payload?: P) => ({ type: `${name}_REQUEST`, payload }) as const,
    success: (payload: P) => ({ type: `${name}_SUCCESS`, payload }) as const,
    failure: (error: Error) => ({ type: `${name}_FAILURE`, error }) as const,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function combineReducers<S extends Record<string, any>>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reducers: Record<string, Reducer<any, any>>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Reducer<S, any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (state: S = {} as S, action: any): S => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nextState: any = { ...state }
    let hasChanged = false

    for (const key in reducers) {
      const reducer = reducers[key]
      const previousStateForKey = state[key]
      const nextStateForKey = reducer(previousStateForKey, action)

      if (nextStateForKey !== previousStateForKey) {
        nextState[key] = nextStateForKey
        hasChanged = true
      }
    }

    return hasChanged ? (nextState as S) : state
  }
}

export function dispatchMultiple<A>(dispatch: Dispatch<A>, actions: A[]): void {
  actions.forEach((action) => dispatch(action))
}

export const STORAGE_KEY_PREFIX = 'gol-'

function cleanupOldLocalStorageData(): void {
  const keysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
      keysToRemove.push(key)
    }
  }

  keysToRemove.forEach((key) => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Failed to remove ${key} from localStorage:`, error)
    }
  })

  console.warn(`Cleaned up ${keysToRemove.length} localStorage items`)
}

export function saveToLocalStorage<T>(key: string, value: T): boolean {
  const fullKey = `${STORAGE_KEY_PREFIX}${key}`
  const serialized = JSON.stringify(value)

  try {
    localStorage.setItem(fullKey, serialized)
    return true
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded. Attempting cleanup...')
      cleanupOldLocalStorageData()
      try {
        localStorage.setItem(fullKey, serialized)
        return true
      } catch (retryError) {
        console.error('Failed to save to localStorage after cleanup:', retryError)
        return false
      }
    }
    console.error('Failed to save to localStorage:', error)
    return false
  }
}

export function loadFromLocalStorage<T>(
  key: string,
  defaultValue: T,
  validator?: (value: unknown) => value is T
): T {
  try {
    const fullKey = `${STORAGE_KEY_PREFIX}${key}`
    const serialized = localStorage.getItem(fullKey)
    if (serialized === null) return defaultValue

    const parsed = JSON.parse(serialized) as T

    if (validator && !validator(parsed)) {
      console.warn(`Invalid data in localStorage for key: ${key}, using default value`)
      return defaultValue
    }

    return parsed
  } catch (error) {
    console.error('Failed to load from localStorage:', error)
    return defaultValue
  }
}

export function removeFromLocalStorage(key: string): boolean {
  try {
    const fullKey = `${STORAGE_KEY_PREFIX}${key}`
    localStorage.removeItem(fullKey)
    return true
  } catch (error) {
    console.error('Failed to remove from localStorage:', error)
    return false
  }
}

export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}
