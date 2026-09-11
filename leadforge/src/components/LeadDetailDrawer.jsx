import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import WebsiteStatusBadge from './WebsiteStatusBadge';
import { useConfirm } from './ConfirmDialog';
import API_BASE, { apiFetch } from '../config';
import { OPPORTUNITY_LABELS } from '../constants/opportunityLabels';

const DEMO_STRATEGY_COPY = {
  NO_DEMO: 'Not usually needed for this kind of opportunity.',
  OFFER_DEMO: 'A website preview could help — generate one if useful.',
  INCLUDE_DEMO: 'A website preview is a strong fit here.',
};

const CONFIDENCE_COLOR = {
  high: 'var(--color-success, #22c55e)',
  medium: 'var(--color-accent-2)',
  low: 'var(--color-text-3)',
};

const TEMPLATE_NAMES = {
  warmLocal: 'Warm & Local',
  refinedEditorial: 'Refined Editorial',
  boldModern: 'Bold Modern',
  classicService: 'Classic Service',
  boutiqueHeritage: 'Boutique Heritage',
};

function CloseIcon(props) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" {...props}>
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}

function StarIcon(props) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M8 1.5l1.98 4.16 4.52.62-3.3 3.24.79 4.52L8 11.9l-4 2.14.79-4.52-3.3-3.24 4.52-.62L8 1.5z" />
    </svg>
  );
}

function SpinnerIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" {...props}>
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.8" opacity="0.2" />
      <path d="M17.5 10a7.5 7.5 0 0 0-7.5-7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function Section({ label, children }) {
  return (
    <div>
      <div className="text-[11px] font-medium uppercase tracking-wider text-text-3 mb-2">{label}</div>
      {children}
    </div>
  );
}

function ScoreChip({ label, value, color }) {
  return (
    <div className="rounded-2xl px-3 py-2.5 flex-1" style={{ background: 'var(--color-surface-2)' }}>
      <div className="text-[10.5px] font-medium uppercase tracking-wider text-text-3 mb-1">{label}</div>
      <div className="font-mono text-[20px] font-semibold tnum" style={{ color: color || 'var(--color-text)' }}>
        {typeof value === 'number' ? value : '—'}
      </div>
    </div>
  );
}

// The demo is deliberately never bundled into outreach automatically — held back and attached
// only when the user explicitly opts in here (typically once there's already been a reply).
// Hidden entirely when there's no completed demo to attach, so it never implies one exists.
function DemoToggle({ checked, onChange, demoReady }) {
  if (!demoReady) return null;
  return (
    <label className="flex items-center gap-1.5 text-[12px] text-text-3 cursor-pointer select-none">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      Include demo link
    </label>
  );
}

function BulletList({ items, color }) {
  if (!items || items.length === 0) return <p className="text-[12.5px] text-text-3">None noted.</p>;
  return (
    <ul className="space-y-1.5">
      {items.map((text, i) => (
        <li key={i} className="flex items-start gap-2 text-[13px] text-text-2">
          <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: color }} />
          <span>{text}</span>
        </li>
      ))}
    </ul>
  );
}

// Mirrors routes/leads.js's isOutreachEligible/notOutreachEligibleMessage — once opportunity
// analysis has run, a credible category (any except NO_STRONG_OPPORTUNITY) is what makes a
// lead eligible, regardless of website condition. Leads not yet run through it fall back to
// aiAnalysis.worthContacting — NEVER website condition, since a confirmed-good website no
// longer disqualifies a lead (COLONBYTE sells AI/automation too, not just websites).
function isOutreachEligible(lead) {
  if (lead.opportunityAnalysis?.status === 'completed') {
    return !!lead.opportunityAnalysis.primaryOpportunity && lead.opportunityAnalysis.primaryOpportunity !== 'NO_STRONG_OPPORTUNITY';
  }
  // Mirrors routes/leads.js — a FAILED opportunity analysis must never fall back to
  // aiAnalysis.opportunity/suggestions, which are general business-quality notes, not a
  // vetted outreach angle. Only a lead never run through the opportunity engine at all falls
  // back to the legacy aiAnalysis-based gate.
  if (lead.opportunityAnalysis?.status === 'failed') {
    return false;
  }
  return lead.aiAnalysis?.status === 'completed' && lead.aiAnalysis?.worthContacting === true;
}

function notHighPriorityMessage(lead) {
  if (lead?.opportunityAnalysis?.status === 'completed') {
    return 'No credible opportunity was found for this business — outreach is only for leads with a defensible reason to contact them.';
  }
  if (lead?.opportunityAnalysis?.status === 'failed') {
    return 'Opportunity analysis failed to complete — re-analyze this lead before drafting outreach.';
  }
  if (lead?.aiAnalysis?.status === 'completed') {
    return 'AI analysis did not find a credible reason to contact this business.';
  }
  return 'Run AI analysis before drafting outreach.';
}

