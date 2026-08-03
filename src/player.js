/**
 * InstaPlayer Controller & Shadow DOM Builder
 */

class InstaPlayerUI {
  /**
   * @param {HTMLVideoElement} videoElement
   */
  constructor(videoElement) {
    this.video = videoElement;
    this.host = null;
    this.shadow = null;
    this.elements = {};
    this.isUserSeeking = false;
    this.boundHandlers = {};

    if (!this.init()) {
      return;
    }

    this.bindEvents();
    this.updateAllStates();
  }

  init() {
    const parent = this.video.parentElement;
    if (!parent) return false;

    // Create host container
    this.host = document.createElement('div');
    this.host.className = 'instaplayer-host';

    // Attach Shadow DOM root
    this.shadow = this.host.attachShadow({ mode: 'open' });

    // Inject styles
    const style = document.createElement('style');
    style.textContent = `
      :host { display: block; position: absolute; bottom: 0; left: 0; right: 0; width: 100%; z-index: 9999; pointer-events: auto; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; user-select: none; }
      .ip-bar { display: flex; align-items: center; gap: 8px; height: 38px; padding: 0 12px; background: rgba(0, 0, 0, 0.85); border-top: 1px solid rgba(255, 255, 255, 0.12); box-sizing: border-box; color: #ffffff; }
      .ip-btn { background: transparent; border: none; color: #ffffff; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; padding: 4px 6px; border-radius: 4px; font-size: 13px; line-height: 1; }
      .ip-btn:hover { background: rgba(255, 255, 255, 0.15); }
      .ip-btn:focus-visible, .ip-seeker:focus-visible, .ip-speed-item:focus-visible { outline: 2px solid #3897f0; outline-offset: 2px; }
      .ip-time { font-size: 12px; font-variant-numeric: tabular-nums; color: rgba(255, 255, 255, 0.9); white-space: nowrap; }
      .ip-seeker-container { flex: 1; display: flex; align-items: center; margin: 0 4px; }
      .ip-seeker { -webkit-appearance: none; appearance: none; width: 100%; height: 4px; background: rgba(255, 255, 255, 0.25); border-radius: 2px; cursor: pointer; }
      .ip-seeker::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 10px; height: 10px; border-radius: 50%; background: #ffffff; cursor: pointer; }
      .ip-speed-wrapper { position: relative; }
      .ip-speed-menu { display: none; position: absolute; bottom: 100%; right: 0; margin-bottom: 6px; background: #121212; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 6px; padding: 4px 0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5); z-index: 10000; min-width: 64px; }
      .ip-speed-menu.open { display: block; }
      .ip-speed-item { display: block; width: 100%; padding: 6px 12px; background: transparent; border: none; color: #ffffff; font-size: 12px; text-align: center; cursor: pointer; }
      .ip-speed-item:hover { background: rgba(255, 255, 255, 0.15); }
      .ip-speed-item.active { font-weight: bold; color: #3897f0; }
    `;
    this.shadow.appendChild(style);

    // Build Bar UI Template
    const bar = document.createElement('div');
    bar.className = 'ip-bar';
    bar.innerHTML = `
      <button class="ip-btn ip-play-btn" title="Play/Pause" aria-label="Play or pause video">▶</button>
      <button class="ip-btn ip-mute-btn" title="Mute/Unmute" aria-label="Mute or unmute video">🔊</button>
      <span class="ip-time">0:00 / 0:00</span>
      <div class="ip-seeker-container">
        <input type="range" class="ip-seeker" min="0" max="100" value="0" step="0.1" aria-label="Seek progress">
      </div>
      <div class="ip-speed-wrapper">
        <button class="ip-btn ip-speed-btn" title="Playback Speed" aria-label="Select playback speed">1x</button>
        <div class="ip-speed-menu">
          <button class="ip-speed-item" data-speed="0.25">0.25x</button>
          <button class="ip-speed-item" data-speed="0.5">0.5x</button>
          <button class="ip-speed-item" data-speed="0.75">0.75x</button>
          <button class="ip-speed-item active" data-speed="1">1x</button>
          <button class="ip-speed-item" data-speed="1.25">1.25x</button>
          <button class="ip-speed-item" data-speed="1.5">1.5x</button>
          <button class="ip-speed-item" data-speed="1.75">1.75x</button>
          <button class="ip-speed-item" data-speed="2">2x</button>
          <button class="ip-speed-item" data-speed="3">3x</button>
        </div>
      </div>
      <button class="ip-btn ip-fs-btn" title="Fullscreen" aria-label="Toggle fullscreen mode">⛶</button>
    `;

    this.shadow.appendChild(bar);

    // Cache elements
    this.elements = {
      playBtn: bar.querySelector('.ip-play-btn'),
      muteBtn: bar.querySelector('.ip-mute-btn'),
      timeLabel: bar.querySelector('.ip-time'),
      seeker: bar.querySelector('.ip-seeker'),
      speedBtn: bar.querySelector('.ip-speed-btn'),
      speedMenu: bar.querySelector('.ip-speed-menu'),
      speedItems: bar.querySelectorAll('.ip-speed-item'),
      fsBtn: bar.querySelector('.ip-fs-btn')
    };

    // Ensure parent position is relative/absolute
    if (getComputedStyle(parent).position === 'static') {
      parent.style.position = 'relative';
    }

    parent.appendChild(this.host);
    return true;
  }

