const files = {
  0: "img/red.png",
  1: "img/red-yellow.png",
  2: "img/green.png",
  3: "img/yellow.png",
  4: "img/none.png",
  5: "img/yellow.png"
};

const FAILURE_DURATION = 15000;
const FAILURE_PROBABILITY = 0.05;

const DEFAULT_PHASES = [
  { state: 0, duration: 30000 },
  { state: 1, duration: 2000 },
  { state: 2, duration: 30000 },
  { state: 3, duration: 2000 }
];

const INVERTED_PHASES = [
  { state: 2, duration: 30000 },
  { state: 3, duration: 2000 },
  { state: 0, duration: 30000 },
  { state: 1, duration: 2000 }
];

const FAILURE_PHASES = [
  { state: 4, duration: 1000 },
  { state: 5, duration: 1000 }
];

const INITIAL_STATE = 0;

class TrafficLight {
  constructor(id, phases) {
    this.id = id;
    this.phases = phases;
    this.intervals = phases.map(phase => phase.duration);
    this.cycleLength = this.intervals.reduce((sum, a) => sum + a, 0);
  }

  nextTransition(currentTimestamp) {
    let cycleStart = currentTimestamp - (currentTimestamp % this.cycleLength);
    let cycleTimestamp = cycleStart;
    let st = 0;
    while (cycleTimestamp < currentTimestamp) {
      cycleTimestamp += this.intervals[st % this.intervals.length];
      st++;
    }
    return {
      state: st,
      timestamp: cycleTimestamp
    };
  }

  nextStateTimestamp(currentTimestamp) {
    return this.nextTransition(currentTimestamp).timestamp;
  }

  currentState(currentTimestamp) {
    return (this.nextTransition(currentTimestamp).state - 1) % this.intervals.length;
  }

  redraw(currentTimestamp) {
    let state = this.currentState(currentTimestamp);
    document.getElementById("light-" + this.id).src = files[this.phases[state].state];
  }
}

class Failure {
  constructor() {
    this.duration = FAILURE_DURATION;
    this.probability = FAILURE_PROBABILITY;
    this.nextTransition = 0;
  }

  deterministicRand(number) {
    return number % 100;
  }

  nextStateTimestamp(currentTimestamp) {
    let currentState = this.currentState(currentTimestamp);

    if (this.nextTransition < currentTimestamp) {
      let bucket = Math.floor(currentTimestamp / this.duration) + 1;
      while (this.state(bucket) == currentState) {
         bucket += 1;
      }
      console.log("bucket " + bucket);
      this.nextFailure = bucket * this.duration;
      console.log("Next failure in: " + (this.nextFailure - currentTimestamp) + " ms");
    }

    return this.nextFailure;
  }

  state(bucket) {
    let rand = this.deterministicRand(bucket);
    console.log("bucket " + bucket);
    console.log("rand " + rand);
    const state = (rand / 100) < FAILURE_PROBABILITY;
    console.log(bucket + " -> " + state)
    return state;
  }

  currentState(currentTimestamp) {
    let bucket = Math.floor(currentTimestamp / this.duration);
    console.log("current failure state " + this.state(bucket));
    return this.state(bucket);
  }
}

const newLight = function(id) {
  return new TrafficLight(id, DEFAULT_PHASES);
}

let failure = false;
const trafficLights = {};
const invertedLights = {};
const failureTrafficLights = {};
const failureObj = new Failure();

const count = function() {
  return Object.keys(trafficLights).length;
}

const addLight = function() {
  const currentTimestamp = Date.now();
  const idx = count();

  trafficLights[idx] = newLight(idx);
  failureTrafficLights[idx] = new TrafficLight(idx, FAILURE_PHASES);
  invertedLights[idx] = new TrafficLight(idx, INVERTED_PHASES);

  const td = document.createElement("td");
  const img = document.createElement("img");
  img.id = "light-" + idx;
  img.alt = "traffic light";
  img.className = "traffic-light";
  img.src = files[trafficLights[idx].currentState(currentTimestamp)];
  td.appendChild(img);

  document.getElementById("traffic-lights").appendChild(td);
}

const removeLight = function() {
  if (count() > 1) {
    const idx = count() - 1;
    delete trafficLights[idx];
    document.getElementById("light-" + idx).remove();
  }
}

let wakeLock = null;

const requestWakeLock = async () => {
  try {
    wakeLock = await navigator.wakeLock.request();
    wakeLock.addEventListener('release', () => {
      document.getElementById("control-wakelock").checked = false;
    });
    document.getElementById("control-wakelock").checked = true;
  } catch (err) {
    console.error(`${err.name}, ${err.message}`);
  }
};

// Function that attempts to release the wake lock.
const releaseWakeLock = async () => {
  if (!wakeLock) {
    return;
  }
  try {
    await wakeLock.release();
    wakeLock = null;
  } catch (err) {
    console.error(`${err.name}, ${err.message}`);
  }
};

const toggleWakeLock = async (e) => {
  if (e.srcElement.checked) {
    requestWakeLock();
  } else {
    releaseWakeLock();
  }
}

let inverted = false;

const toggleInvert = function(e) {
  if (e.srcElement.checked) {
    inverted = true;
  } else {
    inverted = false;
  }
  console.log(inverted);
}

document.getElementById("control-add").addEventListener("click", addLight);
document.getElementById("control-remove").addEventListener("click", removeLight);
document.getElementById("control-invert").addEventListener("click", toggleInvert);
document.getElementById("control-wakelock").addEventListener("click", toggleWakeLock);

addLight();

function runClock() {
  const currentTimestamp = Date.now();

  const normalLights = inverted ? invertedLights : trafficLights;
  const currentTrafficLights = failureObj.currentState(currentTimestamp) ? failureTrafficLights : normalLights;

  Object.values(currentTrafficLights).forEach(light => light.redraw(currentTimestamp));

  const lights = Object.values(currentTrafficLights);

  const timestamps = [...lights, failureObj].map(light => light.nextStateTimestamp(currentTimestamp));
  const timeToNextTick = Math.max(0, Math.min(...timestamps) - currentTimestamp);

  console.log(`Current timestamp ${currentTimestamp}`);
  console.log(`Next tick in ${timeToNextTick} ms`);

  setTimeout(function() {
    runClock();
  }, timeToNextTick);
}

runClock();
