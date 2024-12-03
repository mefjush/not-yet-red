const MAX_NEXT_TRANSITION_WAIT = 30_000

export default class Failure {
  constructor(private duration: number, private probability: number, private nextTransition = 0) {
  }

  nextStateTimestamp(currentTimestamp: number) {
    const currentState = this.currentState(currentTimestamp)

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
    return (this.deterministicRand(bucket) / 100) < this.probability
  }

  deterministicRand(number: number) {
    return this.hash(number) % 100
  }

  private hash(number: number) {
    let x = ((number >> 16) ^ number) * 0x45d9f3b
    x = ((x >> 16) ^ x) * 0x45d9f3b
    x = (x >> 16) ^ x
    return x
  }

  currentState(currentTimestamp: number) {
    const bucket = Math.floor(currentTimestamp / this.duration)
    return this.state(bucket)
  }
}
