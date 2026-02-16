import { useState, useEffect, useRef } from 'react'
import '../styles/FluxDisplay.css'

interface FluxDisplayProps {
  flux: number
  fluxMax: number
  disableAnimation?: boolean
}

export function FluxDisplay({ flux, fluxMax, disableAnimation = false }: FluxDisplayProps) {
  const [displayFlux, setDisplayFlux] = useState(flux)
  const animationRef = useRef<number | null>(null)
  const prevFluxRef = useRef(flux)

  const getFluxColor = (current: number, max: number): string => {
    const ratio = current / max
    if (ratio <= 0) return 'red'
    if (ratio < 0.3) return 'orange'
    if (ratio < 0.5) return 'orange'
    return 'green'
  }

  const fluxColor = getFluxColor(flux, fluxMax)

  const effectiveDisplayFlux = disableAnimation ? flux : displayFlux

  useEffect(() => {
    if (disableAnimation) {
      return
    }

    const startValue = prevFluxRef.current
    const endValue = flux

    if (startValue === endValue) return

    if (animationRef.current !== null) {
      window.cancelAnimationFrame(animationRef.current)
    }

    const duration = 300
    const startTimestamp = window.performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTimestamp
      const progress = Math.min(elapsed / duration, 1)

      const easedProgress = 1 - Math.pow(1 - progress, 3)

      setDisplayFlux(Math.round(startValue + (endValue - startValue) * easedProgress))

      if (progress < 1) {
        animationRef.current = window.requestAnimationFrame(animate)
      } else {
        animationRef.current = null
        prevFluxRef.current = endValue
      }
    }

    animationRef.current = window.requestAnimationFrame(animate)

    return () => {
      if (animationRef.current !== null) {
        window.cancelAnimationFrame(animationRef.current)
      }
    }
  }, [flux, disableAnimation])

  return (
    <span className={`flux-display-value ${fluxColor}`}>
      {effectiveDisplayFlux}/{fluxMax}
    </span>
  )
}
