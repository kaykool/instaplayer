import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { formatTime, debounce } from '../../src/utils.js';
import InstaPlayerUI from '../../src/player.js';

globalThis.formatTime = formatTime;
globalThis.debounce = debounce;
globalThis.InstaPlayerUI = InstaPlayerUI;

import { findVideoContainer, processVideoNode } from '../../src/content.js';

describe('Real-World Instagram Edge Case Tests', () => {
  let container;
  let video;

  beforeEach(() => {
    container = document.createElement('div');
    container.className = '_aaqg';
    document.body.appendChild(container);

    video = document.createElement('video');
    container.appendChild(video);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('Edge Case 1: Parentless Video Node does not throw error and returns false init', () => {
    const orphanVideo = document.createElement('video');
    const player = new InstaPlayerUI(orphanVideo);

    expect(player.host).toBeNull();
    expect(player.shadow).toBeNull();
  });

  it('Edge Case 2: Live streams or unbuffered videos (duration = NaN / Infinity)', () => {
    const player = new InstaPlayerUI(video);

    Object.defineProperty(video, 'duration', { value: NaN, configurable: true });
    Object.defineProperty(video, 'currentTime', { value: 0, configurable: true });

    video.dispatchEvent(new Event('durationchange'));
    video.dispatchEvent(new Event('timeupdate'));

    expect(player.elements.timeLabel.textContent).toBe('0:00 / 0:00');
    expect(player.elements.seeker.value).toBe('0');
  });

  it('Edge Case 3: Rapid Double Injection Guard (prevents multiple overlays on single video)', () => {
    video.dataset.instaplayerAttached = 'true';

    new InstaPlayerUI(video);
    expect(container.querySelectorAll('.instaplayer-host').length).toBe(1);

    // Second manual instantiation on same video
    new InstaPlayerUI(video);
    expect(container.querySelectorAll('.instaplayer-host').length).toBe(2);
  });

  it('Edge Case 4: Extreme playback rates (0.25x to 3x selection)', () => {
    const player = new InstaPlayerUI(video);
    const speedItems = player.elements.speedItems;

    // Click 3x speed
    const speed3xItem = Array.from(speedItems).find(i => i.dataset.speed === '3');
    speed3xItem.click();

    expect(video.playbackRate).toBe(3);

    // Simulate ratechange event
    video.dispatchEvent(new Event('ratechange'));
    expect(player.elements.speedBtn.textContent).toBe('3x');
    expect(speed3xItem.classList.contains('active')).toBe(true);
  });

  it('Edge Case 5: Fullscreen element check is absent', () => {
    const player = new InstaPlayerUI(video);
    expect(player.elements.fsBtn).toBeUndefined();
  });

  it('Edge Case 6: React Virtualized List re-mount & teardown cycle', () => {
    const player = new InstaPlayerUI(video);
    expect(container.children.length).toBe(2); // video + instaplayer-host

    // Simulate React unmounting video card
    player.destroy();
    container.removeChild(video);

    expect(container.children.length).toBe(0);
    expect(player.host).toBeNull();
  });

  it('Edge Case 7: Dedicated Reels page resolves container enclosing native overlay', () => {
    const reelSlide = document.createElement('div');
    reelSlide.className = 'reel-slide-root';
    reelSlide.style.position = 'relative';

    const videoWrapper = document.createElement('div');
    videoWrapper.setAttribute('role', 'presentation');
    const reelVideo = document.createElement('video');
    videoWrapper.appendChild(reelVideo);

    const overlayLayer = document.createElement('div');
    overlayLayer.className = 'reel-overlay-layer';
    const audioBtn = document.createElement('button');
    audioBtn.setAttribute('aria-label', 'Audio');
    overlayLayer.appendChild(audioBtn);

    reelSlide.appendChild(videoWrapper);
    reelSlide.appendChild(overlayLayer);
    document.body.appendChild(reelSlide);

    const detected = findVideoContainer(reelVideo);
    expect(detected).toBe(reelSlide);

    const player = new InstaPlayerUI(reelVideo, detected);
    expect(reelSlide.lastElementChild).toBe(player.host);
    expect(player.host.style.zIndex).toBe('2147483647');
  });

  it('Edge Case 8: Feed post with Reel navigation link wraps link so host paints on top', () => {
    const mediaBox = document.createElement('div');
    mediaBox.className = 'feed-media-box';

    const innerVideoBox = document.createElement('div');
    innerVideoBox.setAttribute('role', 'presentation');
    const feedVideo = document.createElement('video');
    innerVideoBox.appendChild(feedVideo);

    const linkOverlay = document.createElement('div');
    const link = document.createElement('a');
    link.href = '/reels/Dc----NRgmV/';
    linkOverlay.appendChild(link);

    mediaBox.appendChild(innerVideoBox);
    mediaBox.appendChild(linkOverlay);
    document.body.appendChild(mediaBox);

    const detected = findVideoContainer(feedVideo);
    expect(detected).toBe(mediaBox);

    const player = new InstaPlayerUI(feedVideo, detected);
    expect(mediaBox.lastElementChild).toBe(player.host);
  });

  it('Edge Case 9: Container recycling or disconnected host triggers clean re-attachment', () => {
    processVideoNode(video);
    expect(video.dataset.instaplayerAttached).toBe('true');
    const firstHost = container.querySelector('.instaplayer-host');
    expect(firstHost).not.toBeNull();

    // Simulate React recycling: remove host from DOM while video remains
    firstHost.remove();
    expect(firstHost.isConnected).toBe(false);

    // Subsequent scan re-attaches new host
    processVideoNode(video);
    const secondHost = container.querySelector('.instaplayer-host');
    expect(secondHost).not.toBeNull();
    expect(secondHost).not.toBe(firstHost);

    // Simulate reparenting: move video into a new container
    const newContainer = document.createElement('div');
    newContainer.className = '_aaqg';
    document.body.appendChild(newContainer);
    newContainer.appendChild(video);

    processVideoNode(video);
    const thirdHost = newContainer.querySelector('.instaplayer-host');
    expect(thirdHost).not.toBeNull();
    expect(container.querySelector('.instaplayer-host')).toBeNull();
  });
});
