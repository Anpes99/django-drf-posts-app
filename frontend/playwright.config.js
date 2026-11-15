import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e-tests",
  fullyParallel: false, // tests share one SQLite DB
  workers: 1,
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      // fresh DB on every run
      command:
        "rm -f e2e.sqlite3 && ./venv/bin/python manage.py migrate --noinput && ./venv/bin/python manage.py runserver 8000 --noreload",
      cwd: "../backend",
      env: { DJANGO_DB_NAME: "e2e.sqlite3" },
      url: "http://127.0.0.1:8000/admin/login/",
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "npm run dev",
      url: "http://localhost:5173",
      reuseExistingServer: !process.env.CI,
    },
  ],
});
