import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Game } from './Game'

describe('Game', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('should apply data-high-contrast attribute when highContrastMode is enabled', async () => {
    render(<Game />)

    expect(document.documentElement.getAttribute('data-high-contrast')).toBeNull()

    const settingsButton = screen.getByLabelText(/settings/i)
    await userEvent.click(settingsButton)

    await screen.findByRole('dialog', { hidden: true })

    const highContrastCheckbox = screen.getByRole('checkbox', {
      name: /high contrast mode/i,
      hidden: true,
    })

    await userEvent.click(highContrastCheckbox)

    const saveButton = screen.getByRole('button', { name: /save settings/i, hidden: true })
    await userEvent.click(saveButton)

    expect(document.documentElement.getAttribute('data-high-contrast')).toBe('true')
  })

  it('should remove data-high-contrast attribute when highContrastMode is disabled', async () => {
    localStorage.setItem(
      'gol-expert-settings',
      JSON.stringify({
        highContrastMode: true,
        movementDetection: { centroidHistoryLength: 5, movementThreshold: 0.5, minClusterSize: 1 },
        scoring: {
          moverPointsPerGeneration: 10,
          oscillatorPointsPerGeneration: 2,
          scoreMultiplier: 1,
        },
        levelGeneration: {
          baseTimeSeconds: 45,
          timeIncrementPerLevel: 15,
          baseFlux: 20,
          difficultyScalingMode: 'MIXED',
        },
        gridSizing: { mobileCellSize: 18, desktopCellSize: 20, minVisibleCells: 10 },
        audio: { enabled: true, volume: 0.1, waveform: 'sine' },
      })
    )

    render(<Game />)

    expect(document.documentElement.getAttribute('data-high-contrast')).toBe('true')

    const settingsButton = screen.getByLabelText(/settings/i)
    await userEvent.click(settingsButton)

    await screen.findByRole('dialog', { hidden: true })

    const highContrastCheckbox = screen.getByRole('checkbox', {
      name: /high contrast mode/i,
      hidden: true,
    })

    await userEvent.click(highContrastCheckbox)

    const saveButton = screen.getByRole('button', { name: /save settings/i, hidden: true })
    await userEvent.click(saveButton)

    expect(document.documentElement.getAttribute('data-high-contrast')).toBeNull()
  })

  it('should persist high contrast mode setting across reloads', () => {
    localStorage.setItem(
      'gol-expert-settings',
      JSON.stringify({
        highContrastMode: true,
        movementDetection: { centroidHistoryLength: 5, movementThreshold: 0.5, minClusterSize: 1 },
        scoring: {
          moverPointsPerGeneration: 10,
          oscillatorPointsPerGeneration: 2,
          scoreMultiplier: 1,
        },
        levelGeneration: {
          baseTimeSeconds: 45,
          timeIncrementPerLevel: 15,
          baseFlux: 20,
          difficultyScalingMode: 'MIXED',
        },
        gridSizing: { mobileCellSize: 18, desktopCellSize: 20, minVisibleCells: 10 },
        audio: { enabled: true, volume: 0.1, waveform: 'sine' },
      })
    )

    render(<Game />)

    expect(document.documentElement.getAttribute('data-high-contrast')).toBe('true')
  })
})
