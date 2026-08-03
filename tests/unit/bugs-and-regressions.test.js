import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { formatTime } from '../../src/utils.js';
import InstaPlayerUI from '../../src/player.js';

globalThis.formatTime = formatTime;

describe('Bug Detection & Regression Prevention Tests', () => {
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

  it('Bug Check 1: Post-destroy media event does not throw TypeError on null elements', () => {
    const playerUI = new InstaPlayerUI(video);
    playerUI.destroy();

    // Trigger video events on unmounted video
    expect(() => {
      video.dispatchEvent(new Event('timeupdate'));
      video.dispatchEvent(new Event('volumechange'));
      video.dispatchEvent(new Event('play'));
      video.dispatchEvent(new Event('pause'));
      video.dispatchEvent(new Event('ratechange'));
    }).not.toThrow();
  });

  it('Bug Check 2: Time display prevents NaN:NaN output when duration is 0 or NaN', () => {
    const playerUI = new InstaPlayerUI(video);

    Object.defineProperty(video, 'duration', { value: 0, configurable: true });
    Object.defineProperty(video, 'currentTime', { value: 0, configurable: true });

    playerUI.updateTimeState();
    expect(playerUI.elements.timeLabel.textContent).toBe('0:00 / 0:00');

    Object.defineProperty(video, 'duration', { value: NaN, configurable: true });
    playerUI.updateTimeState();
    expect(playerUI.elements.timeLabel.textContent).toBe('0:00 / 0:00');
  });

  it('Bug Check 3: Document click outside speed menu when unmounted does not throw error', () => {
    const playerUI = new InstaPlayerUI(video);
    playerUI.destroy();

    expect(() => {
      document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }).not.toThrow();
  });

  it('Bug Check 4: Play button handles rejected video.play() promise safely without crash', async () => {
    const playerUI = new InstaPlayerUI(video);
    const playBtn = playerUI.elements.playBtn;

    Object.defineProperty(video, 'paused', { value: true, configurable: true });
    video.play = vi.fn().mockRejectedValue(new Error('NotAllowedError: play() failed because the user didn\'t interact with the document first'));

    expect(() => {
      playBtn.click();
    }).not.toThrow();
  });

  it('Bug Check 5: Double destroy() call on same instance is safe and idempotent', () => {
    const playerUI = new InstaPlayerUI(video);

    expect(() => {
      playerUI.destroy();
      playerUI.destroy();
    }).not.toThrow();

    expect(playerUI.host).toBeNull();
  });
});
