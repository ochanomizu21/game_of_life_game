import { useEffect, useRef } from 'react'

interface AnnouncerProps {
  message: string
  priority?: 'polite' | 'assertive'
}

export function Announcer({ message, priority = 'polite' }: AnnouncerProps) {
  const prevMessageRef = useRef<string | null>(null)

  useEffect(() => {
    if (message === prevMessageRef.current) {
      return
    }

    prevMessageRef.current = message
  }, [message])

  return (
    <div aria-live={priority} aria-atomic="true" className="sr-only" role="status">
      {message}
    </div>
  )
}
