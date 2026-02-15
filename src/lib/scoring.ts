import type { TrackedCluster, ScoreState, ScoringConfig } from '../types'

const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER

export function calculateGenerationScore(
  clusters: TrackedCluster[],
  config: ScoringConfig
): number {
  let generationScore = 0

  for (const cluster of clusters) {
    let points = 0

    switch (cluster.classification) {
      case 'MOVER':
        points = config.moverPointsPerGeneration
        break
      case 'OSCILLATOR':
        points = config.oscillatorPointsPerGeneration
        break
      case 'STATIC':
        points = 0
        break
    }

    generationScore += points
  }

  generationScore = Math.round(generationScore * config.scoreMultiplier)

  return Math.min(generationScore, MAX_SAFE_INTEGER)
}

export function updateScore(currentState: ScoreState, generationScore: number): ScoreState {
  const newTotalScore = Math.min(currentState.currentScore + generationScore, MAX_SAFE_INTEGER)

  return {
    currentScore: newTotalScore,
    generationScore,
    totalPatternsTracked: currentState.totalPatternsTracked,
  }
}

export function updateTotalPatternsTracked(
  currentState: ScoreState,
  clusterCount: number
): ScoreState {
  return {
    ...currentState,
    totalPatternsTracked: currentState.totalPatternsTracked + clusterCount,
  }
}

export function resetScore(): ScoreState {
  return {
    currentScore: 0,
    generationScore: 0,
    totalPatternsTracked: 0,
  }
}

export function createInitialScoreState(): ScoreState {
  return resetScore()
}

export function createInitialScoringConfig(): ScoringConfig {
  return {
    moverPointsPerGeneration: 10,
    oscillatorPointsPerGeneration: 2,
    scoreMultiplier: 1.0,
  }
}

export function formatScore(score: number): string {
  if (score >= 1000000) {
    return `${(score / 1000000).toFixed(1)}M`
  }
  if (score >= 1000) {
    return `${(score / 1000).toFixed(1)}K`
  }
  return score.toString()
}

export function calculateMilestone(score: number): number {
  return Math.floor(score / 100) * 100
}

export function isMilestoneReached(currentScore: number, previousScore: number): boolean {
  const currentMilestone = calculateMilestone(currentScore)
  const previousMilestone = calculateMilestone(previousScore)
  return currentMilestone > previousMilestone
}
