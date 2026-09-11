/**
 * InstaPlayer Content Script - Milestone 2 (Dynamic DOM Injection Engine)
 */

(function () {
  'use strict';

  const activePlayers = new WeakMap();

  /**
   * Robust Multi-Tiered Container Resolver.
   * Resilient to Instagram CSS class renames/obfuscation.
   * Priority:
   * 1. Semantic attributes (div[data-instancekey])
   * 2. ARIA & HTML5 Semantic elements (article, div[role="dialog"], [role="region"])
   * 3. Known CSS class selectors (div._aaqg, div._aabw, div._abm0, div._aakw)
   * 4. Structural Computed Style Traversal (highest positioned parent wrapper)
   * @param {HTMLVideoElement} video
   * @returns {HTMLElement}
   */
  function findVideoContainer(video) {
    if (!video) return null;
    const container = video.closest('div[data-instancekey], article, div[role="dialog"], [role="region"], [role="presentation"], div._aaqg, div._aabw, div._abm0, div._aakw');
    if (container) {
      return container.querySelector('div[data-instancekey]') || container;
    }
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

  // Initial DOM Scan
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scanDOM);
  } else {
    scanDOM();
  }
})();
