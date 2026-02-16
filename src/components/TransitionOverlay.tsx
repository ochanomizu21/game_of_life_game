import './TransitionOverlay.css'
import { LevelStats } from './LevelStats'

interface TransitionOverlayProps {
  transitionState: 'PLAYING' | 'FADING_OUT' | 'INTERSTITIAL' | 'FADING_IN' | 'READY'
  currentLevel: number
  showStats?: boolean
  stats?: {
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

export function TransitionOverlay({
  transitionState,
  currentLevel,
  showStats = true,
  stats,
}: TransitionOverlayProps) {
  if (transitionState === 'PLAYING' || transitionState === 'READY') {
    return null
  }

  const opacity = (() => {
    switch (transitionState) {
      case 'FADING_OUT':
        return 0
      case 'INTERSTITIAL':
        return 1
      case 'FADING_IN':
        return 1
      default:
        return 0
    }
  })()

  const animationClass = (() => {
    switch (transitionState) {
      case 'FADING_OUT':
        return 'fade-out'
      case 'INTERSTITIAL':
        return 'interstitial'
      case 'FADING_IN':
        return 'fade-in'
      default:
        return ''
    }
  })()

  return (
    <div className={`transition-overlay ${animationClass}`} style={{ opacity }}>
      {transitionState === 'INTERSTITIAL' && (
        <div className="interstitial-content">
          <div className="level-complete-text">Level {currentLevel} Complete</div>
          <div className="next-level-text">Level {currentLevel + 1}</div>
          {showStats && stats && <LevelStats {...stats} />}
          <div className="skip-hint">Press Space or ESC to skip</div>
        </div>
      )}
      {transitionState !== 'INTERSTITIAL' && (
        <div className="skip-hint">Press Space or ESC to skip</div>
      )}
    </div>
  )
}
