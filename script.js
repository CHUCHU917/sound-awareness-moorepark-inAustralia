'use strict';

// TUNING: normalized RMS amplitude (0–100), not calibrated decibels.
let MEDIUM_THRESHOLD = 8;
let LOUD_THRESHOLD = 18;
const HYSTERESIS = 1; // Small enough for the classroom's lower thresholds.
const MICROPHONE_GAIN = 600; // RMS × gain × sensitivity becomes normalized level.
const SENSITIVITY_MULTIPLIERS = [0.5, 1, 2.5];
const SMOOTHING_SECONDS = 0.28;
const STATE_HOLD_SECONDS = 0.12; // Reject brief crossings after amplitude smoothing.
const BUBBLE_SMOOTHING_SECONDS = 0.55;

const root = document.querySelector('.installation');
const slider = document.querySelector('#sound-level');
const micButton = document.querySelector('#mic-mode');
const manualButton = document.querySelector('#manual-mode');
const status = document.querySelector('#input-status');
const presets = [...document.querySelectorAll('[data-level]')];
const states = {
  quiet: { label: 'Quiet / calm', title: 'Great job!', description: 'Keeping our\nneighbourhood quiet.', mouth: 'M29 49 Q50 70 71 49', scale: 1 },
  medium: { label: 'Getting louder', title: 'Getting louder...', description: 'Let’s keep it\ndown together.', mouth: 'M32 55 L68 55', scale: 1.85 },
  loud: { label: 'Too loud', title: 'Too loud', description: 'Please keep it down\nfor our neighbours.', mouth: 'M32 60 Q50 44 68 60', scale: 3.45 }
};

// MANUAL FOOT ANCHORS — x/y are percentages of the full scene, not the viewport.
// This fixed photo has four clusters with clearly identifiable feet; occluded fans
// and empty treads deliberately have no bubbles. Add a person only after verifying
// a visible foot contact point in assets/stadium-clean-plate.png.
// baseSize is the horizontal radius in the 1672×941 photo; flatten is ry/rx.
const SCENE_WIDTH = 1672;
const SCENE_HEIGHT = 941;
const groups = [
  { id: 'group-1', name: 'Foreground trio', color: '#57bfff', people: [
    { id: 'front-left-woman', x: 12.201, y: 81.509, baseSize: 62, flatten: .34 },
    { id: 'front-middle-woman', x: 21.232, y: 78.108, baseSize: 59, flatten: .34 },
    { id: 'front-right-man', x: 30.323, y: 81.296, baseSize: 67, flatten: .34 }
  ] },
  { id: 'group-2', name: 'Central trio', color: '#a4ef8d', people: [
    { id: 'centre-left-scarf-man', x: 40.251, y: 63.231, baseSize: 44, flatten: .34 },
    { id: 'centre-cap-man', x: 45.933, y: 63.762, baseSize: 43, flatten: .34 },
    { id: 'centre-right-green-shirt-man', x: 50.957, y: 62.168, baseSize: 44, flatten: .34 }
  ] },
  { id: 'group-3', name: 'Right-hand pair', color: '#ff91c6', people: [
    { id: 'right-left-red-scarf-woman', x: 61.364, y: 70.670, baseSize: 48, flatten: .33 },
    { id: 'right-right-red-scarf-woman', x: 66.806, y: 72.051, baseSize: 49, flatten: .33 }
  ] },
  { id: 'group-4', name: 'Upper-left visible fans', color: '#b49cff', people: [
    { id: 'upper-left-edge-grey-trousers-man', x: 1.077, y: 32.519, baseSize: 25, flatten: .32 },
    { id: 'upper-left-black-trousers-man', x: 8.732, y: 32.306, baseSize: 28, flatten: .32 }
  ] }
];
const ns = 'http://www.w3.org/2000/svg';
function renderBubbleGroups(layout) {
document.querySelector('#bubbles').replaceChildren();
document.querySelector('#anchor-markers').replaceChildren();
return layout.flatMap((group, groupIndex) => {
  const groupLayer = document.createElementNS(ns, 'g');
  groupLayer.setAttribute('class', 'visitor-group');
  groupLayer.setAttribute('data-group-id', group.id);
  groupLayer.setAttribute('fill', group.color); // All descendants inherit this one group colour.
  document.querySelector('#bubbles').append(groupLayer);
  return group.people.map(person => {
    const x = person.x / 100 * SCENE_WIDTH;
    const y = person.y / 100 * SCENE_HEIGHT;
    const radiusX = person.baseSize;
    const radiusY = radiusX * person.flatten;
    const anchor = document.createElementNS(ns, 'g');
    anchor.setAttribute('class', 'person-anchor');
    anchor.setAttribute('data-person-id', person.id);
    // Translation lives outside the sound-scaled child: the foot anchor never drifts.
    anchor.setAttribute('transform', `translate(${x} ${y})`);
    const light = document.createElementNS(ns, 'g');
    light.setAttribute('class', 'bubble-light');
    for (const [factor, className] of [[1.32, 'bubble-glow'], [1, 'bubble-core']]) {
      const ellipse = document.createElementNS(ns, 'ellipse');
      ellipse.setAttribute('rx', radiusX * factor);
      ellipse.setAttribute('ry', radiusY * factor);
      if (className === 'bubble-glow') ellipse.setAttribute('mask', 'url(#projection-softness)');
      ellipse.setAttribute('class', className);
      light.append(ellipse);
    }
    anchor.append(light);
    groupLayer.append(anchor);
    const marker = document.createElementNS(ns, 'g');
    marker.setAttribute('transform', `translate(${x} ${y})`);
    marker.setAttribute('data-person-id', person.id);
    const dot = document.createElementNS(ns, 'circle');
    dot.setAttribute('r', '3');
    const label = document.createElementNS(ns, 'text');
    label.setAttribute('x', '7');
    label.setAttribute('y', '-7');
    label.textContent = String(groupIndex + 1);
    marker.append(dot, label);
    document.querySelector('#anchor-markers').append(marker);
    return light;
  });
});
}
let bubbles = renderBubbleGroups(groups);
document.querySelector('#show-anchors').addEventListener('change', event => {
  root.dataset.showAnchors = String(event.target.checked);
});

