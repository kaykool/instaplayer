# InstaPlayer 🎬

> A lightweight, bare-minimum Chrome Extension that embeds a simple, easy-to-operate video player control bar directly onto Instagram Reels, Feed posts, Explore videos, and Stories.

---

## 📸 Feature Preview

InstaPlayer overlays a high-contrast, flat dark control bar docked at the bottom of Instagram videos:

```
+-----------------------------------------------------------------------------------------------+
| INSTAGRAM VIDEO CONTENT                                                                       |
|                                                                                               |
| +-------------------------------------------------------------------------------------------+ |
| |  ▶   🔊  0:35 / 0:35  [===================o================]               1x   ⛶         | |
| +-------------------------------------------------------------------------------------------+ |
+-----------------------------------------------------------------------------------------------+
```

### Key Controls & Features:
* **Play / Pause**: One-click play/pause toggle.
* **Mute / Volume**: Toggle mute state cleanly (`🔊` / `🔇`). Preserves unmuted state on play resume.
* **Time Counter**: Clean `MM:SS / MM:SS` time display with monospaced tabular numbers.
* **Interactive Progress Bar**: High-contrast seek bar with white progress fill and circular thumb handle.
* **Playback Speed Menu**: Click `1x` to open a popup preset menu (`0.25x`, `0.5x`, `0.75x`, `1x`, `1.25x`, `1.5x`, `1.75x`, `2x`, `3x`).
* **Fullscreen Mode**: Expand video to crisp full screen.
* **Always Visible & Bare-Minimum**: High contrast dark flat overlay docked at the bottom for effortless operation (no glassmorphism / fancy blur distraction).
* **Stateless & Lightweight**: Built with 0 external dependencies, < 1.5MB memory footprint.

---

## 🚀 Quick Start / Installation Guide

To install and test **InstaPlayer** in Google Chrome or any Chromium browser (Edge, Brave, Vivaldi):

1. **Clone or Download Repository**:
   ```bash
   git clone https://github.com/your-username/instaplayer.git
   cd instaplayer
   ```

2. **Open Chrome Extension Management**:
   * Navigate to `chrome://extensions` in your browser address bar.
   * Enable **Developer mode** using the toggle switch in the upper right corner.

3. **Load Unpacked Extension**:
   * Click **Load unpacked**.
   * Select the `instaplayer` root directory containing `manifest.json`.

4. **Test on Instagram**:
   * Open [Instagram](https://www.instagram.com) and navigate to any Reel or video post.
   * Notice the bare-minimum player control bar docked at the bottom of the video!

---

## 📁 Documentation Roadmap

The repository includes comprehensive architecture and technical specifications:

* 📄 **[SPECIFICATION.md](file:///run/media/sw/Kanan/ProjectCoding/1New%20Era/instaplayer/SPECIFICATION.md)**: Product scope, functional specifications, bare-minimum UI specs, non-functional requirements.
* 🗺️ **[MILESTONES.md](file:///run/media/sw/Kanan/ProjectCoding/1New%20Era/instaplayer/MILESTONES.md)**: Step-by-step 6-stage development roadmap and milestone task checklists.
* 🏗️ **[ARCHITECTURE.md](file:///run/media/sw/Kanan/ProjectCoding/1New%20Era/instaplayer/ARCHITECTURE.md)**: Technical architecture, Shadow DOM isolation, MutationObserver SPA detection strategy, and sequence diagrams.

---

## 🛠️ Tech Stack & Requirements

* **Manifest**: Chrome Extension Manifest V3
* **Frontend Logic**: Vanilla JavaScript (ES2022+), Web Components & Shadow DOM (`attachShadow`)
* **Styling**: Minimalist Flat CSS3 (High-contrast layout, flexbox, CSS custom properties)
* **Target Domain**: `https://www.instagram.com/*`
