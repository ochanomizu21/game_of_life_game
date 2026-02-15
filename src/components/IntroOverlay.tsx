import { useState } from 'react'
import '../styles/IntroOverlay.css'

export function IntroOverlay({ onEnter }: { onEnter: () => void }) {
  const [isExiting, setIsExiting] = useState(false)

  const handleEnter = () => {
    setIsExiting(true)
    window.setTimeout(() => {
      onEnter()
    }, 1200)
  }

  if (isExiting) {
    return (
      <div className={`intro-overlay exiting`}>
        <h1 className="intro-title glitch">CONWAY'S GAME OF LIFE</h1>
        <button className="enter-button">ENTER VOID</button>
      </div>
    )
  }

  return (
    <div className="intro-overlay">
      <h1 className="intro-title glitch">CONWAY'S GAME OF LIFE</h1>
      <button className="enter-button" onClick={handleEnter}>
        ENTER VOID
      </button>
    </div>
  )
}
