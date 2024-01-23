const MAX_NEXT_TRANSITION_WAIT = 300000

export default class Failure {
  constructor(private duration: number, private probability: number, private nextTransition = 0) {
  }

  deterministicRand(number: number) {
    return number % 100
  }

  nextStateTimestamp(currentTimestamp: number) {
    let currentState = this.currentState(currentTimestamp)

    if (this.nextTransition < currentTimestamp) {
      let bucket = Math.floor(currentTimestamp / this.duration) + 1
      while (this.state(bucket) == currentState) {
         bucket += 1
         this.nextTransition = bucket * this.duration
         if (this.nextTransition - currentTimestamp > MAX_NEXT_TRANSITION_WAIT) {
           //  console.log(`No next transition found, will force-transit in ${MAX_NEXT_TRANSITION_WAIT / 1000} s`)
           break
         }
      }

      // console.log("Next failure transition in: " + (this.nextTransition - currentTimestamp) + " ms")
    }

    return this.nextTransition
  }

  state(bucket: number) {
    const rand = this.deterministicRand(bucket)
    const state = (rand / 100) < this.probability
    return state
  }

  currentState(currentTimestamp: number) {
    const bucket = Math.floor(currentTimestamp / this.duration)
    return this.state(bucket)
  }
}
