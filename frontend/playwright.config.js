import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e-tests",
  fullyParallel: false, // tests share one database
  workers: 1,
  use: {
    baseURL: "http://localhost:5174",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      // own database (posts_app_e2e), migrated and emptied on every run
      command:
        "./venv/bin/python manage.py migrate --noinput && ./venv/bin/python manage.py flush --noinput && ./venv/bin/python manage.py runserver 8001 --noreload",
      cwd: "../backend",
      env: { DJANGO_DB_NAME: "posts_app_e2e" },
      url: "http://127.0.0.1:8001/admin/login/",
      reuseExistingServer: !process.env.CI,
    },
    {
      // separate ports from the dev servers (8000/5173), so a running dev
      // stack is never reused and tests never touch the dev database
      command: "npx vite --port 5174 --strictPort",
      env: { API_TARGET: "http://127.0.0.1:8001" },
      url: "http://localhost:5174",
      reuseExistingServer: !process.env.CI,
    },
  ],
});
