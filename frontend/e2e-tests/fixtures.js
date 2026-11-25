import { test as base, expect } from "@playwright/test";
import { execSync } from "node:child_process";

// Wipes the e2e DB before every test. `auto: true` means every test that
// imports `test` from this file gets it without asking for it.
export const test = base.extend({
  resetDb: [
    async ({}, use) => {
      execSync("./venv/bin/python manage.py flush --noinput", {
        cwd: "../backend",
        env: { ...process.env, DJANGO_DB_NAME: "posts_app_e2e" },
        stdio: "inherit",
      });
      await use();
    },
    { auto: true },
  ],
});

export { expect };
