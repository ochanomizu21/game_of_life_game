import '../styles/GlassHUD.css'

interface UIToggleButtonProps {
  isVisible: boolean
  onToggle: () => void
}

export function UIToggleButton({ isVisible, onToggle }: UIToggleButtonProps) {
  return (
    <button
      className="ui-toggle-button"
      onClick={onToggle}
      aria-label={isVisible ? 'Hide UI' : 'Show UI'}
      title={isVisible ? 'Hide UI' : 'Show UI'}
    >
      {isVisible ? (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <path d="M9.9 4.24A9.12 9.12 0 0 0 12 4c7 0 9 9 9 9s-9 9-9 9c-.78 0-1.53-.09-2.25-.26" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8s0-9 0-9a10.07 10.07 0 0 1 5.94-5.94" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      )}
    </button>
  )
}
