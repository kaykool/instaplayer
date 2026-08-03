# InstaPlayer - Project Milestones & Roadmap

This document outlines the step-by-step development roadmap for building, testing, and shipping the **InstaPlayer** Chrome Extension.

---

## 🔄 Branch & Pull Request Workflow

Development follows a **PR-per-Milestone** workflow:

* **Main Branch**: `main` (production-ready code).
* **Feature Branches**: `feature/m1-boilerplate`, `feature/m2-dom-injection`, `feature/m3-bare-ui`, `feature/m4-media-sync`, `feature/m5-testing`, `feature/m6-packaging`.
* **Pull Request**: Each completed milestone is submitted via GitHub Pull Request to `main` for review and merge.

---

## Milestone Summary

| Milestone | Branch Name | Focus | Deliverables | Target Timeline |
|---|---|---|---|---|
| **M1: Foundation & Boilerplate** | `feature/m1-boilerplate` | Setup & Manifest V3 configuration | `manifest.json`, icon assets, project scaffolding | Day 1 |
| **M2: Dynamic DOM Injection** | `feature/m2-dom-injection` | Instagram SPA video detection | MutationObserver, wrapper injection, Shadow DOM isolation | Day 2 |
| **M3: Bare-Minimum Player Overlay UI** | `feature/m3-bare-ui` | Minimal, flat high-contrast layout | Simple control bar layout, progress bar, high-contrast icons, speed popup | Day 3 |
| **M4: Media Event Sync & Interactive Logic** | `feature/m4-media-sync` | HTML5 Video API bindings | Play/Pause, Seek, Mute, Volume, Speed menu, Fullscreen | Day 4 |
| **M5: Multi-Context Instagram Testing** | `feature/m5-testing` | Cross-view testing & edge cases | Reels, Feed carousels, Explore modal, Stories support | Day 5 |
| **M6: Packaging & Store Readiness** | `feature/m6-packaging` | Build optimization & publishing | Minified build scripts, store assets, documentation | Day 6 |

---

## Detailed Milestone Breakdown

### Milestone 1: Foundation & Extension Boilerplate
- **Branch**: `feature/m1-boilerplate`
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
- [ ] Create Pull Request to `main`.

---

### Milestone 2: Dynamic DOM Injection Engine
- **Branch**: `feature/m2-dom-injection`
- [ ] Build `MutationObserver` instance monitoring `document.body` for dynamically loaded DOM branches.
- [ ] Identify Instagram video container selectors:
  - Feed posts (`article div._aacl`, `div._abm0`)
  - Reels view (`div._aaqg`, video parent wrappers)
  - Explore popups & Stories containers.
- [ ] Implement Shadow DOM isolation layer (`attachShadow({ mode: 'open' })`) attached to a child wrapper node.
- [ ] Implement attribute guard (`data-instaplayer-attached="true"`) to prevent duplicate control bar injections.
- [ ] Create Pull Request to `main`.

---

### Milestone 3: Bare-Minimum Player Overlay UI
- **Branch**: `feature/m3-bare-ui`
- [ ] Design minimal, flat CSS layout in `shadow-styles.css`:
  - Solid dark semi-transparent background (`background: rgba(0, 0, 0, 0.75);`).
  - High-contrast SVG vector icons for Play, Pause, Mute, Speed, and Fullscreen.
- [ ] Build HTML template generator for control bar elements inside Shadow Root:
  - Left section: Play/Pause button, Mute button, Time label (`0:00 / 0:00`).
  - Center section: Progress bar track, fill, and interactive thumb handle.
  - Right section: `Speed` popup trigger button, Fullscreen button.
- [ ] Build minimal floating Speed Popup menu:
  - Clean vertical list with preset speeds (`0.25x` to `3x`).
- [ ] Create Pull Request to `main`.

---

### Milestone 4: Media Event Sync & Interactive Logic
- **Branch**: `feature/m4-media-sync`
- [ ] Bind HTML5 `<video>` element events to UI state updates:
  - `timeupdate` -> updates current time text and progress bar fill.
  - `durationchange` / `loadedmetadata` -> updates total duration text.
  - `play` / `pause` -> syncs Play/Pause button icon state.
  - `volumechange` -> syncs Mute/Volume icon state.
- [ ] Bind UI interaction handlers to `<video>` properties:
  - Play/Pause click -> calls `video.play()` / `video.pause()`.
  - Mute click -> toggles `video.muted`.
  - Progress bar seek (click & drag) -> sets `video.currentTime`.
  - Speed preset menu selection -> sets `video.playbackRate`.
  - Fullscreen click -> triggers `wrapper.requestFullscreen()`.
- [ ] Create Pull Request to `main`.

---

### Milestone 5: Multi-Context Instagram Testing & Polish
- **Branch**: `feature/m5-testing`
- [ ] Validate on **Instagram Reels** (vertical format, continuous vertical scroll).
- [ ] Validate on **Instagram Feed Posts** (single videos & multi-slide carousel videos).
- [ ] Validate on **Instagram Explore View** (lightbox video player popup).
- [ ] Validate on **Instagram Stories** (overlay compatibility).
- [ ] Perform performance audit:
  - Confirm zero memory leaks on long scrolling sessions.
  - Ensure disconnected DOM elements clean up event listeners and observers.
- [ ] Create Pull Request to `main`.

---

### Milestone 6: Packaging & Store Readiness
- **Branch**: `feature/m6-packaging`
- [ ] Compile clean distribution ZIP file (`instaplayer-v1.0.0.zip`).
- [ ] Complete documentation.
- [ ] Create Pull Request to `main`.
