const MAX_NEXT_TRANSITION_WAIT = 300_000

export default class Failure {
  constructor(private duration: number, private probability: number, private nextTransition = 0) {
  }

  nextStateTimestamp(currentTimestamp: number) {
    let currentState = this.currentState(currentTimestamp)

    let bucket = Math.floor(currentTimestamp / this.duration) + 1
    while (this.state(bucket) == currentState || this.nextTransition < currentTimestamp) {
      bucket += 1
      this.nextTransition = bucket * this.duration
      if (this.nextTransition - currentTimestamp > MAX_NEXT_TRANSITION_WAIT) {
        break
      }
    }

    return this.nextTransition
  }

  private state(bucket: number) {
    const rand = this.deterministicRand(bucket)
    const state = (rand / 100) < this.probability
    return state
  }

  private hash(number: number) {
    let x = ((number >> 16) ^ number) * 0x45d9f3b
    x = ((x >> 16) ^ x) * 0x45d9f3b
    x = (x >> 16) ^ x
    return x
  }
  
  deterministicRand(number: number) {
    return this.hash(number) % 100
  }

  currentState(currentTimestamp: number) {
    const bucket = Math.floor(currentTimestamp / this.duration)
    return this.state(bucket)
  }
}
