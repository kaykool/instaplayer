/**
 * InstaPlayer Content Script - Milestone 2 (Dynamic DOM Injection Engine)
 */

(function () {
  'use strict';

  const activePlayers = new WeakMap();

  /**
   * Find the most suitable parent container for the Instagram video element
   * Supports: Reels view, Feed posts, Explore lightbox, and Stories clips
   * @param {HTMLVideoElement} video
   * @returns {HTMLElement}
   */
  function findVideoContainer(video) {
    if (!video) return null;

    // Instagram Reel / Explore Modal Wrapper
    const reelWrapper = video.closest('div._aaqg, div._aakw, div[role="dialog"]');
    if (reelWrapper) return reelWrapper;

    // Feed Post Video Wrapper
    const postWrapper = video.closest('article, div._abm0, div._aacl');
    if (postWrapper) return postWrapper;

    // Fallback to direct parent
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
