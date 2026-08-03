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
   * 1. Semantic attributes (div[data-instancekey], data-testid)
   * 2. ARIA & HTML5 Semantic elements (article, div[role="dialog"], [role="region"])
   * 3. Known CSS class selectors (div._aaqg, div._aabw, div._abm0, div._aakw)
   * 4. Structural Computed Style Traversal (highest positioned parent wrapper)
   * @param {HTMLVideoElement} video
   * @returns {HTMLElement}
   */
  function findVideoContainer(video) {
    if (!video) return null;

    // Tier 1 & 2: WAI-ARIA & Semantic HTML5 containers (article, post modals, reel views)
    const semanticCard = video.closest('article, div[role="dialog"], [role="region"], [role="presentation"], div._aaqg, div._aabw, div._abm0, div._aakw');
    if (semanticCard) {
      const instanceKeyBox = semanticCard.querySelector('div[data-instancekey]');
      if (instanceKeyBox) return instanceKeyBox;
      return semanticCard;
    }

    // Tier 3: Parent hierarchy traversal for data-instancekey or class matches
    let current = video.parentElement;
    let highestPositionedParent = video.parentElement;

    while (current && current !== document.body) {
      const instanceKeyBox = current.querySelector ? current.querySelector('div[data-instancekey]') : null;
      if (instanceKeyBox) return instanceKeyBox;

      if (current.matches && current.matches('div._aabw, div._abm0, div._aaqg, div._aakw')) {
        return current;
      }

      // Track positioned containers (relative/absolute) as structural fallbacks
      try {
        const pos = window.getComputedStyle(current).position;
        if (pos === 'relative' || pos === 'absolute' || pos === 'fixed') {
          highestPositionedParent = current;
        }
      } catch {
        // Fallback for detached elements
      }

      current = current.parentElement;
    }

    // Tier 4: Structural fallback to highest positioned parent or direct parent
    return highestPositionedParent || video.parentElement;
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
