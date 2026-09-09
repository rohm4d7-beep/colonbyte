const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// GROQ_API_KEY, then GROQ_API_KEY_2, GROQ_API_KEY_3, GROQ_API_KEY_4, ... — any number of keys,
// scanned until a gap is hit. Each one is optional beyond the first, but MUST come from a
// genuinely SEPARATE Groq account, not just another key generated under the same one — Groq's
// rate limits (including the daily token cap) are scoped to the organization the key belongs
// to, so keys from the same account share one quota and splitting across them does nothing;
// each different account gets its own independent quota, which is what actually multiplies the
// usable daily budget. Add a 5th (or more) key later just by setting GROQ_API_KEY_5, etc. — no
// code change needed.
function loadKeys() {
  const keys = [process.env.GROQ_API_KEY].filter(Boolean);
  for (let i = 2; process.env[`GROQ_API_KEY_${i}`]; i++) {
    keys.push(process.env[`GROQ_API_KEY_${i}`]);
  }
  return keys;
}
const KEYS = loadKeys();

// Reads Groq's own suggested wait time off a 429 response — the `retry-after` header first,
// falling back to parsing "...try again in 27.1875s..." out of the error body (Groq's TPM-limit
// message includes this even without the header). Cloned so the original response body is still
// readable afterwards, whether we retry or this ends up being the final response a caller reads.
async function getRetryDelayMs(res, fallbackMs) {
  const headerVal = res.headers.get('retry-after');
  const headerSecs = Number(headerVal);
  if (headerVal && !Number.isNaN(headerSecs)) {
    return Math.min(Math.max(headerSecs * 1000, 250), 15000);
  }
  try {
    const text = await res.clone().text();
    const match = text.match(/try again in ([\d.]+)s/i);
    if (match) return Math.min(Math.max(parseFloat(match[1]) * 1000, 250), 15000);
  } catch {
    // Body already consumed or unreadable — fall through to the default.
  }
  return fallbackMs;
}

// Groq's 429 body distinguishes "tokens per minute" (TPM — a momentary burst, clears in
// seconds, worth a short backoff-and-retry) from "tokens per day" (TPD — the daily budget is
// genuinely spent, Groq's own suggested wait is typically 10-25+ minutes). Retrying a TPD
// exhaustion on a few-second timer is pure wasted latency: it will fail identically every time
// until the daily window rolls over, so it isn't worth a short wait at all.
async function isDailyLimitError(res) {
  try {
    const text = await res.clone().text();
    return /tokens per day|\(TPD\)/i.test(text);
  } catch {
    return false;
  }
}

/**
 * Shared Groq chat-completions call used by every analysis/generation service in this
 * pipeline (aiAnalysis, opportunityAnalysis, the four outreach generators, demoContentGenerator,
 * photoSelector). Tries each configured key in order, only moving to the next one when the
 * current one comes back rate-limited (429) — a real content/schema error on the first key is
 * NOT retried against the second, since the second key would just fail the same way and that
 * would only waste a request. This is deliberately a failover, not a round-robin split: it
 * exhausts the first key's daily budget before ever touching the second, which uses the combined
 * budget of both accounts without ever burning a request on a call that was going to fail.
 *
 * When EVERY key comes back 429 in the same round (the organization-wide per-minute token cap,
 * not the daily budget, since that's shared load across whatever else is calling these same
 * accounts right now), this backs off for Groq's own suggested wait and retries the full
 * rotation up to `maxRetryRounds` more times before giving up — a burst of "Analyze Now" clicks
 * hitting a momentary per-minute cap is exactly the case a caller shouldn't have to manually
 * retry for.
 *
 * Returns the raw fetch Response so callers keep their own existing res.ok/res.json() handling
 * unchanged — this only centralizes which key(s) a request is tried against. Returns null only
 * when no key is configured at all (callers already treat that as "feature disabled").
 */
export async function groqFetch(body, { timeoutMs = 30000, maxRetryRounds = 2 } = {}) {
  if (KEYS.length === 0) return null;

  for (let round = 0; round <= maxRetryRounds; round++) {
    let lastRes = null;
    for (let i = 0; i < KEYS.length; i++) {
      const res = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${KEYS[i]}`,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (res.status !== 429) return res;
      if (i < KEYS.length - 1) {
        console.warn(`[groqClient] Key ${i + 1}/${KEYS.length} rate-limited (429) — failing over to the next key.`);
      }
      lastRes = res;
    }

    if (round < maxRetryRounds && !(await isDailyLimitError(lastRes))) {
      const delay = await getRetryDelayMs(lastRes, 3000 * (round + 1));
      console.warn(
        `[groqClient] All ${KEYS.length} keys rate-limited — waiting ${Math.round(delay)}ms before retrying (attempt ${round + 2}/${maxRetryRounds + 1}).`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    } else {
      if (round < maxRetryRounds) {
        console.warn(
          `[groqClient] All ${KEYS.length} keys hit their daily token cap — that won't clear in seconds, so giving up now instead of retrying.`
        );
      }
      return lastRes;
    }
  }
}
