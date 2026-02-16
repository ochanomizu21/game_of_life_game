import type { LevelConfig, LevelProgression, LevelGenerationParams } from '../types'

const HIGH_SCORE_STORAGE_KEY = 'gol-high-scores'

const DEFAULT_TOTAL_LEVELS = 10

function generateLevelConfig(levelNumber: number, params: LevelGenerationParams): LevelConfig {
  const { baseTimeSeconds, timeIncrementPerLevel, baseFlux, difficultyScalingMode } = params

  let timeLimitSeconds = baseTimeSeconds
  let initialFlux = baseFlux

  switch (difficultyScalingMode) {
    case 'TIME_ONLY':
      timeLimitSeconds = baseTimeSeconds + (levelNumber - 1) * timeIncrementPerLevel
      initialFlux = baseFlux
      break

    case 'RESOURCE_ONLY':
      timeLimitSeconds = baseTimeSeconds
      initialFlux = Math.max(5, Math.floor(baseFlux - (levelNumber - 1) * 1.5))
      break

    case 'MIXED':
      timeLimitSeconds = baseTimeSeconds + (levelNumber - 1) * Math.floor(timeIncrementPerLevel / 2)
      initialFlux = Math.max(5, Math.floor(baseFlux - (levelNumber - 1) * 0.5))
      break

    case 'EXTREME':
      timeLimitSeconds = baseTimeSeconds + (levelNumber - 1) * Math.floor(timeIncrementPerLevel / 3)
      initialFlux = Math.max(5, baseFlux - (levelNumber - 1) * 2)
      break

    default:
      timeLimitSeconds = baseTimeSeconds + (levelNumber - 1) * timeIncrementPerLevel
      initialFlux = baseFlux
  }

  return {
    levelNumber,
    timeLimitSeconds,
    initialFlux,
  }
}

export function createInitialProgression(
  totalLevels: number = DEFAULT_TOTAL_LEVELS
): LevelProgression {
  const levels: LevelConfig[] = []
  for (let i = 1; i <= totalLevels; i++) {
    levels.push({
      levelNumber: i,
      timeLimitSeconds: 45 + (i - 1) * 15,
      initialFlux: 20,
    })
  }

  return {
    currentLevel: 1,
    maxUnlockedLevel: 1,
    totalScore: 0,
    levels,
  }
}

export function generateProgression(
  params: LevelGenerationParams,
  totalLevels: number = DEFAULT_TOTAL_LEVELS
): LevelProgression {
  const levels: LevelConfig[] = []
  for (let i = 1; i <= totalLevels; i++) {
    levels.push(generateLevelConfig(i, params))
  }

  return {
    currentLevel: 1,
    maxUnlockedLevel: 1,
    totalScore: 0,
    levels,
  }
}

export function getCurrentLevelConfig(progression: LevelProgression): LevelConfig | null {
  if (progression.currentLevel < 1 || progression.currentLevel > progression.levels.length) {
    return null
  }
  return progression.levels[progression.currentLevel - 1]
}

export function advanceLevel(progression: LevelProgression, levelScore: number): LevelProgression {
  const newTotalScore = progression.totalScore + levelScore
  const newCurrentLevel = progression.currentLevel + 1
  const newMaxUnlockedLevel = Math.max(progression.maxUnlockedLevel, newCurrentLevel)

  return {
    currentLevel: newCurrentLevel,
    maxUnlockedLevel: newMaxUnlockedLevel,
    totalScore: newTotalScore,
    levels: progression.levels,
  }
}

export function isFinalLevel(progression: LevelProgression): boolean {
  return progression.currentLevel >= progression.levels.length
}

export function resetProgression(totalLevels: number = DEFAULT_TOTAL_LEVELS): LevelProgression {
  return createInitialProgression(totalLevels)
}

export function regenerateProgression(
  progression: LevelProgression,
  params: LevelGenerationParams
): LevelProgression {
  const totalLevels = progression.levels.length
  const levels: LevelConfig[] = []

  for (let i = 1; i <= totalLevels; i++) {
    levels.push(generateLevelConfig(i, params))
  }

  return {
    currentLevel: progression.currentLevel,
    maxUnlockedLevel: progression.maxUnlockedLevel,
    totalScore: progression.totalScore,
    levels,
  }
}

function loadHighScores(): Record<number, number> {
  try {
    const stored = localStorage.getItem(HIGH_SCORE_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.warn('Failed to load high scores from localStorage:', e)
  }
  return {}
}

function saveHighScores(scores: Record<number, number>): void {
  try {
    localStorage.setItem(HIGH_SCORE_STORAGE_KEY, JSON.stringify(scores))
  } catch (e) {
    console.warn('Failed to save high scores to localStorage:', e)
  }
}

export function saveHighScore(levelNumber: number, score: number): void {
  const highScores = loadHighScores()
  const currentHighScore = highScores[levelNumber] || 0

  if (score > currentHighScore) {
    highScores[levelNumber] = score
    saveHighScores(highScores)
  }
}

export function getHighScore(levelNumber: number): number {
  const highScores = loadHighScores()
  return highScores[levelNumber] || 0
}
