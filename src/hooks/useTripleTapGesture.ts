import { useEffect, useRef } from 'react'

interface TripleTapGestureOptions {
  threshold?: number
  maxTimeBetweenTaps?: number
  onTripleTap: () => void
}

export function useTripleTapGesture(options: TripleTapGestureOptions) {
  const { threshold = 100, maxTimeBetweenTaps = 500, onTripleTap } = options

  const tapCountRef = useRef<number>(0)
  const lastTapTimeRef = useRef<number>(0)
  const timeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const resetTapState = () => {
      tapCountRef.current = 0
      lastTapTimeRef.current = 0
    }

    const handleTap = () => {
      const now = Date.now()

      if (tapCountRef.current === 0) {
        tapCountRef.current = 1
        lastTapTimeRef.current = now
      } else {
        const timeSinceLastTap = now - lastTapTimeRef.current

        if (timeSinceLastTap <= maxTimeBetweenTaps) {
          tapCountRef.current++
          lastTapTimeRef.current = now

          if (tapCountRef.current === 3) {
            onTripleTap()
            resetTapState()
          }
        } else {
          resetTapState()
          tapCountRef.current = 1
          lastTapTimeRef.current = now
        }
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = window.setTimeout(() => {
        resetTapState()
      }, maxTimeBetweenTaps)
    }

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0] || e.changedTouches[0]
      const clientX = touch.clientX
      const clientY = touch.clientY

      if (clientX < threshold && clientY < threshold) {
        e.preventDefault()
        handleTap()
      }
    }

    const handleClick = (e: MouseEvent) => {
      const clientX = e.clientX
      const clientY = e.clientY

      if (clientX < threshold && clientY < threshold) {
        handleTap()
      }
    }

    window.addEventListener('touchstart', handleTouchStart, { passive: false })
    window.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('click', handleClick)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [threshold, maxTimeBetweenTaps, onTripleTap])

  return
}
