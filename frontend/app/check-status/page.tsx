'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function CheckStatusPage() {
  const router = useRouter();
  const [query,   setQuery]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError('');
    try {
      const res  = await fetch(`${API}/api/status/lookup?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      if (json.success) {
        router.push(`/status?id=${encodeURIComponent(json.data.registrationId)}`);
      } else {
        setError('No record found. Please check your Registration ID or Phone number.\nഈ വിവരങ്ങൾ കണ്ടെത്തിയില്ല. ദയവായി വീണ്ടും ശ്രമിക്കുക.');
      }
    } catch {
      setError('Could not connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: '#f0f9ff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ display: 'inline-block', background: '#0369a1', borderRadius: 16, padding: '10px 18px', marginBottom: 12 }}>
          <img src="/logo.webp" alt="Life and Limb" style={{ height: 64, width: 'auto', objectFit: 'contain', display: 'block' }} />
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#0c4a6e' }}>Life and Limb</div>
        <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Application Status · അപേക്ഷയുടെ നില</div>
      </div>

      {/* Card */}
      <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e2e8f0', width: '100%', maxWidth: 420, boxShadow: '0 4px 24px rgba(3,105,161,0.08)', padding: '32px 28px' }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: '#0c4a6e', marginBottom: 6, marginTop: 0 }}>
          Check Your Status
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24, marginTop: 0, lineHeight: 1.6 }}>
          Enter your <strong>Registration ID</strong> or <strong>Phone number</strong> to see your application status.
          <br />
          <span lang="ml" style={{ fontSize: 12 }}>നിങ്ങളുടെ രജിസ്ട്രേഷൻ ഐഡി അല്ലെങ്കിൽ ഫോൺ നമ്പർ നൽകുക.</span>
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setError(''); }}
            placeholder="e.g. LL-2025-0001 or 94470XXXXX"
            style={{
              width: '100%', height: 48, padding: '0 14px', fontSize: 15,
              border: `1.5px solid ${error ? '#fca5a5' : '#e2e8f0'}`,
              borderRadius: 10, outline: 'none', boxSizing: 'border-box',
              color: '#1e293b', background: 'white',
            }}
            autoFocus
          />

          {error && (
            <div style={{ marginTop: 10, padding: '10px 12px', background: '#FEF2F2', borderRadius: 8, fontSize: 12, color: '#DC2626', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !query.trim()}
            style={{
              marginTop: 16, width: '100%', height: 48, background: loading || !query.trim() ? '#94a3b8' : '#0369a1',
              color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600,
              cursor: loading || !query.trim() ? 'not-allowed' : 'pointer', transition: 'background 0.2s',
            }}
          >
            {loading ? 'Searching…' : 'Check Status →'}
          </button>
        </form>

        <div style={{ marginTop: 20, padding: '12px', background: '#f0f9ff', borderRadius: 10, fontSize: 12, color: '#0369a1', lineHeight: 1.6, textAlign: 'center' }}>
          For queries, contact Life and Limb · കൂടുതൽ വിവരങ്ങൾക്ക് ഞങ്ങളെ ബന്ധപ്പെടുക
        </div>
      </div>
    </main>
  );
}
