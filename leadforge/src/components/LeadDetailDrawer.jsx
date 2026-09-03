import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import WebsiteStatusBadge from './WebsiteStatusBadge';
import API_BASE from '../config';

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
    <div className="rounded-md px-3 py-2.5 flex-1" style={{ background: 'var(--color-surface-2)' }}>
      <div className="text-[10.5px] font-medium uppercase tracking-wider text-text-3 mb-1">{label}</div>
      <div className="font-mono text-[20px] font-semibold tnum" style={{ color: color || 'var(--color-text)' }}>
        {typeof value === 'number' ? value : '—'}
      </div>
    </div>
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

// Mirrors routes/leads.js's isOutreachEligible/notHighPriorityMessage — an 'unverified'
// website (status simply unknown, likely bot-blocked our check) is allowed through same as a
// confirmed poor/missing one; only a CONFIRMED solid website blocks outreach.
function isOutreachEligible(lead) {
  return !!lead.highPriority || lead.websiteStatus === 'unverified';
}

function notHighPriorityMessage() {
  return 'This lead already has a solid website — outreach is only for leads without a confirmed solid site.';
}

export default function LeadDetailDrawer({ lead, onClose, onUpdated }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [generatingDemo, setGeneratingDemo] = useState(false);
  const [demoError, setDemoError] = useState(null);
  const [generatingOutreach, setGeneratingOutreach] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [sending, setSending] = useState(false);
  const [outreachError, setOutreachError] = useState(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [generatingWhatsapp, setGeneratingWhatsapp] = useState(false);
  const [savingWhatsappDraft, setSavingWhatsappDraft] = useState(false);
  const [whatsappError, setWhatsappError] = useState(null);
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [generatingFollowUpEmail, setGeneratingFollowUpEmail] = useState(false);
  const [sendingFollowUpEmail, setSendingFollowUpEmail] = useState(false);
  const [followUpEmailError, setFollowUpEmailError] = useState(null);
  const [followUpSubject, setFollowUpSubject] = useState('');
  const [followUpBody, setFollowUpBody] = useState('');
  const [generatingFollowUpWhatsapp, setGeneratingFollowUpWhatsapp] = useState(false);
  const [followUpWhatsappError, setFollowUpWhatsappError] = useState(null);
  const [followUpWhatsappMessage, setFollowUpWhatsappMessage] = useState('');

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

  const handleAnalyze = async () => {
    if (!lead) return;
    setAnalyzing(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/leads/${lead._id}/analyze`, { method: 'POST' });
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

  const handleGenerateDemo = async () => {
    if (!lead) return;
    setGeneratingDemo(true);
    setDemoError(null);
    try {
      const res = await fetch(`${API_BASE}/api/leads/${lead._id}/generate-demo`, { method: 'POST' });
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

  const handleGenerateOutreach = async () => {
    if (!lead) return;
    setGeneratingOutreach(true);
    setOutreachError(null);
    try {
      const res = await fetch(`${API_BASE}/api/leads/${lead._id}/generate-outreach`, { method: 'POST' });
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
    const res = await fetch(`${API_BASE}/api/leads/${lead._id}/outreach`, {
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
    if (!window.confirm(`Send this email to ${lead.email}? This cannot be undone.`)) return;
    setSending(true);
    setOutreachError(null);
    try {
      await saveDraft();
      const res = await fetch(`${API_BASE}/api/leads/${lead._id}/send-outreach`, { method: 'POST' });
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
      const res = await fetch(`${API_BASE}/api/leads/${lead._id}/generate-whatsapp`, { method: 'POST' });
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
    const res = await fetch(`${API_BASE}/api/leads/${lead._id}/whatsapp`, {
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
      const res = await fetch(`${API_BASE}/api/leads/${lead._id}/whatsapp-opened`, { method: 'POST' });
      if (res.ok) onUpdated?.(await res.json());
    } catch (err) {
      setWhatsappError(err.message || 'Could not open WhatsApp.');
    }
  };

  const handleGenerateFollowUpEmail = async () => {
    if (!lead) return;
    setGeneratingFollowUpEmail(true);
    setFollowUpEmailError(null);
    try {
      const res = await fetch(`${API_BASE}/api/leads/${lead._id}/generate-followup-email`, { method: 'POST' });
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
    const res = await fetch(`${API_BASE}/api/leads/${lead._id}/followup-email`, {
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
    if (!window.confirm(`Send this follow-up to ${lead.email}? This cannot be undone.`)) return;
    setSendingFollowUpEmail(true);
    setFollowUpEmailError(null);
    try {
      await saveFollowUpEmailDraft();
      const res = await fetch(`${API_BASE}/api/leads/${lead._id}/send-followup-email`, { method: 'POST' });
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
      const res = await fetch(`${API_BASE}/api/leads/${lead._id}/generate-followup-whatsapp`, { method: 'POST' });
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
    const res = await fetch(`${API_BASE}/api/leads/${lead._id}/followup-whatsapp`, {
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
      const res = await fetch(`${API_BASE}/api/leads/${lead._id}/followup-whatsapp-opened`, { method: 'POST' });
      if (res.ok) onUpdated?.(await res.json());
    } catch (err) {
      setFollowUpWhatsappError(err.message || 'Could not open WhatsApp.');
    }
  };

  const analysis = lead?.aiAnalysis;
  const analysisStatus = analysis?.status || 'pending';
  const demoSite = lead?.demoSite;
  const demoStatus = demoSite?.status || 'pending';
  const outreach = lead?.outreach;
  const outreachStatus = outreach?.status || 'pending';
  const outreachReady = analysisStatus === 'completed' && demoStatus === 'completed' && isOutreachEligible(lead || {});
  const whatsappOutreach = lead?.whatsappOutreach;
  const whatsappStatus = whatsappOutreach?.status || 'pending';
  const whatsappReady = outreachReady && !!lead?.phone;
  const followUpEmail = lead?.outreachFollowUp;
  const followUpEmailStatus = followUpEmail?.status || 'pending';
  const followUpWhatsapp = lead?.whatsappFollowUp;
  const followUpWhatsappStatus = followUpWhatsapp?.status || 'pending';

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
            className="fixed top-0 right-0 z-50 h-full w-[440px] max-w-full overflow-y-auto border-l"
            style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
          >
            <div
              className="sticky top-0 z-10 flex items-start justify-between gap-3 px-5 py-4 border-b backdrop-blur-sm"
              style={{ background: 'color-mix(in srgb, var(--color-bg) 90%, transparent)', borderColor: 'var(--color-border)' }}
            >
              <div className="min-w-0">
                <h2 className="text-[15px] font-semibold text-text truncate">{lead.businessName}</h2>
                <p className="text-[12px] text-text-3 mt-0.5">{lead.category || lead.keyword}</p>
              </div>
              <button
                onClick={onClose}
                className="shrink-0 w-7 h-7 flex items-center justify-center rounded-md text-text-2 hover:text-text hover:bg-surface-2 transition-colors duration-150"
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
                  <div className="rounded-md px-3 py-2.5" style={{ background: 'var(--color-surface-2)' }}>
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
                  <div className="rounded-md px-3 py-2.5" style={{ background: 'var(--color-surface-2)' }}>
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
              </Section>

              <Section label="AI Business Report">
                {analysisStatus === 'completed' ? (
                  <div className="space-y-4">
                    <p className="text-[13px] text-text-2 leading-relaxed">{analysis.summary}</p>

                    <div className="flex gap-2.5">
                      <ScoreChip label="Lead Quality" value={analysis.leadQualityScore} color="var(--color-accent)" />
                      <ScoreChip label="Site Opportunity" value={analysis.websiteOpportunityScore} color="var(--color-accent-2)" />
                    </div>

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

                    <div className="rounded-md p-3 space-y-1.5" style={{ background: 'var(--color-surface-2)' }}>
                      <div className="flex justify-between text-[12.5px]">
                        <span className="text-text-3">Est. lost customers</span>
                        <span className="text-text text-right">{analysis.estimatedLostCustomers || '—'}</span>
                      </div>
                      <div className="flex justify-between text-[12.5px]">
                        <span className="text-text-3">Revenue opportunity</span>
                        <span className="text-text text-right">{analysis.revenueOpportunityEstimate || '—'}</span>
                      </div>
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
                  <div className="rounded-md border border-dashed p-4 flex flex-col items-center gap-2.5 text-center" style={{ borderColor: 'var(--color-border-strong)' }}>
                    <p className="text-[12.5px] text-text-3">
                      {analysisStatus === 'failed'
                        ? 'Analysis failed — try again.'
                        : 'This lead hasn’t been analyzed yet.'}
                    </p>
                    <button
                      onClick={handleAnalyze}
                      disabled={analyzing}
                      className="flex items-center gap-1.5 h-8 px-3.5 rounded text-[12.5px] font-medium transition-all duration-150 hover:brightness-110 disabled:opacity-60"
                      style={{ background: 'var(--color-accent)', color: '#ffffff' }}
                    >
                      {analyzing && <SpinnerIcon className="w-3.5 h-3.5 animate-spin" />}
                      {analyzing ? 'Analyzing…' : analysisStatus === 'failed' ? 'Retry Analysis' : 'Analyze Now'}
                    </button>
                    {error && <p className="text-[12px]" style={{ color: 'var(--color-danger)' }}>{error}</p>}
                  </div>
                )}
              </Section>

              <Section label="Demo Website">
                {demoStatus === 'completed' ? (
                  <div className="space-y-3">
                    <div className="rounded-md p-3" style={{ background: 'var(--color-surface-2)' }}>
                      <p className="text-[12.5px] text-text-2 italic">"{demoSite.tagline}"</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <a
                        href={`/demo/${lead._id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 flex items-center justify-center h-8 px-3.5 rounded text-[12.5px] font-medium transition-all duration-150 hover:brightness-110"
                        style={{ background: 'var(--color-accent-2)', color: 'var(--color-on-accent-2)' }}
                      >
                        Preview Demo
                      </a>
                      <button
                        onClick={handleGenerateDemo}
                        disabled={generatingDemo}
                        className="text-[12.5px] font-medium text-text-2 hover:text-text transition-colors duration-150 disabled:opacity-50"
                      >
                        {generatingDemo ? 'Regenerating…' : 'Regenerate'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed p-4 flex flex-col items-center gap-2.5 text-center" style={{ borderColor: 'var(--color-border-strong)' }}>
                    <p className="text-[12.5px] text-text-3">
                      {demoStatus === 'failed'
                        ? 'Demo generation failed — try again.'
                        : 'No demo website generated yet.'}
                    </p>
                    <button
                      onClick={handleGenerateDemo}
                      disabled={generatingDemo}
                      className="flex items-center gap-1.5 h-8 px-3.5 rounded text-[12.5px] font-medium transition-all duration-150 hover:brightness-110 disabled:opacity-60"
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
                    <div className="rounded-md p-3 space-y-2" style={{ background: 'var(--color-surface-2)' }}>
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
                          <div className="rounded-md p-3 space-y-1.5" style={{ background: 'var(--color-surface-2)' }}>
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
                            className="w-full h-8 px-2.5 rounded text-[12.5px] text-text border"
                            style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}
                            placeholder="Subject"
                          />
                          <textarea
                            value={followUpBody}
                            onChange={(e) => setFollowUpBody(e.target.value)}
                            maxLength={5000}
                            rows={5}
                            className="w-full px-2.5 py-2 rounded text-[12.5px] text-text border resize-y leading-relaxed"
                            style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}
                            placeholder="Body"
                          />
                          <div className="flex items-center gap-3">
                            <button
                              onClick={handleSendFollowUpEmail}
                              disabled={sendingFollowUpEmail || !followUpSubject.trim() || !followUpBody.trim()}
                              className="flex-1 flex items-center justify-center gap-1.5 h-8 px-3.5 rounded text-[12.5px] font-medium transition-all duration-150 hover:brightness-110 disabled:opacity-60"
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
                          </div>
                          {followUpEmailError && <p className="text-[12px]" style={{ color: 'var(--color-danger)' }}>{followUpEmailError}</p>}
                        </div>
                      ) : (
                        <div className="pt-3">
                          <button
                            onClick={handleGenerateFollowUpEmail}
                            disabled={generatingFollowUpEmail}
                            className="flex items-center gap-1.5 h-8 px-3.5 rounded text-[12.5px] font-medium text-text-2 hover:text-text transition-colors duration-150 disabled:opacity-50"
                          >
                            {generatingFollowUpEmail && <SpinnerIcon className="w-3.5 h-3.5 animate-spin" />}
                            {generatingFollowUpEmail ? 'Drafting…' : followUpEmailStatus === 'failed' ? 'Retry Follow-up' : 'Draft Follow-up'}
                          </button>
                          {followUpEmailError && <p className="text-[12px] mt-1.5" style={{ color: 'var(--color-danger)' }}>{followUpEmailError}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                ) : outreachStatus === 'drafted' ? (
                  <div className="space-y-2.5">
                    {!isOutreachEligible(lead) && (
                      <p className="text-[12px] rounded-md p-2.5" style={{ color: 'var(--color-danger)', background: 'var(--color-surface-2)' }}>
                        {notHighPriorityMessage()} Drafted before this restriction applied — sending is blocked.
                      </p>
                    )}
                    <input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      maxLength={200}
                      className="w-full h-8 px-2.5 rounded text-[12.5px] text-text border"
                      style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}
                      placeholder="Subject"
                    />
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      maxLength={5000}
                      rows={8}
                      className="w-full px-2.5 py-2 rounded text-[12.5px] text-text border resize-y leading-relaxed"
                      style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}
                      placeholder="Body"
                    />
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleSendOutreach}
                        disabled={sending || savingDraft || !subject.trim() || !body.trim() || !lead.email || !isOutreachEligible(lead)}
                        className="flex-1 flex items-center justify-center gap-1.5 h-8 px-3.5 rounded text-[12.5px] font-medium transition-all duration-150 hover:brightness-110 disabled:opacity-60"
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
                    <button
                      onClick={handleGenerateOutreach}
                      disabled={generatingOutreach}
                      className="text-[12.5px] font-medium text-text-2 hover:text-text transition-colors duration-150 disabled:opacity-50"
                    >
                      {generatingOutreach ? 'Regenerating…' : 'Regenerate Draft'}
                    </button>
                    {outreachError && <p className="text-[12px]" style={{ color: 'var(--color-danger)' }}>{outreachError}</p>}
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed p-4 flex flex-col items-center gap-2.5 text-center" style={{ borderColor: 'var(--color-border-strong)' }}>
                    <p className="text-[12.5px] text-text-3">
                      {analysisStatus === 'completed' && demoStatus === 'completed' && !isOutreachEligible(lead)
                        ? notHighPriorityMessage()
                        : !outreachReady
                        ? 'Complete AI analysis and demo generation first.'
                        : outreachStatus === 'failed'
                        ? 'Draft generation failed — try again.'
                        : 'No outreach email drafted yet.'}
                    </p>
                    <button
                      onClick={handleGenerateOutreach}
                      disabled={generatingOutreach || !outreachReady}
                      className="flex items-center gap-1.5 h-8 px-3.5 rounded text-[12.5px] font-medium transition-all duration-150 hover:brightness-110 disabled:opacity-60"
                      style={{ background: 'var(--color-accent)', color: '#ffffff' }}
                    >
                      {generatingOutreach && <SpinnerIcon className="w-3.5 h-3.5 animate-spin" />}
                      {generatingOutreach ? 'Drafting…' : outreachStatus === 'failed' ? 'Retry Draft' : 'Draft Outreach Email'}
                    </button>
                    {outreachError && <p className="text-[12px]" style={{ color: 'var(--color-danger)' }}>{outreachError}</p>}
                  </div>
                )}
              </Section>

              <Section label="WhatsApp Outreach">
                {whatsappStatus === 'opened' ? (
                  <div className="space-y-3">
                    <div className="rounded-md p-3" style={{ background: 'var(--color-surface-2)' }}>
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
                          <div className="rounded-md p-3" style={{ background: 'var(--color-surface-2)' }}>
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
                            className="w-full px-2.5 py-2 rounded text-[12.5px] text-text border resize-y leading-relaxed"
                            style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}
                            placeholder="Message"
                          />
                          <div className="flex items-center gap-3">
                            <button
                              onClick={handleOpenFollowUpWhatsapp}
                              disabled={!followUpWhatsappMessage.trim() || !lead.phone}
                              className="flex-1 flex items-center justify-center h-8 px-3.5 rounded text-[12.5px] font-medium transition-all duration-150 hover:brightness-110 disabled:opacity-60"
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
                          </div>
                          {followUpWhatsappError && <p className="text-[12px]" style={{ color: 'var(--color-danger)' }}>{followUpWhatsappError}</p>}
                        </div>
                      ) : (
                        <div className="pt-3">
                          <button
                            onClick={handleGenerateFollowUpWhatsapp}
                            disabled={generatingFollowUpWhatsapp}
                            className="flex items-center gap-1.5 h-8 px-3.5 rounded text-[12.5px] font-medium text-text-2 hover:text-text transition-colors duration-150 disabled:opacity-50"
                          >
                            {generatingFollowUpWhatsapp && <SpinnerIcon className="w-3.5 h-3.5 animate-spin" />}
                            {generatingFollowUpWhatsapp ? 'Drafting…' : followUpWhatsappStatus === 'failed' ? 'Retry Follow-up' : 'Draft Follow-up'}
                          </button>
                          {followUpWhatsappError && <p className="text-[12px] mt-1.5" style={{ color: 'var(--color-danger)' }}>{followUpWhatsappError}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                ) : whatsappStatus === 'drafted' ? (
                  <div className="space-y-2.5">
                    {!lead.phone && (
                      <p className="text-[12px] rounded-md p-2.5" style={{ color: 'var(--color-danger)', background: 'var(--color-surface-2)' }}>
                        This lead has no phone number — cannot open WhatsApp.
                      </p>
                    )}
                    <textarea
                      value={whatsappMessage}
                      onChange={(e) => setWhatsappMessage(e.target.value)}
                      maxLength={2000}
                      rows={5}
                      className="w-full px-2.5 py-2 rounded text-[12.5px] text-text border resize-y leading-relaxed"
                      style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}
                      placeholder="Message"
                    />
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleOpenWhatsapp}
                        disabled={savingWhatsappDraft || !whatsappMessage.trim() || !lead.phone}
                        className="flex-1 flex items-center justify-center gap-1.5 h-8 px-3.5 rounded text-[12.5px] font-medium transition-all duration-150 hover:brightness-110 disabled:opacity-60"
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
                    <button
                      onClick={handleGenerateWhatsapp}
                      disabled={generatingWhatsapp}
                      className="text-[12.5px] font-medium text-text-2 hover:text-text transition-colors duration-150 disabled:opacity-50"
                    >
                      {generatingWhatsapp ? 'Regenerating…' : 'Regenerate Draft'}
                    </button>
                    {whatsappError && <p className="text-[12px]" style={{ color: 'var(--color-danger)' }}>{whatsappError}</p>}
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed p-4 flex flex-col items-center gap-2.5 text-center" style={{ borderColor: 'var(--color-border-strong)' }}>
                    <p className="text-[12.5px] text-text-3">
                      {!lead.phone
                        ? 'This lead has no phone number.'
                        : analysisStatus === 'completed' && demoStatus === 'completed' && !isOutreachEligible(lead)
                        ? notHighPriorityMessage()
                        : !whatsappReady
                        ? 'Complete AI analysis and demo generation first.'
                        : whatsappStatus === 'failed'
                        ? 'Draft generation failed — try again.'
                        : 'No WhatsApp message drafted yet.'}
                    </p>
                    <button
                      onClick={handleGenerateWhatsapp}
                      disabled={generatingWhatsapp || !whatsappReady}
                      className="flex items-center gap-1.5 h-8 px-3.5 rounded text-[12.5px] font-medium transition-all duration-150 hover:brightness-110 disabled:opacity-60"
                      style={{ background: 'var(--color-accent-3)', color: 'var(--color-on-accent-3)' }}
                    >
                      {generatingWhatsapp && <SpinnerIcon className="w-3.5 h-3.5 animate-spin" />}
                      {generatingWhatsapp ? 'Drafting…' : whatsappStatus === 'failed' ? 'Retry Draft' : 'Draft WhatsApp Message'}
                    </button>
                    {whatsappError && <p className="text-[12px]" style={{ color: 'var(--color-danger)' }}>{whatsappError}</p>}
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
