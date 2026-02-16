import { useState, useEffect, useRef } from 'react'
import { formatScore, isMilestoneReached } from '../lib/scoring'
import '../styles/ScoreDisplay.css'

interface ScoreDisplayProps {
  score: number
  previousScore: number
  movers?: number
  oscillators?: number
  rate?: number
  showPatternBreakdown?: boolean
  highScore?: number
}

export function ScoreDisplay({
  score,
  previousScore,
  movers = 0,
  oscillators = 0,
  rate = 0,
  showPatternBreakdown = false,
  highScore = 0,
}: ScoreDisplayProps) {
  const [displayScore, setDisplayScore] = useState(score)
  const [isPulsing, setIsPulsing] = useState(false)
  const [isMilestoneFlash, setIsMilestoneFlash] = useState(false)
  const lastProcessedScoreRef = useRef<number | null>(null)

  useEffect(() => {
    if (lastProcessedScoreRef.current === null) {
      lastProcessedScoreRef.current = previousScore

      if (previousScore !== score) {
        setIsPulsing(true)

        if (isMilestoneReached(score, previousScore)) {
          setIsMilestoneFlash(true)
        }
      }
      return
    }

    if (lastProcessedScoreRef.current !== previousScore) {
      setIsPulsing(true)

      if (isMilestoneReached(score, previousScore)) {
        setIsMilestoneFlash(true)
      }
    }

    lastProcessedScoreRef.current = previousScore
  }, [score, previousScore])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsPulsing(false)
    }, 200)

    return () => window.clearTimeout(timer)
  }, [isPulsing])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsMilestoneFlash(false)
    }, 500)

    return () => window.clearTimeout(timer)
  }, [isMilestoneFlash])

  useEffect(() => {
    const duration = 200
    const startTimestamp = window.performance.now()
    const startValue = displayScore
    const endValue = score

    if (startValue === endValue) return

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTimestamp
      const progress = Math.min(elapsed / duration, 1)

      const easedProgress =
        progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2

      setDisplayScore(Math.round(startValue + (endValue - startValue) * easedProgress))

      if (progress < 1) {
        window.requestAnimationFrame(animate)
      }
    }

    window.requestAnimationFrame(animate)
  }, [score, displayScore])

  return (
    <div className="score-display-container">
      <div className="score-display">
        <span
          className={`score-value ${isPulsing ? 'pulse' : ''} ${isMilestoneFlash ? 'milestone-flash' : ''}`}
        >
          {formatScore(displayScore)}
        </span>
        <span className="score-label">PTS</span>
      </div>
      {highScore > 0 && (
        <div className="high-score-display">
          <span className="high-score-label">HIGH:</span>
          <span className="high-score-value">{formatScore(highScore)}</span>
        </div>
      )}
      {showPatternBreakdown && (
        <div className="score-breakdown">
          <div className="score-breakdown-item">
            <span className="breakdown-label">Movers:</span>
            <span className="breakdown-value">{movers}</span>
          </div>
          <div className="score-breakdown-item">
            <span className="breakdown-label">Oscillators:</span>
            <span className="breakdown-value">{oscillators}</span>
          </div>
          <div className="score-breakdown-item">
            <span className="breakdown-label">Rate:</span>
            <span className="breakdown-value">{rate}/gen</span>
          </div>
        </div>
      )}
    </div>
  )
}
