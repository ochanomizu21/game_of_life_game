import { useState } from 'react'
import './VictoryScreen.css'

export function VictoryScreen({
  totalScore,
  onPlayAgain,
}: {
  totalScore: number
  onPlayAgain: () => void
}) {
  const [isExiting, setIsExiting] = useState(false)

  const handlePlayAgain = () => {
    setIsExiting(true)
    window.setTimeout(() => {
      onPlayAgain()
    }, 500)
  }

  if (isExiting) {
    return (
      <div className={`victory-overlay exiting`}>
        <h1 className="victory-title">VICTORY</h1>
        <div className="victory-score-container">
          <div className="victory-score-label">Total Score</div>
          <div className="victory-score-value">{totalScore}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="victory-overlay">
      <h1 className="victory-title">VICTORY</h1>
      <div className="victory-score-container">
        <div className="victory-score-label">Total Score</div>
        <div className="victory-score-value">{totalScore}</div>
      </div>
      <button className="victory-button" onClick={handlePlayAgain}>
        Play Again
      </button>
    </div>
  )
}
