// Run: node sound-check.cjs — deterministic audio/control checks without hardware.
const vm = require('node:vm');
const fs = require('node:fs');
const assert = require('node:assert/strict');
class Element {
  constructor(value = '') { this.value = value; this.dataset = {}; this.events = {}; this.style = { setProperty() {} }; this.classList = { toggle() {} }; }
  setAttribute(key, value) { this[key] = String(value); }
  append() {} replaceChildren() {}
  addEventListener(type, callback) { this.events[type] = callback; }
}
const elements = new Map();
const get = key => { if (!elements.has(key)) elements.set(key, new Element()); return elements.get(key); };
get('#sound-level').value = '4';
const presets = [4, 13, 28].map(value => { const el = new Element(); el.dataset.level = String(value); return el; });
let rms = .005, now = 0, denied = false, tracksStopped = 0;
const track = { stop() { tracksStopped++; }, addEventListener() {} };
class AudioContext {
  state = 'running';
  async resume() {} async close() { this.state = 'closed'; }
  createMediaStreamSource() { return { connect() {} }; }
  createAnalyser() { return { getFloatTimeDomainData(buffer) { buffer.fill(rms); } }; }
}
const context = vm.createContext({ document: { querySelector: get, querySelectorAll: () => presets, createElementNS: () => new Element(), createElement: () => new Element(), createTextNode: text => text, addEventListener() {} }, window: { AudioContext, addEventListener() {} }, navigator: { mediaDevices: { async getUserMedia() { if (denied) { const error = new Error(); error.name = 'NotAllowedError'; throw error; } return { getTracks: () => [track], getAudioTracks: () => [track] }; } } }, performance: { now: () => now }, requestAnimationFrame() {}, console });
vm.runInContext(fs.readFileSync(require('node:path').join(__dirname, 'script.js'), 'utf8'), context);
const run = code => vm.runInContext(code, context);
const advance = milliseconds => { for (let i = 0; i < milliseconds; i += 20) { now += 20; run(`frame(${now})`); } };
(async () => {
  assert.equal(run('MEDIUM_THRESHOLD'), 8);
  assert.equal(run('LOUD_THRESHOLD'), 18);
  assert.equal(run('classify(7.9)'), 'quiet');
  assert.equal(run('classify(8)'), 'medium');
  assert.equal(run('classify(18)'), 'medium');
  assert.equal(run('classify(18.1)'), 'loud');
  const originalColours = run('JSON.stringify(groups.map(group => group.color))');
  assert.equal(run('groups.length'), 4, 'only clusters with clearly visible feet are retained');
  assert.equal(run('new Set(groups.map(group => group.color)).size'), 4);
  assert.equal(run('groups.every(group => group.people.length >= 2 && group.people.length <= 4 && group.people.every(person => !("color" in person) && person.x > 0 && person.x < 100 && person.y > 0 && person.y < 100))'), true);
  assert.equal(run('groups.flatMap(group => group.people).length'), 10);
  const anchorCoordinates = run('JSON.stringify(groups.map(group => group.people.map(({x,y}) => [x,y])))');
  get('#show-anchors').events.change({ target: { checked: true } });
  assert.equal(get('.installation').dataset.showAnchors, 'true');
  get('#show-anchors').events.change({ target: { checked: false } });
  assert.equal(get('.installation').dataset.showAnchors, 'false');
  const scales = [0, 4, 8, 13, 18, 28, 100].map(value => run(`bubbleScaleForLevel(${value})`));
  assert.ok(scales.every((value, i) => !i || value >= scales[i - 1]));
  assert.ok(scales[1] < .7 && scales[3] > .8 && scales[3] < 1.2 && scales[5] > 2);
  assert.ok(Math.abs(run('bubbleScaleForLevel(17.999) - bubbleScaleForLevel(18.001)')) < .001);
  get('#sound-level').value = '13'; run('useManual()'); advance(5000);
  const manualScale = run('bubbleScale');
  rms = 13 / 600; await run('useMicrophone()'); advance(5000);
  assert.ok(Math.abs(run('bubbleScale') - manualScale) < .001, 'equal manual and microphone levels produce equal bubble sizes');
  rms = .005;
  await run('useMicrophone()');
  advance(1000);
  assert.equal(run('state'), 'quiet');
  rms = 1; advance(20); rms = .005;
  for (let i = 0; i < 50; i++) { advance(20); assert.equal(run('state'), 'quiet'); }
  assert.equal(run('state'), 'quiet', 'one short spike must not change the state');
  rms = .02; advance(1200); assert.equal(run('state'), 'medium');
  rms = .06; advance(1200); assert.equal(run('state'), 'loud');
  rms = .005; advance(1500); assert.equal(run('state'), 'quiet');
  await get('#calibrate-room').events.click();
  advance(3100);
  assert.equal(run('calibration'), null);
  assert.equal(run('MEDIUM_THRESHOLD'), 7);
  assert.equal(run('LOUD_THRESHOLD'), 17);
  assert.match(get('#calibration-status').textContent, /baseline 3.0/);
  get('#sensitivity').value = '2'; get('#sensitivity').events.input();
  assert.equal(run('MEDIUM_THRESHOLD'), 11.5);
  assert.equal(run('LOUD_THRESHOLD'), 21.5);
  get('#medium-threshold').value = '10'; get('#loud-threshold').value = '24'; get('#medium-threshold').events.change();
  assert.equal(run('ambientRms'), null);
  assert.equal(run('MEDIUM_THRESHOLD'), 10);
  get('#loud-threshold').value = '5'; get('#loud-threshold').events.change();
  assert.equal(run('LOUD_THRESHOLD'), 24, 'invalid edits preserve thresholds');
  await get('#calibrate-room').events.click();
  run('useManual()');
  assert.equal(run('calibration'), null);
  assert.equal(get('#calibrate-room').disabled, false);
  for (const [index, expected] of ['quiet', 'medium', 'loud'].entries()) {
    presets[index].events.click(); advance(2000); assert.equal(run('state'), expected);
  }
  denied = true; await get('#calibrate-room').events.click();
  assert.equal(run('mode'), 'manual');
  assert.equal(get('#calibrate-room').disabled, false);
  assert.match(get('#input-status').textContent, /permission denied/);
  assert.ok(tracksStopped > 0);
  assert.equal(run('JSON.stringify(groups.map(group => group.color))'), originalColours, 'group colours stay fixed across audio states');
  assert.equal(run('JSON.stringify(groups.map(group => group.people.map(({x,y}) => [x,y])))'), anchorCoordinates, 'sound never changes foot coordinates');
  run('setPresentation(true)'); assert.equal(get('.installation').dataset.presentation, 'true');
  run('setPresentation(false)'); assert.equal(get('.installation').dataset.presentation, 'false');
  console.log('PASS: fixed percentage foot anchors, anchor marker toggle, group colours, boundaries, continuous bubble mapping, manual/microphone visual parity, transient filtering, microphone states, calibration, sensitivity, threshold validation, cancellation, presets, permission fallback, presentation toggle.');
})().catch(error => { console.error(error); process.exitCode = 1; });
