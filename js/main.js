const files = {
  0: "img/red.png",
  1: "img/red-yellow.png",
  2: "img/green.png",
  3: "img/yellow.png",
  4: "img/none.png",
  5: "img/yellow.png"
};

const MAX_NEXT_TRANSITION_WAIT = 300000;

let DEFAULT_FAILURE_DURATION = 10000;
let DEFAULT_FAILURE_PROBABILITY = 0.1;

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
    const state = this.currentState(currentTimestamp);
    document.getElementById(`light-${this.id}-img`).src = files[this.phases[state].state];
  }
}

class Failure {
  constructor(duration, probability) {
    this.duration = duration || DEFAULT_FAILURE_DURATION;
    this.probability = probability || DEFAULT_FAILURE_PROBABILITY;
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
         this.nextTransition = bucket * this.duration;
         if (this.nextTransition - currentTimestamp > MAX_NEXT_TRANSITION_WAIT) {
           console.log(`No next transition found, will force-transit in ${MAX_NEXT_TRANSITION_WAIT / 1000} s`);
           break;
         }
      }

      console.log("Next failure transition in: " + (this.nextTransition - currentTimestamp) + " ms");
    }

    return this.nextTransition;
  }

  state(bucket) {
    const rand = this.deterministicRand(bucket);
    console.log("rand " + rand);
    const state = (rand / 100) < this.probability;
    return state;
  }

  currentState(currentTimestamp) {
    const bucket = Math.floor(currentTimestamp / this.duration);
    return this.state(bucket);
  }
}

const trafficLights = {};
let failure = new Failure();

const count = function() {
  return Object.keys(trafficLights).length;
}

const createOffsetInput = function(lightIdx, offset) {
  return createInput(`offset-${lightIdx}`, offset, "Offset", (e) => {
    const light = trafficLights[lightIdx];
    const newOffset = parseInt(e.target.value) * 1000;
    trafficLights[lightIdx] = new TrafficLight(lightIdx, light.phases, newOffset);
  });
}

const createPhaseInput = function(lightIdx, phaseIdx, duration) {
  const id = `phase-time-${lightIdx}-${phaseIdx}`;
  const value = duration / 1000;
  const labelText = `Phase ${phaseIdx} duration`;
  return createInput(id, value, labelText, (e) => {
    const light = trafficLights[lightIdx];
    const updatedPhases = [...light.phases];
    const oldPhase = updatedPhases[phaseIdx];
    updatedPhases[phaseIdx] = { ...oldPhase, duration: parseInt(e.target.value) * 1000 };
    trafficLights[lightIdx] = new TrafficLight(lightIdx, updatedPhases, light.offset);
  });
}

const createInput = function(id, value, labelText, listener) {
  const li = document.createElement("li");

  const input = document.createElement("input");
  input.type = "range";
  input.id = id;
  input.name = id;
  input.value = value;
  input.max = 90;
  input.addEventListener("input", (e) => {
    document.getElementById(`${id}-value`).value = `${e.target.value} s`;
    listener(e);
    forceClock();
  });

  const inputValue = document.createElement("input");
  inputValue.type = "text";
  inputValue.id = `${id}-value`;
  inputValue.className = "input-value";
  inputValue.value = `${value} s`;
  inputValue.disabled = true;

  const label = document.createElement("label");
  label.htmlFor = id;
  label.textContent = labelText;

  li.appendChild(label);
  li.appendChild(input);
  li.appendChild(inputValue);

  return li;
}

const addLight = function() {
  const currentTimestamp = Date.now();
  const idx = count();

  const light = new TrafficLight(idx, DEFAULT_PHASES, DEFAULT_OFFSET);
  trafficLights[idx] = light;

  const td = document.createElement("td");
  td.id = `light-${idx}`;

  const img = document.createElement("img");
  img.id = `light-${idx}-img`;
  img.alt = "traffic light";
  img.className = "traffic-light";
  img.src = files[trafficLights[idx].currentState(currentTimestamp)];

  const form = document.createElement("form");
  const ul = document.createElement("ul");
  ul.className = "traffic-light-controls";

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
    document.getElementById(`light-${idx}`).remove();
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

const updateFailureDuration = (e) => {
  failure = new Failure(e.target.value * 1000, failure.probability);
  runClock();
}

const updateFailureProbability = (e) => {
  failure = new Failure(failure.duration, e.target.value);
  runClock();
}

document.getElementById("control-add").addEventListener("click", addLight);
document.getElementById("control-remove").addEventListener("click", removeLight);
document.getElementById("control-failure-duration").addEventListener("input", updateFailureDuration);
document.getElementById("control-failure-probability").addEventListener("input", updateFailureProbability);
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

function failureTrafficLights(trafficLights) {
  return Object.fromEntries(Object.keys(trafficLights).map((idx) => [idx, new TrafficLight(idx, FAILURE_PHASES)]));
}

function runClock() {
  const currentTimestamp = Date.now();

  const currentTrafficLights = failure.currentState(currentTimestamp) ? failureTrafficLights(trafficLights) : trafficLights;

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