let mode = 'manual';
let interactionMode = 'group'; // Separate from input mode and the three sound states.
let state = 'quiet';
let level = Number(slider.value);
let bubbleScale = .55;
let stream = null, audioContext = null, analyser = null, samples = null;
let microphoneRequest = 0;
let lastFrame = performance.now();
let sensitivityIndex = 1;
let candidateState = state, candidateSeconds = 0;
let calibration = null;
let ambientRms = null;
const debugLevel = document.querySelector('#debug-level');
const calibrationStatus = document.querySelector('#calibration-status');
const calibrateButton = document.querySelector('#calibrate-room');
const sensitivitySlider = document.querySelector('#sensitivity');
const mediumInput = document.querySelector('#medium-threshold');
const loudInput = document.querySelector('#loud-threshold');

function currentGain() {
  return MICROPHONE_GAIN * SENSITIVITY_MULTIPLIERS[sensitivityIndex];
}

function syncThresholdControls() {
  mediumInput.value = MEDIUM_THRESHOLD;
  loudInput.value = LOUD_THRESHOLD;
  document.querySelector('#threshold-help').textContent = `Quiet: below ${MEDIUM_THRESHOLD} · Yellow: ${MEDIUM_THRESHOLD}–${LOUD_THRESHOLD} · Red: above ${LOUD_THRESHOLD}.`;
  // Manual presets follow edited/calibrated boundaries while preserving their meaning.
  const levels = [MEDIUM_THRESHOLD / 2, (MEDIUM_THRESHOLD + LOUD_THRESHOLD) / 2, Math.min(100, LOUD_THRESHOLD + Math.max(6, LOUD_THRESHOLD - MEDIUM_THRESHOLD))];
  presets.forEach((button, i) => { button.dataset.level = i === 0 ? Math.floor(levels[i]) : Math.round(levels[i]); });
  candidateState = state;
  candidateSeconds = 0;
  updateModeUI();
}

function cancelCalibration(message) {
  if (calibration) calibrationStatus.textContent = message;
  calibration = null;
  calibrateButton.disabled = false;
  sensitivitySlider.disabled = mediumInput.disabled = loudInput.disabled = false;
}

