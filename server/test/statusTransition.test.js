import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { setStatus } from '../services/statusTransition.js';

function makeLead(status) {
  return { status, statusHistory: [] };
}

describe('setStatus', () => {
  test('changes status and pushes a history entry', () => {
    const lead = makeLead('new');
    setStatus(lead, 'contacted', { source: 'system', note: 'test' });
    assert.equal(lead.status, 'contacted');
    assert.equal(lead.statusHistory.length, 1);
    assert.equal(lead.statusHistory[0].status, 'contacted');
    assert.equal(lead.statusHistory[0].source, 'system');
    assert.equal(lead.statusHistory[0].note, 'test');
    assert.ok(lead.statusHistory[0].changedAt instanceof Date);
  });

  test('is a no-op when already at the target status - no duplicate history entry', () => {
    const lead = makeLead('contacted');
    setStatus(lead, 'contacted', { source: 'system' });
    assert.equal(lead.statusHistory.length, 0);
  });

  test('defaults source to "human" when not given', () => {
    const lead = makeLead('new');
    setStatus(lead, 'contacted');
    assert.equal(lead.statusHistory[0].source, 'human');
  });

  test('multiple transitions in sequence each record their own history entry', () => {
    const lead = makeLead('new');
    setStatus(lead, 'contacted', { source: 'system', note: 'first' });
    setStatus(lead, 'replied', { source: 'system', note: 'second' });
    setStatus(lead, 'positive_interest', { source: 'system', note: 'third' });
    assert.equal(lead.status, 'positive_interest');
    assert.deepEqual(
      lead.statusHistory.map((h) => h.status),
      ['contacted', 'replied', 'positive_interest']
    );
  });

  test('does not enforce any particular ordering itself - callers gate that', () => {
    // setStatus has no opinion on pipeline order; the "only advance forward" rule lives in the
    // caller (routes/leads.js), not here - this documents that boundary rather than assuming it.
    const lead = makeLead('won');
    setStatus(lead, 'new');
    assert.equal(lead.status, 'new');
  });
});
