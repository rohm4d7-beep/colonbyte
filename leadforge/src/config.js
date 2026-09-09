// Empty string in local dev - every /api call is relative, so Vite's own dev-server proxy
// (vite.config.js) forwards it to the backend, and the browser sees it as same-origin (no CORS,
// cookies "just work"). Once the dashboard is deployed as its own static site (e.g. Vercel),
// there's no dev-server proxy anymore - it has to call the deployed backend directly across
// origins, which is what VITE_API_BASE_URL is for (set in that deployment's env vars).
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

// A cross-origin request needs credentials: 'include' or the browser simply won't attach the
// session cookie - same-origin (local dev, via the proxy) doesn't strictly need it, but it's
// harmless there too, so every call goes through this instead of bare fetch().
export function apiFetch(url, options = {}) {
  return fetch(url, { ...options, credentials: 'include' });
}

export default API_BASE;
