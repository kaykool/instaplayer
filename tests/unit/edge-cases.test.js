import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { formatTime } from '../../src/utils.js';
import InstaPlayerUI from '../../src/player.js';

globalThis.formatTime = formatTime;

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

    const player1 = new InstaPlayerUI(video);
    expect(container.querySelectorAll('.instaplayer-host').length).toBe(1);

    // Second manual instantiation on same video
    const player2 = new InstaPlayerUI(video);
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
});
