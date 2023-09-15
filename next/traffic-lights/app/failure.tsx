const MAX_NEXT_TRANSITION_WAIT = 300000;

export default class Failure {
  constructor(duration, probability) {
    this.duration = duration
    this.probability = probability
    this.nextTransition = 0
  }

  deterministicRand(number) {
    return number % 100
  }

  nextStateTimestamp(currentTimestamp) {
    let currentState = this.currentState(currentTimestamp)

    if (this.nextTransition < currentTimestamp) {
      let bucket = Math.floor(currentTimestamp / this.duration) + 1
      while (this.state(bucket) == currentState) {
         bucket += 1
         this.nextTransition = bucket * this.duration
         if (this.nextTransition - currentTimestamp > MAX_NEXT_TRANSITION_WAIT) {
           console.log(`No next transition found, will force-transit in ${MAX_NEXT_TRANSITION_WAIT / 1000} s`)
           break;
         }
      }

      console.log("Next failure transition in: " + (this.nextTransition - currentTimestamp) + " ms")
    }

    return this.nextTransition
  }

  state(bucket) {
    const rand = this.deterministicRand(bucket)
    const state = (rand / 100) < this.probability
    return state
  }

  currentState(currentTimestamp) {
    const bucket = Math.floor(currentTimestamp / this.duration)
    return this.state(bucket)
  }
}
