# Soft Steps

A plain HTML/CSS/JavaScript concept demo for a stadium exit sound-awareness installation. One shared sound level smoothly scales every coloured projection and changes a three-state signal device. Colours imply visitor groups; they never encode loudness. The fixed stadium scene comes from the supplied rugby-fan reference, with baked-in light effects removed to make room for live overlays. This is a concept visualisation, not a completed installation.

## Run locally

Open `index.html` for the manual demo. For reliable microphone access, serve this folder on localhost. With Node.js installed, run:

```sh
node serve.cjs
```

Then open http://127.0.0.1:4180. Alternatively, with Python installed:

```sh
python -m http.server 4180
```

Then open http://localhost:4180. No build step or dependencies are required. Google Fonts are optional; system fonts work offline. Microphones require browser permission and a secure context (localhost or HTTPS). Remote HTTP addresses may disable microphone access.

## Explore

### Three interaction modes

The existing demo is **Group Interaction**, which remains the default. Open Debug Mode to select **Passive**, **Individual**, or **Group**. These are separate from Quiet / Getting louder / Too loud sound states and from the Microphone / Manual input modes.

- **Passive Mode** uses the supplied clean `passive mode-scenario.png` image unchanged (`assets/passive-clean-scene.png`), with no baked-in bubbles. Seven independent projected-light overlays perform a soft double heartbeat, then pause. Base diameters are 20–40 reference pixels, smaller further up the stairs. Each has its own fixed colour, delay, duration (3.8–4.7 seconds), and opacity. Peak scale is only 1.10, with a second pulse at 1.06; all centres stay fixed and their maximum glow bounds never overlap. The photographed green smile/Great job!/two-bar signal stays permanently calm, regardless of microphone or manual volume. Reduced-motion settings show static small lights.
- **Individual Interaction** uses the supplied five-visitor scene. Two fixed-colour groups have five manually anchored projections. The existing audio analyser, sensitivity, calibration, thresholds and smoothing drive their size and the live signal.
- **Group Interaction** restores the existing crowd image, four group configurations, ten anchors, colours, masks, scale mapping, signal and manual controls. No Group positions or colours were changed to add the new modes.

In Presentation Mode, press **1** for Passive, **2** for Individual, or **3** for Group. Shortcuts work outside text/number/range inputs and do not reload the page. Scene changes fade out/in together. The microphone and input choice remain connected across switches; Passive simply suppresses the visual sound response. Custom thresholds survive all switches. Rapid requests use the latest requested mode. A missing image leaves the current scene available and reports the error in Debug Mode.

`interaction-modes.js` defines each scene's background, groups, and response policy. Individual anchors use the same percentage x/y / baseSize / flatten format as Group. The two new supplied files are stored as byte-identical `assets/passive-scene.png` and `assets/individual-scene.png`; neither was regenerated or edited. Because the Individual photo includes baked-in large projections and yellow graphics, an Individual-only SVG layer borrows masked empty-stair texture from the supplied Passive image and covers only the sign's display surface before drawing live overlays. Foreground masks keep the original five people above that layer. This is browser-only compositing, not a replacement background file; fixed photographic light spill on clothing remains part of the supplied image. Group never uses this layer.

The later clean Passive source is a separate file, `assets/passive-clean-scene.png`. The original `assets/passive-scene.png` remains untouched because Individual compositing still uses it. Edit only `passiveBubbles` in `interaction-modes.js` to tune idle x/y percentages, diameter (`size`), `color`, `delay`, `duration`, and `opacity`. The `passiveHeartbeat` CSS keyframes define quick pulse → return → smaller pulse → return → pause (36–100% of each cycle). The existing 220 ms fade-out plus 220 ms fade-in remains a roughly 440 ms transition between scenes; leaving Passive fades its overlays with the scene. No microphone/state code is involved in the heartbeat.

The demo starts in **Manual demo**. Drag the sound slider or choose **Quiet**, **Getting louder**, or **Too loud**. Changes ease in over about a second. Choose **Microphone** to measure environmental sound using the existing Web Audio RMS implementation. The input is processed locally without recording, uploading, or speaker playback. Returning to Manual demo stops microphone tracks. Permission errors leave the manual demo available. Manual and microphone modes use exactly the same rendering path.

Click **Presentation Mode** or press **P** while outside an input to show only the scene, live projections and signal. **Esc** restores controls; **D** restores controls and opens Debug Mode. Double-clicking/tapping the scene twice also restores controls. Presentation mode keeps the selected sound source running. The full landscape composition is contained within the viewport, with letterboxing where necessary, rather than cropping the people or signal.

## Replace the scene

The current scene uses `assets/stadium-clean-plate.png` (1672 × 941). The supplied original is preserved as `assets/main-scene-reference.png`; the three-state reference is stored as `assets/signal-state-reference.png` for documentation only and is never used to switch backgrounds. The clean plate preserves the composition and physical signal housing, with its baked-in coloured projections and illuminated display removed. See `assets/asset-notes.md` for provenance and the edit prompt. The old SVG placeholder remains unused for reference.

