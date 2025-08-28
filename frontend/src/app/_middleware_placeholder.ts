// src/app/_middleware_placeholder.ts
// Placeholder - real middleware lives in src/middleware.ts (Next will pick it up)
// This file exists only to prevent accidental route handling by pages in some setups.
export default function noop() {
  return null;
}
