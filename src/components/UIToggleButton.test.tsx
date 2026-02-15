import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UIToggleButton } from './UIToggleButton'

describe('UIToggleButton', () => {
  it('should render eye icon when UI is visible', () => {
    render(<UIToggleButton isVisible={true} onToggle={vi.fn()} />)

    const button = screen.getByLabelText('Hide UI')
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('title', 'Hide UI')
  })

  it('should render eye-slash icon when UI is hidden', () => {
    render(<UIToggleButton isVisible={false} onToggle={vi.fn()} />)

    const button = screen.getByLabelText('Show UI')
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('title', 'Show UI')
  })

  it('should call onToggle when clicked', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(<UIToggleButton isVisible={true} onToggle={onToggle} />)

    const button = screen.getByLabelText('Hide UI')
    await user.click(button)

    expect(onToggle).toHaveBeenCalledTimes(1)
  })
})
