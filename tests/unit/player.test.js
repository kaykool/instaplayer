import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { formatTime } from '../../src/utils.js';
import InstaPlayerUI from '../../src/player.js';

globalThis.formatTime = formatTime;

describe('InstaPlayerUI Component (src/player.js)', () => {
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

  it('creates Shadow DOM overlay container attached to video parent', () => {
    const playerUI = new InstaPlayerUI(video);

    expect(playerUI.host).not.toBeNull();
    expect(playerUI.shadow).not.toBeNull();
    expect(container.querySelector('.instaplayer-host')).toBe(playerUI.host);
  });

  it('renders control elements inside Shadow Root including sound button', () => {
    const playerUI = new InstaPlayerUI(video);
    const shadow = playerUI.shadow;

    expect(shadow.querySelector('.ip-play-btn')).not.toBeNull();
    expect(shadow.querySelector('.ip-mute-btn')).not.toBeNull();
    expect(shadow.querySelector('.ip-seeker')).not.toBeNull();
    expect(shadow.querySelector('.ip-speed-btn')).not.toBeNull();
    expect(shadow.querySelector('.ip-fs-btn')).not.toBeNull();
  });

  it('updates Play/Pause icon state on video play/pause events', () => {
    const playerUI = new InstaPlayerUI(video);
    const playBtn = playerUI.elements.playBtn;

    expect(playBtn.textContent).toBe('▶'); // Initial paused state

    // Simulate play event
    Object.defineProperty(video, 'paused', { value: false, configurable: true });
    video.dispatchEvent(new Event('play'));
    expect(playBtn.textContent).toBe('❚❚');

    // Simulate pause event
    Object.defineProperty(video, 'paused', { value: true, configurable: true });
    video.dispatchEvent(new Event('pause'));
    expect(playBtn.textContent).toBe('▶');
  });

  it('updates Mute icon state on video volumechange event', () => {
    const playerUI = new InstaPlayerUI(video);
    const muteBtn = playerUI.elements.muteBtn;

    expect(muteBtn.textContent).toBe('🔊');

    video.muted = true;
    video.dispatchEvent(new Event('volumechange'));
    expect(muteBtn.textContent).toBe('🔇');
  });

  it('destroys overlay and cleans up DOM host on destroy()', () => {
    const playerUI = new InstaPlayerUI(video);
    expect(container.contains(playerUI.host)).toBe(true);

    playerUI.destroy();

    expect(playerUI.host).toBeNull();
    expect(container.querySelector('.instaplayer-host')).toBeNull();
  });
});
