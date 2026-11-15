import axios from 'axios'

// Axios instance for the Django API (requests go through the Vite proxy).
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  // Django's CSRF cookie/header names; axios attaches the token automatically
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
})

// Turn an axios error into a readable message.
// Backend sends {error: "..."}, {error: [...]} or field errors
// {error: {title: [...]}}; DRF sends {detail: "..."}.
export function getErrorMessage(err) {
  const data = err.response?.data
  const msg = data?.error ?? data?.detail
  if (Array.isArray(msg)) return msg.join('\n')
  if (typeof msg === 'string') return msg
  if (msg && typeof msg === 'object') return Object.values(msg).flat().join('\n')
  return 'Something went wrong. Please try again.'
}

export default api
