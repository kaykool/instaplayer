/**
 * InstaPlayer Content Script Entry Point
 */

(function () {
  'use strict';

  const activePlayers = new WeakMap();

  function processVideoNode(video) {
    if (!video || video.dataset.instaplayerAttached) return;

    video.dataset.instaplayerAttached = 'true';
    const playerUI = new InstaPlayerUI(video);
    activePlayers.set(video, playerUI);
  }

  function scanDOM() {
    const videos = document.querySelectorAll('video');
    videos.forEach(processVideoNode);
  }

  const observer = new MutationObserver(debounce(() => {
    scanDOM();
  }, 100));

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
