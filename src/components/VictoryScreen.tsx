import { useState } from 'react'
import { LevelStats } from './LevelStats'
import './VictoryScreen.css'

interface VictoryScreenProps {
  totalScore: number
  onPlayAgain: () => void
  finalLevelStats?: {
    finalScore: number
    highScore: number
    timeLimitSeconds: number
    timeRemaining: number
    finalGeneration: number
    finalAliveCount: number
    moversCount: number
    oscillatorsCount: number
    staticCount: number
    totalPatternsTracked: number
  }
}

export function VictoryScreen({ totalScore, onPlayAgain, finalLevelStats }: VictoryScreenProps) {
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
      {finalLevelStats && <LevelStats {...finalLevelStats} />}
      <button className="victory-button" onClick={handlePlayAgain}>
        Play Again
      </button>
    </div>
  )
}
