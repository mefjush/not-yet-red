const files = {
  0: "img/red.png",
  1: "img/red-yellow.png",
  2: "img/green.png",
  3: "img/yellow.png"
};

const intervals = {
  0: [30, 2, 30, 2],
  1: [30, 2, 30, 2],
  2: [30, 2, 30, 2]
}

const lights = [ 0, 2, 0 ];

const tick = function(idx) {
  let state = (lights[idx] + 1) % 4
  lights[idx] = state;
  document.getElementById("light-" + idx).src = files[state];

  let extraDelay = 0;
  if (state == 0 || state == 2) {
    extraDelay = Math.floor(Math.random() * 4000);
  }

  let delay = extraDelay + intervals[idx][state] * 1000;
  setTimeout(() => tick(idx), delay);
};

for (let i = 0; i < 3; i++) {
  tick(i);
}
