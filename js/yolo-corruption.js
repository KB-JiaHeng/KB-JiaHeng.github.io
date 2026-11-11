/* A damaged DOS video buffer gradually exposes an impossible print beneath.
 * Deliberately scheduled with discrete frames instead of smooth CSS easing.
 * No timers while the page is hidden or reduced motion is requested.
 */
(() => {
  "use strict";

  const intro = document.querySelector(".home-intro");
  if (!intro) return;

  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (motion.matches) return;

  const title = intro.querySelector("h1");
  const rift = intro.querySelector(".yolo-rift");
  if (!rift) return;

  if (title) title.setAttribute("data-rift-title", title.textContent.trim());

  const modes = ["rebirth", "stoic", "buddha"];
  const messages = {
    rebirth: "SEGMENTATION FAULT",
    stoic: "ASSERTION FAILED",
    buddha: "STACK OVERFLOW"
  };
  const faultText = intro.querySelector(".yolo-rift__fault-message");
  const requestedMode = new URLSearchParams(window.location.search).get("rift");
  const forcedMode = modes.includes(requestedMode) ? requestedMode : null;
  // Optional art-direction inspection link: ?rift=stoic&preview=1
  const stillPreview = forcedMode && new URLSearchParams(window.location.search).get("preview") === "1";

  let timer = null;
  let running = false;
  let frame = 0;
  let lastClick = 0;
  let lastMode = null;

  const random = (min, max) => min + Math.random() * (max - min);
  const offsets = [1.2, -2.4, 1.6, -3.3, 3, -1.7, 2.8, -2.1, 1.5, -2, 2.3, -1.1, 1.4];
  let tilt = 0;

  function selectScene() {
    const choices = modes.filter(mode => mode !== lastMode);
    const mode = forcedMode || choices[Math.floor(Math.random() * choices.length)];
    intro.dataset.rift = mode;
    if (faultText) faultText.textContent = messages[mode];
    lastMode = mode;
  }

  const closed = "polygon(0% 50%, 100% 50%, 100% 50%, 0% 50%)";
  const snap = (n, size) => Math.round(n / size) * size;
  const rectangle = (x, y, width, height) =>
    `M ${x} ${y} h ${width} v ${height} h ${-width} Z`;
  const path = (commands) => `path("${commands.join(" ")}")`;
  let lastOpening = 0;

  // Original VHS-like horizontal tear. Its geometry and visual rhythm remain unchanged.
  function tearingPolygon(opening, margin) {
    const xs = [0, 7, 15, 23, 31, 39, 47, 55, 63, 71, 79, 87, 94, 100];
    const top = [];
    const bottom = [];
    xs.forEach((x, index) => {
      const noise = offsets[index % offsets.length];
      const stagger = Math.sin(index * 1.7 + tilt) * 1.25;
      const slope = (x - 50) * .09;
      const center = 49 + slope + noise * .5;
      const width = Math.max(0, opening) * (0.84 + ((index * 7) % 5) * .065);
      const up = center - width * .54 - margin + stagger;
      const down = center + width * .46 + margin + stagger;
      top.push(`${x}% ${up.toFixed(2)}%`);
      bottom.unshift(`${x}% ${down.toFixed(2)}%`);
    });
    return `polygon(${top.concat(bottom).join(", ")})`;
  }

  // A damaged VGA text buffer exposes stair-stepped 8x16 cell regions,
  // plus disconnected chunks of video memory above and below the main image.
  function fracturedBlocks(opening, border) {
    const w = rift.clientWidth;
    const h = rift.clientHeight;
    const strength = Math.min(opening / 43, 1);
    const cols = Math.max(8, Math.ceil(w / 88));
    const left = 8;
    const right = snap(w - 8, 8);
    const xs = Array.from({ length: cols + 1 }, (_, i) =>
      snap(left + ((right - left) * i) / cols, 8));
    const top = [];
    const bottom = [];
    const variation = [-1, 1, 0, -2, 2, -1, 1, 0, -2, 1, 2, -1];
    const mid = snap(h * .50, 16);
    const half = snap(h * (.032 + strength * .375), 16);
    for (let i = 0; i < cols; i++) {
      const stagger = variation[(i + Math.round(tilt * 2) + 12) % variation.length] * 16;
      top.push(mid - half + Math.round(stagger * strength) - border);
      bottom.push(mid + half + Math.round(stagger * .60 * strength) + border);
    }
    const commands = [`M ${xs[0] - border} ${top[0]}`];
    for (let i = 0; i < cols; i++) {
      commands.push(`H ${xs[i + 1] + (i === cols - 1 ? border : 0)}`);
      if (i < cols - 1) commands.push(`V ${top[i + 1]}`);
    }
    commands.push(`V ${bottom[cols - 1]}`);
    for (let i = cols - 1; i >= 0; i--) {
      commands.push(`H ${xs[i] - (i === 0 ? border : 0)}`);
      if (i > 0) commands.push(`V ${bottom[i - 1]}`);
    }
    commands.push("Z");

    // Sporadic out-of-range raster cells give the crack its corrupted-memory silhouette.
    if (strength > .22) {
      for (let i = 1; i < cols; i += 3) {
        const x = xs[i] + 8 - border;
        const width = Math.max(16, xs[i + 1] - xs[i] - 16) + border * 2;
        const y = i % 2 ? top[i] - 32 - border : bottom[i] + 16 - border;
        commands.push(rectangle(x, y, width, 16 + border * 2));
      }
    }
    return path(commands);
  }

  // Eight-petal recursive bloom. Each edge point is snapped to a VGA pixel cell
  // and each contour segment is orthogonal: no smooth vector shape or easing.
  function rasterBloom(opening, border) {
    const w = rift.clientWidth;
    const h = rift.clientHeight;
    const strength = Math.min(opening / 43, 1);
    const cx = w * .49;
    const cy = h * .50;
    const rx = w * (.075 + strength * .48) + border;
    const ry = h * (.058 + strength * .38) + border;
    const points = [];
    const segments = 80;
    for (let i = 0; i < segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      // Larger troughs between petals keep the bloom legible at desktop width.
      const petal = .78 + .18 * Math.cos(8 * theta + tilt * .08)
        + .045 * Math.cos(16 * theta);
      const pixelSize = border ? 4 : 8;
      const x = snap(cx + Math.cos(theta) * rx * petal, pixelSize);
      const y = snap(cy + Math.sin(theta) * ry * petal, pixelSize);
      if (!points.length || x !== points[points.length - 1][0]
        || y !== points[points.length - 1][1]) points.push([x, y]);
    }
    const commands = [`M ${points[0][0]} ${points[0][1]}`];
    for (let i = 1; i < points.length; i++) {
      commands.push(`H ${points[i][0]} V ${points[i][1]}`);
    }
    commands.push(`H ${points[0][0]} V ${points[0][1]} Z`);
    return path(commands);
  }

  function setRift(opening) {
    lastOpening = opening;
    const active = opening > 0;
    const mode = intro.dataset.rift;
    let edge = closed;
    let windowShape = closed;
    if (active && mode === "stoic") {
      edge = fracturedBlocks(opening, 5);
      windowShape = fracturedBlocks(opening, 0);
    } else if (active && mode === "buddha") {
      edge = rasterBloom(opening, 7);
      windowShape = rasterBloom(opening, 0);
    } else if (active) {
      edge = tearingPolygon(opening, 1.2);
      windowShape = tearingPolygon(opening, .22);
    }
    rift.style.setProperty("--yolo-edge", edge);
    rift.style.setProperty("--yolo-window", windowShape);
    intro.classList.toggle("is-rifting", active);
  }

  function tracking(y, shift, height = 12) {
    rift.style.setProperty("--tracking-y", `${y}%`);
    rift.style.setProperty("--tracking-shift", `${shift}px`);
    rift.style.setProperty("--tracking-height", `${height}px`);
    intro.classList.add("is-tracking");
  }

  function clear() {
    window.clearTimeout(timer);
    timer = null;
    running = false;
    lastOpening = 0;
    intro.classList.remove("is-rifting", "is-tracking", "is-faulting", "has-afterimage");
    rift.style.setProperty("--yolo-edge", closed);
    rift.style.setProperty("--yolo-window", closed);
  }

  // All three start with a video sync fault, but use distinct damaged-buffer
  // timings. Each wait belongs to its own frame; long holds emulate frozen CRTs.
  const sequences = {
    rebirth: [
      { wait: 0,    tracking: [31, -9, 17] },
      { wait: 160,  tracking: false },
      { wait: 850,  tracking: [57, 13, 9] },
      { wait: 100,  tracking: false },
      { wait: 380,  tracking: [48, -17, 23], opening: 2 },
      { wait: 120,  tracking: false, opening: 2 },
      { wait: 940,  tracking: [48, -17, 23], opening: 10 },
      { wait: 90,   tracking: false, opening: 10 },
      { wait: 430,  tracking: [69, 8, 8], opening: 23 },
      { wait: 130,  tracking: false, opening: 23 },
      { wait: 1510, tracking: [37, -22, 14], opening: 29 },
      { wait: 70,   tracking: false, opening: 29 },
      { wait: 600,  tracking: [54, 16, 32], opening: 39 },
      { wait: 100,  tracking: false, opening: 39 },
      { wait: 1200, tracking: [22, 26, 7], opening: 18 },
      { wait: 90,   tracking: false, opening: 18 },
      { wait: 450,  tracking: [49, -11, 12], opening: 1 },
      { wait: 80,   tracking: false, opening: 0, afterimage: true },
      { wait: 480,  afterimage: false }
    ],
    stoic: [
      { wait: 0,    tracking: [24, -16, 24] },
      { wait: 120,  tracking: false },
      { wait: 650,  tracking: [62, 27, 16] },
      { wait: 80,   tracking: false },
      { wait: 320,  tracking: [42, -22, 16], opening: 3 },
      { wait: 100,  tracking: false, opening: 3 },
      { wait: 780,  tracking: [43, 32, 40], opening: 25 },
      { wait: 100,  tracking: false, opening: 25 },
      { wait: 1250, tracking: false, opening: 25 },
      { wait: 80,   tracking: [27, -37, 12], opening: 43 },
      { wait: 130,  tracking: false, opening: 43 },
      { wait: 1100, tracking: false, opening: 43 },
      { wait: 80,   tracking: [76, 24, 30], opening: 32 },
      { wait: 140,  tracking: false, opening: 32 },
      { wait: 350,  tracking: [55, -19, 13], opening: 12 },
      { wait: 90,   tracking: false, opening: 12 },
      { wait: 330,  tracking: [49, 11, 8], opening: 0, afterimage: true },
      { wait: 490,  afterimage: false }
    ],
    buddha: [
      { wait: 0,    tracking: [47, -5, 6] },
      { wait: 250,  tracking: false },
      { wait: 860,  tracking: [54, 12, 12] },
      { wait: 80,   tracking: false },
      { wait: 410,  tracking: false, opening: 3 },
      { wait: 160,  tracking: [50, -8, 5], opening: 7 },
      { wait: 110,  tracking: false, opening: 7 },
      { wait: 1080, tracking: false, opening: 12 },
      { wait: 100,  tracking: [57, 16, 7], opening: 20 },
      { wait: 120,  tracking: false, opening: 20 },
      { wait: 1430, tracking: false, opening: 29 },
      { wait: 100,  tracking: [36, -12, 9], opening: 39 },
      { wait: 140,  tracking: false, opening: 39 },
      { wait: 950,  tracking: false, opening: 43 },
      { wait: 1100, tracking: [61, 12, 5], opening: 32 },
      { wait: 90,   tracking: false, opening: 32 },
      { wait: 520,  tracking: false, opening: 17 },
      { wait: 150,  tracking: [49, -8, 6], opening: 7 },
      { wait: 80,   tracking: false, opening: 7 },
      { wait: 360,  tracking: false, opening: 0, afterimage: true },
      { wait: 650,  afterimage: false }
    ]
  };

  function playStep() {
    if (document.hidden || motion.matches) {
      clear();
      return;
    }
    const sequence = sequences[intro.dataset.rift];
    const step = sequence[frame];
    if (!step) {
      clear();
      schedule(random(19000, 37000));
      return;
    }
    if (step.opening !== undefined) setRift(step.opening);
    if (step.tracking) tracking(...step.tracking);
    else intro.classList.remove("is-tracking");
    intro.classList.add("is-faulting"); // Persist through the tear and final afterimage.
    intro.classList.toggle("has-afterimage", Boolean(step.afterimage));
    frame++;
    timer = window.setTimeout(playStep, sequence[frame]?.wait ?? 0);
  }

  function start() {
    if (running || document.hidden || motion.matches) return;
    window.clearTimeout(timer);
    selectScene();
    running = true;
    frame = 0;
    tilt = random(-2, 2);
    if (stillPreview) {
      intro.classList.add("is-faulting");
      setRift(43); // Leave black space for the error while holding the artwork open.
      return;
    }
    playStep();
  }

  function schedule(delay) {
    window.clearTimeout(timer);
    if (!document.hidden && !motion.matches) {
      timer = window.setTimeout(start, delay);
    }
  }

  // A visitor can summon the phenomenon by tapping the empty hero or title.
  intro.addEventListener("click", () => {
    if (Date.now() - lastClick < 600) return;
    lastClick = Date.now();
    if (!running) start();
  });

  // Path() uses physical raster pixels; rebuild it if the viewport is resized.
  window.addEventListener("resize", () => {
    if (running && lastOpening > 0) setRift(lastOpening);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clear();
    else schedule(random(2200, 5000));
  });

  if (motion.addEventListener) {
    motion.addEventListener("change", () => {
      clear();
      if (!motion.matches) schedule(3000);
    });
  }

  schedule(forcedMode ? 850 : 2600);
})();
