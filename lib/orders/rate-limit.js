import { createHash } from 'node:crypto';

const attempts = new Map();
const WINDOW_MS = 60_000;
const LIMIT = 12;

export function allowTrackingAttempt(ip, phone) {
  const key = createHash('sha256').update(`${ip || 'unknown'}:${phone || ''}`).digest('hex');
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || now - current.startedAt >= WINDOW_MS) { attempts.set(key, { startedAt: now, count: 1 }); return true; }
  if (current.count >= LIMIT) return false;
  current.count += 1;
  return true;
}