  bindEvents() {
    const { playBtn, muteBtn, seeker, speedBtn, speedMenu, speedItems, fsBtn } = this.elements;

    // Define bound handlers for cleanup
    this.boundHandlers = {
      playClick: () => {
        if (this.video.paused) {
          this.video.play().catch(() => {});
        } else {
          this.video.pause();
        }
      },
      muteClick: () => {
        this.video.muted = !this.video.muted;
      },
      seekerMousedown: () => { this.isUserSeeking = true; },
      seekerTouchstart: () => { this.isUserSeeking = true; },
      seekerInput: () => {
        if (this.video.duration) {
          const targetTime = (parseFloat(seeker.value) / 100) * this.video.duration;
          this.elements.timeLabel.textContent = `${formatTime(targetTime)} / ${formatTime(this.video.duration)}`;
        }
      },
      commitSeek: () => {
        if (this.video.duration) {
          this.video.currentTime = (parseFloat(seeker.value) / 100) * this.video.duration;
        }
        this.isUserSeeking = false;
      },
      speedBtnClick: (e) => {
        e.stopPropagation();
        speedMenu.classList.toggle('open');
      },
      documentClick: (e) => {
        if (this.host && !this.host.contains(e.target)) {
          speedMenu.classList.remove('open');
        }
      },
      fsClick: () => {
        const targetContainer = this.video.parentElement || this.video;
        if (!document.fullscreenElement) {
          if (targetContainer.requestFullscreen) {
            targetContainer.requestFullscreen();
          } else if (targetContainer.webkitRequestFullscreen) {
            targetContainer.webkitRequestFullscreen();
          }
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          }
        }
      },
      videoPlay: () => this.updatePlayState(),
      videoPause: () => this.updatePlayState(),
      videoVolume: () => this.updateMuteState(),
      videoTime: () => this.updateTimeState(),
      videoDuration: () => this.updateTimeState(),
      videoRate: () => this.updateSpeedState()
    };

    // UI Listeners
    playBtn.addEventListener('click', this.boundHandlers.playClick);
    muteBtn.addEventListener('click', this.boundHandlers.muteClick);
    seeker.addEventListener('mousedown', this.boundHandlers.seekerMousedown);
    seeker.addEventListener('touchstart', this.boundHandlers.seekerTouchstart, { passive: true });
    seeker.addEventListener('input', this.boundHandlers.seekerInput);
    seeker.addEventListener('change', this.boundHandlers.commitSeek);
    seeker.addEventListener('mouseup', this.boundHandlers.commitSeek);
    seeker.addEventListener('touchend', this.boundHandlers.commitSeek);

