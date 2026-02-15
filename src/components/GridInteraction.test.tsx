import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { GridInteraction } from './GridInteraction'
import type { GridType } from '../types'
import type { FluxState } from '../types'

describe('GridInteraction', () => {
  it('renders without crashing', () => {
    const grid: GridType = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]
    const flux: FluxState = {
      current: 20,
      initial: 20,
      placed: 0,
      removed: 0,
    }

    render(
      <GridInteraction
        grid={grid}
        flux={flux}
        phase="PLANNING"
        showGridLines={false}
        onGridChange={vi.fn()}
        onFluxChange={vi.fn()}
        interactionMode="DRAW"
      />
    )
  })

  it('disables interaction during RUNNING phase', () => {
    const grid: GridType = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]
    const flux: FluxState = {
      current: 20,
      initial: 20,
      placed: 0,
      removed: 0,
    }

    const { container } = render(
      <GridInteraction
        grid={grid}
        flux={flux}
        phase="RUNNING"
        showGridLines={false}
        onGridChange={vi.fn()}
        onFluxChange={vi.fn()}
        interactionMode="DRAW"
      />
    )

    const containerDiv = container.querySelector('div')
    expect(containerDiv).toHaveStyle({ cursor: 'not-allowed' })
  })

  it('disables interaction during COUNTDOWN phase', () => {
    const grid: GridType = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]
    const flux: FluxState = {
      current: 20,
      initial: 20,
      placed: 0,
      removed: 0,
    }

    const { container } = render(
      <GridInteraction
        grid={grid}
        flux={flux}
        phase="COUNTDOWN"
        showGridLines={false}
        onGridChange={vi.fn()}
        onFluxChange={vi.fn()}
        interactionMode="DRAW"
      />
    )

    const containerDiv = container.querySelector('div')
    expect(containerDiv).toHaveStyle({ cursor: 'not-allowed' })
  })

  it('enables interaction during PLANNING phase', () => {
    const grid: GridType = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]
    const flux: FluxState = {
      current: 20,
      initial: 20,
      placed: 0,
      removed: 0,
    }

    const { container } = render(
      <GridInteraction
        grid={grid}
        flux={flux}
        phase="PLANNING"
        showGridLines={false}
        onGridChange={vi.fn()}
        onFluxChange={vi.fn()}
        interactionMode="DRAW"
      />
    )

    const containerDiv = container.querySelector('div')
    expect(containerDiv).toHaveStyle({ cursor: 'default' })
  })
})