function applyAmbientBaseline() {
  const baseline = ambientRms * currentGain();
  // Leave enough headroom and keep both boundaries attainable on the 0–100 scale.
  if (baseline > 85) {
    calibrationStatus.textContent = 'Room input is too high. Lower sensitivity and calibrate again; thresholds were unchanged.';
    return;
  }
  MEDIUM_THRESHOLD = Math.round(Math.min(92, baseline + Math.max(4, baseline * .4)) * 10) / 10;
  LOUD_THRESHOLD = Math.round(Math.min(99, baseline + Math.max(14, baseline * 1.2)) * 10) / 10;
  LOUD_THRESHOLD = Math.max(MEDIUM_THRESHOLD + 1, LOUD_THRESHOLD);
  syncThresholdControls();
  calibrationStatus.textContent = `Room calibrated · ambient baseline ${baseline.toFixed(1)} / 100. Yellow at ${MEDIUM_THRESHOLD}; red above ${LOUD_THRESHOLD}.`;
}

mediumInput.addEventListener('change', editThresholds);
loudInput.addEventListener('change', editThresholds);
function editThresholds() {
  const medium = Number(mediumInput.value), loud = Number(loudInput.value);
  if (!mediumInput.value || !loudInput.value || !Number.isFinite(medium + loud) || medium < 1 || loud > 99 || loud - medium < 1) {
    calibrationStatus.textContent = 'Use thresholds between 1 and 99, with red at least 1 above yellow.';
    syncThresholdControls();
    return;
  }
  MEDIUM_THRESHOLD = medium;
  LOUD_THRESHOLD = loud;
  ambientRms = null; // Explicit edits supersede automatic calibration.
  calibrationStatus.textContent = 'Custom thresholds applied.';
  syncThresholdControls();
}
sensitivitySlider.addEventListener('input', () => {
  sensitivityIndex = Number(sensitivitySlider.value);
  const label = ['Low sensitivity', 'Medium sensitivity', 'High sensitivity'][sensitivityIndex];
  document.querySelector('#sensitivity-label').textContent = label;
  sensitivitySlider.setAttribute('aria-valuetext', label);
  if (ambientRms !== null) applyAmbientBaseline();
});
calibrateButton.addEventListener('click', async () => {
  calibrateButton.disabled = true;
  calibrationStatus.textContent = 'Connecting microphone for room calibration…';
  const ready = await useMicrophone();
  if (!ready || mode !== 'microphone') {
    cancelCalibration('Calibration needs microphone permission. Manual testing remains available.');
    calibrationStatus.textContent = 'Calibration needs microphone permission. Manual testing remains available.';
    return;
  }
  calibration = { start: performance.now(), readings: [] };
  sensitivitySlider.disabled = mediumInput.disabled = loudInput.disabled = true;
  calibrationStatus.textContent = 'Listening for 3 seconds… keep the room at its usual quiet conversation level.';
});
const debugToggle = document.querySelector('#debug-toggle');
debugToggle.addEventListener('click', () => {
  const panel = document.querySelector('#debug-panel');
  panel.hidden = !panel.hidden;
  debugToggle.setAttribute('aria-expanded', !panel.hidden);
});

function setState(next) {
  if (next === state) return;
  state = next;
  const details = states[state];
  root.dataset.state = state;
  document.querySelector('#state-label').textContent = details.label;
  document.querySelector('#debug-state').textContent = details.label;
  document.querySelector('.signal-overlay').setAttribute('aria-label', `Sound signal: ${details.label}`);
  const title = document.querySelector('#device-title');
  const lines = { quiet: ['Great', 'job!'], medium: ['Getting', 'louder...'], loud: ['Too', 'loud'] }[state];
  title.replaceChildren(...lines.map((line, i) => {
    const span = document.createElementNS(ns, 'tspan');
    span.setAttribute('x', '1341');
    if (i) span.setAttribute('dy', '29');
    span.textContent = line;
    return span;
  }));
  document.querySelector('#mouth').setAttribute('d', details.mouth);
}

