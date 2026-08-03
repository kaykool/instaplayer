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

| Milestone | Branch Name | Focus | Deliverables | Target Timeline | Status |
|---|---|---|---|---|---|
| **M1: Foundation & Boilerplate** | `feature/m1-boilerplate` | Setup & Manifest V3 configuration | `manifest.json`, icon assets, project scaffolding | Day 1 | Completed |
| **M2: Dynamic DOM Injection** | `feature/m2-dom-injection` | Instagram SPA video detection | MutationObserver, wrapper injection, Shadow DOM isolation | Day 2 | Completed & Merged |
| **M3: Bare-Minimum Player Overlay UI** | `feature/m3-bare-ui` | Minimal, flat high-contrast layout | Simple control bar layout, progress bar, high-contrast icons, speed popup | Day 3 | Completed |
| **M4: Media Event Sync & Interactive Logic** | `feature/m4-media-sync` | HTML5 Video API bindings | Play/Pause, Mute/Unmute, Seek, Speed menu, Fullscreen | Day 4 | Completed |
| **M5: Multi-Context Instagram Testing** | `feature/m5-testing` | Cross-view testing & edge cases | Reels, Feed carousels, Explore modal, Stories support | Day 5 | Completed |
| **M6: Packaging & Store Readiness** | `feature/m6-packaging` | Build optimization & publishing | Minified build scripts, store assets, documentation | Day 6 | Completed |

---

## Detailed Milestone Breakdown

### Milestone 1: Foundation & Extension Boilerplate
- **Branch**: `feature/m1-boilerplate`
- [x] Initialize extension directory structure:
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
- [x] Create `manifest.json` targeting Manifest V3.
- [x] Verify unpacking and loading in `chrome://extensions`.
- [x] Merged to `main`.

---

### Milestone 2: Dynamic DOM Injection Engine
- **Branch**: `feature/m2-dom-injection`
- [x] Build `MutationObserver` instance monitoring `document.body` for dynamically loaded DOM branches.
- [x] Identify Instagram video container selectors (Reels, Feed posts, Explore popups, Stories).
- [x] Implement Shadow DOM isolation layer (`attachShadow({ mode: 'open' })`).
- [x] Implement attribute guard (`data-instaplayer-attached="true"`).
- [x] Resolve `div[data-instancekey]` DOM stacking hierarchy & overlay mask suppression.
- [x] Merged to `main`.

---

### Milestone 3: Bare-Minimum Player Overlay UI
- **Branch**: `feature/m3-bare-ui`
- [x] Design minimal, flat CSS layout in `shadow-styles.css`.
- [x] Build HTML template generator for control bar elements inside Shadow Root (Play/Pause, Mute, Time label, Seeker, Speed popup, Fullscreen).
- [x] Build minimal floating Speed Popup menu.

---

### Milestone 4: Media Event Sync & Interactive Logic
- **Branch**: `feature/m4-media-sync`
- [x] Bind HTML5 `<video>` element events to UI state updates (`timeupdate`, `durationchange`, `play`, `pause`, `volumechange`, `ratechange`).
- [x] Bind UI interaction handlers to `<video>` properties (Play/Pause click, Mute click, Seeker drag, Speed menu, Fullscreen).

---

### Milestone 5: Multi-Context Instagram Testing & Polish
- **Branch**: `feature/m5-testing`
- [x] Validate on **Instagram Reels**, **Feed Posts**, **Explore View**, **Stories**.
- [x] Perform unit testing suite (Vitest + JSDOM, edge case tests, bug prevention tests).

---

### Milestone 6: Packaging & Store Readiness
- **Branch**: `feature/m6-packaging`
- [x] Compile clean distribution ZIP file (`instaplayer-v1.0.0.zip`) via `npm run package` (`scripts/package.mjs`, zero-dep store/deflate ZIP).
- [x] Complete documentation (README install guide, SPECIFICATION, ARCHITECTURE).
