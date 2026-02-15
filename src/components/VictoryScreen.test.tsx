import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { VictoryScreen } from './VictoryScreen'

describe('VictoryScreen', () => {
  it('should render victory title', () => {
    render(<VictoryScreen totalScore={1000} onPlayAgain={vi.fn()} />)

    expect(screen.getByText('VICTORY')).toBeInTheDocument()
  })

  it('should display total score', () => {
    render(<VictoryScreen totalScore={5000} onPlayAgain={vi.fn()} />)

    expect(screen.getByText('5000')).toBeInTheDocument()
    expect(screen.getByText('Total Score')).toBeInTheDocument()
  })

  it('should render play again button', () => {
    const onPlayAgain = vi.fn()
    render(<VictoryScreen totalScore={1000} onPlayAgain={onPlayAgain} />)

    const button = screen.getByText('Play Again')
    expect(button).toBeInTheDocument()
  })

  it('should call onPlayAgain when button is clicked', async () => {
    const onPlayAgain = vi.fn()
    render(<VictoryScreen totalScore={1000} onPlayAgain={onPlayAgain} />)

    const button = screen.getByText('Play Again')
    fireEvent.click(button)

    await vi.waitFor(
      () => {
        expect(onPlayAgain).toHaveBeenCalled()
      },
      { timeout: 1000 }
    )
  })

  it('should apply exiting class when button clicked', async () => {
    const onPlayAgain = vi.fn()
    const { container } = render(<VictoryScreen totalScore={1000} onPlayAgain={onPlayAgain} />)

    const button = screen.getByText('Play Again')
    fireEvent.click(button)

    const overlay = container.querySelector('.victory-overlay')
    expect(overlay).toHaveClass('exiting')
  })
})
