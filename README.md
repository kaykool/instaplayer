# InstaPlayer

Chrome extension that adds a video player control bar to Instagram Reels, Feed posts, Explore videos, and Stories.

## Features

Overlays a high-contrast dark control bar at the bottom of Instagram videos:

```
+-----------------------------------------------------------------------------------------------+
| INSTAGRAM VIDEO CONTENT                                                                       |
|                                                                                               |
| +-------------------------------------------------------------------------------------------+ |
| |  ▶   🔊  0:35 / 0:35  [===================o================]               1x             | |
| +-------------------------------------------------------------------------------------------+ |
+-----------------------------------------------------------------------------------------------+
```

- **Play / Pause**: toggles playback.
- **Mute / Volume**: toggles mute; preserves unmuted state on play resume.
- **Time Counter**: `MM:SS / MM:SS` display with tabular numbers.
- **Progress Bar**: seek bar with white progress fill and thumb handle.
- **Playback Speed**: `1x` button opens preset menu (0.25x–3x).
- **Stateless & Lightweight**: zero external dependencies, no persistent storage.

## Install

Load unpacked in Chrome or any Chromium browser (Edge, Brave, Vivaldi):

1. Open the extension management page, enable **Developer mode**:
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
   - Brave: `brave://extensions`
   - Vivaldi: `vivaldi://extensions`
2. Click **Load unpacked**, select this directory (contains `manifest.json`).
3. Open [Instagram](https://www.instagram.com) — the control bar appears on videos.

## Docs

- [SPECIFICATION.md](SPECIFICATION.md): product scope and UI specs.
- [MILESTONES.md](MILESTONES.md): development roadmap and task checklists.
- [ARCHITECTURE.md](ARCHITECTURE.md): Shadow DOM isolation and MutationObserver SPA detection.

## Tech Stack

- Chrome Extension Manifest V3
- Vanilla JavaScript (ES2022+), Web Components & Shadow DOM
- Flat CSS3 (flexbox, custom properties)
- Target domain: `https://www.instagram.com/*`
