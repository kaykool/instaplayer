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
    expect(shadow.querySelector('.ip-fs-btn')).toBeNull();
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

  describe('Low-overhead Visibility Control', () => {
    it('initially hides control bar when video is paused and not hovered', () => {
      Object.defineProperty(video, 'paused', { value: true, configurable: true });
      const playerUI = new InstaPlayerUI(video);

      expect(playerUI.host.style.display).toBe('none');
      expect(playerUI.host.dataset.visible).toBe('false');
    });

    it('shows control bar when video starts playing', () => {
      Object.defineProperty(video, 'paused', { value: true, configurable: true });
      const playerUI = new InstaPlayerUI(video);
      expect(playerUI.host.style.display).toBe('none');

      Object.defineProperty(video, 'paused', { value: false, configurable: true });
      video.dispatchEvent(new Event('play'));

      expect(playerUI.host.style.display).toBe('block');
      expect(playerUI.host.dataset.visible).toBe('true');
    });

    it('hides control bar when playing video is paused and not hovered', () => {
      Object.defineProperty(video, 'paused', { value: false, configurable: true });
      const playerUI = new InstaPlayerUI(video);
      expect(playerUI.host.style.display).toBe('block');

      Object.defineProperty(video, 'paused', { value: true, configurable: true });
      video.dispatchEvent(new Event('pause'));

      expect(playerUI.host.style.display).toBe('none');
      expect(playerUI.host.dataset.visible).toBe('false');
    });

    it('reveals control bar on mouseenter of parent container and hides on mouseleave when paused', () => {
      Object.defineProperty(video, 'paused', { value: true, configurable: true });
      const playerUI = new InstaPlayerUI(video);
      expect(playerUI.host.style.display).toBe('none');

      container.dispatchEvent(new MouseEvent('mouseenter'));
      expect(playerUI.host.style.display).toBe('block');
      expect(playerUI.host.dataset.visible).toBe('true');

      container.dispatchEvent(new MouseEvent('mouseleave'));
      expect(playerUI.host.style.display).toBe('none');
      expect(playerUI.host.dataset.visible).toBe('false');
    });

    it('keeps control bar visible when actively scrubbing seek slider even if paused', () => {
      Object.defineProperty(video, 'paused', { value: true, configurable: true });
      const playerUI = new InstaPlayerUI(video);
      expect(playerUI.host.style.display).toBe('none');

      playerUI.elements.seeker.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      expect(playerUI.host.style.display).toBe('block');
      expect(playerUI.host.dataset.visible).toBe('true');

      playerUI.elements.seeker.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      expect(playerUI.host.style.display).toBe('none');
    });

    it('keeps control bar visible when speed menu is open even if paused', () => {
      Object.defineProperty(video, 'paused', { value: true, configurable: true });
      const playerUI = new InstaPlayerUI(video);
      expect(playerUI.host.style.display).toBe('none');

      playerUI.elements.speedBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(playerUI.elements.speedMenu.classList.contains('open')).toBe(true);
      expect(playerUI.host.style.display).toBe('block');
      expect(playerUI.host.dataset.visible).toBe('true');

      document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(playerUI.elements.speedMenu.classList.contains('open')).toBe(false);
      expect(playerUI.host.style.display).toBe('none');
    });
  });
});