export default function LeadDetailDrawer({ lead, onClose, onUpdated }) {
  const confirm = useConfirm();
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [rechecking, setRechecking] = useState(false);
  const [recheckError, setRecheckError] = useState(null);
  const [generatingDemo, setGeneratingDemo] = useState(false);
  const [changingTemplate, setChangingTemplate] = useState(false);
  const [templateChangeNotice, setTemplateChangeNotice] = useState(null);
  const [demoError, setDemoError] = useState(null);
  const [generatingOutreach, setGeneratingOutreach] = useState(false);
  const [includeDemoInOutreach, setIncludeDemoInOutreach] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [sending, setSending] = useState(false);
  const [outreachError, setOutreachError] = useState(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [generatingWhatsapp, setGeneratingWhatsapp] = useState(false);
  const [includeDemoInWhatsapp, setIncludeDemoInWhatsapp] = useState(false);
  const [savingWhatsappDraft, setSavingWhatsappDraft] = useState(false);
  const [whatsappError, setWhatsappError] = useState(null);
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [generatingFollowUpEmail, setGeneratingFollowUpEmail] = useState(false);
  const [includeDemoInFollowUpEmail, setIncludeDemoInFollowUpEmail] = useState(false);
  const [sendingFollowUpEmail, setSendingFollowUpEmail] = useState(false);
  const [followUpEmailError, setFollowUpEmailError] = useState(null);
  const [followUpSubject, setFollowUpSubject] = useState('');
  const [followUpBody, setFollowUpBody] = useState('');
  const [generatingFollowUpWhatsapp, setGeneratingFollowUpWhatsapp] = useState(false);
  const [includeDemoInFollowUpWhatsapp, setIncludeDemoInFollowUpWhatsapp] = useState(false);
  const [followUpWhatsappError, setFollowUpWhatsappError] = useState(null);
  const [followUpWhatsappMessage, setFollowUpWhatsappMessage] = useState('');
  const [generatingInstagram, setGeneratingInstagram] = useState(false);
  const [includeDemoInInstagram, setIncludeDemoInInstagram] = useState(false);
  const [savingInstagramDraft, setSavingInstagramDraft] = useState(false);
  const [instagramError, setInstagramError] = useState(null);
  const [instagramMessage, setInstagramMessage] = useState('');
  const [instagramCopied, setInstagramCopied] = useState(false);
  const [generatingFollowUpInstagram, setGeneratingFollowUpInstagram] = useState(false);
  const [includeDemoInFollowUpInstagram, setIncludeDemoInFollowUpInstagram] = useState(false);
  const [savingFollowUpInstagramDraft, setSavingFollowUpInstagramDraft] = useState(false);
  const [followUpInstagramError, setFollowUpInstagramError] = useState(null);
  const [followUpInstagramMessage, setFollowUpInstagramMessage] = useState('');
  const [followUpInstagramCopied, setFollowUpInstagramCopied] = useState(false);
  const [generatingFacebook, setGeneratingFacebook] = useState(false);
  const [includeDemoInFacebook, setIncludeDemoInFacebook] = useState(false);
  const [savingFacebookDraft, setSavingFacebookDraft] = useState(false);
  const [facebookError, setFacebookError] = useState(null);
  const [facebookMessage, setFacebookMessage] = useState('');
  const [facebookCopied, setFacebookCopied] = useState(false);

  useEffect(() => {
    setRecheckError(null);
  }, [lead?._id]);

  useEffect(() => {
    setSubject(lead?.outreach?.subject || '');
    setBody(lead?.outreach?.body || '');
    setOutreachError(null);
  }, [lead?._id, lead?.outreach?.generatedAt]);

  useEffect(() => {
    setFollowUpSubject(lead?.outreachFollowUp?.subject || '');
    setFollowUpBody(lead?.outreachFollowUp?.body || '');
    setFollowUpEmailError(null);
  }, [lead?._id, lead?.outreachFollowUp?.generatedAt]);

  useEffect(() => {
    setFollowUpWhatsappMessage(lead?.whatsappFollowUp?.message || '');
    setFollowUpWhatsappError(null);
  }, [lead?._id, lead?.whatsappFollowUp?.generatedAt]);

  useEffect(() => {
    setWhatsappMessage(lead?.whatsappOutreach?.message || '');
    setWhatsappError(null);
  }, [lead?._id, lead?.whatsappOutreach?.generatedAt]);

  useEffect(() => {
    setInstagramMessage(lead?.instagramOutreach?.message || '');
    setInstagramError(null);
    setInstagramCopied(false);
  }, [lead?._id, lead?.instagramOutreach?.generatedAt]);

  useEffect(() => {
    setFollowUpInstagramMessage(lead?.instagramFollowUp?.message || '');
    setFollowUpInstagramError(null);
    setFollowUpInstagramCopied(false);
  }, [lead?._id, lead?.instagramFollowUp?.generatedAt]);

  useEffect(() => {
    setFacebookMessage(lead?.facebookOutreach?.message || '');
    setFacebookError(null);
    setFacebookCopied(false);
  }, [lead?._id, lead?.facebookOutreach?.generatedAt]);

  const handleAnalyze = async () => {
    if (!lead) return;
    setAnalyzing(true);
    setError(null);
    try {
      const res = await apiFetch(`${API_BASE}/api/leads/${lead._id}/analyze`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Analysis failed.');
      }
      const updated = await res.json();
      onUpdated?.(updated);
    } catch (err) {
      setError(err.message || 'Analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRecheckWebsite = async () => {
    if (!lead) return;
    setRechecking(true);
    setRecheckError(null);
    try {
      const res = await apiFetch(`${API_BASE}/api/leads/${lead._id}/recheck-website`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Recheck failed.');
      }
      const updated = await res.json();
      onUpdated?.(updated);
    } catch (err) {
      setRecheckError(err.message || 'Recheck failed.');
    } finally {
      setRechecking(false);
    }
  };

  const handleGenerateDemo = async () => {
    if (!lead) return;
    setGeneratingDemo(true);
    setDemoError(null);
    try {
      const res = await apiFetch(`${API_BASE}/api/leads/${lead._id}/generate-demo`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Demo generation failed.');
      }
      const updated = await res.json();
      onUpdated?.(updated);
    } catch (err) {
      setDemoError(err.message || 'Demo generation failed.');
    } finally {
      setGeneratingDemo(false);
    }
  };

  const handleChangeTemplate = async () => {
    if (!lead) return;
    setChangingTemplate(true);
    setDemoError(null);
    setTemplateChangeNotice(null);
    try {
      const res = await apiFetch(`${API_BASE}/api/leads/${lead._id}/change-template`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Template change failed.');
      }
      const updated = await res.json();
      onUpdated?.(updated);
      // The drawer only shows a text summary, not a live preview - without this, clicking the
      // button gave zero visible feedback (the change only shows up if you reopen Preview Demo),
      // which reads as "the button doesn't do anything" even though it worked.
      const name = TEMPLATE_NAMES[updated.demoSite?.templateKey] || updated.demoSite?.templateKey;
      setTemplateChangeNotice(`Switched to "${name}" — reopen Preview Demo to see it.`);
      setTimeout(() => setTemplateChangeNotice(null), 6000);
    } catch (err) {
      setDemoError(err.message || 'Template change failed.');
    } finally {
      setChangingTemplate(false);
    }
  };

  const handleGenerateOutreach = async () => {
    if (!lead) return;
    setGeneratingOutreach(true);
    setOutreachError(null);
    try {
      const res = await apiFetch(`${API_BASE}/api/leads/${lead._id}/generate-outreach`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ includeDemo: includeDemoInOutreach }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Draft generation failed.');
      }
      const updated = await res.json();
      onUpdated?.(updated);
    } catch (err) {
      setOutreachError(err.message || 'Draft generation failed.');
    } finally {
      setGeneratingOutreach(false);
    }
  };

  const saveDraft = async () => {
    const res = await apiFetch(`${API_BASE}/api/leads/${lead._id}/outreach`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, body }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to save draft.');
    }
    return res.json();
  };

  const handleSaveDraft = async () => {
    if (!lead) return;
    setSavingDraft(true);
    setOutreachError(null);
    try {
      const updated = await saveDraft();
      onUpdated?.(updated);
    } catch (err) {
      setOutreachError(err.message || 'Failed to save draft.');
    } finally {
      setSavingDraft(false);
    }
  };

  const handleSendOutreach = async () => {
    if (!lead) return;
    if (!(await confirm(`Send this email to ${lead.email}? This cannot be undone.`, { confirmLabel: 'Send' }))) return;
    setSending(true);
    setOutreachError(null);
    try {
      await saveDraft();
      const res = await apiFetch(`${API_BASE}/api/leads/${lead._id}/send-outreach`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to send email.');
      }
      const updated = await res.json();
      onUpdated?.(updated);
    } catch (err) {
      setOutreachError(err.message || 'Failed to send email.');
    } finally {
      setSending(false);
    }
  };

  const handleGenerateWhatsapp = async () => {
    if (!lead) return;
    setGeneratingWhatsapp(true);
    setWhatsappError(null);
    try {
      const res = await apiFetch(`${API_BASE}/api/leads/${lead._id}/generate-whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ includeDemo: includeDemoInWhatsapp }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Draft generation failed.');
      }
      const updated = await res.json();
      onUpdated?.(updated);
    } catch (err) {
      setWhatsappError(err.message || 'Draft generation failed.');
    } finally {
      setGeneratingWhatsapp(false);
    }
  };

  const saveWhatsappDraft = async () => {
    const res = await apiFetch(`${API_BASE}/api/leads/${lead._id}/whatsapp`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: whatsappMessage }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to save draft.');
    }
    return res.json();
  };

  const handleSaveWhatsappDraft = async () => {
    if (!lead) return;
    setSavingWhatsappDraft(true);
    setWhatsappError(null);
    try {
      const updated = await saveWhatsappDraft();
      onUpdated?.(updated);
    } catch (err) {
      setWhatsappError(err.message || 'Failed to save draft.');
    } finally {
      setSavingWhatsappDraft(false);
    }
  };

  // wa.me only ever opens WhatsApp with the message pre-filled in the compose box - the
  // operator still has to hit send themselves inside WhatsApp, so this can never auto-send.
  const handleOpenWhatsapp = async () => {
    if (!lead) return;
    setWhatsappError(null);
    try {
      await saveWhatsappDraft();
      const digits = (lead.normalizedPhone || lead.phone || '').replace(/[^\d]/g, '');
      if (!digits) throw new Error('No usable phone number for this lead.');
      const url = `https://wa.me/${digits}?text=${encodeURIComponent(whatsappMessage)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      const res = await apiFetch(`${API_BASE}/api/leads/${lead._id}/whatsapp-opened`, { method: 'POST' });
      if (res.ok) onUpdated?.(await res.json());
    } catch (err) {
      setWhatsappError(err.message || 'Could not open WhatsApp.');
    }
  };

  const handleGenerateInstagram = async () => {
    if (!lead) return;
    setGeneratingInstagram(true);
    setInstagramError(null);
    try {
      const res = await apiFetch(`${API_BASE}/api/leads/${lead._id}/generate-instagram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ includeDemo: includeDemoInInstagram }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Draft generation failed.');
      }
      const updated = await res.json();
      onUpdated?.(updated);
    } catch (err) {
      setInstagramError(err.message || 'Draft generation failed.');
    } finally {
      setGeneratingInstagram(false);
    }
  };

  const saveInstagramDraft = async () => {
    const res = await apiFetch(`${API_BASE}/api/leads/${lead._id}/instagram`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: instagramMessage }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to save draft.');
    }
    return res.json();
  };

  const handleSaveInstagramDraft = async () => {
    if (!lead) return;
    setSavingInstagramDraft(true);
    setInstagramError(null);
    try {
      const updated = await saveInstagramDraft();
      onUpdated?.(updated);
    } catch (err) {
      setInstagramError(err.message || 'Failed to save draft.');
    } finally {
      setSavingInstagramDraft(false);
    }
  };

  // Instagram has no official deep-link that pre-fills a DM the way wa.me does for WhatsApp -
  // copy the draft to the clipboard, then open the profile so the operator can paste it in
  // themselves, and record the click-through as "opened" once both succeed.
  const handleCopyAndOpenInstagram = async () => {
    if (!lead) return;
    setInstagramError(null);
    try {
      await saveInstagramDraft();
      await navigator.clipboard.writeText(instagramMessage);
      setInstagramCopied(true);
      setTimeout(() => setInstagramCopied(false), 4000);
      window.open(lead.instagramUrl, '_blank', 'noopener,noreferrer');
      const res = await apiFetch(`${API_BASE}/api/leads/${lead._id}/instagram-opened`, { method: 'POST' });
      if (res.ok) onUpdated?.(await res.json());
    } catch (err) {
      setInstagramError(err.message || 'Could not copy message or open Instagram.');
    }
  };

  const handleGenerateFollowUpInstagram = async () => {
    if (!lead) return;
    setGeneratingFollowUpInstagram(true);
    setFollowUpInstagramError(null);
    try {
      const res = await apiFetch(`${API_BASE}/api/leads/${lead._id}/generate-followup-instagram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ includeDemo: includeDemoInFollowUpInstagram }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Follow-up draft generation failed.');
      }
      const updated = await res.json();
      onUpdated?.(updated);
    } catch (err) {
      setFollowUpInstagramError(err.message || 'Follow-up draft generation failed.');
    } finally {
      setGeneratingFollowUpInstagram(false);
    }
  };

  const saveFollowUpInstagramDraft = async () => {
    const res = await apiFetch(`${API_BASE}/api/leads/${lead._id}/followup-instagram`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: followUpInstagramMessage }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to save draft.');
    }
    return res.json();
  };

  const handleSaveFollowUpInstagramDraft = async () => {
    if (!lead) return;
    setSavingFollowUpInstagramDraft(true);
    setFollowUpInstagramError(null);
    try {
      const updated = await saveFollowUpInstagramDraft();
      onUpdated?.(updated);
    } catch (err) {
      setFollowUpInstagramError(err.message || 'Failed to save draft.');
    } finally {
      setSavingFollowUpInstagramDraft(false);
    }
  };

  // Same no-deep-link limitation as the original Instagram message (see handleCopyAndOpenInstagram) -
  // copy the follow-up to the clipboard, open the profile, and record the click-through.
  const handleCopyAndOpenFollowUpInstagram = async () => {
    if (!lead) return;
    setFollowUpInstagramError(null);
    try {
      await saveFollowUpInstagramDraft();
      await navigator.clipboard.writeText(followUpInstagramMessage);
      setFollowUpInstagramCopied(true);
      setTimeout(() => setFollowUpInstagramCopied(false), 4000);
      window.open(lead.instagramUrl, '_blank', 'noopener,noreferrer');
      const res = await apiFetch(`${API_BASE}/api/leads/${lead._id}/followup-instagram-opened`, { method: 'POST' });
      if (res.ok) onUpdated?.(await res.json());
    } catch (err) {
      setFollowUpInstagramError(err.message || 'Could not copy message or open Instagram.');
    }
  };

  const handleGenerateFacebook = async () => {
    if (!lead) return;
    setGeneratingFacebook(true);
    setFacebookError(null);
    try {
      const res = await apiFetch(`${API_BASE}/api/leads/${lead._id}/generate-facebook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ includeDemo: includeDemoInFacebook }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Draft generation failed.');
      }
      const updated = await res.json();
      onUpdated?.(updated);
    } catch (err) {
      setFacebookError(err.message || 'Draft generation failed.');
    } finally {
      setGeneratingFacebook(false);
    }
  };

  const saveFacebookDraft = async () => {
    const res = await apiFetch(`${API_BASE}/api/leads/${lead._id}/facebook`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: facebookMessage }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to save draft.');
    }
    return res.json();
  };

  const handleSaveFacebookDraft = async () => {
    if (!lead) return;
    setSavingFacebookDraft(true);
    setFacebookError(null);
    try {
      const updated = await saveFacebookDraft();
      onUpdated?.(updated);
    } catch (err) {
      setFacebookError(err.message || 'Failed to save draft.');
    } finally {
      setSavingFacebookDraft(false);
    }
  };

  const handleCopyAndOpenFacebook = async () => {
    if (!lead) return;
    setFacebookError(null);
    try {
      await saveFacebookDraft();
      await navigator.clipboard.writeText(facebookMessage);
      setFacebookCopied(true);
      setTimeout(() => setFacebookCopied(false), 4000);
      window.open(lead.facebookUrl, '_blank', 'noopener,noreferrer');
      const res = await apiFetch(`${API_BASE}/api/leads/${lead._id}/facebook-opened`, { method: 'POST' });
      if (res.ok) onUpdated?.(await res.json());
    } catch (err) {
      setFacebookError(err.message || 'Could not copy message or open Facebook.');
    }
  };

  const handleGenerateFollowUpEmail = async () => {
    if (!lead) return;
    setGeneratingFollowUpEmail(true);
    setFollowUpEmailError(null);
    try {
      const res = await apiFetch(`${API_BASE}/api/leads/${lead._id}/generate-followup-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ includeDemo: includeDemoInFollowUpEmail }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Follow-up draft generation failed.');
      }
      const updated = await res.json();
      onUpdated?.(updated);
    } catch (err) {
      setFollowUpEmailError(err.message || 'Follow-up draft generation failed.');
    } finally {
      setGeneratingFollowUpEmail(false);
    }
  };

  const saveFollowUpEmailDraft = async () => {
    const res = await apiFetch(`${API_BASE}/api/leads/${lead._id}/followup-email`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: followUpSubject, body: followUpBody }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to save draft.');
    }
    return res.json();
  };

  const handleSendFollowUpEmail = async () => {
    if (!lead) return;
    if (!(await confirm(`Send this follow-up to ${lead.email}? This cannot be undone.`, { confirmLabel: 'Send' }))) return;
    setSendingFollowUpEmail(true);
    setFollowUpEmailError(null);
    try {
      await saveFollowUpEmailDraft();
      const res = await apiFetch(`${API_BASE}/api/leads/${lead._id}/send-followup-email`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to send follow-up.');
      }
      const updated = await res.json();
      onUpdated?.(updated);
    } catch (err) {
      setFollowUpEmailError(err.message || 'Failed to send follow-up.');
    } finally {
      setSendingFollowUpEmail(false);
    }
  };

  const handleGenerateFollowUpWhatsapp = async () => {
    if (!lead) return;
    setGeneratingFollowUpWhatsapp(true);
    setFollowUpWhatsappError(null);
    try {
      const res = await apiFetch(`${API_BASE}/api/leads/${lead._id}/generate-followup-whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ includeDemo: includeDemoInFollowUpWhatsapp }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Follow-up draft generation failed.');
      }
      const updated = await res.json();
      onUpdated?.(updated);
    } catch (err) {
      setFollowUpWhatsappError(err.message || 'Follow-up draft generation failed.');
    } finally {
      setGeneratingFollowUpWhatsapp(false);
    }
  };

  const saveFollowUpWhatsappDraft = async () => {
    const res = await apiFetch(`${API_BASE}/api/leads/${lead._id}/followup-whatsapp`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: followUpWhatsappMessage }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to save draft.');
    }
    return res.json();
  };

  const handleOpenFollowUpWhatsapp = async () => {
    if (!lead) return;
    setFollowUpWhatsappError(null);
    try {
      await saveFollowUpWhatsappDraft();
      const digits = (lead.normalizedPhone || lead.phone || '').replace(/[^\d]/g, '');
      if (!digits) throw new Error('No usable phone number for this lead.');
      const url = `https://wa.me/${digits}?text=${encodeURIComponent(followUpWhatsappMessage)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      const res = await apiFetch(`${API_BASE}/api/leads/${lead._id}/followup-whatsapp-opened`, { method: 'POST' });
      if (res.ok) onUpdated?.(await res.json());
    } catch (err) {
      setFollowUpWhatsappError(err.message || 'Could not open WhatsApp.');
    }
  };

  const analysis = lead?.aiAnalysis;
  const analysisStatus = analysis?.status || 'pending';
  const opportunity = lead?.opportunityAnalysis || {};
  const opportunityStatus = opportunity?.status || 'pending';
  const demoSite = lead?.demoSite;
  const demoStatus = demoSite?.status || 'pending';
  const outreach = lead?.outreach;
  const outreachStatus = outreach?.status || 'pending';
  const outreachReady = analysisStatus === 'completed' && isOutreachEligible(lead || {});
  const whatsappOutreach = lead?.whatsappOutreach;
  const whatsappStatus = whatsappOutreach?.status || 'pending';
  const whatsappReady = outreachReady && !!lead?.phone;
  const followUpEmail = lead?.outreachFollowUp;
  const followUpEmailStatus = followUpEmail?.status || 'pending';
  const followUpWhatsapp = lead?.whatsappFollowUp;
  const followUpWhatsappStatus = followUpWhatsapp?.status || 'pending';
  const instagramOutreach = lead?.instagramOutreach;
  const instagramStatus = instagramOutreach?.status || 'pending';
  const instagramReady = outreachReady && !!lead?.instagramUrl;
  const followUpInstagram = lead?.instagramFollowUp;
  const followUpInstagramStatus = followUpInstagram?.status || 'pending';
  const facebookOutreach = lead?.facebookOutreach;
  const facebookStatus = facebookOutreach?.status || 'pending';
  const facebookReady = outreachReady && !!lead?.facebookUrl;

  return (
    <AnimatePresence>
      {lead && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.4)' }}
            onClick={onClose}
          />
          <motion.div
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            className="fixed top-0 right-0 z-50 h-full w-[440px] max-w-full overflow-y-auto overflow-x-hidden rounded-l-[28px]"
            style={{ background: 'var(--color-bg)' }}
          >
            <div
              className="sticky top-0 z-10 flex items-start justify-between gap-3 px-5 py-4"
              style={{ background: 'var(--color-black)' }}
            >
              <div className="min-w-0">
                <h2 className="text-[17px] font-bold tracking-tight truncate" style={{ color: '#ffffff' }}>{lead.businessName}</h2>
                <p className="text-[12px] mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>{lead.category || lead.keyword}</p>
              </div>
              <button
                onClick={onClose}
                className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full transition-colors duration-150 hover:bg-white/10"
                style={{ color: 'rgba(255,255,255,0.7)' }}
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-6">
              <Section label="Contact">
                <div className="space-y-1.5 text-[13px]">
                  <div className="flex justify-between gap-3">
                    <span className="text-text-3">Email</span>
                    <span className="text-text text-right">{lead.email || '—'}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-text-3">Phone</span>
                    <span className="text-text font-mono text-right">{lead.phone || '—'}</span>
                  </div>
                  {lead.instagramUrl && (
                    <div className="flex justify-between gap-3">
                      <span className="text-text-3">Instagram</span>
                      <a
                        href={lead.instagramUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-accent text-right hover:opacity-80 transition-opacity duration-150 truncate max-w-[220px]"
                      >
                        {lead.instagramUrl.replace(/^https?:\/\/(www\.)?/, '')}
                      </a>
                    </div>
                  )}
                  {lead.facebookUrl && (
                    <div className="flex justify-between gap-3">
                      <span className="text-text-3">Facebook</span>
                      <a
                        href={lead.facebookUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-accent text-right hover:opacity-80 transition-opacity duration-150 truncate max-w-[220px]"
                      >
                        {lead.facebookUrl.replace(/^https?:\/\/(www\.)?/, '')}
                      </a>
                    </div>
                  )}
                  <div className="flex justify-between gap-3">
                    <span className="text-text-3">Address</span>
                    <span className="text-text text-right">{lead.address || '—'}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-text-3">Country</span>
                    <span className="text-text text-right">{lead.country || '—'}</span>
                  </div>
                </div>
              </Section>

              <Section label="Google Maps signals">
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="rounded-2xl px-3 py-2.5" style={{ background: 'var(--color-surface-2)' }}>
                    <div className="text-[10.5px] font-medium uppercase tracking-wider text-text-3 mb-1">Rating</div>
                    <div className="flex items-center gap-1">
                      <StarIcon className="w-3.5 h-3.5" style={{ color: 'var(--color-accent-3)' }} />
                      <span className="font-mono text-[14px] font-medium text-text tnum">
                        {typeof lead.rating === 'number' ? lead.rating.toFixed(1) : '—'}
                      </span>
                      <span className="text-[11.5px] text-text-3 tnum">
                        ({typeof lead.reviewCount === 'number' ? lead.reviewCount : 0})
                      </span>
                    </div>
                  </div>
                  <div className="rounded-2xl px-3 py-2.5" style={{ background: 'var(--color-surface-2)' }}>
                    <div className="text-[10.5px] font-medium uppercase tracking-wider text-text-3 mb-1">Photos</div>
                    <div className="font-mono text-[14px] font-medium text-text tnum">{lead.photoCount || 0}</div>
                  </div>
                </div>
                {lead.openingHoursSummary && (
                  <p className="text-[12.5px] text-text-2 mt-2.5">{lead.openingHoursSummary}</p>
                )}
              </Section>

              <Section label="Website">
                <div className="flex items-center justify-between">
                  <WebsiteStatusBadge status={lead.websiteStatus} score={lead.websiteQualityScore} />
                  {lead.website && (
                    <a
                      href={lead.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[12.5px] text-accent hover:opacity-80 transition-opacity duration-150"
                    >
                      Visit site
                    </a>
                  )}
                </div>
                {lead.website && (
                  <div className="mt-2.5">
                    <button
                      onClick={handleRecheckWebsite}
                      disabled={rechecking}
                      className="flex items-center gap-1.5 text-[12.5px] font-medium text-text-2 hover:text-text transition-colors duration-150 disabled:opacity-50"
                    >
                      {rechecking && <SpinnerIcon className="w-3.5 h-3.5 animate-spin" />}
                      {rechecking ? 'Rechecking…' : 'Recheck Website'}
                    </button>
                    {recheckError && <p className="text-[12px] mt-1.5" style={{ color: 'var(--color-danger)' }}>{recheckError}</p>}
                  </div>
                )}
              </Section>

              <Section label="AI Business Report">
                {analysisStatus === 'completed' ? (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[13px] text-text-2 leading-relaxed">{analysis.summary}</p>
                      {typeof analysis.worthContacting === 'boolean' && (
                        <span
                          className="shrink-0 text-[10.5px] font-medium uppercase tracking-wider px-2 py-1 rounded-full"
                          style={
                            analysis.worthContacting
                              ? { background: 'rgba(34,197,94,0.15)', color: 'var(--color-success, #22c55e)' }
                              : { background: 'var(--color-surface-2)', color: 'var(--color-text-3)' }
                          }
                        >
                          {analysis.worthContacting ? 'Worth contacting' : 'No strong angle'}
                        </span>
                      )}
                    </div>

                    {analysis.worthContacting === false ? (
                      <p className="text-[12.5px] text-text-3 rounded-2xl p-3" style={{ background: 'var(--color-surface-2)' }}>
                        No strong outreach angle found for this lead. You can still draft outreach manually if you
                        know something the data doesn't show.
                      </p>
                    ) : analysis.opportunity ? (
                      <div>
                        <div className="text-[11px] font-medium uppercase tracking-wider text-text-3 mb-2">Primary Opportunity</div>
                        <p
                          className="text-[13px] text-text leading-relaxed rounded-2xl p-3"
                          style={{ background: 'var(--color-surface-2)' }}
                        >
                          {analysis.opportunity}
                        </p>
                      </div>
                    ) : null}

                    <div>
                      <div className="text-[11px] font-medium uppercase tracking-wider text-text-3 mb-2">Strengths</div>
                      <BulletList items={analysis.strengths} color="var(--color-success)" />
                    </div>
                    <div>
                      <div className="text-[11px] font-medium uppercase tracking-wider text-text-3 mb-2">Weaknesses</div>
                      <BulletList items={analysis.weaknesses} color="var(--color-danger)" />
                    </div>
                    <div>
                      <div className="text-[11px] font-medium uppercase tracking-wider text-text-3 mb-2">Suggestions</div>
                      <BulletList items={analysis.suggestions} color="var(--color-accent)" />
                    </div>

                    <button
                      onClick={handleAnalyze}
                      disabled={analyzing}
                      className="text-[12.5px] font-medium text-text-2 hover:text-text transition-colors duration-150 disabled:opacity-50"
                    >
                      {analyzing ? 'Re-analyzing…' : 'Re-analyze'}
                    </button>
                  </div>
                ) : (
                  <div className="rounded-2xl p-4 flex flex-col items-center gap-2.5 text-center" style={{ background: 'var(--color-surface-2)' }}>
                    <p className="text-[12.5px] text-text-3">
                      {analysisStatus === 'failed'
                        ? 'Analysis failed — try again.'
                        : 'This lead hasn’t been analyzed yet.'}
                    </p>
                    <button
                      onClick={handleAnalyze}
                      disabled={analyzing}
                      className="flex items-center gap-1.5 h-8 px-3.5 rounded-full text-[12.5px] font-medium transition-all duration-150 hover:brightness-110 disabled:opacity-60"
                      style={{ background: 'var(--color-accent)', color: '#ffffff' }}
                    >
                      {analyzing && <SpinnerIcon className="w-3.5 h-3.5 animate-spin" />}
                      {analyzing ? 'Analyzing…' : analysisStatus === 'failed' ? 'Retry Analysis' : 'Analyze Now'}
                    </button>
                    {error && <p className="text-[12px]" style={{ color: 'var(--color-danger)' }}>{error}</p>}
                  </div>
                )}
              </Section>

              {opportunityStatus === 'completed' && (
                <Section label="Opportunity">
                  {opportunity.primaryOpportunity && opportunity.primaryOpportunity !== 'NO_STRONG_OPPORTUNITY' ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[13px] font-medium text-text">
                          {OPPORTUNITY_LABELS[opportunity.primaryOpportunity] || opportunity.primaryOpportunity}
                        </p>
                        {opportunity.opportunityConfidence && (
                          <span
                            className="shrink-0 text-[10.5px] font-medium uppercase tracking-wider px-2 py-1 rounded-full"
                            style={{ background: 'var(--color-surface-2)', color: CONFIDENCE_COLOR[opportunity.opportunityConfidence] }}
                          >
                            {opportunity.opportunityConfidence} confidence
                          </span>
                        )}
                      </div>

                      {opportunity.reasoning && (
                        <div>
                          <div className="text-[11px] font-medium uppercase tracking-wider text-text-3 mb-2">Why</div>
                          <p className="text-[13px] text-text-2 leading-relaxed">{opportunity.reasoning}</p>
                        </div>
                      )}

                      <div>
                        <div className="text-[11px] font-medium uppercase tracking-wider text-text-3 mb-2">Evidence</div>
                        <BulletList items={opportunity.evidence} color="var(--color-accent)" />
                      </div>

                      {opportunity.outreachAngle && (
                        <div>
                          <div className="text-[11px] font-medium uppercase tracking-wider text-text-3 mb-2">Outreach Angle</div>
                          <p
                            className="text-[13px] text-text leading-relaxed rounded-2xl p-3"
                            style={{ background: 'var(--color-surface-2)' }}
                          >
                            {opportunity.outreachAngle}
                          </p>
                        </div>
                      )}

                      <div className="flex justify-between gap-3 text-[12.5px]">
                        <span className="text-text-3">Solution</span>
                        <span className="text-text text-right">{opportunity.solutionCategory || '—'}</span>
                      </div>
                      <div className="flex justify-between gap-3 text-[12.5px]">
                        <span className="text-text-3">Demo</span>
                        <span className="text-text-2 text-right">{DEMO_STRATEGY_COPY[opportunity.demoStrategy] || DEMO_STRATEGY_COPY.NO_DEMO}</span>
                      </div>

                      {opportunity.secondaryOpportunities?.length > 0 && (
                        <div>
                          <div className="text-[11px] font-medium uppercase tracking-wider text-text-3 mb-2">Also Considered</div>
                          <p className="text-[12.5px] text-text-3">
                            {opportunity.secondaryOpportunities.map((c) => OPPORTUNITY_LABELS[c] || c).join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-[12.5px] text-text-3 rounded-2xl p-3" style={{ background: 'var(--color-surface-2)' }}>
                      No credible digital/AI/automation opportunity found for this business. You can still draft
                      outreach manually if you know something the data doesn't show.
                    </p>
                  )}
                </Section>
              )}

              <Section label="Demo Website">
                {demoStatus === 'completed' ? (
                  <div className="space-y-3">
                    <div className="rounded-2xl p-3" style={{ background: 'var(--color-surface-2)' }}>
                      <p className="text-[12.5px] text-text-2 italic">"{demoSite.tagline}"</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <a
                        href={`/demo/${lead._id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 flex items-center justify-center h-8 px-3.5 rounded-full text-[12.5px] font-medium transition-all duration-150 hover:brightness-110"
                        style={{ background: 'var(--color-accent-2)', color: 'var(--color-on-accent-2)' }}
                      >
                        Preview Demo
                      </a>
                      <button
                        onClick={handleGenerateDemo}
                        disabled={generatingDemo || changingTemplate}
                        className="text-[12.5px] font-medium text-text-2 hover:text-text transition-colors duration-150 disabled:opacity-50"
                      >
                        {generatingDemo ? 'Regenerating…' : 'Regenerate'}
                      </button>
                      <button
                        onClick={handleChangeTemplate}
                        disabled={generatingDemo || changingTemplate}
                        title="Keeps the current color, photo, and copy — only swaps the layout"
                        className="text-[12.5px] font-medium text-text-2 hover:text-text transition-colors duration-150 disabled:opacity-50"
                      >
                        {changingTemplate ? 'Switching…' : 'Change Template'}
                      </button>
                    </div>
                    {templateChangeNotice && (
                      <p className="text-[12px]" style={{ color: 'var(--color-success, var(--color-accent))' }}>
                        {templateChangeNotice}
                      </p>
                    )}
                    {demoError && <p className="text-[12px]" style={{ color: 'var(--color-danger)' }}>{demoError}</p>}
                  </div>
                ) : (
                  <div className="rounded-2xl p-4 flex flex-col items-center gap-2.5 text-center" style={{ background: 'var(--color-surface-2)' }}>
                    <p className="text-[12.5px] text-text-3">
                      {demoStatus === 'failed'
                        ? 'Demo generation failed — try again.'
                        : 'No demo website generated yet.'}
                    </p>
                    <button
                      onClick={handleGenerateDemo}
                      disabled={generatingDemo}
                      className="flex items-center gap-1.5 h-8 px-3.5 rounded-full text-[12.5px] font-medium transition-all duration-150 hover:brightness-110 disabled:opacity-60"
                      style={{ background: 'var(--color-accent-2)', color: 'var(--color-on-accent-2)' }}
                    >
                      {generatingDemo && <SpinnerIcon className="w-3.5 h-3.5 animate-spin" />}
                      {generatingDemo ? 'Generating…' : demoStatus === 'failed' ? 'Retry Generation' : 'Generate Demo'}
                    </button>
                    {demoError && <p className="text-[12px]" style={{ color: 'var(--color-danger)' }}>{demoError}</p>}
                  </div>
                )}
              </Section>

              <Section label="Outreach Email">
                {outreachStatus === 'sent' ? (
                  <div className="space-y-3">
                    <div className="rounded-2xl p-3 space-y-2" style={{ background: 'var(--color-surface-2)' }}>
                      <p className="text-[12.5px] font-medium text-text">{outreach.subject}</p>
                      <p className="text-[12.5px] text-text-2 whitespace-pre-wrap leading-relaxed">{outreach.body}</p>
                    </div>
                    <div className="flex gap-2.5">
                      <ScoreChip label="Opens" value={outreach.openCount ?? 0} color="var(--color-accent)" />
                      <ScoreChip label="Clicks" value={outreach.clickCount ?? 0} color="var(--color-accent-2)" />
                    </div>
                    {outreach.bounced && (
                      <p className="text-[12px]" style={{ color: 'var(--color-danger)' }}>Bounced or marked as spam.</p>
                    )}
                    <p className="text-[11.5px] text-text-3">
                      Sent {outreach.sentAt ? new Date(outreach.sentAt).toLocaleString() : ''}
                    </p>

                    <div className="pt-1 border-t" style={{ borderColor: 'var(--color-border)' }}>
                      {followUpEmailStatus === 'sent' ? (
                        <div className="space-y-2 pt-3">
                          <p className="text-[11px] font-medium uppercase tracking-wider text-text-3">Follow-up</p>
                          <div className="rounded-2xl p-3 space-y-1.5" style={{ background: 'var(--color-surface-2)' }}>
                            <p className="text-[12.5px] font-medium text-text">{followUpEmail.subject}</p>
                            <p className="text-[12.5px] text-text-2 whitespace-pre-wrap leading-relaxed">{followUpEmail.body}</p>
                          </div>
                          <p className="text-[11.5px] text-text-3">
                            Sent {followUpEmail.sentAt ? new Date(followUpEmail.sentAt).toLocaleString() : ''}
                          </p>
                        </div>
                      ) : followUpEmailStatus === 'drafted' ? (
                        <div className="space-y-2 pt-3">
                          <p className="text-[11px] font-medium uppercase tracking-wider text-text-3">Follow-up</p>
                          <input
                            value={followUpSubject}
                            onChange={(e) => setFollowUpSubject(e.target.value)}
                            maxLength={200}
                            className="w-full h-8 px-2.5 rounded-full text-[12.5px] text-text border"
                            style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}
                            placeholder="Subject"
                          />
                          <textarea
                            value={followUpBody}
                            onChange={(e) => setFollowUpBody(e.target.value)}
                            maxLength={5000}
                            rows={5}
                            className="w-full px-2.5 py-2 rounded-xl text-[12.5px] text-text border resize-y leading-relaxed"
                            style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}
                            placeholder="Body"
                          />
                          <div className="flex items-center gap-3">
                            <button
                              onClick={handleSendFollowUpEmail}
                              disabled={sendingFollowUpEmail || !followUpSubject.trim() || !followUpBody.trim()}
                              className="flex-1 flex items-center justify-center gap-1.5 h-8 px-3.5 rounded-full text-[12.5px] font-medium transition-all duration-150 hover:brightness-110 disabled:opacity-60"
                              style={{ background: 'var(--color-accent)', color: '#ffffff' }}
                            >
                              {sendingFollowUpEmail && <SpinnerIcon className="w-3.5 h-3.5 animate-spin" />}
                              {sendingFollowUpEmail ? 'Sending…' : 'Send Follow-up'}
                            </button>
                            <button
                              onClick={handleGenerateFollowUpEmail}
                              disabled={generatingFollowUpEmail}
                              className="text-[12.5px] font-medium text-text-2 hover:text-text transition-colors duration-150 disabled:opacity-50"
                            >
                              {generatingFollowUpEmail ? 'Regenerating…' : 'Regenerate'}
                            </button>
                            <DemoToggle checked={includeDemoInFollowUpEmail} onChange={setIncludeDemoInFollowUpEmail} demoReady={demoStatus === 'completed'} />
                          </div>
                          {followUpEmailError && <p className="text-[12px]" style={{ color: 'var(--color-danger)' }}>{followUpEmailError}</p>}
                        </div>
                      ) : (
                        <div className="pt-3 space-y-1.5">
                          <button
                            onClick={handleGenerateFollowUpEmail}
                            disabled={generatingFollowUpEmail}
                            className="flex items-center gap-1.5 h-8 px-3.5 rounded-full text-[12.5px] font-medium text-text-2 hover:text-text transition-colors duration-150 disabled:opacity-50"
                          >
                            {generatingFollowUpEmail && <SpinnerIcon className="w-3.5 h-3.5 animate-spin" />}
                            {generatingFollowUpEmail ? 'Drafting…' : followUpEmailStatus === 'failed' ? 'Retry Follow-up' : 'Draft Follow-up'}
                          </button>
                          <DemoToggle checked={includeDemoInFollowUpEmail} onChange={setIncludeDemoInFollowUpEmail} demoReady={demoStatus === 'completed'} />
                          {followUpEmailError && <p className="text-[12px] mt-1.5" style={{ color: 'var(--color-danger)' }}>{followUpEmailError}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                ) : outreachStatus === 'drafted' ? (
                  <div className="space-y-2.5">
                    {!isOutreachEligible(lead) && (
                      <p className="text-[12px] rounded-2xl p-2.5" style={{ color: 'var(--color-danger)', background: 'var(--color-surface-2)' }}>
                        {notHighPriorityMessage(lead)} Drafted before this restriction applied — sending is blocked.
                      </p>
                    )}
                    <input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      maxLength={200}
                      className="w-full h-8 px-2.5 rounded-full text-[12.5px] text-text border"
                      style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}
                      placeholder="Subject"
                    />
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      maxLength={5000}
                      rows={8}
                      className="w-full px-2.5 py-2 rounded-xl text-[12.5px] text-text border resize-y leading-relaxed"
                      style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}
                      placeholder="Body"
                    />
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleSendOutreach}
                        disabled={sending || savingDraft || !subject.trim() || !body.trim() || !lead.email || !isOutreachEligible(lead)}
                        className="flex-1 flex items-center justify-center gap-1.5 h-8 px-3.5 rounded-full text-[12.5px] font-medium transition-all duration-150 hover:brightness-110 disabled:opacity-60"
                        style={{ background: 'var(--color-accent)', color: '#ffffff' }}
                      >
                        {sending && <SpinnerIcon className="w-3.5 h-3.5 animate-spin" />}
                        {sending ? 'Sending…' : 'Send Email'}
                      </button>
                      <button
                        onClick={handleSaveDraft}
                        disabled={savingDraft || sending}
                        className="text-[12.5px] font-medium text-text-2 hover:text-text transition-colors duration-150 disabled:opacity-50"
                      >
                        {savingDraft ? 'Saving…' : 'Save Draft'}
                      </button>
                    </div>
                    {!lead.email && (
                      <p className="text-[12px]" style={{ color: 'var(--color-danger)' }}>This lead has no email address — cannot send.</p>
                    )}
                    <div className="flex items-center justify-between gap-3">
                      <button
                        onClick={handleGenerateOutreach}
                        disabled={generatingOutreach}
                        className="text-[12.5px] font-medium text-text-2 hover:text-text transition-colors duration-150 disabled:opacity-50"
                      >
                        {generatingOutreach ? 'Regenerating…' : 'Regenerate Draft'}
                      </button>
                      <DemoToggle checked={includeDemoInOutreach} onChange={setIncludeDemoInOutreach} demoReady={demoStatus === 'completed'} />
                    </div>
                    {outreachError && <p className="text-[12px]" style={{ color: 'var(--color-danger)' }}>{outreachError}</p>}
                  </div>
                ) : (
                  <div className="rounded-2xl p-4 flex flex-col items-center gap-2.5 text-center" style={{ background: 'var(--color-surface-2)' }}>
                    <p className="text-[12.5px] text-text-3">
                      {analysisStatus === 'completed' && !isOutreachEligible(lead)
                        ? notHighPriorityMessage(lead)
                        : !outreachReady
                        ? 'Complete AI analysis first.'
                        : outreachStatus === 'failed'
                        ? 'Draft generation failed — try again.'
                        : 'No outreach email drafted yet.'}
                    </p>
                    <button
                      onClick={handleGenerateOutreach}
                      disabled={generatingOutreach || !outreachReady}
                      className="flex items-center gap-1.5 h-8 px-3.5 rounded-full text-[12.5px] font-medium transition-all duration-150 hover:brightness-110 disabled:opacity-60"
                      style={{ background: 'var(--color-accent)', color: '#ffffff' }}
                    >
                      {generatingOutreach && <SpinnerIcon className="w-3.5 h-3.5 animate-spin" />}
                      {generatingOutreach ? 'Drafting…' : outreachStatus === 'failed' ? 'Retry Draft' : 'Draft Outreach Email'}
                    </button>
                    <DemoToggle checked={includeDemoInOutreach} onChange={setIncludeDemoInOutreach} demoReady={demoStatus === 'completed'} />
                    {outreachError && <p className="text-[12px]" style={{ color: 'var(--color-danger)' }}>{outreachError}</p>}
                  </div>
                )}
              </Section>

              <Section label="WhatsApp Outreach">
                {whatsappStatus === 'opened' ? (
                  <div className="space-y-3">
                    <div className="rounded-2xl p-3" style={{ background: 'var(--color-surface-2)' }}>
                      <p className="text-[12.5px] text-text-2 whitespace-pre-wrap leading-relaxed">{whatsappOutreach.message}</p>
                    </div>
                    <p className="text-[11.5px] text-text-3">
                      Opened in WhatsApp {whatsappOutreach.openedAt ? new Date(whatsappOutreach.openedAt).toLocaleString() : ''} — sending itself happens inside WhatsApp, so this only confirms the link was opened.
                    </p>
                    <button
                      onClick={handleOpenWhatsapp}
                      className="text-[12.5px] font-medium text-text-2 hover:text-text transition-colors duration-150"
                    >
                      Open again
                    </button>

                    <div className="pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                      {followUpWhatsappStatus === 'opened' ? (
                        <div className="space-y-2 pt-3">
                          <p className="text-[11px] font-medium uppercase tracking-wider text-text-3">Follow-up</p>
                          <div className="rounded-2xl p-3" style={{ background: 'var(--color-surface-2)' }}>
                            <p className="text-[12.5px] text-text-2 whitespace-pre-wrap leading-relaxed">{followUpWhatsapp.message}</p>
                          </div>
                          <p className="text-[11.5px] text-text-3">
                            Opened {followUpWhatsapp.openedAt ? new Date(followUpWhatsapp.openedAt).toLocaleString() : ''}
                          </p>
                          <button
                            onClick={handleOpenFollowUpWhatsapp}
                            className="text-[12.5px] font-medium text-text-2 hover:text-text transition-colors duration-150"
                          >
                            Open again
                          </button>
                        </div>
                      ) : followUpWhatsappStatus === 'drafted' ? (
                        <div className="space-y-2 pt-3">
                          <p className="text-[11px] font-medium uppercase tracking-wider text-text-3">Follow-up</p>
                          <textarea
                            value={followUpWhatsappMessage}
                            onChange={(e) => setFollowUpWhatsappMessage(e.target.value)}
                            maxLength={2000}
                            rows={4}
                            className="w-full px-2.5 py-2 rounded-xl text-[12.5px] text-text border resize-y leading-relaxed"
                            style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}
                            placeholder="Message"
                          />
                          <div className="flex items-center gap-3">
                            <button
                              onClick={handleOpenFollowUpWhatsapp}
                              disabled={!followUpWhatsappMessage.trim() || !lead.phone}
                              className="flex-1 flex items-center justify-center h-8 px-3.5 rounded-full text-[12.5px] font-medium transition-all duration-150 hover:brightness-110 disabled:opacity-60"
                              style={{ background: 'var(--color-accent-3)', color: 'var(--color-on-accent-3)' }}
                            >
                              Open Follow-up
                            </button>
                            <button
                              onClick={handleGenerateFollowUpWhatsapp}
                              disabled={generatingFollowUpWhatsapp}
                              className="text-[12.5px] font-medium text-text-2 hover:text-text transition-colors duration-150 disabled:opacity-50"
                            >
                              {generatingFollowUpWhatsapp ? 'Regenerating…' : 'Regenerate'}
                            </button>
                            <DemoToggle checked={includeDemoInFollowUpWhatsapp} onChange={setIncludeDemoInFollowUpWhatsapp} demoReady={demoStatus === 'completed'} />
                          </div>
                          {followUpWhatsappError && <p className="text-[12px]" style={{ color: 'var(--color-danger)' }}>{followUpWhatsappError}</p>}
                        </div>
                      ) : (
                        <div className="pt-3 space-y-1.5">
                          <button
                            onClick={handleGenerateFollowUpWhatsapp}
                            disabled={generatingFollowUpWhatsapp}
                            className="flex items-center gap-1.5 h-8 px-3.5 rounded-full text-[12.5px] font-medium text-text-2 hover:text-text transition-colors duration-150 disabled:opacity-50"
                          >
                            {generatingFollowUpWhatsapp && <SpinnerIcon className="w-3.5 h-3.5 animate-spin" />}
                            {generatingFollowUpWhatsapp ? 'Drafting…' : followUpWhatsappStatus === 'failed' ? 'Retry Follow-up' : 'Draft Follow-up'}
                          </button>
                          <DemoToggle checked={includeDemoInFollowUpWhatsapp} onChange={setIncludeDemoInFollowUpWhatsapp} demoReady={demoStatus === 'completed'} />
                          {followUpWhatsappError && <p className="text-[12px] mt-1.5" style={{ color: 'var(--color-danger)' }}>{followUpWhatsappError}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                ) : whatsappStatus === 'drafted' ? (
                  <div className="space-y-2.5">
                    {!lead.phone && (
                      <p className="text-[12px] rounded-2xl p-2.5" style={{ color: 'var(--color-danger)', background: 'var(--color-surface-2)' }}>
                        This lead has no phone number — cannot open WhatsApp.
                      </p>
                    )}
                    <textarea
                      value={whatsappMessage}
                      onChange={(e) => setWhatsappMessage(e.target.value)}
                      maxLength={2000}
                      rows={5}
                      className="w-full px-2.5 py-2 rounded-xl text-[12.5px] text-text border resize-y leading-relaxed"
                      style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}
                      placeholder="Message"
                    />
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleOpenWhatsapp}
                        disabled={savingWhatsappDraft || !whatsappMessage.trim() || !lead.phone}
                        className="flex-1 flex items-center justify-center gap-1.5 h-8 px-3.5 rounded-full text-[12.5px] font-medium transition-all duration-150 hover:brightness-110 disabled:opacity-60"
                        style={{ background: 'var(--color-accent-3)', color: 'var(--color-on-accent-3)' }}
                      >
                        Open in WhatsApp
                      </button>
                      <button
                        onClick={handleSaveWhatsappDraft}
                        disabled={savingWhatsappDraft}
                        className="text-[12.5px] font-medium text-text-2 hover:text-text transition-colors duration-150 disabled:opacity-50"
                      >
                        {savingWhatsappDraft ? 'Saving…' : 'Save Draft'}
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <button
                        onClick={handleGenerateWhatsapp}
                        disabled={generatingWhatsapp}
                        className="text-[12.5px] font-medium text-text-2 hover:text-text transition-colors duration-150 disabled:opacity-50"
                      >
                        {generatingWhatsapp ? 'Regenerating…' : 'Regenerate Draft'}
                      </button>
                      <DemoToggle checked={includeDemoInWhatsapp} onChange={setIncludeDemoInWhatsapp} demoReady={demoStatus === 'completed'} />
                    </div>
                    {whatsappError && <p className="text-[12px]" style={{ color: 'var(--color-danger)' }}>{whatsappError}</p>}
                  </div>
                ) : (
                  <div className="rounded-2xl p-4 flex flex-col items-center gap-2.5 text-center" style={{ background: 'var(--color-surface-2)' }}>
                    <p className="text-[12.5px] text-text-3">
                      {!lead.phone
                        ? 'This lead has no phone number.'
                        : analysisStatus === 'completed' && !isOutreachEligible(lead)
                        ? notHighPriorityMessage(lead)
                        : !whatsappReady
                        ? 'Complete AI analysis first.'
                        : whatsappStatus === 'failed'
                        ? 'Draft generation failed — try again.'
                        : 'No WhatsApp message drafted yet.'}
                    </p>
                    <button
                      onClick={handleGenerateWhatsapp}
                      disabled={generatingWhatsapp || !whatsappReady}
                      className="flex items-center gap-1.5 h-8 px-3.5 rounded-full text-[12.5px] font-medium transition-all duration-150 hover:brightness-110 disabled:opacity-60"
                      style={{ background: 'var(--color-accent-3)', color: 'var(--color-on-accent-3)' }}
                    >
                      {generatingWhatsapp && <SpinnerIcon className="w-3.5 h-3.5 animate-spin" />}
                      {generatingWhatsapp ? 'Drafting…' : whatsappStatus === 'failed' ? 'Retry Draft' : 'Draft WhatsApp Message'}
                    </button>
                    <DemoToggle checked={includeDemoInWhatsapp} onChange={setIncludeDemoInWhatsapp} demoReady={demoStatus === 'completed'} />
                    {whatsappError && <p className="text-[12px]" style={{ color: 'var(--color-danger)' }}>{whatsappError}</p>}
                  </div>
                )}
              </Section>

              <Section label="Instagram Outreach">
                {instagramStatus === 'opened' ? (
                  <div className="space-y-3">
                    <div className="rounded-2xl p-3" style={{ background: 'var(--color-surface-2)' }}>
                      <p className="text-[12.5px] text-text-2 whitespace-pre-wrap leading-relaxed">{instagramOutreach.message}</p>
                    </div>
                    <p className="text-[11.5px] text-text-3">
                      Copied and opened {instagramOutreach.openedAt ? new Date(instagramOutreach.openedAt).toLocaleString() : ''} — Instagram has no way to pre-fill or confirm a DM, so this only tracks that you copied the message and opened the profile.
                    </p>
                    <button
                      onClick={handleCopyAndOpenInstagram}
                      className="text-[12.5px] font-medium text-text-2 hover:text-text transition-colors duration-150"
                    >
                      {instagramCopied ? 'Copied!' : 'Copy again & open'}
                    </button>
                    {instagramError && <p className="text-[12px]" style={{ color: 'var(--color-danger)' }}>{instagramError}</p>}

                    <div className="pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                      {followUpInstagramStatus === 'opened' ? (
                        <div className="space-y-2 pt-3">
                          <p className="text-[11px] font-medium uppercase tracking-wider text-text-3">Follow-up</p>
                          <div className="rounded-2xl p-3" style={{ background: 'var(--color-surface-2)' }}>
                            <p className="text-[12.5px] text-text-2 whitespace-pre-wrap leading-relaxed">{followUpInstagram.message}</p>
                          </div>
                          <p className="text-[11.5px] text-text-3">
                            Copied and opened {followUpInstagram.openedAt ? new Date(followUpInstagram.openedAt).toLocaleString() : ''}
                          </p>
                          <button
                            onClick={handleCopyAndOpenFollowUpInstagram}
                            className="text-[12.5px] font-medium text-text-2 hover:text-text transition-colors duration-150"
                          >
                            {followUpInstagramCopied ? 'Copied!' : 'Copy again & open'}
                          </button>
                        </div>
                      ) : followUpInstagramStatus === 'drafted' ? (
                        <div className="space-y-2 pt-3">
                          <p className="text-[11px] font-medium uppercase tracking-wider text-text-3">Follow-up</p>
                          <textarea
                            value={followUpInstagramMessage}
                            onChange={(e) => setFollowUpInstagramMessage(e.target.value)}
                            maxLength={2000}
                            rows={4}
                            className="w-full px-2.5 py-2 rounded-xl text-[12.5px] text-text border resize-y leading-relaxed"
                            style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}
                            placeholder="Message"
                          />
                          <div className="flex items-center gap-3">
                            <button
                              onClick={handleCopyAndOpenFollowUpInstagram}
                              disabled={savingFollowUpInstagramDraft || !followUpInstagramMessage.trim()}
                              className="flex-1 flex items-center justify-center h-8 px-3.5 rounded-full text-[12.5px] font-medium transition-all duration-150 hover:brightness-110 disabled:opacity-60"
                              style={{ background: 'var(--color-accent-3)', color: 'var(--color-on-accent-3)' }}
                            >
                              {followUpInstagramCopied ? 'Copied!' : 'Copy Follow-up & Open'}
                            </button>
                            <button
                              onClick={handleSaveFollowUpInstagramDraft}
                              disabled={savingFollowUpInstagramDraft}
                              className="text-[12.5px] font-medium text-text-2 hover:text-text transition-colors duration-150 disabled:opacity-50"
                            >
                              {savingFollowUpInstagramDraft ? 'Saving…' : 'Save Draft'}
                            </button>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <button
                              onClick={handleGenerateFollowUpInstagram}
                              disabled={generatingFollowUpInstagram}
                              className="text-[12.5px] font-medium text-text-2 hover:text-text transition-colors duration-150 disabled:opacity-50"
                            >
                              {generatingFollowUpInstagram ? 'Regenerating…' : 'Regenerate'}
                            </button>
                            <DemoToggle checked={includeDemoInFollowUpInstagram} onChange={setIncludeDemoInFollowUpInstagram} demoReady={demoStatus === 'completed'} />
                          </div>
                          {followUpInstagramError && <p className="text-[12px]" style={{ color: 'var(--color-danger)' }}>{followUpInstagramError}</p>}
                        </div>
                      ) : (
                        <div className="pt-3 space-y-1.5">
                          <button
                            onClick={handleGenerateFollowUpInstagram}
                            disabled={generatingFollowUpInstagram}
                            className="flex items-center gap-1.5 h-8 px-3.5 rounded-full text-[12.5px] font-medium text-text-2 hover:text-text transition-colors duration-150 disabled:opacity-50"
                          >
                            {generatingFollowUpInstagram && <SpinnerIcon className="w-3.5 h-3.5 animate-spin" />}
                            {generatingFollowUpInstagram ? 'Drafting…' : followUpInstagramStatus === 'failed' ? 'Retry Follow-up' : 'Draft Follow-up'}
                          </button>
                          <DemoToggle checked={includeDemoInFollowUpInstagram} onChange={setIncludeDemoInFollowUpInstagram} demoReady={demoStatus === 'completed'} />
                          {followUpInstagramError && <p className="text-[12px] mt-1.5" style={{ color: 'var(--color-danger)' }}>{followUpInstagramError}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                ) : instagramStatus === 'drafted' ? (
                  <div className="space-y-2.5">
                    {!lead.instagramUrl && (
                      <p className="text-[12px] rounded-2xl p-2.5" style={{ color: 'var(--color-danger)', background: 'var(--color-surface-2)' }}>
                        This lead has no Instagram profile — cannot open it.
                      </p>
                    )}
                    <textarea
                      value={instagramMessage}
                      onChange={(e) => setInstagramMessage(e.target.value)}
                      maxLength={2000}
                      rows={4}
                      className="w-full px-2.5 py-2 rounded-xl text-[12.5px] text-text border resize-y leading-relaxed"
                      style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}
                      placeholder="Message"
                    />
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleCopyAndOpenInstagram}
                        disabled={savingInstagramDraft || !instagramMessage.trim() || !lead.instagramUrl}
                        className="flex-1 flex items-center justify-center h-8 px-3.5 rounded-full text-[12.5px] font-medium transition-all duration-150 hover:brightness-110 disabled:opacity-60"
                        style={{ background: 'var(--color-accent-3)', color: 'var(--color-on-accent-3)' }}
                      >
                        {instagramCopied ? 'Copied!' : 'Copy & Open Instagram'}
                      </button>
                      <button
                        onClick={handleSaveInstagramDraft}
                        disabled={savingInstagramDraft}
                        className="text-[12.5px] font-medium text-text-2 hover:text-text transition-colors duration-150 disabled:opacity-50"
                      >
                        {savingInstagramDraft ? 'Saving…' : 'Save Draft'}
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <button
                        onClick={handleGenerateInstagram}
                        disabled={generatingInstagram}
                        className="text-[12.5px] font-medium text-text-2 hover:text-text transition-colors duration-150 disabled:opacity-50"
                      >
                        {generatingInstagram ? 'Regenerating…' : 'Regenerate Draft'}
                      </button>
                      <DemoToggle checked={includeDemoInInstagram} onChange={setIncludeDemoInInstagram} demoReady={demoStatus === 'completed'} />
                    </div>
                    {instagramError && <p className="text-[12px]" style={{ color: 'var(--color-danger)' }}>{instagramError}</p>}
                  </div>
                ) : (
                  <div className="rounded-2xl p-4 flex flex-col items-center gap-2.5 text-center" style={{ background: 'var(--color-surface-2)' }}>
                    <p className="text-[12.5px] text-text-3">
                      {!lead.instagramUrl
                        ? 'This lead has no Instagram profile.'
                        : analysisStatus === 'completed' && !isOutreachEligible(lead)
                        ? notHighPriorityMessage(lead)
                        : !instagramReady
                        ? 'Complete AI analysis first.'
                        : instagramStatus === 'failed'
                        ? 'Draft generation failed — try again.'
                        : 'No Instagram DM drafted yet.'}
                    </p>
                    <button
                      onClick={handleGenerateInstagram}
                      disabled={generatingInstagram || !instagramReady}
                      className="flex items-center gap-1.5 h-8 px-3.5 rounded-full text-[12.5px] font-medium transition-all duration-150 hover:brightness-110 disabled:opacity-60"
                      style={{ background: 'var(--color-accent-3)', color: 'var(--color-on-accent-3)' }}
                    >
                      {generatingInstagram && <SpinnerIcon className="w-3.5 h-3.5 animate-spin" />}
                      {generatingInstagram ? 'Drafting…' : instagramStatus === 'failed' ? 'Retry Draft' : 'Draft Instagram DM'}
                    </button>
                    <DemoToggle checked={includeDemoInInstagram} onChange={setIncludeDemoInInstagram} demoReady={demoStatus === 'completed'} />
                    {instagramError && <p className="text-[12px]" style={{ color: 'var(--color-danger)' }}>{instagramError}</p>}
                  </div>
                )}
              </Section>

              <Section label="Facebook Outreach">
                {facebookStatus === 'opened' ? (
                  <div className="space-y-3">
                    <div className="rounded-2xl p-3" style={{ background: 'var(--color-surface-2)' }}>
                      <p className="text-[12.5px] text-text-2 whitespace-pre-wrap leading-relaxed">{facebookOutreach.message}</p>
                    </div>
                    <p className="text-[11.5px] text-text-3">
                      Copied and opened {facebookOutreach.openedAt ? new Date(facebookOutreach.openedAt).toLocaleString() : ''} — Facebook has no way to pre-fill or confirm a Messenger message, so this only tracks that you copied the message and opened the page.
                    </p>
                    <button
                      onClick={handleCopyAndOpenFacebook}
                      className="text-[12.5px] font-medium text-text-2 hover:text-text transition-colors duration-150"
                    >
                      {facebookCopied ? 'Copied!' : 'Copy again & open'}
                    </button>
                    {facebookError && <p className="text-[12px]" style={{ color: 'var(--color-danger)' }}>{facebookError}</p>}
                  </div>
                ) : facebookStatus === 'drafted' ? (
                  <div className="space-y-2.5">
                    {!lead.facebookUrl && (
                      <p className="text-[12px] rounded-2xl p-2.5" style={{ color: 'var(--color-danger)', background: 'var(--color-surface-2)' }}>
                        This lead has no Facebook page — cannot open it.
                      </p>
                    )}
                    <textarea
                      value={facebookMessage}
                      onChange={(e) => setFacebookMessage(e.target.value)}
                      maxLength={2000}
                      rows={5}
                      className="w-full px-2.5 py-2 rounded-xl text-[12.5px] text-text border resize-y leading-relaxed"
                      style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}
                      placeholder="Message"
                    />
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleCopyAndOpenFacebook}
                        disabled={savingFacebookDraft || !facebookMessage.trim() || !lead.facebookUrl}
                        className="flex-1 flex items-center justify-center h-8 px-3.5 rounded-full text-[12.5px] font-medium transition-all duration-150 hover:brightness-110 disabled:opacity-60"
                        style={{ background: 'var(--color-accent-3)', color: 'var(--color-on-accent-3)' }}
                      >
                        {facebookCopied ? 'Copied!' : 'Copy & Open Facebook'}
                      </button>
                      <button
                        onClick={handleSaveFacebookDraft}
                        disabled={savingFacebookDraft}
                        className="text-[12.5px] font-medium text-text-2 hover:text-text transition-colors duration-150 disabled:opacity-50"
                      >
                        {savingFacebookDraft ? 'Saving…' : 'Save Draft'}
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <button
                        onClick={handleGenerateFacebook}
                        disabled={generatingFacebook}
                        className="text-[12.5px] font-medium text-text-2 hover:text-text transition-colors duration-150 disabled:opacity-50"
                      >
                        {generatingFacebook ? 'Regenerating…' : 'Regenerate Draft'}
                      </button>
                      <DemoToggle checked={includeDemoInFacebook} onChange={setIncludeDemoInFacebook} demoReady={demoStatus === 'completed'} />
                    </div>
                    {facebookError && <p className="text-[12px]" style={{ color: 'var(--color-danger)' }}>{facebookError}</p>}
                  </div>
                ) : (
                  <div className="rounded-2xl p-4 flex flex-col items-center gap-2.5 text-center" style={{ background: 'var(--color-surface-2)' }}>
                    <p className="text-[12.5px] text-text-3">
                      {!lead.facebookUrl
                        ? 'This lead has no Facebook page.'
                        : analysisStatus === 'completed' && !isOutreachEligible(lead)
                        ? notHighPriorityMessage(lead)
                        : !facebookReady
                        ? 'Complete AI analysis first.'
                        : facebookStatus === 'failed'
                        ? 'Draft generation failed — try again.'
                        : 'No Facebook message drafted yet.'}
                    </p>
                    <button
                      onClick={handleGenerateFacebook}
                      disabled={generatingFacebook || !facebookReady}
                      className="flex items-center gap-1.5 h-8 px-3.5 rounded-full text-[12.5px] font-medium transition-all duration-150 hover:brightness-110 disabled:opacity-60"
                      style={{ background: 'var(--color-accent-3)', color: 'var(--color-on-accent-3)' }}
                    >
                      {generatingFacebook && <SpinnerIcon className="w-3.5 h-3.5 animate-spin" />}
                      {generatingFacebook ? 'Drafting…' : facebookStatus === 'failed' ? 'Retry Draft' : 'Draft Facebook Message'}
                    </button>
                    <DemoToggle checked={includeDemoInFacebook} onChange={setIncludeDemoInFacebook} demoReady={demoStatus === 'completed'} />
                    {facebookError && <p className="text-[12px]" style={{ color: 'var(--color-danger)' }}>{facebookError}</p>}
                  </div>
                )}
              </Section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
