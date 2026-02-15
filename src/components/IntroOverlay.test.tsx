import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { IntroOverlay } from './IntroOverlay'

describe('IntroOverlay', () => {
  it('should render title with glitch effect', () => {
    const onEnter = vi.fn()
    render(<IntroOverlay onEnter={onEnter} />)

    const title = screen.getByText("CONWAY'S GAME OF LIFE")
    expect(title).toBeInTheDocument()
    expect(title).toHaveClass('intro-title', 'glitch')
  })

  it('should render enter button', () => {
    const onEnter = vi.fn()
    render(<IntroOverlay onEnter={onEnter} />)

    const button = screen.getByText('ENTER VOID')
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('enter-button')
  })

  it('should call onEnter after clicking button and waiting for animation', () => {
    vi.useFakeTimers()
    const onEnter = vi.fn()
    render(<IntroOverlay onEnter={onEnter} />)

    const button = screen.getByText('ENTER VOID')
    button.click()

    expect(onEnter).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1200)

    expect(onEnter).toHaveBeenCalledTimes(1)

    vi.useRealTimers()
  })

  it('should apply exiting class after click', () => {
    const onEnter = vi.fn()
    const { container } = render(<IntroOverlay onEnter={onEnter} />)

    const overlay = container.querySelector('.intro-overlay')
    expect(overlay).not.toHaveClass('exiting')

    const button = screen.getByText('ENTER VOID')
    act(() => {
      button.click()
    })

    expect(overlay).toHaveClass('exiting')
  })
})
