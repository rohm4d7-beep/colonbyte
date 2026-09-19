// Extracted from routes/leads.js so it's unit-testable in isolation (brief section 19: "status
// transitions" needs test coverage) - behavior is unchanged, this is the exact same function
// that was previously defined inline there.
//
// A no-op when the lead is already at `status` - this is what makes every caller's "only
// advance forward" guard (e.g. `if (['new','contacted','delivered'].includes(lead.status))`)
// safe to call even when the lead is already past that point: it simply won't match the guard,
// so setStatus is never reached, and even if a caller forgot the guard, setting a lead to its
// own current status would still never push a spurious duplicate entry onto statusHistory.
export function setStatus(lead, status, { source = 'human', note = '' } = {}) {
  if (lead.status === status) return;
  lead.status = status;
  lead.statusHistory.push({ status, changedAt: new Date(), source, note });
}
