import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders title', () => {
    render(<App />)
    expect(screen.getByText("Conway's Game of Life")).toBeInTheDocument()
  })

  it('renders game controls', () => {
    render(<App />)
    expect(screen.getByText('Small')).toBeInTheDocument()
    expect(screen.getByText('Medium')).toBeInTheDocument()
    expect(screen.getByText('Large')).toBeInTheDocument()
    expect(screen.getByText('Start')).toBeInTheDocument()
    expect(screen.getByText('Clear')).toBeInTheDocument()
    expect(screen.getByText('Random')).toBeInTheDocument()
    expect(screen.getByText('Draw')).toBeInTheDocument()
    expect(screen.getByText('Erase')).toBeInTheDocument()
  })

  it('renders status display', () => {
    render(<App />)
    expect(screen.getByText(/Phase:/)).toBeInTheDocument()
    expect(screen.getByText(/Cells:/)).toBeInTheDocument()
    expect(screen.getByText(/Flux:/)).toBeInTheDocument()
  })
})
