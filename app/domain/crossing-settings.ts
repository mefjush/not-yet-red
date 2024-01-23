export default interface CrossingSettings {
  cycleLength: number
  failure: {
    probability: number
    duration: number
  }
}