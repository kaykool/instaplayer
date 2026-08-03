# InstaPlayer - Project Milestones & Roadmap

This document outlines the step-by-step development roadmap for building, testing, and shipping the **InstaPlayer** Chrome Extension.

---

## Milestone Summary

| Milestone | Focus | Deliverables | Target Timeline |
|---|---|---|---|
| **M1: Foundation & Extension Boilerplate** | Setup & Manifest V3 configuration | `manifest.json`, icon assets, project scaffolding | Day 1 |
| **M2: Dynamic DOM Injection Engine** | Instagram SPA video detection | MutationObserver, wrapper injection, Shadow DOM isolation | Day 2 |
| **M3: Bare-Minimum Player Overlay UI** | Minimal, flat high-contrast layout | Simple control bar layout, progress bar, high-contrast icons, speed popup | Day 3 |
| **M4: Media Event Sync & Interactive Logic** | HTML5 Video API bindings | Play/Pause, Seek, Mute, Volume, Fast Forward (+5s), Speed menu, Fullscreen | Day 4 |
| **M5: Multi-Context Instagram Testing & Polish** | Cross-view testing & edge cases | Reels, Feed carousels, Explore modal, Stories support | Day 5 |
| **M6: Packaging & Store Readiness** | Build optimization & publishing | Minified build scripts, store assets, documentation | Day 6 |

---

## Detailed Milestone Breakdown

### Milestone 1: Foundation & Extension Boilerplate
- [ ] Initialize extension directory structure:
  ```
  instaplayer/
  ├── manifest.json
  ├── icons/
  │   ├── icon16.png
  │   ├── icon48.png
  │   └── icon128.png
  ├── src/
  │   ├── content.js
  │   ├── player.js
  │   ├── shadow-styles.css
  │   └── utils.js
  ```
- [ ] Create `manifest.json` targeting Manifest V3:
  - Permissions: `declarativeContent`, matching `https://www.instagram.com/*`.
  - Declare content script entry point and web-accessible resources.
- [ ] Verify unpacking and loading in `chrome://extensions`.

---

### Milestone 2: Dynamic DOM Injection Engine
- [ ] Build `MutationObserver` instance monitoring `document.body` for dynamically loaded DOM branches.
- [ ] Identify Instagram video container selectors:
  - Feed posts (`article div._aacl`, `div._abm0`)
  - Reels view (`div._aaqg`, video parent wrappers)
  - Explore popups & Stories containers.
- [ ] Implement Shadow DOM isolation layer (`attachShadow({ mode: 'open' })`) attached to a child wrapper node.
- [ ] Implement attribute guard (`data-instaplayer-attached="true"`) to prevent duplicate control bar injections.

---

### Milestone 3: Bare-Minimum Player Overlay UI
- [ ] Design minimal, flat CSS layout in `shadow-styles.css`:
  - Solid dark semi-transparent background (`background: rgba(0, 0, 0, 0.75);`).
  - High-contrast SVG vector icons for Play, Pause, Mute, Forward 5s, Speed, and Fullscreen.
- [ ] Build HTML template generator for control bar elements inside Shadow Root:
  - Left section: Play/Pause button, Mute button, Time label (`0:00 / 0:00`).
  - Center section: Progress bar track, fill, and interactive thumb handle.
  - Right section: `+5s` button, `Speed` popup trigger button, Fullscreen button.
- [ ] Build minimal floating Speed Popup menu:
  - Clean vertical list with preset speeds (`0.25x` to `3x`).

---

### Milestone 4: Media Event Sync & Interactive Logic
- [ ] Bind HTML5 `<video>` element events to UI state updates:
  - `timeupdate` -> updates current time text and progress bar fill.
  - `durationchange` / `loadedmetadata` -> updates total duration text.
  - `play` / `pause` -> syncs Play/Pause button icon state.
  - `volumechange` -> syncs Mute/Volume icon state.
- [ ] Bind UI interaction handlers to `<video>` properties:
  - Play/Pause click -> calls `video.play()` / `video.pause()`.
  - Mute click -> toggles `video.muted`.
  - Progress bar seek (click & drag) -> sets `video.currentTime`.
  - Forward 5s click -> adjusts `video.currentTime + 5`.
  - Speed preset menu selection -> sets `video.playbackRate`.
  - Fullscreen click -> triggers `wrapper.requestFullscreen()`.

---

### Milestone 5: Multi-Context Instagram Testing & Polish
- [ ] Validate on **Instagram Reels** (vertical format, continuous vertical scroll).
- [ ] Validate on **Instagram Feed Posts** (single videos & multi-slide carousel videos).
- [ ] Validate on **Instagram Explore View** (lightbox video player popup).
- [ ] Validate on **Instagram Stories** (overlay compatibility).
- [ ] Perform performance audit:
  - Confirm zero memory leaks on long scrolling sessions.
  - Ensure disconnected DOM elements clean up event listeners and observers.

---

### Milestone 6: Packaging & Store Readiness
- [ ] Compile clean distribution ZIP file (`instaplayer-v1.0.0.zip`).
- [ ] Complete documentation:
  - Finalize `SPECIFICATION.md`, `MILESTONES.md`, `ARCHITECTURE.md`, and `README.md`.
