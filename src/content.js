/**
 * InstaPlayer Content Script - Milestone 2 (Dynamic DOM Injection Engine)
 */

(function () {
  'use strict';

  const activePlayers = new WeakMap();

  /**
   * Robust Multi-Tiered Container Resolver.
   * Resilient to Instagram CSS class renames/obfuscation.
   * Resolves the common ancestor container wrapping both the <video>
   * and its overlay/interactive layers, ensuring the player bar sits ON TOP.
   * Priority:
   * 1. Direct media container markers (div[data-instancekey])
   * 2. Known card/media class selectors (div._aaqg, div._aabw, div._abm0, div._aakw)
   * 3. Structural traversal: walks up to find the container enclosing video + overlays
   *    without escaping into the outer document/feed/article bounds.
   * @param {HTMLVideoElement} video
   * @returns {HTMLElement}
   */
  function findVideoContainer(video) {
    if (!video) return null;

    // 1. Direct Instagram media container markers
    const instanceKeyBox = video.closest('div[data-instancekey]');
    if (instanceKeyBox) return instanceKeyBox;

    // 2. Known class selectors (legacy/fallback)
    const knownClassContainer = video.closest('div._aaqg, div._aabw, div._abm0, div._aakw');
    if (knownClassContainer) return knownClassContainer;

    // 3. Structural traversal for Reels, Feed cards, and dynamic SPA containers:
    // Walk up ancestors from video to find the container holding both video AND overlay elements
    let current = video.parentElement;
    let best = current;

    while (
      current &&
      current !== current.ownerDocument.body &&
      current.nodeName !== 'MAIN' &&
      current.nodeName !== 'ARTICLE' &&
      (!current.matches || !current.matches('div[role="dialog"]'))
    ) {
      // Stop if container holds multiple videos (reached feed list or reels scroll container)
      if (current.querySelectorAll('video').length > 1) {
        break;
      }

      // Check if current contains overlay or link elements that are siblings to the video branch
      const hasOverlay = current.querySelector('a[href*="/reel/"], a[href*="/reels/"], button, [role="button"], [aria-label*="Audio"], [aria-label*="Volume"], [aria-label*="Mute"], [aria-label*="Like"]');
      if (hasOverlay && current !== video.parentElement) {
        best = current;
        break;
      }

      // Track positioned wrappers as structural fallbacks
      try {
        const pos = current.ownerDocument.defaultView.getComputedStyle(current).position;
        if (pos === 'relative' || pos === 'absolute') {
          best = current;
        }
      } catch {
        // Fallback for detached elements
      }

      current = current.parentElement;
    }

    return best || video.parentElement;
  }

  /**
   * Process and attach InstaPlayer UI overlay to target video element
   * @param {HTMLVideoElement} video
   */
  function processVideoNode(video) {
    if (!video || video.dataset.instaplayerAttached) return;

    const container = findVideoContainer(video);
    if (!container) return;

    video.dataset.instaplayerAttached = 'true';
    const playerUI = new InstaPlayerUI(video, container);

    if (playerUI.host) {
      activePlayers.set(video, playerUI);
    } else {
      delete video.dataset.instaplayerAttached;
    }
  }

  /**
   * Clean up InstaPlayer instances when video nodes are unmounted
   * @param {NodeList|Array} nodes
   */
  function handleRemovedNodes(nodes) {
    nodes.forEach((node) => {
      if (node.nodeType !== Node.ELEMENT_NODE) return;

      const videos = node.nodeName === 'VIDEO' ? [node] : (node.getElementsByTagName ? Array.from(node.getElementsByTagName('video')) : []);
      videos.forEach((video) => {
        const player = activePlayers.get(video);
        if (player) {
          player.destroy();
          activePlayers.delete(video);
          delete video.dataset.instaplayerAttached;
        }
      });
    });
  }

  /**
   * Scan DOM for all video elements
   */
  function scanDOM() {
    const videos = document.querySelectorAll('video:not([data-instaplayer-attached])');
    videos.forEach(processVideoNode);
  }

  const debouncedScan = typeof debounce === 'function' ? debounce(scanDOM, 100) : scanDOM;

  // In browser extension runtime, observe mutations and scan initial DOM
  if (typeof module === 'undefined' && typeof document !== 'undefined') {
    if (typeof MutationObserver !== 'undefined' && document.body) {
      const observer = new MutationObserver((mutations) => {
        let hasAdditions = false;
        mutations.forEach((mutation) => {
          if (mutation.removedNodes && mutation.removedNodes.length > 0) {
            handleRemovedNodes(mutation.removedNodes);
          }
          if (mutation.addedNodes && mutation.addedNodes.length > 0) {
            hasAdditions = true;
          }
        });

        if (hasAdditions) {
          debouncedScan();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', scanDOM);
    } else {
      scanDOM();
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { findVideoContainer, processVideoNode };
  }
})();
