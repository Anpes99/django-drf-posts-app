# Django DRF Posts App

A small posts app with a Django REST Framework API and a React frontend.

## Features

- Session authentication: sign up, log in, log out
- Create, read, update and delete posts (only the author can edit or delete their own posts)
- Upvote and downvote posts, with counters kept consistent under concurrent votes
- Post pages with comments (newest first, cursor pagination with "load more")
- Post search and pagination
- 64 backend tests with pytest and 6 end-to-end tests with Playwright

## Tech stack

**Backend:** Python, Django, Django REST Framework, SQLite
**Frontend:** React, Redux Toolkit, React Router, Axios, Vite
**Testing:** pytest, pytest-django, Playwright

## API endpoints

| Method             | Endpoint                    | Description                                                             |
| ------------------ | --------------------------- | ----------------------------------------------------------------------- |
| POST               | `/api/auth/signup/`         | Sign up                                                                 |
| POST               | `/api/auth/login/`          | Log in                                                                  |
| POST               | `/api/auth/logout/`         | Log out                                                                 |
| GET                | `/api/auth/me/`             | Current user                                                            |
| GET, POST          | `/api/posts/`               | List (search, paginated) / create posts                                 |
| GET, PATCH, DELETE | `/api/posts/<id>/`          | Retrieve / update / delete a post                                       |
| PUT                | `/api/posts/<id>/vote/`     | Upvote (`1`), downvote (`-1`) or remove your vote (`0`)                 |
| GET, POST          | `/api/posts/<id>/comments/` | List a post's comments (newest first, cursor-paginated) / add a comment |

All API errors return `{"error": {"message": "...", "fields": {...}}}`, where `fields` is only present for validation errors.
