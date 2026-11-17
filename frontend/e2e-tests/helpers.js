import { expect } from "./fixtures.js";

export const signUp = async (page, username) => {
  await page.getByRole("button", { name: "Sign up" }).click();
  const signup = page.getByRole("dialog");
  await signup.getByLabel("Username").fill(username);
  await signup.getByLabel("Password").fill("S3cure-pass!");
  await signup.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("banner").getByText(username)).toBeVisible();
};

export const logOut = async (page) => {
  await page.getByRole("banner").getByRole("button", { name: "Log out" }).click();
  await expect(page.getByRole("banner").getByRole("button", { name: "Log in" })).toBeVisible();
};

export const createPost = async (page, title, text) => {
  await page.getByRole("button", { name: "New post" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Title").fill(title);
  await dialog.getByLabel("Text").fill(text);
  await dialog.getByRole("button", { name: "Publish" }).click();
  await expect(dialog).toBeHidden();
};
