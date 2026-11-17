import { test, expect } from "./fixtures.js";
import { createPost, logOut, signUp } from "./helpers.js";

const comments = (page) => page.getByRole("region", { name: "Comments" });

const addComment = async (page, text) => {
  const section = comments(page);
  await section.getByLabel("Add a comment").fill(text);
  await section.getByRole("button", { name: "Comment" }).click();
  await expect(
    section.getByRole("listitem").filter({ hasText: text }),
  ).toBeVisible();
};

// Sign up, create a post and open its page from the feed.
const openNewPost = async (page, title) => {
  await page.goto("/");
  await signUp(page, `user_${Date.now()}`);
  await createPost(page, title, "Post text for comments");
  await page.getByRole("link", { name: title }).click();
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
};

test("user can comment on a post", async ({ page }) => {
  await openNewPost(page, "Commented post");
  const section = comments(page);

  await expect(section.getByText("No comments yet.")).toBeVisible();

  await addComment(page, "commenttext1");
  await addComment(page, "commenttext2");

  // newest first, and the form is cleared after posting
  await expect(
    section.getByRole("listitem").locator(".comment-text"),
  ).toHaveText(["commenttext2", "commenttext1"]);
  await expect(section.getByLabel("Add a comment")).toHaveValue("");
  await expect(section.getByText("No comments yet.")).toBeHidden();

  // the comments are saved on the server, not just in the UI
  await page.reload();
  await expect(
    section.getByRole("listitem").locator(".comment-text"),
  ).toHaveText(["commenttext2", "commenttext1"]);
});

test("logged-out user can read comments but not comment", async ({ page }) => {
  await openNewPost(page, "Read-only comments");
  await addComment(page, "commenttext1");
  await logOut(page);

  const section = comments(page);
  await expect(
    section.getByRole("listitem").locator(".comment-text"),
  ).toHaveText(["commenttext1"]);
  await expect(section.getByText("Log in to comment.")).toBeVisible();
  await expect(section.getByLabel("Add a comment")).toHaveCount(0);
});

test("load more shows older comments once each", async ({ page }) => {
  await openNewPost(page, "Many comments");
  // one more than a page (CommentPagination.page_size = 5)
  for (let i = 1; i <= 6; i++) await addComment(page, `commenttext${i}`);

  // a fresh load shows only the first page, newest first
  await page.reload();
  const section = comments(page);
  const texts = section.getByRole("listitem").locator(".comment-text");
  await expect(texts).toHaveText([
    "commenttext6",
    "commenttext5",
    "commenttext4",
    "commenttext3",
    "commenttext2",
  ]);

  await section.getByRole("button", { name: "Load more comments" }).click();
  await expect(texts).toHaveText([
    "commenttext6",
    "commenttext5",
    "commenttext4",
    "commenttext3",
    "commenttext2",
    "commenttext1",
  ]);
  await expect(
    section.getByRole("button", { name: "Load more comments" }),
  ).toBeHidden();
});

test("missing post shows not found", async ({ page }) => {
  await page.goto("/posts/999999");

  await expect(
    page.getByRole("heading", { name: "Post not found" }),
  ).toBeVisible();
  await expect(comments(page)).toHaveCount(0);
});