function bubbleScaleForLevel(value) {
  // Continuous mapping through the editable state boundaries, rather than three fixed sizes.
  // Medium stays mostly separate; a modest increase above red creates strong overlap.
  const quiet = Math.max(1, MEDIUM_THRESHOLD), loud = Math.max(quiet + 1, LOUD_THRESHOLD);
  if (value < quiet) return .42 + .28 * value / quiet;
  if (value <= loud) return .7 + .45 * (value - quiet) / (loud - quiet);
  const spread = Math.min(1, (value - loud) / Math.max(6, (loud - quiet) * 1.2));
  return 1.15 + 1.25 * spread;
}

function setPresentation(enabled) {
  root.dataset.presentation = String(enabled);
  if (enabled) {
    document.querySelector('#debug-panel').hidden = true;
    debugToggle.setAttribute('aria-expanded', 'false');
    document.querySelector('#concept-info').hidden = true;
  }
}
document.querySelector('#presentation-toggle').addEventListener('click', () => setPresentation(true));
document.querySelector('.scene').addEventListener('dblclick', () => setPresentation(false));

function classify(value) {
  // Evaluate both boundaries so large jumps can move directly between quiet and loud.
  const hysteresis = Math.min(HYSTERESIS, (LOUD_THRESHOLD - MEDIUM_THRESHOLD) / 3);
  if (value > LOUD_THRESHOLD || (state === 'loud' && value > LOUD_THRESHOLD - hysteresis)) return 'loud';
  if (value >= MEDIUM_THRESHOLD || (state !== 'quiet' && value >= MEDIUM_THRESHOLD - hysteresis)) return 'medium';
  return 'quiet';
}

function releaseMicrophone() {
  if (stream) stream.getTracks().forEach(track => track.stop());
  stream = null;
  if (audioContext && audioContext.state !== 'closed') audioContext.close().catch(() => {});
  audioContext = analyser = samples = null;
}

function updateModeUI() {
  micButton.classList.toggle('active', mode === 'microphone');
  manualButton.classList.toggle('active', mode === 'manual');
  micButton.setAttribute('aria-pressed', mode === 'microphone');
  manualButton.setAttribute('aria-pressed', mode === 'manual');
  slider.disabled = mode === 'microphone';
  presets.forEach(button => {
    const selected = mode === 'manual' && Number(button.dataset.level) === Number(slider.value);
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', selected);
  });
}

function useManual(message = 'Move the slider or choose a sound level to explore.') {
  cancelCalibration('Calibration cancelled. Switch to microphone input to try again.');
  if (stream) document.querySelector('#microphone-status').textContent = 'Granted · microphone stopped';
  microphoneRequest++; // Invalidates a permission request that may still be pending.
  releaseMicrophone();
  mode = 'manual';
  micButton.disabled = false;
  status.textContent = message;
  updateModeUI();
}

async function useMicrophone() {
  if (mode === 'microphone') return true;
  const request = ++microphoneRequest;
  micButton.disabled = true;
  status.textContent = 'Waiting for microphone permission… Manual controls are still available.';
  document.querySelector('#microphone-status').textContent = 'Waiting for permission';
  let pendingStream = null;
  let pendingContext = null;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!navigator.mediaDevices?.getUserMedia || !AudioContextClass) throw new Error('unsupported');
    // Create/resume in the click gesture, including browsers with audio autoplay restrictions.
    pendingContext = new AudioContextClass();
    await pendingContext.resume();
    pendingStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    if (request !== microphoneRequest) {
      pendingStream.getTracks().forEach(track => track.stop());
      await pendingContext.close();
      return;
    }
    audioContext = pendingContext;
    stream = pendingStream;
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    samples = new Float32Array(analyser.fftSize);
    audioContext.createMediaStreamSource(stream).connect(analyser);
    // No destination connection: the microphone is never played through the speakers.
    stream.getAudioTracks()[0].addEventListener('ended', () => {
      if (mode === 'microphone') useManual('Microphone disconnected. Manual demo is ready.');
    });
    mode = 'microphone';
    document.querySelector('#microphone-status').textContent = 'Granted · listening locally';
    status.textContent = 'Microphone live · listening to the overall sound around you.';
    updateModeUI();
    return true;
  } catch (error) {
    pendingStream?.getTracks().forEach(track => track.stop());
    if (pendingContext && pendingContext.state !== 'closed') await pendingContext.close().catch(() => {});
    if (request !== microphoneRequest) return;
    const message = error.name === 'NotAllowedError' ? 'Microphone permission denied. You can use the manual demo.' : error.name === 'NotFoundError' ? 'No microphone found. You can use the manual demo.' : 'Microphone unavailable. Use localhost or HTTPS, or try the manual demo.';
    useManual(message);
    document.querySelector('#microphone-status').textContent = error.name === 'NotAllowedError' ? 'Permission denied' : 'Unavailable';
  } finally {
    if (request === microphoneRequest) micButton.disabled = false;
  }
}

