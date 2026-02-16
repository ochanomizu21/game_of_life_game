import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LevelStats } from './LevelStats'

describe('LevelStats', () => {
  const mockStats = {
    finalScore: 1500,
    highScore: 1000,
    timeLimitSeconds: 45,
    timeRemaining: 10,
    finalGeneration: 50,
    finalAliveCount: 25,
    moversCount: 3,
    oscillatorsCount: 5,
    staticCount: 2,
    totalPatternsTracked: 10,
  }

  it('renders correctly with stats data', () => {
    render(<LevelStats {...mockStats} />)

    expect(screen.getAllByText(/Score/)).toHaveLength(3)
    expect(screen.getAllByText(/Time/)).toHaveLength(3)
    expect(screen.getAllByText(/Patterns/)).toHaveLength(2)
    expect(screen.getByText(/Stats/)).toBeInTheDocument()
  })

  it('displays final score', () => {
    render(<LevelStats {...mockStats} />)

    expect(screen.getByText('1.5K')).toBeInTheDocument()
  })

  it('displays high score', () => {
    render(<LevelStats {...mockStats} />)

    expect(screen.getByText('1.0K')).toBeInTheDocument()
  })

  it('displays time taken correctly', () => {
    render(<LevelStats {...mockStats} />)

    expect(screen.getByText('0:35')).toBeInTheDocument()
  })

  it('displays time remaining correctly', () => {
    render(<LevelStats {...mockStats} />)

    expect(screen.getByText('0:10')).toBeInTheDocument()
  })

  it('displays movers count', () => {
    render(<LevelStats {...mockStats} />)

    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('displays oscillators count', () => {
    render(<LevelStats {...mockStats} />)

    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('displays static count', () => {
    render(<LevelStats {...mockStats} />)

    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('displays total patterns', () => {
    render(<LevelStats {...mockStats} />)

    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('displays generations', () => {
    render(<LevelStats {...mockStats} />)

    expect(screen.getByText('50')).toBeInTheDocument()
  })

  it('displays cells alive', () => {
    render(<LevelStats {...mockStats} />)

    expect(screen.getByText('25')).toBeInTheDocument()
  })

  it('shows new high score badge when final score exceeds high score', () => {
    const statsWithNewHigh = { ...mockStats, finalScore: 2000 }

    render(<LevelStats {...statsWithNewHigh} />)

    expect(screen.getByText('NEW HIGH!')).toBeInTheDocument()
  })

  it('does not show new high score badge when final score is not higher', () => {
    const statsWithLowerScore = { ...mockStats, finalScore: 500 }

    render(<LevelStats {...statsWithLowerScore} />)

    expect(screen.queryByText('NEW HIGH!')).not.toBeInTheDocument()
  })

  it('formats time correctly for seconds only', () => {
    const statsWithSecondsOnly = { ...mockStats, timeLimitSeconds: 30, timeRemaining: 5 }

    render(<LevelStats {...statsWithSecondsOnly} />)

    expect(screen.getByText('0:25')).toBeInTheDocument()
  })

  it('formats time correctly for minutes and seconds', () => {
    const statsWithMinutes = { ...mockStats, timeLimitSeconds: 120, timeRemaining: 15 }

    render(<LevelStats {...statsWithMinutes} />)

    expect(screen.getByText('1:45')).toBeInTheDocument()
  })
})
