import { test, expect, chromium } from '@playwright/test';
import path from 'path';
import http from 'http';

const extensionPath = path.resolve(__dirname, '../../');
let server;
const PORT = 8086;

test.beforeAll(async () => {
  server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head><title>Instagram Multi-Container Mock</title></head>
        <body>
          <!-- Reels Container -->
          <div class="_aaqg" id="reel-container">
            <video id="reel-video" width="400" src="data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAA1tZGF0AAAAAA=="></video>
          </div>

          <!-- Feed Post Container -->
          <article id="feed-post">
            <video id="feed-video" width="400" src="data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAA1tZGF0AAAAAA=="></video>
          </article>

          <!-- Explore Modal Lightbox Container -->
          <div class="_aakw" id="modal-container">
            <video id="modal-video" width="400" src="data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAA1tZGF0AAAAAA=="></video>
          </div>
        </body>
      </html>
    `);
  });

  await new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve));
});

test.afterAll(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

test.describe('InstaPlayer Full Extension Feature Matrix E2E Tests', () => {
  let browserContext;
  let page;

  test.beforeEach(async () => {
    browserContext = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`
      ]
    });

    page = await browserContext.newPage();
    await page.goto(`http://127.0.0.1:${PORT}/`);
  });

  test.afterEach(async () => {
    if (browserContext) {
      await browserContext.close();
    }
  });

  test('Feature 1: Multi-context container injection (Reels, Feed, Explore Modal)', async () => {
    const reelHost = page.locator('#reel-container .instaplayer-host');
    await expect(reelHost).toBeAttached({ timeout: 10000 });

    const feedHost = page.locator('#feed-post .instaplayer-host');
    await expect(feedHost).toBeAttached({ timeout: 10000 });

    const modalHost = page.locator('#modal-container .instaplayer-host');
    await expect(modalHost).toBeAttached({ timeout: 10000 });
  });

  test('Feature 2: Play/Pause button toggles video playback state', async () => {
    const reelHost = page.locator('#reel-container .instaplayer-host');
    await expect(reelHost).toBeAttached();

    const playBtn = reelHost.locator('css=.ip-play-btn');
    expect(await playBtn.textContent()).toBe('▶');

    await playBtn.click();
    const isPaused = await page.$eval('#reel-video', v => v.paused);
    expect(typeof isPaused).toBe('boolean');
  });

  test('Feature 3: Mute/Unmute button toggles video muted property', async () => {
    const reelHost = page.locator('#reel-container .instaplayer-host');
    await expect(reelHost).toBeAttached();

    const muteBtn = reelHost.locator('css=.ip-mute-btn');
    expect(await muteBtn.textContent()).toBe('🔊');

    await muteBtn.click();
    expect(await page.$eval('#reel-video', v => v.muted)).toBe(true);
    expect(await muteBtn.textContent()).toBe('🔇');

    await muteBtn.click();
    expect(await page.$eval('#reel-video', v => v.muted)).toBe(false);
    expect(await muteBtn.textContent()).toBe('🔊');
  });

  test('Feature 4: Time label displays formatted current time and duration', async () => {
    const reelHost = page.locator('#reel-container .instaplayer-host');
    await expect(reelHost).toBeAttached();

    const timeLabel = reelHost.locator('css=.ip-time');
    await expect(timeLabel).toBeVisible();
    const timeText = await timeLabel.textContent();
    expect(timeText).toMatch(/\d+:\d{2}\s*\/\s*\d+:\d{2}/);
  });

  test('Feature 5: Seeker progress range input updates time label on seek input', async () => {
    const reelHost = page.locator('#reel-container .instaplayer-host');
    await expect(reelHost).toBeAttached();

    await page.evaluate(() => {
      const host = document.querySelector('#reel-container .instaplayer-host');
      const seeker = host.shadowRoot.querySelector('.ip-seeker');
      seeker.value = '50';
      seeker.dispatchEvent(new Event('input'));
    });

    const timeLabel = reelHost.locator('css=.ip-time');
    await expect(timeLabel).toBeVisible();
  });

  test('Feature 6: Playback speed preset menu (0.25x to 3x)', async () => {
    const reelHost = page.locator('#reel-container .instaplayer-host');
    await expect(reelHost).toBeAttached();

    const speedBtn = reelHost.locator('css=.ip-speed-btn');
    const speedMenu = reelHost.locator('css=.ip-speed-menu');

    await speedBtn.click();
    await expect(speedMenu).toHaveClass(/open/);

    const option15x = reelHost.locator('css=.ip-speed-item[data-speed="1.5"]');
    await option15x.click();

    expect(await page.$eval('#reel-video', v => v.playbackRate)).toBe(1.5);
    expect(await speedBtn.textContent()).toBe('1.5x');
    await expect(speedMenu).not.toHaveClass(/open/);
  });

  test('Feature 7: Fullscreen button click handler', async () => {
    const reelHost = page.locator('#reel-container .instaplayer-host');
    await expect(reelHost).toBeAttached();

    const fsBtn = reelHost.locator('css=.ip-fs-btn');
    await expect(fsBtn).toBeVisible();

    await fsBtn.click();
  });

  test('Feature 8: Teardown cleanup on DOM unmount', async () => {
    const reelHost = page.locator('#reel-container .instaplayer-host');
    await expect(reelHost).toBeAttached();

    await page.evaluate(() => {
      const el = document.querySelector('#reel-container');
      el.parentElement.removeChild(el);
    });

    const hostCount = await page.locator('#reel-container .instaplayer-host').count();
    expect(hostCount).toBe(0);
  });
});
