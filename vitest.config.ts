import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    test: {
      globals: true,
      environment: 'node',
      env: {
        VITE_APPS_SCRIPT_URL: env.VITE_APPS_SCRIPT_URL,
      },
      testTimeout: 30000,
      hookTimeout: 30000,
      sequence: { concurrent: false },
    },
  };
});
