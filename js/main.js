const files = {
  0: "img/red.png",
  1: "img/red-yellow.png",
  2: "img/green.png",
  3: "img/yellow.png",
  4: "img/none.png",
  5: "img/yellow.png"
};

const FAILURE_DURATION = 10000;
const FAILURE_PROBABILITY = 0.1;

const DEFAULT_OFFSET = 0;

const DEFAULT_PHASES = [
  { state: 0, duration: 30000 },
  { state: 1, duration: 2000 },
  { state: 2, duration: 30000 },
  { state: 3, duration: 2000 }
];

const FAILURE_PHASES = [
  { state: 4, duration: 1000 },
  { state: 5, duration: 1000 }
];

const INITIAL_STATE = 0;

function negativeSafeMod(n, m) {
  return ((n % m) + m) % m;
}

class TrafficLight {
  constructor(id, phases, offset) {
    this.id = id;
    this.phases = phases;
    this.offset = offset || DEFAULT_OFFSET;
    this.intervals = phases.map(phase => phase.duration);
    this.cycleLength = this.intervals.reduce((sum, a) => sum + a, 0);
  }

  nextTransition(currentTimestamp) {
    const cycleStart = Math.floor((currentTimestamp - this.offset) / this.cycleLength) * this.cycleLength + this.offset;
    let cycleTimestamp = cycleStart;
    let st = 0;
    while (cycleTimestamp < currentTimestamp) {
      cycleTimestamp += this.intervals[st];
      st = (st + 1) % this.intervals.length;
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
    return negativeSafeMod(this.nextTransition(currentTimestamp).state - 1, this.intervals.length);
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
      this.nextTransition = bucket * this.duration;
      console.log("Next failure transition in: " + (this.nextTransition - currentTimestamp) + " ms");
    }

    return this.nextTransition;
  }

  state(bucket) {
    const rand = this.deterministicRand(bucket);
    console.log("rand " + rand);
    const state = (rand / 100) < FAILURE_PROBABILITY;
    return state;
  }

  currentState(currentTimestamp) {
    const bucket = Math.floor(currentTimestamp / this.duration);
    return this.state(bucket);
  }
}

const trafficLights = {};
const failureTrafficLights = {};
const failure = new Failure();

const count = function() {
  return Object.keys(trafficLights).length;
}

const createOffsetInput = function(lightIdx, offset) {
  return createInput(`offset-${lightIdx}`, offset, "Offset: ", (e) => {
    const light = trafficLights[lightIdx];
    const newOffset = parseInt(e.target.value) * 1000;
    trafficLights[lightIdx] = new TrafficLight(lightIdx, light.phases, newOffset);
  });
}

const createPhaseInput = function(lightIdx, phaseIdx, duration) {
  const id = `phase-time-${lightIdx}-${phaseIdx}`;
  const value = duration / 1000;
  const labelText = `Phase ${phaseIdx} duration (s): `;
  return createInput(id, value, labelText, (e) => {
    const light = trafficLights[lightIdx];
    const updatedPhases = [...light.phases];
    updatedPhases[phaseIdx].duration = parseInt(e.target.value) * 1000;
    trafficLights[lightIdx] = new TrafficLight(lightIdx, updatedPhases, light.offset);
  });
}

const createInput = function(id, value, labelText, listener) {
  const li = document.createElement("li");

  const input = document.createElement("input");
  input.type = "number";
  input.id = id;
  input.name = id;
  input.value = value;
  input.addEventListener("input", (e) => {
    listener(e);
    forceClock();
  });

  const label = document.createElement("label");
  label.htmlFor = id;
  label.textContent = labelText;

  li.appendChild(label);
  li.appendChild(input);

  return li;
}

const addLight = function() {
  const currentTimestamp = Date.now();
  const idx = count();

  const light = new TrafficLight(idx, DEFAULT_PHASES, DEFAULT_OFFSET);
  trafficLights[idx] = light;
  failureTrafficLights[idx] = new TrafficLight(idx, FAILURE_PHASES);

  const td = document.createElement("td");
  const img = document.createElement("img");
  img.id = "light-" + idx;
  img.alt = "traffic light";
  img.className = "traffic-light";
  img.src = files[trafficLights[idx].currentState(currentTimestamp)];

  const form = document.createElement("form");
  const ul = document.createElement("ul");

  ul.appendChild(createOffsetInput(idx, light.offset));
  light.phases.map((phase, phaseIdx) => createPhaseInput(idx, phaseIdx, phase.duration)).forEach(el => ul.appendChild(el));

  form.appendChild(ul);
  td.appendChild(form);
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

document.getElementById("control-add").addEventListener("click", addLight);
document.getElementById("control-remove").addEventListener("click", removeLight);
document.getElementById("control-wakelock").addEventListener("click", toggleWakeLock);

addLight();

let nextTimeout = null;

function forceClock() {
  console.log("Forcing clock!");
  if (nextTimeout != null) {
    clearTimeout(nextTimeout);
  }
  runClock();
}

function runClock() {
  const currentTimestamp = Date.now();

  const currentTrafficLights = failure.currentState(currentTimestamp) ? failureTrafficLights : trafficLights;

  Object.values(currentTrafficLights).forEach(light => light.redraw(currentTimestamp));

  const lights = Object.values(currentTrafficLights);

  const timestamps = [...lights, failure].map(light => light.nextStateTimestamp(currentTimestamp));

  const loopEndTimestamp = Date.now();

  const timeToNextTick = Math.max(0, Math.min(...timestamps) - loopEndTimestamp);

  console.log(`Current timestamp ${currentTimestamp}`);
  console.log(`Loop time ${loopEndTimestamp - currentTimestamp} ms`);
  console.log(`Next tick in ${timeToNextTick} ms`);

  nextTimeout = setTimeout(function() {
    runClock();
  }, timeToNextTick);
}

runClock();
