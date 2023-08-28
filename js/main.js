const files = {
  0: "img/red.png",
  1: "img/red-yellow.png",
  2: "img/green.png",
  3: "img/yellow.png",
  4: "img/none.png",
  5: "img/yellow.png"
};

const DEFAULT_INTERVALS = [30, 2, 30, 2, 1, 1];
const INITIAL_STATE = 0;

const newLight = function() {
  return {
    state: INITIAL_STATE,
    intervals: DEFAULT_INTERVALS,
    cycleLength: DEFAULT_INTERVALS[0] + DEFAULT_INTERVALS[1] + DEFAULT_INTERVALS[2] + DEFAULT_INTERVALS[3]
  };
}

const trafficLights = {};

const count = function() {
  return Object.keys(trafficLights).length;
}

let failure = false;

const startFailure = function() {
  console.log("startFailure");
  failure = true;
  for (let i = 0; i < count(); i++) {
    trafficLights[i].state = 4;
  }
}

const stopFailure = function() {
  console.log("stopFailure");
  failure = false;
  for (let i = 0; i < count(); i++) {
    trafficLights[i].state = 0; //TODO revert back to what has been before
  }
}

const redraw = function(idx) {
  const light = trafficLights[idx];
  if (light.state >= 4) {
    light.state = 4 + (light.state + 1) % 2;
  } else {
    light.state = (light.state + 1) % 4;
  }
  document.getElementById("light-" + idx).src = files[light.state];
}

const tick = function(idx) {
  if (idx < count()) {
    redraw(idx);
  }
};

const addLight = function() {
  const idx = count();

  trafficLights[idx] = newLight();

  const td = document.createElement("td");
  const img = document.createElement("img");
  img.id = "light-" + idx;
  img.alt = "traffic light";
  img.className = "traffic-light";
  img.src = files[trafficLights[idx].state];
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

function globalTick() {
//  console.log(new Date());

  if (failure) {
    if (Math.random() < 0.05) {
      stopFailure();
    }
  } else {
    if (Math.random() < 0.01) {
      startFailure();
    }
  }

  let timestampSeconds = Math.floor(Date.now() / 1000);

  for (let i = 0; i < count(); i++) {
    let light = trafficLights[i];
    let currentState = trafficLights[i].state;
    let cycleSecond = timestampSeconds % light.cycleLength;

    for (let st = 0; st < 4; st++) {
      cycleSecond -= light.intervals[st];
      if (cycleSecond <= 0) {
        if (currentState != st) {
          tick(i);
        }
        break;
      }

    }
  }
}

function runClock() {
  let now = new Date();
  let timeToNextTick = 1000 - now.getMilliseconds();
  setTimeout(function() {
    globalTick();
    runClock();
  }, timeToNextTick);
}

globalTick();
runClock();
