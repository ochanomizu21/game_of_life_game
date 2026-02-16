export type GridType = number[][]

export type GamePhase = 'PLANNING' | 'COUNTDOWN' | 'RUNNING' | 'FINISHED'

export type InteractionMode = 'DRAW' | 'ERASE'

export type TransitionState = 'PLAYING' | 'FADING_OUT' | 'INTERSTITIAL' | 'FADING_IN' | 'READY'

export interface CellCluster {
  id: string
  cells: Set<string>
  centroid: { x: number; y: number }
  generation: number
}

export interface TrackedCluster extends CellCluster {
  centroidHistory: { x: number; y: number }[]
  velocity: { dx: number; dy: number }
  classification: 'MOVER' | 'OSCILLATOR' | 'STATIC'
}

export interface RuleSet {
  name: string
  born: number[]
  survive: number[]
}

export interface SimulationState {
  grid: GridType
  generation: number
  running: boolean
  speed: number
  selectedRule: RuleSet
}

export interface FluxState {
  current: number
  initial: number
  placed: number
  removed: number
}

export interface LevelConfig {
  levelNumber: number
  timeLimitSeconds: number
  initialFlux: number
}

export interface ScoringConfig {
  moverPointsPerGeneration: number
  oscillatorPointsPerGeneration: number
  scoreMultiplier: number
}

export interface ScoreState {
  currentScore: number
  generationScore: number
  totalPatternsTracked: number
}

export interface LevelProgression {
  currentLevel: number
  maxUnlockedLevel: number
  totalScore: number
  levels: LevelConfig[]
}

export type DifficultyScalingMode = 'TIME_ONLY' | 'RESOURCE_ONLY' | 'MIXED' | 'EXTREME'

export interface LevelGenerationParams {
  baseTimeSeconds: number
  timeIncrementPerLevel: number
  baseFlux: number
  difficultyScalingMode: DifficultyScalingMode
}

export interface TransitionConfig {
  fadeOutDuration: number
  fadeInDuration: number
  interstitialDuration: number
  autoAdvanceDelay: number
  skipEnabled: boolean
}

export interface MovementDetectionParams {
  centroidHistoryLength: number
  movementThreshold: number
  minClusterSize: number
}

export interface GridSizingParams {
  mobileCellSize: number
  desktopCellSize: number
  minVisibleCells: number
}

export interface AudioParams {
  enabled: boolean
  volume: number
  waveform: 'sine' | 'triangle' | 'square' | 'sawtooth'
}

export type Preset = 'EASY' | 'NORMAL' | 'HARD' | 'CHAOS'

export interface ExpertSettings {
  movementDetection: MovementDetectionParams
  scoring: ScoringConfig
  levelGeneration: LevelGenerationParams
  gridSizing: GridSizingParams
  audio: AudioParams
  preset?: Preset
}
