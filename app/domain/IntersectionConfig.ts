const DEFAULT_FAILURE_DURATION = 30_000
const DEFAULT_FAILURE_PROBABILITY = 0
const DEFAULT_CYCLE_LENGTH = 30_000

export const DEFAULT_INTERSECTION_CONFIG = {
  cycleLength: DEFAULT_CYCLE_LENGTH,
  failure: {
    probability: DEFAULT_FAILURE_PROBABILITY,
    duration: DEFAULT_FAILURE_DURATION,
  },
}

export default interface IntersectionConfig {
  cycleLength: number
  failure: {
    probability: number
    duration: number
  }
}
