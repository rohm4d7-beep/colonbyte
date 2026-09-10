// In-memory per-key daily usage tracking for the shared Groq token pool (see groqClient.js).
// Groq only tells us the exact "Used X / Limit Y" numbers when a key actually hits its daily
// cap (TPD) — there's no endpoint to just ask "how much is left". So the numbers here are a mix
// of two sources: an exact, authoritative sync whenever a 429 daily-cap error happens (the
// ground truth), and a running estimate (successful calls' `usage.total_tokens`) added on top of
// the last sync. This resets to zero on every server restart, same as the process itself — it is
// not a substitute for Groq's own dashboard, just enough to see today's picture without manually
// probing each key like we did by hand.

const DEFAULT_DAILY_LIMIT = 200000;

const state = new Map();

function ensure(keyIndex) {
  if (!state.has(keyIndex)) {
    state.set(keyIndex, {
      limit: DEFAULT_DAILY_LIMIT,
      confirmedUsed: null,
      confirmedAt: null,
      estimatedSinceConfirm: 0,
      capped: false,
      resetAt: null,
      lastCallAt: null,
    });
  }
  return state.get(keyIndex);
}

// Called once at startup with how many keys are configured, so the snapshot always lists every
// key (as "no data yet") even before any of them has taken a request.
export function registerKeyCount(count) {
  for (let i = 1; i <= count; i++) ensure(i);
}

export function recordSuccess(keyIndex, tokensUsed) {
  const s = ensure(keyIndex);
  s.lastCallAt = Date.now();
  if (typeof tokensUsed === 'number' && Number.isFinite(tokensUsed)) {
    s.estimatedSinceConfirm += tokensUsed;
  }
  // A call that just succeeded proves this key isn't capped right now, regardless of what an
  // earlier resetAt estimate said.
  s.capped = false;
}

export function recordDailyCapHit(keyIndex, { used, limit, retryAfterMs } = {}) {
  const s = ensure(keyIndex);
  s.lastCallAt = Date.now();
  s.capped = true;
  if (typeof used === 'number') {
    s.confirmedUsed = used;
    s.confirmedAt = Date.now();
    s.estimatedSinceConfirm = 0;
  }
  if (typeof limit === 'number') s.limit = limit;
  s.resetAt = typeof retryAfterMs === 'number' ? Date.now() + retryAfterMs : null;
}

export function getSnapshot() {
  return [...state.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([keyIndex, s]) => {
      const used = (s.confirmedUsed ?? 0) + s.estimatedSinceConfirm;
      return {
        keyIndex,
        used,
        limit: s.limit,
        percentUsed: Math.min(100, Math.round((used / s.limit) * 100)),
        capped: s.capped,
        resetAt: s.resetAt,
        // False until a 429 has actually pinned down a real "Used" number for this key — until
        // then `used` is only the estimate accumulated since this process started, which
        // undercounts whatever the key had already used before that.
        confirmed: s.confirmedUsed !== null,
        lastCallAt: s.lastCallAt,
      };
    });
}
