import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders intro overlay on initial load', () => {
    render(<App />)
    expect(screen.getByText('ENTER VOID')).toBeInTheDocument()
  })

  it('shows game after intro completes', () => {
    vi.useFakeTimers()
    render(<App />)

    const enterButton = screen.getByText('ENTER VOID')
    expect(enterButton).toBeInTheDocument()

    act(() => {
      fireEvent.click(enterButton)
      vi.advanceTimersByTime(1200)
    })

    expect(screen.queryByText('ENTER VOID')).not.toBeInTheDocument()
    expect(screen.getByText('Small')).toBeInTheDocument()
    expect(screen.getByText('Medium')).toBeInTheDocument()
    expect(screen.getByText('Large')).toBeInTheDocument()
    expect(screen.getByText('START')).toBeInTheDocument()
    expect(screen.getByText('CLEAR')).toBeInTheDocument()
    expect(screen.getByText('RANDOM')).toBeInTheDocument()
    expect(screen.getByText('DRAW')).toBeInTheDocument()
    expect(screen.getByText('ERASE')).toBeInTheDocument()

    vi.useRealTimers()
  })

  it('renders status display after intro', () => {
    vi.useFakeTimers()
    render(<App />)

    act(() => {
      fireEvent.click(screen.getByText('ENTER VOID'))
      vi.advanceTimersByTime(1200)
    })

    expect(screen.queryByText('ENTER VOID')).not.toBeInTheDocument()
    expect(screen.getByText(/Phase:/)).toBeInTheDocument()
    expect(screen.getByText(/Cells:/)).toBeInTheDocument()
    expect(screen.getByText(/Flux:/)).toBeInTheDocument()

    vi.useRealTimers()
  })
})
