import { defineConfig, devices } from '@playwright/test';
import path from 'path';

const extensionPath = path.resolve(__dirname);

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  use: {
    headless: false, // Chrome Extensions require non-headless mode in Chromium
    viewport: { width: 1280, height: 720 }
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            `--disable-extensions-except=${extensionPath}`,
            `--load-extension=${extensionPath}`
          ]
        }
      }
    }
  ]
});
