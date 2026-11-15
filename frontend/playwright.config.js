import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e-tests",
  fullyParallel: false, // tests share one SQLite DB
  workers: 1,
  use: {
    baseURL: "http://localhost:5174",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      // fresh DB on every run
      command:
        "rm -f e2e.sqlite3 && ./venv/bin/python manage.py migrate --noinput && ./venv/bin/python manage.py runserver 8001 --noreload",
      cwd: "../backend",
      env: { DJANGO_DB_NAME: "e2e.sqlite3" },
      url: "http://127.0.0.1:8001/admin/login/",
      reuseExistingServer: !process.env.CI,
    },
    {
      // separate ports from the dev servers (8000/5173), so a running dev
      // stack is never reused and tests never touch db.sqlite3
      command: "npx vite --port 5174 --strictPort",
      env: { API_TARGET: "http://127.0.0.1:8001" },
      url: "http://localhost:5174",
      reuseExistingServer: !process.env.CI,
    },
  ],
});
