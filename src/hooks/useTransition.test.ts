import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useTransition } from './useTransition'

describe('useTransition', () => {
  it('should start in PLAYING state', () => {
    const { result } = renderHook(() => useTransition())

    expect(result.current.transitionState).toBe('PLAYING')
    expect(result.current.isTransitioning).toBe(false)
  })

  it('should start in FADING_OUT state when startTransition is called', () => {
    const { result } = renderHook(() => useTransition())

    act(() => {
      result.current.startTransition()
    })

    expect(result.current.transitionState).toBe('FADING_OUT')
    expect(result.current.isFadingOut).toBe(true)
    expect(result.current.isTransitioning).toBe(true)
  })

  it('should skip transition when Space is pressed', () => {
    const onTransitionComplete = vi.fn()
    const { result } = renderHook(() => useTransition(undefined, onTransitionComplete))

    act(() => {
      result.current.startTransition()
    })

    act(() => {
      const event = new KeyboardEvent('keydown', { code: 'Space' })
      window.dispatchEvent(event)
    })

    expect(result.current.transitionState).toBe('READY')
    expect(result.current.isReady).toBe(true)
    expect(onTransitionComplete).toHaveBeenCalled()
  })

  it('should skip transition when Escape is pressed', () => {
    const onTransitionComplete = vi.fn()
    const { result } = renderHook(() => useTransition(undefined, onTransitionComplete))

    act(() => {
      result.current.startTransition()
    })

    act(() => {
      const event = new KeyboardEvent('keydown', { code: 'Escape' })
      window.dispatchEvent(event)
    })

    expect(result.current.transitionState).toBe('READY')
    expect(result.current.isReady).toBe(true)
    expect(onTransitionComplete).toHaveBeenCalled()
  })

  it('should not skip when skipEnabled is false', () => {
    const config = {
      fadeOutDuration: 2000,
      fadeInDuration: 2000,
      interstitialDuration: 2000,
      autoAdvanceDelay: 2000,
      skipEnabled: false,
    }
    const { result } = renderHook(() => useTransition(config))

    act(() => {
      result.current.startTransition()
    })

    act(() => {
      const event = new KeyboardEvent('keydown', { code: 'Space' })
      window.dispatchEvent(event)
    })

    expect(result.current.transitionState).toBe('FADING_OUT')
  })

  it('should not skip when in PLAYING state', () => {
    const { result } = renderHook(() => useTransition())

    act(() => {
      const event = new KeyboardEvent('keydown', { code: 'Space' })
      window.dispatchEvent(event)
    })

    expect(result.current.transitionState).toBe('PLAYING')
  })

  it('should not skip when in READY state', () => {
    const onTransitionComplete = vi.fn()
    const { result } = renderHook(() => useTransition(undefined, onTransitionComplete))

    act(() => {
      result.current.startTransition()
    })

    expect(result.current.transitionState).toBe('FADING_OUT')
  })

  it('should reset to PLAYING state', () => {
    const { result } = renderHook(() => useTransition())

    act(() => {
      result.current.startTransition()
    })

    expect(result.current.transitionState).toBe('FADING_OUT')

    act(() => {
      result.current.resetTransition()
    })

    expect(result.current.transitionState).toBe('PLAYING')
    expect(result.current.isTransitioning).toBe(false)
  })

  it('should clear timeout on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout')

    const { unmount, result } = renderHook(() => useTransition())

    act(() => {
      result.current.startTransition()
    })

    unmount()

    expect(clearTimeoutSpy).toHaveBeenCalled()
  })
})
