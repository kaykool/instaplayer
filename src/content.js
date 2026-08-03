/**
 * InstaPlayer Content Script - Milestone 2 (Dynamic DOM Injection Engine)
 */

(function () {
  'use strict';

  const activePlayers = new WeakMap();

  /**
   * Find the optimal outer container for Instagram video card.
   * Finds the common ancestor container wrapping both <video> AND Instagram's native overlay layers
   * (div[data-instancekey], div[aria-label="Video player"]), ensuring instaplayer-host is appended LAST.
   * @param {HTMLVideoElement} video
   * @returns {HTMLElement}
   */
  function findVideoContainer(video) {
    if (!video) return null;

    // 1. Locate outer video post or reel card ancestor
    const card = video.closest('article, div[role="dialog"], div._aaqg, div._aabw, div._abm0, div._aakw');
    if (card) {
      // If card contains div[data-instancekey] (Instagram's top overlay box), return it so host is appended inside as last child
      const instanceKeyBox = card.querySelector('div[data-instancekey]');
      if (instanceKeyBox) return instanceKeyBox;
      return card;
    }

    // 2. Check direct parent hierarchy for div[data-instancekey]
    let current = video.parentElement;
    while (current && current !== document.body) {
      const instanceKeyBox = current.querySelector ? current.querySelector('div[data-instancekey]') : null;
      if (instanceKeyBox) return instanceKeyBox;
      if (current.matches && current.matches('div._aabw, div._abm0, div._aaqg, div._aakw')) return current;
      current = current.parentElement;
    }

    // 3. Fallback to video parent
    return video.parentElement;
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

      const videos = node.matches && node.matches('video') ? [node] : (node.querySelectorAll ? node.querySelectorAll('video') : []);
      videos.forEach((video) => {
        const player = activePlayers.get(video);
        if (player) {
          player.destroy();
          activePlayers.delete(video);
        }
      });
    });
  }

  /**
   * Scan DOM for all video elements
   */
  function scanDOM() {
    const videos = document.querySelectorAll('video');
    videos.forEach(processVideoNode);
  }

  const debouncedScan = debounce(scanDOM, 100);

  // MutationObserver for dynamic Instagram SPA updates & infinite scroll
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

  // Listen to Instagram SPA Navigation (pushState / replaceState / popstate)
  const wrapHistoryMethod = (type) => {
    const orig = history[type];
    return function (...args) {
      const result = orig.apply(this, args);
      window.dispatchEvent(new Event('locationchange'));
      return result;
    };
  };

  history.pushState = wrapHistoryMethod('pushState');
  history.replaceState = wrapHistoryMethod('replaceState');

  window.addEventListener('popstate', () => window.dispatchEvent(new Event('locationchange')));
  window.addEventListener('locationchange', () => {
    setTimeout(scanDOM, 200);
  });

  // Initial DOM Scan
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scanDOM);
  } else {
    scanDOM();
  }
})();
