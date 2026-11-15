import { test, expect } from "./fixtures.js";

test("user can sign up and create a post", async ({ page }) => {
  const username = `user_${Date.now()}`;

  await page.goto("/");
  await page.getByRole("button", { name: "Sign up" }).click();

  const signup = page.getByRole("dialog"); // only the open <dialog> is visible
  await expect(signup.getByRole("heading", { name: "Sign up" })).toBeVisible();
  await signup.getByLabel("Username").fill(username);
  await signup.getByLabel("Password").fill("S3cure-pass!");
  await signup.getByRole("button", { name: "Create account" }).click();

  await expect(page.getByRole("banner").getByText(username)).toBeVisible();

  await page.getByRole("button", { name: "New post" }).click();
  const postDialog = page.getByRole("dialog");
  await postDialog.getByLabel("Title").fill("New created test post 12345");
  await postDialog.getByLabel("Text").fill("Test post text content1");
  await postDialog.getByRole("button", { name: "Publish" }).click();

  await expect(postDialog).toBeHidden();

  // exact feed contents, so it can't pass against a stale list
  const feed = page.getByRole("article");
  await expect(feed.getByRole("heading")).toHaveText([
    "New created test post 12345",
  ]);
  await expect(feed.locator(".post-text")).toHaveText([
    "Test post text content1",
  ]);
});

test("user can sign up, log out and log in", async ({ page }) => {
  const username = `user_${Date.now()}`;
  const password = "S3cure-pass!";
  const banner = page.getByRole("banner");

  await page.goto("/");
  await page.getByRole("button", { name: "Sign up" }).click();
  const signup = page.getByRole("dialog");
  await signup.getByLabel("Username").fill(username);
  await signup.getByLabel("Password").fill(password);
  await signup.getByRole("button", { name: "Create account" }).click();
  await expect(banner.getByText(username)).toBeVisible();

  await banner.getByRole("button", { name: "Log out" }).click();
  await expect(banner.getByText(username)).toBeHidden();
  await expect(banner.getByRole("button", { name: "Log in" })).toBeVisible();

  await banner.getByRole("button", { name: "Log in" }).click();
  const login = page.getByRole("dialog");
  await expect(login.getByRole("heading", { name: "Log in" })).toBeVisible();
  await login.getByLabel("Username").fill(username);
  await login.getByLabel("Password").fill(password);
  await login.getByRole("button", { name: "Log in" }).click();

  await expect(login).toBeHidden();
  await expect(banner.getByText(username)).toBeVisible();
  await expect(banner.getByRole("button", { name: "New post" })).toBeVisible();

  // session survives a reload
  await page.reload();
  await expect(banner.getByText(username)).toBeVisible();
});

test("user can search posts by title and text", async ({ page }) => {
  const username = `user_${Date.now()}`;

  await page.goto("/");
  await page.getByRole("button", { name: "Sign up" }).click();
  const signup = page.getByRole("dialog");
  await signup.getByLabel("Username").fill(username);
  await signup.getByLabel("Password").fill("S3cure-pass!");
  await signup.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("banner").getByText(username)).toBeVisible();

  const posts = [
    { title: "Test post title1", text: "Test post text1" },
    { title: "Test post title2", text: "Test post text2" },
    { title: "Test post title3", text: "Test post text3" },
  ];
  for (const post of posts) {
    await page.getByRole("button", { name: "New post" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Title").fill(post.title);
    await dialog.getByLabel("Text").fill(post.text);
    await dialog.getByRole("button", { name: "Publish" }).click();
    await expect(dialog).toBeHidden();
  }

  for (const post of posts) {
    await expect(page.getByText(post.title)).toBeVisible();
  }

  const search = page.getByRole("searchbox", { name: "Search posts" });

  // matches the title, case-insensitively
  await search.fill("TITLE1");
  await search.press("Enter");
  await expect(page.getByText("Test post title2")).toBeHidden();
  await expect(page.getByText("Test post title3")).toBeHidden();
  await expect(page.getByText("Test post title1")).toBeVisible();

  // finds many posts
  await search.fill("post");
  await search.press("Enter");

  await expect(page.getByText("Test post title2")).toBeVisible();
  await expect(page.getByText("Test post title1")).toBeVisible();
  await expect(page.getByText("Test post title3")).toBeVisible();

  // matches the text
  await search.fill("text2");
  await search.press("Enter");
  await expect(page.getByText("Test post title1")).toBeHidden();
  await expect(page.getByText("Test post title3")).toBeHidden();
  await expect(page.getByText("Test post title2")).toBeVisible();

  // no matches
  await search.fill("no results");
  await search.press("Enter");
  for (const post of posts) {
    await expect(page.getByText(post.title)).toBeHidden();
  }

  // clearing the field shows everything again
  await search.clear();
  for (const post of posts) {
    await expect(page.getByText(post.title)).toBeVisible();
  }
});
