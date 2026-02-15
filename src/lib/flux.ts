import type { FluxState } from '../types'

export function createInitialFluxState(initialFlux: number = 20): FluxState {
  return {
    current: initialFlux,
    initial: initialFlux,
    placed: 0,
    removed: 0,
  }
}

export function canPlaceCell(flux: FluxState): boolean {
  return flux.current >= 1
}

export function canRefundCell(phase: 'PLANNING' | 'COUNTDOWN' | 'RUNNING' | 'FINISHED'): boolean {
  return phase === 'PLANNING'
}

export function placeCell(flux: FluxState): FluxState {
  if (!canPlaceCell(flux)) {
    return flux
  }

  return {
    ...flux,
    current: flux.current - 1,
    placed: flux.placed + 1,
  }
}

export function removeCell(
  flux: FluxState,
  phase: 'PLANNING' | 'COUNTDOWN' | 'RUNNING' | 'FINISHED'
): FluxState {
  if (!canRefundCell(phase)) {
    return flux
  }

  return {
    ...flux,
    current: flux.current + 1,
    removed: flux.removed + 1,
  }
}

export function resetFlux(initialFlux: number): FluxState {
  return createInitialFluxState(initialFlux)
}

export function getFluxColor(flux: FluxState): 'green' | 'yellow' | 'orange' | 'red' {
  const ratio = flux.current / flux.initial
  if (flux.current === 0) return 'red'
  if (ratio < 0.3) return 'orange'
  return ratio < 0.5 ? 'yellow' : 'green'
}