To reposition projections, edit the `groups` array near the top of `script.js`. It contains four verified clusters and 10 visible-person anchors: foreground trio (blue), central trio (green), right-hand pair (pink), and upper-left visible pair (purple). Speculative groups on empty treads were removed. Feet hidden behind foreground people are not assigned bubbles. Each group owns exactly one `color`; its people have no individual colour fields and inherit the group's SVG fill.

Each group lists its people with manually measured percentage coordinates relative to the main scene:

```js
{ id: 'group-1', name: 'Foreground trio', color: '#57bfff',
  people: [
    { id: 'front-left-woman', x: 12.201, y: 81.509, baseSize: 62, flatten: .34 },
    // One entry for each additional visible person in this group.
  ]
}
```

`x` and `y` are percentages of the full photograph, not percentages of the browser viewport. `baseSize` is the horizontal radius in the photo's 1672 × 941 reference units; `flatten` is the vertical/horizontal radius ratio. Distant fans have smaller base sizes. All dimensions scale automatically with the shared scene frame. Edit each person's percentage position to fine-tune the foot contact point, and `color` to change the whole group's identity. There are no generated/distributed positions and no extra footprint entries between people. All group members use the same existing smoothed scale factor. Translation belongs to the fixed outer anchor; sound scales only its child, so centres never drift.

Enable **Debug Mode → Show Anchors** for a small white dot and group number at each foot position. Uncheck Show Anchors to return to the final bubbles only. Markers are hidden in Presentation Mode along with other debug UI. The option starts off and resets on refresh. Only add groups when at least two identifiable people have visible foot contact points; the crowd photograph does not supply six to eight clear clusters.

`stairs-mask` in `index.html` clips light to the staircase and `visitor-occlusion` masks foreground clothing/shoes/legs so light remains on the ground. Adjust these masks when moving bubbles. The signal is a separate SVG display overlay aligned with the photograph's housing. All layers share `.scene-frame`, preserving alignment at every viewport size. Fans remain stationary; there is no individual detection or tracking.

## Tune sound response

Edit the constants at the top of `script.js`:

- `MEDIUM_THRESHOLD = 8` and `LOUD_THRESHOLD = 18`: classroom defaults on a 0–100 scale. Below 8 is quiet, 8–18 is yellow, and above 18 is red. Hysteresis slightly shifts downward transitions. Manual presets automatically follow threshold edits and calibration.
- `HYSTERESIS = 1`: a small downward margin prevents flicker (automatically reduced for closely spaced thresholds).
- `MICROPHONE_GAIN = 600`: base RMS sensitivity. This is a relative input level, **not calibrated dB**.
- `SMOOTHING_SECONDS` and `BUBBLE_SMOOTHING_SECONDS`: level and projection easing.

The `states` object defines signal states and expressions. `bubbleScaleForLevel()` maps the live smoothed normalized level continuously through the editable thresholds, from 0.42 at silence through 0.7 at yellow and 1.15 at red, up to 2.4 above red. A second easing stage smooths projection size changes. Quiet uses small separated ellipses, medium keeps most separate, and loud creates visible colour overlaps. Colours are never modified by state logic. Only the signal uses green/yellow/red. Its display has a smile, neutral face, and shh gesture, with 2/5/9 illuminated stacked bars.

### Classroom Debug Mode

Open **Debug Mode** in the controls footer to see microphone permission status, current state, and the live smoothed normalized value; edit the yellow/red thresholds; and choose Low, Medium, or High sensitivity (0.5×, 1×, or 2.5× microphone gain). The input-mode toggle and manual presets remain in the control panel. Sensitivity does not change the manual slider's values. Thresholds must be between 1 and 99 with at least 1 point between them. Settings last until refresh.

Click **Calibrate Room** and grant microphone access if needed. Keep the room at its usual quiet conversation level for 3 seconds. The demo uses the 70th percentile of room RMS samples as its ambient baseline, resisting isolated transient sounds. Yellow starts at baseline + max(4, 40% of baseline); red starts above baseline + max(14, 120% of baseline), with headroom limits. Changing sensitivity after calibration rescales the recorded baseline and recomputes thresholds; manual threshold edits override the stored baseline. If the baseline exceeds 85, lower sensitivity and retry. Switching to manual cancels calibration.

Amplitude smoothing remains at 0.28 seconds and microphone state crossings must persist for 0.12 seconds to reject short spikes. Bubble easing remains unchanged. For your presentation, calibrate during normal quiet conversation, then try a louder voice near the laptop and a clap. Hardware levels vary; use High sensitivity or adjust the thresholds while watching the live value if needed.

## Presentation check

Try all three presets and the full slider range; confirm signal messages, shh gesture, bar counts, and projection overlap. Try microphone permission granted and denied. Check keyboard focus, Presentation/Escape, switching back to manual, and wide/narrow browser windows. Real microphone sensitivity varies by hardware and browser; tune the gain in your presentation space. Run `node sound-check.cjs` for deterministic audio/control regression checks with simulated Web Audio input. These checks do not replace testing your physical microphone.
