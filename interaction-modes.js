'use strict';

// The Group configuration is the original groups array in script.js, used unchanged.
// Individual coordinates are manually measured foot contacts in the supplied image.
const individualGroups = [
  { id: 'individual-1', name: 'Three black-shirt fans', color: '#57bfff', people: [
    { id: 'individual-left-cap-man', x: 14.952, y: 75.877, baseSize: 72, flatten: .33 },
    { id: 'individual-centre-woman', x: 23.565, y: 74.070, baseSize: 64, flatten: .33 },
    { id: 'individual-right-shorts-man', x: 32.655, y: 76.620, baseSize: 70, flatten: .33 }
  ] },
  { id: 'individual-2', name: 'Two green-shirt fans', color: '#ff91c6', people: [
    { id: 'individual-green-shirt-woman', x: 52.811, y: 71.307, baseSize: 58, flatten: .32 },
    { id: 'individual-green-cap-man', x: 62.201, y: 72.476, baseSize: 60, flatten: .32 }
  ] }
];
// Passive-only markers: percentage scene coordinates; size is diameter in reference pixels.
// Fixed colours and per-marker timing have no dependency on microphone level/state.
const passiveBubbles = [
  { x: 8.553, y: 32.200, size: 20, color: '#a4ef8d', delay: 0, duration: 3.8, opacity: .52 },
  { x: 34.928, y: 48.672, size: 22, color: '#a4ef8d', delay: .4, duration: 4.2, opacity: .56 },
  { x: 54.007, y: 59.511, size: 26, color: '#ff91c6', delay: .9, duration: 4.5, opacity: .50 },
  { x: 48.624, y: 67.588, size: 30, color: '#a4ef8d', delay: 1.3, duration: 3.9, opacity: .54 },
  { x: 66.806, y: 74.176, size: 32, color: '#ff91c6', delay: 1.8, duration: 4.7, opacity: .58 },
  { x: 25.658, y: 77.577, size: 36, color: '#ffdc67', delay: 2.2, duration: 4.1, opacity: .55 },
  { x: 16.687, y: 83.953, size: 40, color: '#57bfff', delay: 2.7, duration: 4.4, opacity: .60 }
];
const passiveLayer = document.querySelector('#passive-bubbles');
passiveBubbles.forEach((bubble, index) => {
  const anchor = document.createElementNS(ns, 'g');
  anchor.setAttribute('class', 'passive-anchor');
  anchor.setAttribute('data-passive-id', String(index + 1));
  anchor.setAttribute('transform', `translate(${bubble.x / 100 * SCENE_WIDTH} ${bubble.y / 100 * SCENE_HEIGHT})`);
  anchor.setAttribute('fill', bubble.color);
  const pulse = document.createElementNS(ns, 'g');
  pulse.setAttribute('class', 'passive-heartbeat');
  pulse.style.setProperty('--heartbeat-delay', `${bubble.delay}s`);
  pulse.style.setProperty('--heartbeat-duration', `${bubble.duration}s`);
  pulse.style.setProperty('--heartbeat-opacity', bubble.opacity);
  for (const halo of [true, false]) {
    const ellipse = document.createElementNS(ns, 'ellipse');
    ellipse.setAttribute('rx', bubble.size / 2 * (halo ? 1.22 : 1));
    ellipse.setAttribute('ry', bubble.size / 2 * .27 * (halo ? 1.22 : 1));
    ellipse.setAttribute('class', halo ? 'passive-halo' : 'passive-core');
    pulse.append(ellipse);
  }
  anchor.append(pulse);
  passiveLayer.append(anchor);
});
const interactionScenes = {
  passive: { background: 'assets/passive-clean-scene.png', groups: [], reactive: false, label: 'Passive Mode', description: 'Passive Mode · waiting for visitors. Small staggered heartbeat lights and a permanently calm signal.', alt: 'Clean empty stadium stairs at dusk with independent small heartbeat lights and a green smiling signal.' },
  individual: { background: 'assets/individual-scene.png', groups: individualGroups, reactive: true, label: 'Individual Interaction', description: 'Individual Interaction · five visitors, fixed group colours, live sound feedback.', alt: 'Five rugby fans walking down the stadium steps at dusk.' },
  group: { background: 'assets/stadium-clean-plate.png', groups, reactive: true, label: 'Group Interaction', description: 'Group Interaction · existing collective sound demo.', alt: 'Rugby fans walking down stadium exit stairs at dusk, with a vertical sound signal on the right.' }
};
const interactionButtons = [...document.querySelectorAll('[data-interaction-mode]')];
const sceneDescription = document.querySelector('#interaction-description');
const sceneImage = document.querySelector('.scene-image');
let sceneSwitchTicket = 0;

function loadSceneImage(path) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = resolve;
    image.onerror = () => reject(new Error(`Could not load ${path}`));
    image.src = path;
  });
}

async function switchInteractionMode(nextMode) {
  const scene = interactionScenes[nextMode];
  if (!scene) return;
  const ticket = ++sceneSwitchTicket;
  if (nextMode === interactionMode) {
    root.classList.remove('scene-changing');
    sceneDescription.textContent = scene.description;
    return;
  }
  try {
    // Await all compositing inputs before fading; do not blank a working scene on a missing asset.
    await Promise.all([loadSceneImage(scene.background), ...(nextMode === 'individual' ? [loadSceneImage('assets/passive-scene.png')] : [])]);
    if (ticket !== sceneSwitchTicket) return;
    root.classList.add('scene-changing');
    await new Promise(resolve => setTimeout(resolve, 220));
    if (ticket !== sceneSwitchTicket) return;
    sceneImage.src = scene.background;
    sceneImage.alt = scene.alt;
    bubbles = renderBubbleGroups(scene.groups);
    const field = document.querySelector('#projection-field');
    field.setAttribute('mask', nextMode === 'individual' ? 'url(#individual-person-mask)' : 'url(#visitor-occlusion)');
    interactionMode = nextMode;
    root.dataset.interactionMode = nextMode;
    candidateState = state;
    candidateSeconds = 0;
    if (!scene.reactive) setState('quiet');
    interactionButtons.forEach(button => button.setAttribute('aria-pressed', button.dataset.interactionMode === nextMode));
    sceneDescription.textContent = scene.description;
    // Commit the image and overlays together, then fade the whole scene back in.
    root.classList.remove('scene-changing');
  } catch (error) {
    if (ticket !== sceneSwitchTicket) return;
    root.classList.remove('scene-changing');
    sceneDescription.textContent = `${scene.label} unavailable. ${error.message}. Current scene retained.`;
  }
}

interactionButtons.forEach(button => button.addEventListener('click', () => switchInteractionMode(button.dataset.interactionMode)));
document.addEventListener('keydown', event => {
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target?.tagName) || event.ctrlKey || event.altKey || event.metaKey || event.repeat) return;
  const requestedMode = { '1': 'passive', '2': 'individual', '3': 'group' }[event.key];
  if (requestedMode) { event.preventDefault(); switchInteractionMode(requestedMode); }
});
root.dataset.interactionMode = 'group';
