const files = {
  0: "img/red.png",
  1: "img/red-yellow.png",
  2: "img/green.png",
  3: "img/yellow.png"
};

const DEFAULT_INTERVALS = [30, 2, 30, 2];
const INITIAL_STATE = 0;

const newLight = function() {
  return {
    state: INITIAL_STATE,
    intervals: DEFAULT_INTERVALS
  };
}

const trafficLights = {};

const count = function() {
  return Object.keys(trafficLights).length;
}

const tick = function(idx) {
  if (idx <= count()) {
    const light = trafficLights[idx];
    light.state = (light.state + 1) % 4;
    document.getElementById("light-" + idx).src = files[light.state];

    let extraDelay = 0;
    if (light.state == 0 || light.state == 2) {
      extraDelay = Math.floor(Math.random() * 4000);
    }

    let delay = extraDelay + light.intervals[light.state] * 1000;
    setTimeout(() => tick(idx), delay);
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
  tick(idx);
}

const removeLight = function() {
  if (count() >= 0) {
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
      console.log('Screen Wake Lock released:', wakeLock.released);
      document.getElementById("control-wakelock").checked = false;
    });
    console.log('Screen Wake Lock released:', wakeLock.released);
  } catch (err) {
    console.error(`${err.name}, ${err.message}`);
  }
  document.getElementById("control-wakelock").checked = true;
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
  console.log(e);
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
