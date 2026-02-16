import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTripleTapGesture } from './useTripleTapGesture'

function createMockTouch(x: number, y: number): Touch {
  return {
    clientX: x,
    clientY: y,
    identifier: 0,
    force: 1,
    radiusX: 1,
    radiusY: 1,
    rotationAngle: 0,
    screenX: x,
    screenY: y,
    pageX: x,
    pageY: y,
    target: window,
  } as unknown as Touch
}

describe('useTripleTapGesture', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should call onTripleTap after three taps within threshold', () => {
    const onTripleTap = vi.fn()

    renderHook(() =>
      useTripleTapGesture({
        threshold: 100,
        maxTimeBetweenTaps: 500,
        onTripleTap,
      })
    )

    const mockTouch = createMockTouch(50, 50)
    const touchEvent = new TouchEvent('touchstart', {
      touches: [mockTouch],
      changedTouches: [mockTouch],
      bubbles: true,
      cancelable: true,
    } as any)

    act(() => {
      window.dispatchEvent(touchEvent)
    })

    expect(onTripleTap).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(250)
      window.dispatchEvent(touchEvent)
    })

    expect(onTripleTap).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(250)
      window.dispatchEvent(touchEvent)
    })

    expect(onTripleTap).toHaveBeenCalledTimes(1)
  })

  it('should not trigger triple tap if time between taps exceeds maxTimeBetweenTaps', () => {
    const onTripleTap = vi.fn()

    renderHook(() =>
      useTripleTapGesture({
        threshold: 100,
        maxTimeBetweenTaps: 500,
        onTripleTap,
      })
    )

    const mockTouch = createMockTouch(50, 50)
    const touchEvent = new TouchEvent('touchstart', {
      touches: [mockTouch],
      changedTouches: [mockTouch],
      bubbles: true,
      cancelable: true,
    } as any)

    act(() => {
      window.dispatchEvent(touchEvent)
    })

    act(() => {
      vi.advanceTimersByTime(600)
      window.dispatchEvent(touchEvent)
    })

    act(() => {
      vi.advanceTimersByTime(250)
      window.dispatchEvent(touchEvent)
    })

    expect(onTripleTap).not.toHaveBeenCalled()
  })

  it('should only detect taps within threshold zone', () => {
    const onTripleTap = vi.fn()

    renderHook(() =>
      useTripleTapGesture({
        threshold: 100,
        maxTimeBetweenTaps: 500,
        onTripleTap,
      })
    )

    const mockTouchInside = createMockTouch(50, 50)
    const mockTouchOutside = createMockTouch(150, 50)

    const touchEventInside = new TouchEvent('touchstart', {
      touches: [mockTouchInside],
      changedTouches: [mockTouchInside],
      bubbles: true,
      cancelable: true,
    } as any)

    const touchEventOutside = new TouchEvent('touchstart', {
      touches: [mockTouchOutside],
      changedTouches: [mockTouchOutside],
      bubbles: true,
      cancelable: true,
    } as any)

    act(() => {
      window.dispatchEvent(touchEventInside)
    })

    act(() => {
      vi.advanceTimersByTime(250)
      window.dispatchEvent(touchEventOutside)
    })

    act(() => {
      vi.advanceTimersByTime(250)
      window.dispatchEvent(touchEventInside)
    })

    expect(onTripleTap).not.toHaveBeenCalled()
  })

  it('should work with mouse click events', () => {
    const onTripleTap = vi.fn()

    renderHook(() =>
      useTripleTapGesture({
        threshold: 100,
        maxTimeBetweenTaps: 500,
        onTripleTap,
      })
    )

    const clickEvent = new MouseEvent('click', {
      clientX: 50,
      clientY: 50,
      bubbles: true,
      cancelable: true,
    })

    act(() => {
      window.dispatchEvent(clickEvent)
    })

    act(() => {
      vi.advanceTimersByTime(250)
      window.dispatchEvent(clickEvent)
    })

    act(() => {
      vi.advanceTimersByTime(250)
      window.dispatchEvent(clickEvent)
    })

    expect(onTripleTap).toHaveBeenCalledTimes(1)
  })

  it('should prevent default on touch events within threshold', () => {
    const onTripleTap = vi.fn()
    const preventDefaultSpy = vi.fn()

    renderHook(() =>
      useTripleTapGesture({
        threshold: 100,
        maxTimeBetweenTaps: 500,
        onTripleTap,
      })
    )

    const mockTouch = createMockTouch(50, 50)
    const touchEvent = new TouchEvent('touchstart', {
      touches: [mockTouch],
      changedTouches: [mockTouch],
      bubbles: true,
      cancelable: true,
    } as any)

    Object.defineProperty(touchEvent, 'preventDefault', {
      value: preventDefaultSpy,
      writable: true,
    })

    act(() => {
      window.dispatchEvent(touchEvent)
    })

    expect(preventDefaultSpy).toHaveBeenCalled()
  })

  it('should not prevent default on touch events outside threshold', () => {
    const onTripleTap = vi.fn()
    const preventDefaultSpy = vi.fn()

    renderHook(() =>
      useTripleTapGesture({
        threshold: 100,
        maxTimeBetweenTaps: 500,
        onTripleTap,
      })
    )

    const mockTouch = createMockTouch(150, 150)
    const touchEvent = new TouchEvent('touchstart', {
      touches: [mockTouch],
      changedTouches: [mockTouch],
      bubbles: true,
      cancelable: true,
    } as any)

    Object.defineProperty(touchEvent, 'preventDefault', {
      value: preventDefaultSpy,
      writable: true,
    })

    act(() => {
      window.dispatchEvent(touchEvent)
    })

    expect(preventDefaultSpy).not.toHaveBeenCalled()
  })

  it('should reset tap state after timeout', () => {
    const onTripleTap = vi.fn()

    renderHook(() =>
      useTripleTapGesture({
        threshold: 100,
        maxTimeBetweenTaps: 500,
        onTripleTap,
      })
    )

    const mockTouch = createMockTouch(50, 50)
    const touchEvent = new TouchEvent('touchstart', {
      touches: [mockTouch],
      changedTouches: [mockTouch],
      bubbles: true,
      cancelable: true,
    } as any)

    act(() => {
      window.dispatchEvent(touchEvent)
    })

    act(() => {
      vi.advanceTimersByTime(600)
    })

    act(() => {
      window.dispatchEvent(touchEvent)
    })

    act(() => {
      vi.advanceTimersByTime(250)
      window.dispatchEvent(touchEvent)
    })

    expect(onTripleTap).not.toHaveBeenCalled()
  })

  it('should cleanup event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() =>
      useTripleTapGesture({
        threshold: 100,
        maxTimeBetweenTaps: 500,
        onTripleTap: vi.fn(),
      })
    )

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function))
    expect(removeEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function))
  })
})
