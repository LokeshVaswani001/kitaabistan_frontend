/** Minimal in-memory sliding-window limiter for auth attempts.
 *  Enough to blunt brute-force on a single node; swap for a shared store
 *  when running multiple instances. */
const buckets = new Map();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 12;

export function rateLimit(key) {
  const now = Date.now();
  const hits = (buckets.get(key) || []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= MAX_ATTEMPTS) {
    return { ok: false, retryAfterMs: WINDOW_MS - (now - hits[0]) };
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) buckets.clear(); // crude memory guard
  return { ok: true };
}

export function clearRateLimit(key) {
  buckets.delete(key);
}
