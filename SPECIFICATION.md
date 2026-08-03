# InstaPlayer - Chrome Extension Specification

## 1. Overview
**InstaPlayer** is a lightweight, minimalistic Chrome Extension designed specifically for Instagram (Reels, Feed video posts, Explore modal, and Stories). It automatically attaches a clean, bare-minimum HTML5 video player control bar directly to Instagram video containers, providing effortless access to playback speed, precision seeking, time tracking, and audio muting without visual distraction.

---

## 2. Product Scope & Target Platform

* **Browser Target**: Google Chrome (Manifest V3 compatible, cross-browser support for Edge/Brave/Vivaldi).
* **Target Domain**: `https://www.instagram.com/*`
* **Supported Media Contexts**:
  1. **Instagram Reels**: Vertical reel player view & grid reel modal.
  2. **Feed Video Posts**: Single and multi-video gallery carousels on main feed.
  3. **Explore View**: Pop-up modal video player.
  4. **Instagram Stories**: Overlay on story video clips.
* **Storage Footprint**: Strictly lightweight & stateless (0kb persistent storage overhead). Directly manipulates current DOM `<video>` node state without background sync tasks.

---

## 3. UI / UX Specifications

### 3.1 Visual Aesthetics & Layout (Bare-Minimum Design)
The player bar is rendered as a clean, high-contrast, flat docked overlay bar at the bottom of the Instagram video container.

```
+-----------------------------------------------------------------------------------------------+
| VIDEO CONTAINER                                                                               |
|                                                                                               |
|                                                                                               |
|                                                                                               |
| +-------------------------------------------------------------------------------------------+ |
| | [> / ||]  [Vol]  0:35 / 0:35  [===================o================]         [1x]         | |
| +-------------------------------------------------------------------------------------------+ |
+-----------------------------------------------------------------------------------------------+
```

* **Position**: Docked at the bottom of the video wrapper container (`position: absolute; bottom: 0; left: 0; right: 0; z-index: 2147483647;`).
* **Visibility Mode**: Always visible docked bar without auto-hiding for instant readability and ease of operation.
* **Background Style**: Ultra-clean, high-contrast flat layout:
  * Background: Solid dark opacity `rgba(0, 0, 0, 0.85)` or `#121212` for optimal contrast against video backgrounds.
  * Border: Simple top border `1px solid rgba(255, 255, 255, 0.12)`.
  * Height: Compact `38px`.
  * Padding: `0 12px`.
* **Typography**: Clean system sans-serif font stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`).
  * Time Display: `12px`, tabular monospaced numbers (`font-variant-numeric: tabular-nums`).

---

## 4. Control Bar Feature Breakdown

### 4.1 Play / Pause Toggle (`[►]` / `[❚❚]`)
* **State Sync**: Listens to `<video>` events (`play`, `pause`, `ended`).
* **Interaction**:
  * Click to toggle play/pause status.
  * Synchronized directly with `video.play()` and `video.pause()`.

### 4.2 Mute / Unmute & Volume Toggle (`[🔊]` / `[🔇]`)
* **State Sync**: Listens to `<video>` events (`volumechange`).
* **Interaction**:
  * Click button to toggle mute state (`video.muted = !video.muted`).
  * Icon toggles cleanly between Mute and Unmute states.
  * Automatically preserves user unmuted preference when pausing and re-playing.

### 4.3 Time Display (`MM:SS / MM:SS`)
* **Format**: Current time and total duration formatted as `M:SS` or `MM:SS` (e.g., `0:35 / 0:35`).
* **Updates**: Driven by `<video>` `timeupdate`, `durationchange`, and `loadedmetadata` events.

### 4.4 Interactive Progress / Seek Bar
* **Track**: Simple high-contrast track (`rgba(255, 255, 255, 0.3)`).
* **Progress Fill**: Solid bright white fill (`#ffffff`) indicating current timestamp.
* **Scrubber Thumb**: Compact 16px circular white thumb indicator for easy scrubbing.
* **Interaction**: Click or drag to jump to target timestamp (`video.currentTime = seekPercentage * video.duration`).

### 4.5 Playback Speed Control (`[1x]`)
* **Active Indicator**: Button displays current playback speed label (e.g., `1x`, `1.5x`, `2x`).
* **Interaction**: Click opens a clean, minimal popup preset menu.
* **Speed Presets**: `0.25x`, `0.5x`, `0.75x`, `1x` (Default), `1.25x`, `1.5x`, `1.75x`, `2x`, `3x`.
* **Behavior**: Selecting an option updates `video.playbackRate` immediately.

---

## 5. Technical Requirements & Non-Functional Specs

### 5.1 Extension Architecture
* **Manifest Version**: Manifest V3 (`manifest.json`).
* **Injection Strategy**: Content Script (`content.js` + `content.css`) matching `https://www.instagram.com/*`.
* **DOM Encapsulation**: Uses Shadow DOM (`Element.attachShadow({ mode: 'open' })`) to prevent Instagram styles from breaking the bare-minimum control bar.

### 5.2 Performance & Footprint
* Zero external JS/CSS dependencies.
* Ultra-fast rendering: no GPU backdrop-filter overhead.
