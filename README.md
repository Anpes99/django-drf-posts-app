# Django DRF Posts App

[![CI](https://github.com/Anpes99/django-drf-posts-app/actions/workflows/ci.yml/badge.svg)](https://github.com/Anpes99/django-drf-posts-app/actions/workflows/ci.yml)

A posts app with a Django REST Framework API and a React frontend.

## Features
- Session authentication: sign up, log in, log out
- Create, read, update and delete posts (only the author can edit or delete their own posts)
- Post search and pagination
- Backend tests with pytest and end-to-end tests with Playwright

## Tech stack
**Backend:** Python, Django, Django REST Framework, SQLite
**Frontend:** React, Redux Toolkit, React Router, Axios, Vite
**Testing:** pytest, pytest-django, Playwright

## API endpoints
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup/` | Sign up |
| POST | `/api/auth/login/` | Log in |
| POST | `/api/auth/logout/` | Log out |
| GET | `/api/auth/me/` | Current user |
| GET, POST | `/api/posts/` | List (search, paginated) / create posts |
| GET, PATCH, DELETE | `/api/posts/<id>/` | Retrieve / update / delete a post |
