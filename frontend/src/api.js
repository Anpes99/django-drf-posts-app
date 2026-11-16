import axios from "axios";

// Axios instance for the Django API (requests go through the Vite proxy).
const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  // Django's CSRF cookie/header names; axios attaches the token automatically
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
});

// Turn an axios error into a readable message.
// Every API error has the shape {error: {message, fields?}}, where
// `message` is ready to display and `fields` maps field names to messages.
export function getErrorMessage(err) {
  return (
    err.response?.data?.error?.message ??
    "Something went wrong. Please try again."
  );
}

export default api;
