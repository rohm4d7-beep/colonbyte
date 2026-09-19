import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { FUNNEL_STAGES, shapeFunnelResult } from '../services/funnelStages.js';

describe('shapeFunnelResult', () => {
  test('computes percentage of the top-of-funnel (scraped) count for each stage', () => {
    const row = { scraped: 200, verified: 200, qualified: 100, approved: 50 };
    const result = shapeFunnelResult(row);
    assert.equal(result.find((s) => s.key === 'qualified').pctOfTotal, 50);
    assert.equal(result.find((s) => s.key === 'approved').pctOfTotal, 25);
  });

  test('returns every stage in FUNNEL_STAGES, defaulting missing counts to 0', () => {
    const result = shapeFunnelResult({ scraped: 10 });
    assert.equal(result.length, FUNNEL_STAGES.length);
    assert.equal(result.find((s) => s.key === 'won').count, 0);
    assert.equal(result.find((s) => s.key === 'won').pctOfTotal, 0);
  });

  test('a null/undefined row (no matching documents) never throws - everything is 0', () => {
    const result = shapeFunnelResult(null);
    assert.equal(result.every((s) => s.count === 0 && s.pctOfTotal === 0), true);
  });

  test('zero scraped leads never divides by zero', () => {
    const result = shapeFunnelResult({ scraped: 0, qualified: 0 });
    assert.equal(result.find((s) => s.key === 'qualified').pctOfTotal, 0);
  });

  test('preserves FUNNEL_STAGES order (Scraped first, Won last)', () => {
    const result = shapeFunnelResult({ scraped: 5 });
    assert.equal(result[0].key, 'scraped');
    assert.equal(result[result.length - 1].key, 'won');
  });
});
