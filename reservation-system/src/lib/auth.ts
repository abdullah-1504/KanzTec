// =============================================================================
// Lightweight manager authentication. A single shared password (set via the
// MANAGER_PASSWORD env var) gates the /manager console. This is intentionally
// simple for launch — swap for real per-user accounts (NextAuth / Clerk /
// a database) later without touching the pages it protects.
//
// Runs in BOTH the Node API routes and the Edge middleware, so it only uses Web
// Crypto (available in both) — no Node-only APIs.
// =============================================================================

export const SESSION_COOKIE = 'tk_session';

/** The configured manager password (falls back to a dev default). */
export function getManagerPassword(): string {
  return process.env.MANAGER_PASSWORD || 'admin';
}

/**
 * Derive an opaque session token from the password. The raw password is never
 * stored in the cookie; the middleware recomputes the expected token from the
 * env var and compares.
 */
export async function sessionToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`tablekit::${password}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** The token a valid session cookie must match. */
export function expectedToken(): Promise<string> {
  return sessionToken(getManagerPassword());
}