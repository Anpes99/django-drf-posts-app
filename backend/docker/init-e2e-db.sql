-- Runs once, when the Postgres volume is first created.
-- The e2e tests use their own database so they never touch your dev data.
CREATE DATABASE posts_app_e2e OWNER posts;
