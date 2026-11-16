import { test, expect } from "./fixtures.js";

const signUp = async (page, username) => {
  await page.getByRole("button", { name: "Sign up" }).click();
  const signup = page.getByRole("dialog");
  await signup.getByLabel("Username").fill(username);
  await signup.getByLabel("Password").fill("S3cure-pass!");
  await signup.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("banner").getByText(username)).toBeVisible();
};

const createPost = async (page, title, text) => {
  await page.getByRole("button", { name: "New post" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Title").fill(title);
  await dialog.getByLabel("Text").fill(text);
  await dialog.getByRole("button", { name: "Publish" }).click();
  await expect(dialog).toBeHidden();
};

test("user can upvote, downvote and remove a vote", async ({ page }) => {
  await page.goto("/");
  await signUp(page, `user_${Date.now()}`);
  await createPost(page, "Vote test post", "Vote test text");

  const post = page.getByRole("article").filter({ hasText: "Vote test post" });
  const upvote = post.getByRole("button", { name: "Upvote" });
  const downvote = post.getByRole("button", { name: "Downvote" });
  const score = post.getByLabel("Score");

  await expect(score).toHaveText("0");

  // upvote
  await upvote.click();
  await expect(score).toHaveText("1");
  await expect(upvote).toHaveAttribute("aria-pressed", "true");
  await expect(downvote).toHaveAttribute("aria-pressed", "false");

  // switching to a downvote moves the vote
  await downvote.click();
  await expect(score).toHaveText("-1");
  await expect(upvote).toHaveAttribute("aria-pressed", "false");
  await expect(downvote).toHaveAttribute("aria-pressed", "true");

  // clicking the active arrow again removes the vote
  await downvote.click();
  await expect(score).toHaveText("0");
  await expect(downvote).toHaveAttribute("aria-pressed", "false");

  // the vote is saved on the server, not just in the UI
  await upvote.click();
  await expect(score).toHaveText("1");
  await page.reload();
  await expect(score).toHaveText("1");
  await expect(upvote).toHaveAttribute("aria-pressed", "true");
});

test("votes from different users add up", async ({ page }) => {
  await page.goto("/");
  await signUp(page, `author_${Date.now()}`);
  await createPost(page, "Shared post", "Shared text");

  const post = page.getByRole("article").filter({ hasText: "Shared post" });
  const upvote = post.getByRole("button", { name: "Upvote" });
  const score = post.getByLabel("Score");

  await upvote.click();
  await expect(score).toHaveText("1");

  await page
    .getByRole("banner")
    .getByRole("button", { name: "Log out" })
    .click();
  await signUp(page, `voter_${Date.now()}`);

  // the second user sees the total, but not the first user's vote as their own
  await expect(score).toHaveText("1");
  await expect(upvote).toHaveAttribute("aria-pressed", "false");

  await upvote.click();
  await expect(score).toHaveText("2");
  await expect(upvote).toHaveAttribute("aria-pressed", "true");
});

test("logged-out user cannot vote", async ({ page }) => {
  await page.goto("/");
  await signUp(page, `user_${Date.now()}`);
  await createPost(page, "Read-only post", "Read-only text");
  await page
    .getByRole("banner")
    .getByRole("button", { name: "Log out" })
    .click();

  const post = page.getByRole("article").filter({ hasText: "Read-only post" });
  await expect(post.getByLabel("Score")).toHaveText("0");
  await expect(post.getByRole("button", { name: "Upvote" })).toBeDisabled();
  await expect(post.getByRole("button", { name: "Downvote" })).toBeDisabled();
});
