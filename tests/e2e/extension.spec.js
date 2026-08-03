import { test, expect, chromium } from '@playwright/test';
import path from 'path';
import http from 'http';

const extensionPath = path.resolve(__dirname, '../../');
let server;
const PORT = 8085;

test.beforeAll(async () => {
  server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head><title>Instagram Mock</title></head>
        <body>
          <div class="_aaqg">
            <video id="test-video" width="400">
              <source src="data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAA1tZGF0AAAAAA==" type="video/mp4">
            </video>
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

test.describe('InstaPlayer Chrome Extension E2E Tests', () => {
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
  });

  test.afterEach(async () => {
    if (browserContext) {
      await browserContext.close();
    }
  });

  test('Extension injects Shadow DOM player overlay into Instagram mock container', async () => {
    await page.goto(`http://127.0.0.1:${PORT}/`);

    const host = page.locator('.instaplayer-host');
    await expect(host).toBeAttached({ timeout: 10000 });

    const playBtn = page.locator('.instaplayer-host').locator('css=.ip-play-btn');
    await expect(playBtn).toBeVisible();

    const muteBtn = page.locator('.instaplayer-host').locator('css=.ip-mute-btn');
    await expect(muteBtn).toBeVisible();

    const speedBtn = page.locator('.instaplayer-host').locator('css=.ip-speed-btn');
    await expect(speedBtn).toBeVisible();
  });

  test('Player controls interact directly with video element state', async () => {
    await page.goto(`http://127.0.0.1:${PORT}/`);

    await expect(page.locator('.instaplayer-host')).toBeAttached({ timeout: 10000 });

    const muteBtn = page.locator('.instaplayer-host').locator('css=.ip-mute-btn');

    // Click Mute button
    await muteBtn.click();
    const isMuted = await page.$eval('#test-video', v => v.muted);
    expect(isMuted).toBe(true);

    // Click Speed menu and select 2x speed
    const speedBtn = page.locator('.instaplayer-host').locator('css=.ip-speed-btn');
    await speedBtn.click();

    const speed2xOption = page.locator('.instaplayer-host').locator('css=.ip-speed-item[data-speed="2"]');
    await speed2xOption.click();

    const playbackRate = await page.$eval('#test-video', v => v.playbackRate);
    expect(playbackRate).toBe(2);
  });
});
