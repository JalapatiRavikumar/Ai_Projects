// API base URL.
//
// Priority:
//  1. REACT_APP_API_BASE_URL  -> explicit backend URL (set this for split hosting,
//     e.g. Vercel frontend + Render backend).
//  2. REACT_APP_SAME_ORIGIN === "true" -> use relative paths ("") so the app calls
//     the API on the same origin it was served from. Used for the single-origin /
//     single-tunnel deployment (frontend served by a proxy that forwards /api).
//  3. Fallback -> local backend on http://localhost:8080 for plain `npm start` dev.
export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.REACT_APP_SAME_ORIGIN === "true" ? "" : "http://localhost:8080");
