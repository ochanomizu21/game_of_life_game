import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ErrorBoundary from './ErrorBoundary'

describe('ErrorBoundary', () => {
  it('should render children when no error occurs', () => {
    const ChildComponent = () => <div data-testid="child">Child Component</div>

    render(
      <ErrorBoundary>
        <ChildComponent />
      </ErrorBoundary>
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('should catch errors and display error UI', () => {
    const ThrowError = () => {
      throw new Error('Test error')
    }

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(
      screen.getByText(
        'The application encountered an unexpected error. Please try refreshing the page.'
      )
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument()

    consoleErrorSpy.mockRestore()
  })

  it('should reload page when reload button is clicked', async () => {
    const ThrowError = () => {
      throw new Error('Test error')
    }

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const user = userEvent.setup()

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    const reloadButton = screen.getByRole('button', { name: /reload page/i })
    expect(reloadButton).toBeInTheDocument()

    await user.click(reloadButton)

    consoleErrorSpy.mockRestore()
  })

  it('should log error and component stack to console', () => {
    const ThrowError = () => {
      throw new Error('Test error')
    }

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error caught by ErrorBoundary:',
      expect.any(Error)
    )
    expect(consoleErrorSpy).toHaveBeenCalledWith('Component stack:', expect.any(String))

    consoleErrorSpy.mockRestore()
  })
})
