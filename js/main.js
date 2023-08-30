const STATE = {
  RED: { "name": "Red", "file": "img/red.png", "color": "#FF0000"},
  RED_YELLOW: { "name": "Red-Yellow", "file": "img/red-yellow.png", "color": "#FFA500"},
  GREEN: { "name": "Green", "file": "img/green.png", "color": "#008000"},
  YELLOW: { "name": "Yellow", "file": "img/yellow.png", "color": "#FFFF00"},
  NONE: { "name": "None", "file": "img/none.png", "color": "#D3D3D3"},
};

const MAX_NEXT_TRANSITION_WAIT = 300000;

let DEFAULT_FAILURE_DURATION = 10000;
let DEFAULT_FAILURE_PROBABILITY = 0.1;

const DEFAULT_OFFSET = 0;

const DEFAULT_PHASES = [
  { state: STATE.RED, duration: 30000 },
  { state: STATE.RED_YELLOW, duration: 2000 },
  { state: STATE.GREEN, duration: 30000 },
  { state: STATE.YELLOW, duration: 2000 }
];

const FAILURE_PHASES = [
  { state: STATE.YELLOW, duration: 1000 },
  { state: STATE.NONE, duration: 1000 }
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
    let phaseIdx = 0;
    while (cycleTimestamp < currentTimestamp) {
      cycleTimestamp += this.intervals[phaseIdx];
      phaseIdx = (phaseIdx + 1) % this.intervals.length;
    }
    return {
      phaseIdx: phaseIdx,
      timestamp: cycleTimestamp
    };
  }

  nextStateTimestamp(currentTimestamp) {
    return this.nextTransition(currentTimestamp).timestamp;
  }

  currentPhase(currentTimestamp) {
    const state = negativeSafeMod(this.nextTransition(currentTimestamp).phaseIdx - 1, this.intervals.length);
    return this.phases[state];
  }

  redraw(currentTimestamp) {
    const state = this.currentPhase(currentTimestamp).state;
    document.getElementById(`light-${this.id}-img`).src = state.file;
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
    updateIndicator(lightIdx);
  });
}

const createPhaseInput = function(lightIdx, phaseIdx, phase) {
  const id = `phase-time-${lightIdx}-${phaseIdx}`;
  const value = phase.duration / 1000;
  const labelText = `${phase.state.name} duration`;
  return createInput(id, value, labelText, (e) => {
    const light = trafficLights[lightIdx];
    const updatedPhases = [...light.phases];
    const oldPhase = updatedPhases[phaseIdx];
    updatedPhases[phaseIdx] = { ...oldPhase, duration: parseInt(e.target.value) * 1000 };
    trafficLights[lightIdx] = new TrafficLight(lightIdx, updatedPhases, light.offset);
    updateIndicator(lightIdx);
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

const createSegment = function(phase, length) {
  const cell = document.createElement("div");
  cell.className = "indicator";
  cell.style.width = "100px";
  cell.style.height = `${3 * length / 1000}px`;
  cell.style.backgroundColor = phase.state.color;
  return cell;
}

const updateIndicator = function(lightIdx) {
  const indicator = document.getElementById(`light-indicator-${lightIdx}`);

  const light = trafficLights[lightIdx];
  let offset = light.offset;
  let phaseIdx = 0;
  while (offset > 0) {
    phaseIdx = negativeSafeMod(phaseIdx - 1, light.phases.length);
    offset -= light.phases[phaseIdx].duration;
  }

  let cells = [];
  cells.push(createSegment(light.phases[phaseIdx], light.phases[phaseIdx].duration + offset));
  for (let segment = 0; segment < light.phases.length; segment++) {
    let index = (phaseIdx + segment + 1) % light.phases.length;
    let duration = (segment == light.phases.length - 1) ? (-offset) : light.phases[index].duration;
    cells.push(createSegment(light.phases[index], duration));
  }
  indicator.replaceChildren(...cells);
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
  img.src = trafficLights[idx].currentPhase(currentTimestamp).state.file;

  const form = document.createElement("form");
  const ul = document.createElement("ul");
  ul.className = "traffic-light-controls";

  ul.appendChild(createOffsetInput(idx, light.offset));
  light.phases.map((phase, phaseIdx) => createPhaseInput(idx, phaseIdx, phase)).forEach(el => ul.appendChild(el));

  form.appendChild(ul);

  const indicator = document.createElement("div");
  indicator.id = `light-indicator-${idx}`;
  indicator.style.margin = "auto";
  indicator.style.width = "100px";

  td.appendChild(form);
  td.appendChild(indicator);
  td.appendChild(img);

  document.getElementById("traffic-lights").appendChild(td);

  updateIndicator(idx);
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
  forceClock();
}

const updateFailureProbability = (e) => {
  failure = new Failure(failure.duration, e.target.value);
  forceClock();
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
