import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: '3a23c8',
  e2e: {
    baseUrl: 'http://localhost:3000/',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    viewportHeight: 1920,
    viewportWidth: 1080,
  },
});
