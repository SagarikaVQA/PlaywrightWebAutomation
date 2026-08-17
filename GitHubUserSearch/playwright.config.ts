import { defineConfig, devices } from '@playwright/test';

export default defineConfig({

  testDir: './tests',

  timeout: 30 * 1000,

  expect: {
    timeout: 5000
  },

  use: {

    // Application URL
    baseURL: 'https://qaplayground.com',

    // Capture screenshot only when test fails
    screenshot: 'only-on-failure',

    // Keep trace when test fails
    trace: 'retain-on-failure',

    // Keep video when test fails
    video: 'retain-on-failure'
  },

  reporter: [
    ['html']
  ],

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome']
      }
    }
  ]
});