    speedBtn.addEventListener('click', this.boundHandlers.speedBtnClick);
    this.speedItemHandlers = [];
    speedItems.forEach((item) => {
      const handler = () => {
        const rate = parseFloat(item.dataset.speed);
        this.video.playbackRate = rate;
        speedMenu.classList.remove('open');
      };
      this.speedItemHandlers.push({ item, handler });
      item.addEventListener('click', handler);
    });

    document.addEventListener('click', this.boundHandlers.documentClick);
    fsBtn.addEventListener('click', this.boundHandlers.fsClick);

    // Video Listeners
    this.video.addEventListener('play', this.boundHandlers.videoPlay);
    this.video.addEventListener('pause', this.boundHandlers.videoPause);
    this.video.addEventListener('volumechange', this.boundHandlers.videoVolume);
    this.video.addEventListener('timeupdate', this.boundHandlers.videoTime);
    this.video.addEventListener('durationchange', this.boundHandlers.videoDuration);
    this.video.addEventListener('ratechange', this.boundHandlers.videoRate);
  }

  updatePlayState() {
    if (this.elements.playBtn) {
      this.elements.playBtn.textContent = this.video.paused ? '▶' : '❚❚';
    }
  }

  updateMuteState() {
    if (this.elements.muteBtn) {
      this.elements.muteBtn.textContent = this.video.muted ? '🔇' : '🔊';
    }
  }

  updateTimeState() {
    if (!this.elements.timeLabel) return;
    if (!this.isUserSeeking && this.video.duration) {
      const percent = (this.video.currentTime / this.video.duration) * 100;
      this.elements.seeker.value = percent;
    }
    this.elements.timeLabel.textContent = `${formatTime(this.video.currentTime)} / ${formatTime(this.video.duration)}`;
  }

  updateSpeedState() {
    if (!this.elements.speedBtn) return;
    const rate = this.video.playbackRate;
    this.elements.speedBtn.textContent = `${rate}x`;
    if (this.elements.speedItems) {
      this.elements.speedItems.forEach((item) => {
        if (parseFloat(item.dataset.speed) === rate) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    }
  }

  updateAllStates() {
    this.updatePlayState();
    this.updateMuteState();
    this.updateTimeState();
    this.updateSpeedState();
  }

  destroy() {
    if (!this.host) return;

    const { playBtn, muteBtn, seeker, speedBtn, fsBtn } = this.elements;
    const h = this.boundHandlers;

    if (h.playClick && playBtn) playBtn.removeEventListener('click', h.playClick);
    if (h.muteClick && muteBtn) muteBtn.removeEventListener('click', h.muteClick);
    if (seeker) {
      if (h.seekerMousedown) seeker.removeEventListener('mousedown', h.seekerMousedown);
      if (h.seekerTouchstart) seeker.removeEventListener('touchstart', h.seekerTouchstart);
      if (h.seekerInput) seeker.removeEventListener('input', h.seekerInput);
      if (h.commitSeek) {
        seeker.removeEventListener('change', h.commitSeek);
        seeker.removeEventListener('mouseup', h.commitSeek);
        seeker.removeEventListener('touchend', h.commitSeek);
      }
    }
    if (h.speedBtnClick && speedBtn) speedBtn.removeEventListener('click', h.speedBtnClick);
    if (this.speedItemHandlers) {
      this.speedItemHandlers.forEach(({ item, handler }) => {
        item.removeEventListener('click', handler);
      });
    }
    if (h.documentClick) document.removeEventListener('click', h.documentClick);
    if (h.fsClick && fsBtn) fsBtn.removeEventListener('click', h.fsClick);

    if (this.video && h.videoPlay) {
      this.video.removeEventListener('play', h.videoPlay);
      this.video.removeEventListener('pause', h.videoPause);
      this.video.removeEventListener('volumechange', h.videoVolume);
      this.video.removeEventListener('timeupdate', h.videoTime);
      this.video.removeEventListener('durationchange', h.videoDuration);
      this.video.removeEventListener('ratechange', h.videoRate);
    }

    if (this.host.parentElement) {
      this.host.parentElement.removeChild(this.host);
    }
    this.host = null;
    this.shadow = null;
  }
}
