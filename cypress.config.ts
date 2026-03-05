import { defineConfig } from 'cypress'

export default defineConfig({
  chromeWebSecurity: false,
  viewportWidth: 1280,
  viewportHeight: 720,
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {},
  },
})
