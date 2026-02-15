import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { TransitionOverlay } from './TransitionOverlay'

describe('TransitionOverlay', () => {
  it('should not render when in PLAYING state', () => {
    const { container } = render(<TransitionOverlay transitionState="PLAYING" currentLevel={1} />)

    expect(container.querySelector('.transition-overlay')).toBeNull()
  })

  it('should not render when in READY state', () => {
    const { container } = render(<TransitionOverlay transitionState="READY" currentLevel={1} />)

    expect(container.querySelector('.transition-overlay')).toBeNull()
  })

  it('should render with fade-out animation in FADING_OUT state', () => {
    const { container } = render(
      <TransitionOverlay transitionState="FADING_OUT" currentLevel={3} />
    )

    const overlay = container.querySelector('.transition-overlay')
    expect(overlay).toBeInTheDocument()
    expect(overlay).toHaveClass('fade-out')
    expect(screen.queryByText('Level 3 Complete')).not.toBeInTheDocument()
    expect(screen.queryByText('Level 4')).not.toBeInTheDocument()
  })

  it('should render interstitial content in INTERSTITIAL state', () => {
    render(<TransitionOverlay transitionState="INTERSTITIAL" currentLevel={5} />)

    expect(screen.getByText('Level 5 Complete')).toBeInTheDocument()
    expect(screen.getByText('Level 6')).toBeInTheDocument()
    expect(screen.getByText('Press Space or ESC to skip')).toBeInTheDocument()
  })

  it('should render with fade-in animation in FADING_IN state', () => {
    const { container } = render(<TransitionOverlay transitionState="FADING_IN" currentLevel={2} />)

    const overlay = container.querySelector('.transition-overlay')
    expect(overlay).toBeInTheDocument()
    expect(overlay).toHaveClass('fade-in')
    expect(screen.queryByText('Level 2 Complete')).not.toBeInTheDocument()
  })

  it('should show skip hint in all transition states except READY', () => {
    const { rerender } = render(<TransitionOverlay transitionState="FADING_OUT" currentLevel={1} />)

    expect(screen.getByText('Press Space or ESC to skip')).toBeInTheDocument()

    rerender(<TransitionOverlay transitionState="INTERSTITIAL" currentLevel={1} />)
    expect(screen.getByText('Press Space or ESC to skip')).toBeInTheDocument()

    rerender(<TransitionOverlay transitionState="FADING_IN" currentLevel={1} />)
    expect(screen.getByText('Press Space or ESC to skip')).toBeInTheDocument()
  })
})
