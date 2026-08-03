/**
 * InstaPlayer Content Script Entry Point
 */

(function () {
  'use strict';

  const activePlayers = new WeakMap();

  /**
   * Attaches the player interface to a video element once.
   * @param {HTMLVideoElement} video - The video element to process.
   */
  function processVideoNode(video) {
    if (!video || video.dataset.instaplayerAttached) return;

    video.dataset.instaplayerAttached = 'true';
    const playerUI = new InstaPlayerUI(video);
    if (playerUI.host) {
      activePlayers.set(video, playerUI);
    } else {
      delete video.dataset.instaplayerAttached;
    }
  }

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
   * Processes all video elements currently present in the document.
   */
  function scanDOM() {
    const videos = document.querySelectorAll('video');
    videos.forEach(processVideoNode);
  }

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.removedNodes && mutation.removedNodes.length > 0) {
        handleRemovedNodes(mutation.removedNodes);
      }
    });
    debounce(scanDOM, 100)();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Initial scan
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scanDOM);
  } else {
    scanDOM();
  }
})();