slider.addEventListener('input', () => {
  // Changing manual input also cancels any unresolved microphone permission request.
  useManual();
});
presets.forEach(button => button.addEventListener('click', () => {
  slider.value = button.dataset.level;
  useManual('Manual demo · all light bubbles respond to the same sound level.');
}));
manualButton.addEventListener('click', () => useManual());
micButton.addEventListener('click', useMicrophone);
const infoButton = document.querySelector('#info-toggle');
infoButton.addEventListener('click', () => {
  const panel = document.querySelector('#concept-info');
  panel.hidden = !panel.hidden;
  infoButton.setAttribute('aria-expanded', !panel.hidden);
});
document.addEventListener('keydown', event => {
  const editing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target?.tagName);
  if (!editing && event.key.toLowerCase() === 'p') setPresentation(root.dataset.presentation !== 'true');
  if (!editing && event.key.toLowerCase() === 'd') {
    setPresentation(false);
    document.querySelector('#debug-panel').hidden = false;
    debugToggle.setAttribute('aria-expanded', 'true');
  }
  if (event.key === 'Escape') {
    setPresentation(false);
    document.querySelector('#debug-panel').hidden = true;
    debugToggle.setAttribute('aria-expanded', 'false');
    document.querySelector('#concept-info').hidden = true;
    infoButton.setAttribute('aria-expanded', 'false');
  }
});
window.addEventListener('pagehide', () => useManual());

function frame(now) {
  const delta = Math.min((now - lastFrame) / 1000, .1);
  lastFrame = now;
  let target = Number(slider.value);
  if (mode === 'microphone' && analyser) {
    analyser.getFloatTimeDomainData(samples);
    let sum = 0;
    for (const sample of samples) sum += sample * sample;
    const rms = Math.sqrt(sum / samples.length);
    target = Math.min(100, rms * currentGain());
    if (calibration) {
      calibration.readings.push(rms);
      const elapsed = now - calibration.start;
      calibrationStatus.textContent = `Listening… ${Math.max(0, (3000 - elapsed) / 1000).toFixed(1)} seconds remaining.`;
      if (elapsed >= 3000) {
        // A 70th percentile tolerates isolated claps without underestimating normal room noise.
        const readings = calibration.readings.sort((a, b) => a - b);
        ambientRms = readings[Math.floor((readings.length - 1) * .7)];
        cancelCalibration('Calibration complete.');
        applyAmbientBaseline();
      }
    }
  }
  level += (target - level) * (1 - Math.exp(-delta / SMOOTHING_SECONDS));
  const nextState = interactionMode === 'passive' ? 'quiet' : classify(level);
  if (nextState !== candidateState) { candidateState = nextState; candidateSeconds = 0; }
  candidateSeconds += delta;
  if (mode === 'manual' || candidateSeconds >= STATE_HOLD_SECONDS) setState(nextState);
  bubbleScale += (bubbleScaleForLevel(level) - bubbleScale) * (1 - Math.exp(-delta / BUBBLE_SMOOTHING_SECONDS));
  bubbles.forEach(bubble => bubble.setAttribute('transform', `scale(${bubbleScale.toFixed(3)})`));
  document.querySelector('#level-value').textContent = Math.round(level);
  debugLevel.textContent = level.toFixed(1);
  document.querySelector('#debug-source').textContent = mode === 'microphone' ? 'Microphone live' : 'Manual';
  slider.style.setProperty('--level', `${mode === 'microphone' ? level : slider.value}%`);
  if (mode === 'microphone') slider.value = Math.round(level);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
