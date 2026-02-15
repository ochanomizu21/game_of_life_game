import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GlassHUD } from './GlassHUD'

describe('GlassHUD', () => {
  const defaultProps = {
    phase: 'PLANNING' as const,
    aliveCount: 10,
    flux: 20,
    fluxMax: 20,
    interactionMode: 'DRAW' as const,
    gridPreset: 'SMALL' as const,
    showGridLines: true,
    canStart: true,
    canInteract: true,
    onStart: vi.fn(),
    onClear: vi.fn(),
    onRandom: vi.fn(),
    onToggleGrid: vi.fn(),
    onSetMode: vi.fn(),
    onSetGridPreset: vi.fn(),
    onToggleSettings: vi.fn(),
  }

  it('should render all control groups', () => {
    render(<GlassHUD {...defaultProps} />)

    expect(screen.getByText('START')).toBeInTheDocument()
    expect(screen.getByText('RANDOM')).toBeInTheDocument()
    expect(screen.getByText('CLEAR')).toBeInTheDocument()
    expect(screen.getByText('DRAW')).toBeInTheDocument()
    expect(screen.getByText('ERASE')).toBeInTheDocument()
    expect(screen.getByText('Small')).toBeInTheDocument()
    expect(screen.getByText('Medium')).toBeInTheDocument()
    expect(screen.getByText('Large')).toBeInTheDocument()
  })

  it('should render status display', () => {
    render(<GlassHUD {...defaultProps} />)

    expect(screen.getByText('Phase:')).toBeInTheDocument()
    expect(screen.getByText('Cells:')).toBeInTheDocument()
    expect(screen.getByText('Flux:')).toBeInTheDocument()
    expect(screen.getByText('PLANNING')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('20')).toBeInTheDocument()
  })

  it('should call onStart when START button clicked', async () => {
    const user = userEvent.setup()
    render(<GlassHUD {...defaultProps} />)

    const startButton = screen.getByText('START')
    await user.click(startButton)

    expect(defaultProps.onStart).toHaveBeenCalledTimes(1)
  })

  it('should call onRandom when RANDOM button clicked', async () => {
    const user = userEvent.setup()
    render(<GlassHUD {...defaultProps} />)

    const randomButton = screen.getByText('RANDOM')
    await user.click(randomButton)

    expect(defaultProps.onRandom).toHaveBeenCalledTimes(1)
  })

  it('should call onClear when CLEAR button clicked', async () => {
    const user = userEvent.setup()
    render(<GlassHUD {...defaultProps} />)

    const clearButton = screen.getByText('CLEAR')
    await user.click(clearButton)

    expect(defaultProps.onClear).toHaveBeenCalledTimes(1)
  })

  it('should call onSetMode when mode buttons clicked', async () => {
    const user = userEvent.setup()
    render(<GlassHUD {...defaultProps} />)

    await user.click(screen.getByText('ERASE'))
    expect(defaultProps.onSetMode).toHaveBeenCalledWith('ERASE')

    await user.click(screen.getByText('DRAW'))
    expect(defaultProps.onSetMode).toHaveBeenCalledWith('DRAW')
  })

  it('should call onSetGridPreset when size buttons clicked', async () => {
    const user = userEvent.setup()
    render(<GlassHUD {...defaultProps} />)

    await user.click(screen.getByText('Medium'))
    expect(defaultProps.onSetGridPreset).toHaveBeenCalledWith('MEDIUM')

    await user.click(screen.getByText('Large'))
    expect(defaultProps.onSetGridPreset).toHaveBeenCalledWith('LARGE')
  })

  it('should call onToggleGrid when grid toggle clicked', async () => {
    const user = userEvent.setup()
    render(<GlassHUD {...defaultProps} />)

    const gridButton = screen.getByText('Hide Grid')
    await user.click(gridButton)

    expect(defaultProps.onToggleGrid).toHaveBeenCalledTimes(1)
  })

  it('should call onToggleSettings when settings clicked', async () => {
    const user = userEvent.setup()
    render(<GlassHUD {...defaultProps} />)

    const settingsButton = screen.getByText('⚙️')
    await user.click(settingsButton)

    expect(defaultProps.onToggleSettings).toHaveBeenCalledTimes(1)
  })

  it('should disable interaction when canInteract is false', () => {
    render(<GlassHUD {...defaultProps} canInteract={false} />)

    expect(screen.getByText('START')).toBeDisabled()
    expect(screen.getByText('RANDOM')).toBeDisabled()
    expect(screen.getByText('CLEAR')).toBeDisabled()
    expect(screen.getByText('DRAW')).toBeDisabled()
    expect(screen.getByText('ERASE')).toBeDisabled()
    expect(screen.getByText('Small')).toBeDisabled()
  })

  it('should disable START when canStart is false', () => {
    render(<GlassHUD {...defaultProps} canStart={false} />)

    expect(screen.getByText('START')).toBeDisabled()
    expect(screen.getByText('RANDOM')).not.toBeDisabled()
  })

  it('should show Show Grid when grid lines are hidden', () => {
    render(<GlassHUD {...defaultProps} showGridLines={false} />)

    expect(screen.getByText('Show Grid')).toBeInTheDocument()
    expect(screen.queryByText('Hide Grid')).not.toBeInTheDocument()
  })

  it('should display flux color based on value', () => {
    const { rerender } = render(<GlassHUD {...defaultProps} flux={20} fluxMax={20} />)
    const fluxValue = screen.getByText('20')
    expect(fluxValue).toHaveClass('hud-status-value', 'green')

    rerender(<GlassHUD {...defaultProps} flux={5} fluxMax={20} />)
    expect(fluxValue).toHaveClass('hud-status-value', 'orange')

    rerender(<GlassHUD {...defaultProps} flux={0} fluxMax={20} />)
    expect(fluxValue).toHaveClass('hud-status-value', 'red')
  })

  it('should highlight active interaction mode', () => {
    const { container: container1 } = render(<GlassHUD {...defaultProps} interactionMode="DRAW" />)
    expect(container1.querySelectorAll('.hud-button')[3]).toHaveClass('active')
    expect(container1.querySelectorAll('.hud-button')[4]).not.toHaveClass('active')

    const { container: container2 } = render(<GlassHUD {...defaultProps} interactionMode="ERASE" />)
    expect(container2.querySelectorAll('.hud-button')[4]).toHaveClass('active')
    expect(container2.querySelectorAll('.hud-button')[3]).not.toHaveClass('active')
  })

  it('should highlight active grid preset', () => {
    const { container: container1 } = render(<GlassHUD {...defaultProps} gridPreset="SMALL" />)
    const gridButtons = Array.from(container1.querySelectorAll('.hud-button')).filter((btn) =>
      ['Small', 'Medium', 'Large'].includes(btn.textContent || '')
    )
    const activeSmall = gridButtons.find((btn) => btn.textContent === 'Small')
    const inactiveOthers = gridButtons.filter((btn) => btn.textContent !== 'Small')
    expect(activeSmall).toHaveClass('active')
    expect(inactiveOthers.every((btn) => !btn.classList.contains('active'))).toBe(true)

    const { container: container2 } = render(<GlassHUD {...defaultProps} gridPreset="MEDIUM" />)
    const gridButtons2 = Array.from(container2.querySelectorAll('.hud-button')).filter((btn) =>
      ['Small', 'Medium', 'Large'].includes(btn.textContent || '')
    )
    const activeMedium = gridButtons2.find((btn) => btn.textContent === 'Medium')
    expect(activeMedium).toHaveClass('active')
  })

  it('should show RUNNING text when phase is not PLANNING', () => {
    render(<GlassHUD {...defaultProps} phase="RUNNING" />)
    expect(screen.getAllByText('RUNNING')[1]).toBeInTheDocument()
    expect(screen.queryByText('START')).not.toBeInTheDocument()
  })
})
