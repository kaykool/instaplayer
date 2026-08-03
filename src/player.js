/**
 * InstaPlayer Controller & Shadow DOM Builder
 */

class InstaPlayerUI {
  /**
   * @param {HTMLVideoElement} videoElement
   * @param {HTMLElement} [customContainer]
   */
  constructor(videoElement, customContainer = null) {
    this.video = videoElement;
    this.host = null;
    this.shadow = null;
    this.elements = {};
    this.isUserSeeking = false;
    this.userExplicitlyUnmuted = !videoElement.muted;
    this.boundHandlers = {};
    this.videoPlayerWrapper = null;
    this.originalWrapperHeight = '';
    this.disabledOverlays = [];

    if (!this.init(customContainer)) {
      return;
    }

    this.bindEvents();
    this.updateAllStates();
  }

  /**
   * Initialize Shadow DOM host and attach overlay
   * @param {HTMLElement} [customContainer]
   * @returns {boolean} Success status
   */
  init(customContainer) {
    const parent = customContainer || this.video.parentElement;
    if (!parent) return false;

    // Adjust Instagram video player overlay container height (calc(100% - 38px)) so bar sits cleanly underneath
    this.videoPlayerWrapper = parent.querySelector('div[aria-label="Video player"]') ||
                              this.video.closest('div[aria-label="Video player"]') ||
                              this.video.closest('div.x5yr21d') ||
                              this.video.parentElement;

    if (this.videoPlayerWrapper && this.videoPlayerWrapper !== parent) {
      this.originalWrapperHeight = this.videoPlayerWrapper.style.height || '';
      this.videoPlayerWrapper.style.setProperty('height', 'calc(100% - 38px)', 'important');
    }

    // Disable pointer-events on native Instagram transparent click-intercepting overlays in parent
    const nativeOverlays = parent.querySelectorAll('div._aav3, div[role="slider"], div[role="button"].x1i10hfl');
    nativeOverlays.forEach((overlay) => {
      if (overlay && !overlay.classList.contains('instaplayer-host')) {
        this.disabledOverlays.push({ element: overlay, prevPointer: overlay.style.pointerEvents });
        overlay.style.setProperty('pointer-events', 'none', 'important');
      }
    });

    // Create host container with explicit maximum z-index in light DOM
    this.host = document.createElement('div');
    this.host.className = 'instaplayer-host';
    this.host.style.setProperty('position', 'absolute', 'important');
    this.host.style.setProperty('bottom', '0', 'important');
    this.host.style.setProperty('left', '0', 'important');
    this.host.style.setProperty('right', '0', 'important');
    this.host.style.setProperty('width', '100%', 'important');
    this.host.style.setProperty('height', '38px', 'important');
    this.host.style.setProperty('z-index', '2147483647', 'important');
    this.host.style.setProperty('pointer-events', 'auto', 'important');

    // Attach Shadow DOM root
    this.shadow = this.host.attachShadow({ mode: 'open' });

    // Inject styles with maximum 32-bit integer z-index (2147483647)
    const style = document.createElement('style');
    style.textContent = `
      :host { display: block !important; position: absolute !important; bottom: 0 !important; left: 0 !important; right: 0 !important; width: 100% !important; height: 38px !important; z-index: 2147483647 !important; pointer-events: auto !important; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; user-select: none; }
      .ip-bar { display: flex; align-items: center; gap: 8px; height: 38px; padding: 0 12px; background: rgba(0, 0, 0, 0.85); border-top: 1px solid rgba(255, 255, 255, 0.12); box-sizing: border-box; color: #ffffff; pointer-events: auto !important; position: relative !important; z-index: 2147483647 !important; }
      .ip-btn { background: transparent; border: none; color: #ffffff; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; padding: 4px 6px; border-radius: 4px; font-size: 13px; line-height: 1; pointer-events: auto !important; position: relative !important; z-index: 2147483647 !important; }
      .ip-btn:hover { background: rgba(255, 255, 255, 0.15); }
      .ip-btn:focus-visible, .ip-seeker:focus-visible, .ip-speed-item:focus-visible { outline: 2px solid #3897f0; outline-offset: 2px; }
      .ip-time { font-size: 12px; font-variant-numeric: tabular-nums; color: rgba(255, 255, 255, 0.9); white-space: nowrap; pointer-events: auto !important; position: relative !important; z-index: 2147483647 !important; }
      .ip-seeker-container { flex: 1; display: flex; align-items: center; margin: 0 6px; pointer-events: auto !important; position: relative !important; z-index: 2147483647 !important; }
      .ip-seeker { -webkit-appearance: none; appearance: none; width: 100%; height: 8px; background: rgba(255, 255, 255, 0.3); border-radius: 4px; cursor: pointer; pointer-events: auto !important; position: relative !important; z-index: 2147483647 !important; }
      .ip-seeker::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #ffffff; cursor: pointer; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4); transition: transform 0.1s ease; }
      .ip-seeker::-webkit-slider-thumb:hover { transform: scale(1.2); }
      .ip-seeker::-moz-range-thumb { width: 16px; height: 16px; border-radius: 50%; background: #ffffff; border: none; cursor: pointer; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4); transition: transform 0.1s ease; }
      .ip-seeker::-moz-range-thumb:hover { transform: scale(1.2); }
      .ip-speed-wrapper { position: relative !important; pointer-events: auto !important; z-index: 2147483647 !important; }
      .ip-speed-menu { display: none; position: absolute; bottom: 100%; right: 0; margin-bottom: 6px; background: #121212; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 6px; padding: 4px 0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5); z-index: 2147483647 !important; min-width: 64px; pointer-events: auto !important; }
      .ip-speed-menu.open { display: block; }
      .ip-speed-item { display: block; width: 100%; padding: 6px 12px; background: transparent; border: none; color: #ffffff; font-size: 12px; text-align: center; cursor: pointer; pointer-events: auto !important; position: relative !important; z-index: 2147483647 !important; }
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
      speedItems: bar.querySelectorAll('.ip-speed-item')
    };

    // Ensure parent position is relative/absolute
    if (getComputedStyle(parent).position === 'static') {
      parent.style.position = 'relative';
    }

    // Append host as last child of parent
    parent.appendChild(this.host);
    return true;
  }

  bindEvents() {
    const { playBtn, muteBtn, seeker, speedBtn, speedMenu, speedItems } = this.elements;

    // Helper to stop event propagation so Instagram click-to-pause handlers do not intercept control clicks
    const stopEvt = (e) => {
      if (e) {
        if (typeof e.stopPropagation === 'function') e.stopPropagation();
        if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
      }
    };

    // Bubble-phase event traps on host to stop events from escaping to Instagram outer container
    ['click', 'mousedown', 'mouseup', 'pointerdown', 'pointerup', 'touchstart', 'touchend', 'contextmenu'].forEach((evtType) => {
      this.host.addEventListener(evtType, stopEvt, false);
    });

    // Define bound handlers for cleanup
    this.boundHandlers = {
      playClick: (e) => {
        stopEvt(e);
        if (this.video.paused) {
          const promise = this.video.play();
          if (promise && typeof promise.then === 'function') {
            promise.then(() => {
              if (this.userExplicitlyUnmuted && this.video.muted) {
                this.video.muted = false;
              }
            }).catch(() => {});
          } else {
            if (this.userExplicitlyUnmuted && this.video.muted) {
              this.video.muted = false;
            }
          }
        } else {
          this.video.pause();
        }
      },
      muteClick: (e) => {
        stopEvt(e);
        this.video.muted = !this.video.muted;
        this.userExplicitlyUnmuted = !this.video.muted;
      },
      seekerMousedown: (e) => {
        stopEvt(e);
        this.isUserSeeking = true;
      },
      seekerTouchstart: (e) => {
        stopEvt(e);
        this.isUserSeeking = true;
      },
      seekerInput: (e) => {
        stopEvt(e);
        if (this.video.duration) {
          const targetTime = (parseFloat(seeker.value) / 100) * this.video.duration;
          this.elements.timeLabel.textContent = `${formatTime(targetTime)} / ${formatTime(this.video.duration)}`;
        }
      },
      commitSeek: (e) => {
        stopEvt(e);
        if (this.video.duration) {
          this.video.currentTime = (parseFloat(seeker.value) / 100) * this.video.duration;
        }
        this.isUserSeeking = false;
      },
      speedBtnClick: (e) => {
        stopEvt(e);
        speedMenu.classList.toggle('open');
      },
      documentClick: (e) => {
        if (this.host && !this.host.contains(e.target)) {
          speedMenu.classList.remove('open');
        }
      },
      videoPlay: () => {
        this.updatePlayState();
        if (this.userExplicitlyUnmuted && this.video.muted) {
          this.video.muted = false;
        }
      },
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
    seeker.addEventListener('touchstart', this.boundHandlers.seekerTouchstart, { passive: false });
    seeker.addEventListener('input', this.boundHandlers.seekerInput);
    seeker.addEventListener('change', this.boundHandlers.commitSeek);
    seeker.addEventListener('mouseup', this.boundHandlers.commitSeek);
    seeker.addEventListener('touchend', this.boundHandlers.commitSeek);

    speedBtn.addEventListener('click', this.boundHandlers.speedBtnClick);
    this.speedItemHandlers = [];
    speedItems.forEach((item) => {
      const handler = (e) => {
        stopEvt(e);
        const rate = parseFloat(item.dataset.speed);
        this.video.playbackRate = rate;
        speedMenu.classList.remove('open');
      };
      this.speedItemHandlers.push({ item, handler });
      item.addEventListener('click', handler);
    });

    document.addEventListener('click', this.boundHandlers.documentClick);

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

    // Restore video player wrapper height
    if (this.videoPlayerWrapper) {
      if (this.originalWrapperHeight) {
        this.videoPlayerWrapper.style.height = this.originalWrapperHeight;
      } else {
        this.videoPlayerWrapper.style.removeProperty('height');
      }
    }

    // Restore disabled native overlays
    if (this.disabledOverlays) {
      this.disabledOverlays.forEach(({ element, prevPointer }) => {
        if (element) {
          if (prevPointer) {
            element.style.pointerEvents = prevPointer;
          } else {
            element.style.removeProperty('pointer-events');
          }
        }
      });
      this.disabledOverlays = [];
    }

    const { playBtn, muteBtn, seeker, speedBtn } = this.elements;
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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = InstaPlayerUI;
}
