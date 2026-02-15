import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ScoreDisplay } from './ScoreDisplay'

describe('ScoreDisplay', () => {
  it('should render score with PTS label', () => {
    render(<ScoreDisplay score={100} previousScore={0} />)

    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('PTS')).toBeInTheDocument()
  })

  it('should format large scores with K suffix', () => {
    render(<ScoreDisplay score={1500} previousScore={0} />)

    expect(screen.getByText('1.5K')).toBeInTheDocument()
  })

  it('should format very large scores with M suffix', () => {
    render(<ScoreDisplay score={1500000} previousScore={0} />)

    expect(screen.getByText('1.5M')).toBeInTheDocument()
  })

  it('should apply pulse class when score increases', () => {
    render(<ScoreDisplay score={100} previousScore={0} />)

    const scoreValue = screen.getByText('100')
    expect(scoreValue).toHaveClass('pulse')
  })

  it('should not apply pulse class when score stays same', () => {
    render(<ScoreDisplay score={100} previousScore={100} />)

    const scoreValue = screen.getByText('100')
    expect(scoreValue).not.toHaveClass('pulse')
  })

  it('should apply milestone flash when reaching 100 points', () => {
    render(<ScoreDisplay score={100} previousScore={95} />)

    const scoreValue = screen.getByText('100')
    expect(scoreValue).toHaveClass('milestone-flash')
  })

  it('should apply milestone flash when reaching 200 points', () => {
    render(<ScoreDisplay score={200} previousScore={195} />)

    const scoreValue = screen.getByText('200')
    expect(scoreValue).toHaveClass('milestone-flash')
  })

  it('should not apply milestone flash when not crossing milestone', () => {
    render(<ScoreDisplay score={150} previousScore={145} />)

    const scoreValue = screen.getByText('150')
    expect(scoreValue).not.toHaveClass('milestone-flash')
  })

  it('should render pattern breakdown when showPatternBreakdown is true', () => {
    render(
      <ScoreDisplay
        score={100}
        previousScore={0}
        movers={5}
        oscillators={3}
        rate={58}
        showPatternBreakdown={true}
      />
    )

    expect(screen.getByText('Movers:')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('Oscillators:')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('Rate:')).toBeInTheDocument()
    expect(screen.getByText('58/gen')).toBeInTheDocument()
  })

  it('should not render pattern breakdown when showPatternBreakdown is false', () => {
    render(
      <ScoreDisplay
        score={100}
        previousScore={0}
        movers={5}
        oscillators={3}
        rate={58}
        showPatternBreakdown={false}
      />
    )

    expect(screen.queryByText('Movers:')).not.toBeInTheDocument()
    expect(screen.queryByText('Oscillators:')).not.toBeInTheDocument()
    expect(screen.queryByText('Rate:')).not.toBeInTheDocument()
  })

  it('should handle zero movers and oscillators', () => {
    render(
      <ScoreDisplay
        score={100}
        previousScore={0}
        movers={0}
        oscillators={0}
        rate={0}
        showPatternBreakdown={true}
      />
    )

    expect(screen.getByText('Movers:')).toBeInTheDocument()
    expect(screen.getByText('Oscillators:')).toBeInTheDocument()
    expect(screen.getByText('Rate:')).toBeInTheDocument()
    expect(screen.getByText('0/gen')).toBeInTheDocument()
  })

  it('should have correct CSS classes', () => {
    const { container } = render(<ScoreDisplay score={100} previousScore={0} />)

    expect(container.querySelector('.score-display-container')).toBeInTheDocument()
    expect(container.querySelector('.score-display')).toBeInTheDocument()
    expect(container.querySelector('.score-value')).toBeInTheDocument()
    expect(container.querySelector('.score-label')).toBeInTheDocument()
  })
})
