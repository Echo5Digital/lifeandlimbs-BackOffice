'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const STATUS_LABELS: Record<string, { label: string; ml: string; color: string; bg: string; step: number }> = {
  new:                  { label: 'Registered',          ml: 'രജിസ്റ്റർ ചെയ്തു',           color: '#0369a1', bg: '#f0f9ff', step: 1 },
  ready_for_evaluation: { label: 'Ready for Evaluation', ml: 'മൂല്യനിർണ്ണയത്തിന് തയ്യാർ',    color: '#6D28D9', bg: '#F5F3FF', step: 2 },
  evaluated:            { label: 'Evaluated',            ml: 'മൂല്യനിർണ്ണയം ചെയ്തു',         color: '#065F46', bg: '#ECFDF5', step: 3 },
  approved:             { label: 'Approved',             ml: 'അംഗീകരിച്ചു',                  color: '#065F46', bg: '#ECFDF5', step: 4 },
  on_hold:              { label: 'On Hold',              ml: 'നിലവിൽ ഹോൾഡ് ചെയ്തിരിക്കുന്നു', color: '#4B5563', bg: '#F3F4F6', step: 2 },
  rejected:             { label: 'Not Approved',         ml: 'അംഗീകരിച്ചിട്ടില്ല',             color: '#991B1B', bg: '#FEF2F2', step: 0 },
  completed:            { label: 'Completed',            ml: 'പൂർത്തിയായി',                    color: '#065F46', bg: '#F0FDF4', step: 5 },
};

const STEPS = [
  { key: 'new',                  label: 'Registered',   ml: 'രജിസ്റ്റർ ചെയ്തു' },
  { key: 'ready_for_evaluation', label: 'Under Review', ml: 'അവലോകനത്തിൽ' },
  { key: 'evaluated',            label: 'Evaluated',    ml: 'മൂല്യനിർണ്ണയം' },
  { key: 'approved',             label: 'Approved',     ml: 'അംഗീകരിച്ചു' },
  { key: 'completed',            label: 'Completed',    ml: 'പൂർത്തിയായി' },
];

interface StatusData {
  registrationId: string;
  fullName: string;
  status: string;
  registeredAt: string;
  lastUpdatedAt?: string;
}

function StatusContent() {
  const params = useSearchParams();
  const regId  = params.get('id') || '';

  const [data,    setData]    = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!regId) { setError('No registration ID provided.'); setLoading(false); return; }
    fetch(`${API_URL}/api/status/${encodeURIComponent(regId)}`)
      .then(r => r.json())
      .then(j => {
        if (j.success) setData(j.data);
        else setError('Registration ID not found. · ഈ ഐഡി കണ്ടെത്തിയില്ല.');
      })
      .catch(() => setError('Could not connect. Please try again. · വീണ്ടും ശ്രമിക്കുക.'))
      .finally(() => setLoading(false));
  }, [regId]);

  const info    = data ? STATUS_LABELS[data.status] : null;
  const curStep = info?.step ?? 0;

  const fmtDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <main style={{ minHeight: '100vh', background: '#f0f9ff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Logo + header */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ display: 'inline-block', background: '#0369a1', borderRadius: 16, padding: '10px 18px', marginBottom: 12 }}>
          <img src="/logo.webp" alt="Life and Limbs" style={{ height: 64, width: 'auto', objectFit: 'contain', display: 'block' }} />
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#0c4a6e' }}>Life and Limb</div>
        <div style={{ fontSize: 13, color: '#64748b' }}>Application Status · അപേക്ഷയുടെ നില</div>
      </div>

      <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e2e8f0', width: '100%', maxWidth: 420, boxShadow: '0 4px 24px rgba(3,105,161,0.08)', overflow: 'hidden' }}>

        {loading && (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
            <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#0369a1', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }} />
            Checking status…
          </div>
        )}

        {!loading && error && (
          <div style={{ padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, background: '#FEF2F2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <div style={{ fontSize: 14, color: '#DC2626', lineHeight: 1.6 }}>{error}</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 12 }}>ID: {regId}</div>
          </div>
        )}

        {!loading && data && info && (
          <>
            {/* Status banner */}
            <div style={{ background: info.bg, borderBottom: '1px solid #e2e8f0', padding: '20px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Current Status</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: info.color }}>{info.label}</div>
              <div style={{ fontSize: 13, color: info.color, opacity: 0.8, marginTop: 3 }} lang="ml">{info.ml}</div>
            </div>

            {/* Progress steps */}
            {data.status !== 'rejected' && data.status !== 'on_hold' && (
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {STEPS.map((s, i) => {
                    const done    = curStep > i + 1;
                    const current = curStep === i + 1;
                    return (
                      <div key={s.key} style={{ display: 'contents' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: i < STEPS.length - 1 ? 'none' : 1 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: done ? '#0369a1' : current ? '#eab308' : '#e2e8f0',
                            color: done || current ? 'white' : '#94a3b8',
                            fontSize: 12, fontWeight: 700, flexShrink: 0,
                          }}>
                            {done ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg> : i + 1}
                          </div>
                          <div style={{ fontSize: 9, color: current ? '#0c4a6e' : '#94a3b8', marginTop: 4, textAlign: 'center', fontWeight: current ? 700 : 400, lineHeight: 1.3 }}>{s.label}</div>
                        </div>
                        {i < STEPS.length - 1 && (
                          <div style={{ flex: 1, height: 2, background: done ? '#0369a1' : '#e2e8f0', margin: '0 4px', marginBottom: 16, transition: 'background 0.3s' }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Patient info */}
            <div style={{ padding: '16px 24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Name</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{data.fullName}</div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Registration ID</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0369a1' }}>{data.registrationId}</div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Registered On</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#1e293b' }}>{fmtDate(data.registeredAt)}</div>
                </div>
                {data.lastUpdatedAt && (
                  <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 12px' }}>
                    <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Last Updated</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#1e293b' }}>{fmtDate(data.lastUpdatedAt)}</div>
                  </div>
                )}
              </div>
              <div style={{ marginTop: 16, padding: '12px', background: '#f0f9ff', borderRadius: 10, fontSize: 12, color: '#0369a1', lineHeight: 1.6, textAlign: 'center' }}>
                For queries, contact Life and Limb · കൂടുതൽ വിവരങ്ങൾക്ക് ഞങ്ങളെ ബന്ധപ്പെടുക
                <br />
                <a href="mailto:founder@lifeandlimbs.org" style={{ color: '#0369a1', fontWeight: 600 }}>founder@lifeandlimbs.org</a>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}

export default function StatusPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading…</div>}>
      <StatusContent />
    </Suspense>
  );
}
