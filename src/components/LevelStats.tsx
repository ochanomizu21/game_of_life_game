import { formatScore } from '../lib/scoring'

interface LevelStatsProps {
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

export function LevelStats({
  finalScore,
  highScore,
  timeLimitSeconds,
  timeRemaining,
  finalGeneration,
  finalAliveCount,
  moversCount,
  oscillatorsCount,
  staticCount,
  totalPatternsTracked,
}: LevelStatsProps) {
  const timeTaken = timeLimitSeconds - timeRemaining
  const timeTakenFormatted = formatTime(timeTaken)
  const isNewHighScore = finalScore > highScore

  return (
    <div className="level-stats">
      <div className="stats-section">
        <h3 className="stats-section-title">Score</h3>
        <div className="stat-row">
          <span className="stat-label">Final Score:</span>
          <span className={`stat-value ${isNewHighScore ? 'new-high-score' : ''}`}>
            {formatScore(finalScore)}
            {isNewHighScore && <span className="high-score-badge">NEW HIGH!</span>}
          </span>
        </div>
        <div className="stat-row">
          <span className="stat-label">High Score:</span>
          <span className="stat-value">{formatScore(highScore)}</span>
        </div>
      </div>

      <div className="stats-section">
        <h3 className="stats-section-title">Time</h3>
        <div className="stat-row">
          <span className="stat-label">Time Taken:</span>
          <span className="stat-value">{timeTakenFormatted}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Time Remaining:</span>
          <span className="stat-value">{formatTime(timeRemaining)}</span>
        </div>
      </div>

      <div className="stats-section">
        <h3 className="stats-section-title">Patterns</h3>
        <div className="stat-row">
          <span className="stat-label">Movers:</span>
          <span className="stat-value mover-count">{moversCount}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Oscillators:</span>
          <span className="stat-value oscillator-count">{oscillatorsCount}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Static:</span>
          <span className="stat-value static-count">{staticCount}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Total Patterns:</span>
          <span className="stat-value">{totalPatternsTracked}</span>
        </div>
      </div>

      <div className="stats-section">
        <h3 className="stats-section-title">Stats</h3>
        <div className="stat-row">
          <span className="stat-label">Generations:</span>
          <span className="stat-value">{finalGeneration}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Cells Alive:</span>
          <span className="stat-value">{finalAliveCount}</span>
        </div>
      </div>
    </div>
  )
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
