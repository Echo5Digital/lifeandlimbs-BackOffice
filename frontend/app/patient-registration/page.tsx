'use client';
import { useState, useRef, useEffect, CSSProperties, Suspense } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ─── Colors (matches lifeandlimbs.org palette) ────────────────────────────────
const C = {
  dark:         '#0c4a6e',  // sky-900
  blue:         '#0369a1',  // sky-700 — primary
  mid:          '#0ea5e9',  // sky-500
  light:        '#f0f9ff',  // sky-50
  amber:        '#eab308',  // yellow-500 — website secondary
  border:       '#e2e8f0',  // slate-200
  borderStrong: '#cbd5e1',  // slate-300
  surface:      '#f8fafc',  // slate-50
  text:         '#1e293b',  // slate-800
  textSub:      '#64748b',  // slate-500
  textMuted:    '#94a3b8',  // slate-400
};

// ─── Shared styles ─────────────────────────────────────────────────────────────
const inp: CSSProperties = {
  width: '100%', height: 52, padding: '0 18px',
  border: `1.5px solid ${C.border}`, borderRadius: 12,
  fontSize: 16, color: C.text, background: C.surface,
  outline: 'none', boxSizing: 'border-box',
  fontFamily: "'Inter', system-ui, sans-serif", transition: 'border-color 0.2s',
};
const sel: CSSProperties = { ...inp, appearance: 'auto' };
const txa: CSSProperties = {
  ...inp, height: 'auto', padding: '14px 18px',
  minHeight: 120, resize: 'vertical', lineHeight: 1.7,
};
const subHead: CSSProperties = {
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSize: 13, fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: '0.09em', color: C.mid, marginBottom: 16,
};
const divider: CSSProperties = { height: 1, background: C.border, margin: '22px 0' };
const cardBox: CSSProperties = {
  background: 'white', borderRadius: 20, border: `1px solid ${C.border}`, marginBottom: 20,
};

// ─── Combobox (styled searchable dropdown) ────────────────────────────────────
function Combobox({ options, value, onChange, placeholder }: {
  options: string[]; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const filtered = value ? options.filter(o => o.toLowerCase().includes(value.toLowerCase())) : options;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <input
        style={{ ...inp, paddingRight: 40 }}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setOpen(true)}
        autoComplete="off"
      />
      <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: C.textMuted, fontSize: 13, lineHeight: 1 }}>▾</span>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 200,
          background: 'white', border: `1.5px solid ${C.borderStrong}`, borderRadius: 12,
          maxHeight: 220, overflowY: 'auto', boxShadow: '0 8px 28px rgba(3,105,161,0.13)',
        }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '12px 18px', fontSize: 14, color: C.textMuted, fontStyle: 'italic' }}>No match — your text will be saved</div>
          ) : filtered.map(opt => (
            <div
              key={opt}
              onMouseDown={() => { onChange(opt); setOpen(false); }}
              style={{
                padding: '11px 18px', cursor: 'pointer', fontSize: 15, color: C.text,
                background: value === opt ? C.light : 'white',
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = C.light; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = value === opt ? C.light : 'white'; }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function F({ label, sub, err, children }: { label: string; sub?: string; err?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <label style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.textSub, marginBottom: sub ? 3 : 8 }}>{label}</label>
      {sub && <span style={{ fontSize: 12, color: C.textMuted, marginBottom: 7 }}>{sub}</span>}
      {children}
      {err && <span style={{ fontSize: 12, color: '#DC2626', marginTop: 5 }}>⚠ {err}</span>}
    </div>
  );
}

// ─── Malayalam Transliteration Textarea ───────────────────────────────────────
// Akshaya operators type English phonetically (e.g. "njan veedu") → press Space → converts to Malayalam
function MlTextarea({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  const [mlMode, setMlMode]         = useState(false);
  const [converting, setConverting] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!mlMode || (e.key !== ' ' && e.key !== 'Enter')) return;
    const el = ref.current;
    if (!el) return;
    const pos      = el.selectionStart ?? value.length;
    const before   = value.slice(0, pos);
    const lastWord = before.split(/[\s\n]+/).pop() || '';
    if (!lastWord || /[\u0D00-\u0D7F]/.test(lastWord)) return;

    e.preventDefault();
    setConverting(true);
    try {
      const res  = await fetch(`${API_URL}/api/transliterate?q=${encodeURIComponent(lastWord)}`);
      const data = await res.json();
      const ml   = data.result || lastWord;
      const sep  = e.key === 'Enter' ? '\n' : ' ';
      const newVal = value.slice(0, pos - lastWord.length) + ml + sep + value.slice(pos);
      onChange(newVal);
      setTimeout(() => {
        if (!el) return;
        const newPos = pos - lastWord.length + ml.length + 1;
        el.selectionStart = el.selectionEnd = newPos;
      }, 0);
    } catch {
      onChange(value.slice(0, pos) + (e.key === 'Enter' ? '\n' : ' ') + value.slice(pos));
    } finally {
      setConverting(false);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setMlMode(m => !m)}
        title={mlMode ? 'Switch to English' : 'Click to type in Malayalam'}
        style={{
          position: 'absolute', top: 8, right: 8, zIndex: 10,
          padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer',
          border: `1.5px solid ${mlMode ? C.blue : C.border}`,
          background: mlMode ? C.blue : C.surface,
          color: mlMode ? 'white' : C.textMuted,
          transition: 'all 0.2s',
        }}
      >
        {converting ? '...' : mlMode ? 'English' : 'മലയാളം'}
      </button>
      <textarea
        ref={ref}
        style={{ ...txa, paddingRight: 64 } as CSSProperties}
        lang={mlMode ? 'ml' : 'en'}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      {mlMode && (
        <p style={{ fontSize: 11, color: C.textMuted, marginTop: 5, lineHeight: 1.6 }} lang="ml">
          ഇംഗ്ലീഷിൽ ടൈപ്പ് ചെയ്ത് <strong>Space</strong> അമർത്തിയാൽ മലയാളമാകും &nbsp;·&nbsp; ഉദാ: "njan" → "ഞാൻ" · "veedu" → "വീട്"
        </p>
      )}
    </div>
  );
}

// ─── Document upload helper ───────────────────────────────────────────────────
const DOC_ICONS = {
  camera: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  ),
  house: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
      <polyline points="9,21 9,12 15,12 15,21"/>
    </svg>
  ),
  idCard: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <circle cx="8" cy="12" r="2.5"/>
      <line x1="13" y1="10" x2="19" y2="10"/>
      <line x1="13" y1="14" x2="17" y2="14"/>
    </svg>
  ),
};

const ALL_DOCS = [
  { key: 'patientPhoto' as const, icon: DOC_ICONS.camera, en: 'Patient full picture that shows lost leg',               ml: 'നഷ്ടപ്പെട്ട കാല്‌ (കൾ) കാണിക്കുന്ന നിങ്ങളുടെ പൂർണ്ണ ചിത്രം', accept: 'image/*' },
  { key: 'housePhoto'   as const, icon: DOC_ICONS.house,  en: 'Picture of the entire house with Patient in front',      ml: 'നിങ്ങളുടെ വീടിന്റെ മുന്നിൽ നിന്ന് ഉള്ള മുഴുവൻ ചിത്രം',      accept: 'image/*' },
  { key: 'aadhaarCard'  as const, icon: DOC_ICONS.idCard, en: 'Aadhaar Card',                                           ml: 'നിങ്ങളുടെ ആധാർ കാർഡിന്റെ ചിത്രം',                           accept: 'image/*,application/pdf' },
];
type DocKey = 'patientPhoto' | 'housePhoto' | 'aadhaarCard';
type Docs   = Record<DocKey, File | null>;
type Prvw   = Record<DocKey, { name: string; originalSize: number; compressedSize: number | null } | null>;
type Urls   = Record<DocKey, string | null>;
const fmt = (b: number) => b < 1048576 ? (b / 1024).toFixed(0) + ' KB' : (b / 1048576).toFixed(1) + ' MB';

// ─── Section SVG icons ────────────────────────────────────────────────────────
const SEC_ICONS = [
  // 0 Personal — user
  <svg key="personal" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
  // 1 Documents — file text
  <svg key="documents" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>,
  // 2 Contact — map pin
  <svg key="contact" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>,
  // 3 Family — users
  <svg key="family" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="8" r="2.5"/><path d="M21 20c0-2.8-2-5-4.5-5.5"/></svg>,
  // 4 Occupation — briefcase
  <svg key="occupation" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="12"/><path d="M2 12h20"/></svg>,
  // 5 Referral — share
  <svg key="referral" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  // 6 Medical — activity / heartbeat
  <svg key="medical" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>,
  // 7 Prosthetic — settings / accessibility
  <svg key="prosthetic" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="2"/><path d="M12 7v5l3 3"/><path d="M9 12H6a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h2"/><path d="M15 17h2a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-3"/><line x1="10" y1="18" x2="10" y2="22"/><line x1="14" y1="18" x2="14" y2="22"/></svg>,
  // 8 Review — clipboard check
  <svg key="review" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><polyline points="9,12 11,14 15,10"/></svg>,
];

// ─── Sections config ──────────────────────────────────────────────────────────
const SECTIONS = [
  { label: 'Personal',   title: 'Personal Information',       sub: 'വ്യക്തിഗത വിവരങ്ങൾ' },
  { label: 'Documents',  title: 'Document Upload',             sub: 'ഡോക്കുമെന്റ് അപ്‌ലോഡ്' },
  { label: 'Contact',    title: 'Contact Information',         sub: 'ബന്ധപ്പെടാനുള്ള വിവരങ്ങൾ' },
  { label: 'Family',     title: 'Family Details',              sub: 'കുടുംബ വിവരങ്ങൾ' },
  { label: 'Occupation', title: 'Occupation & Financial',      sub: 'തൊഴിൽ & സാമ്പത്തിക' },
  { label: 'Referral',   title: 'Referral Information',        sub: 'റഫറൽ വിവരങ്ങൾ' },
  { label: 'Medical',    title: 'Medical History',             sub: 'ലിംബ് ലോസ് വിവരങ്ങൾ' },
  { label: 'Prosthetic', title: 'Prosthetic Usage Details',    sub: 'കൃത്രിമ അവയവ ഉപയോഗ വിവരങ്ങൾ' },
  { label: 'Review',     title: 'Review & Submit',             sub: 'സമർപ്പിക്കുക' },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
function PatientForm() {
  const router = useRouter();
  const [sec, setSec]   = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // Personal fields (required for initial API)
  const [p, setP] = useState({ fullName: '', firstName: '', lastName: '', age: '', dateOfBirth: '', gender: '', phone: '', email: '', maritalStatus: '' });
  const [pErr, setPErr] = useState<Record<string, string>>({});
  const sp = (k: string, v: string) => { setP(x => ({ ...x, [k]: v })); if (pErr[k]) setPErr(e => ({ ...e, [k]: '' })); };
  const spDob = (dob: string) => {
    const updates: Partial<typeof p> = { dateOfBirth: dob };
    if (dob) {
      const birth = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      if (age >= 0 && age < 130) updates.age = String(age);
    }
    setP(x => ({ ...x, ...updates }));
    setPErr(e => ({ ...e, dateOfBirth: '', age: '' }));
  };

  // Documents
  const [docs, setDocs]     = useState<Docs>({ patientPhoto: null, housePhoto: null, aadhaarCard: null });
  const [prvw, setPrvw]     = useState<Prvw>({ patientPhoto: null, housePhoto: null, aadhaarCard: null });
  const [urls, setUrls]     = useState<Urls>({ patientPhoto: null, housePhoto: null, aadhaarCard: null });
  const [compress, setCompress] = useState(true);
  const [compressing, setCompressing] = useState<DocKey | null>(null);
  const [docErr, setDocErr] = useState('');

  // Detail fields
  const [d, setD] = useState<Record<string, string>>({ country: 'India' });
  const [dErr, setDErr] = useState<Record<string, string>>({});
  const sd = (k: string, v: string) => { setD(x => ({ ...x, [k]: v })); if (dErr[k]) setDErr(e => ({ ...e, [k]: '' })); };

  const goTo = (i: number) => { setSec(i); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  // ── Document upload ──────────────────────────────────────────────────────────
  const handleDocFile = async (key: DocKey, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocErr('');
    const isImage = file.type.startsWith('image/');
    const needsCompress = compress && isImage && file.size > 1048576;
    let final = file;
    let cSize: number | null = null;
    if (needsCompress) {
      setCompressing(key);
      try {
        const mod = (await import('browser-image-compression')).default;
        const c = await mod(file, { maxSizeMB: 1, maxWidthOrHeight: 1280, useWebWorker: true, fileType: 'image/jpeg' });
        final = c as File;
        cSize = c.size;
      } catch { /* keep original */ }
      finally { setCompressing(null); }
    }
    setDocs(x => ({ ...x, [key]: final }));
    setPrvw(x => ({ ...x, [key]: { name: file.name, originalSize: file.size, compressedSize: cSize } }));
    if (isImage) setUrls(x => ({ ...x, [key]: URL.createObjectURL(final) }));
  };

  // ── Validation ───────────────────────────────────────────────────────────────
  const validatePersonal = () => {
    const e: Record<string, string> = {};
    if (!p.firstName.trim()) e.firstName = 'First name is required · പേര് നൽകണം';
    if (!p.dateOfBirth)      e.dateOfBirth = 'Date of birth is required · ജനന തീയതി നൽകണം';
    if (!p.age.trim() || isNaN(Number(p.age)) || Number(p.age) <= 0) e.age = 'Valid age required · ശരിയായ പ്രായം നൽകണം';
    if (!p.gender)           e.gender  = 'Select gender · ലിംഗം തിരഞ്ഞെടുക്കുക';
    if (!p.maritalStatus)    e.maritalStatus = 'Select marital status · വിവാഹാവസ്ഥ തിരഞ്ഞെടുക്കുക';
    if (!p.phone.trim())     e.phone   = 'Phone is required · ഫോൺ നൽകണം';
    else if (!/^\d{10}$/.test(p.phone.replace(/\s/g, ''))) e.phone = 'Enter 10-digit number';
    setPErr(e);
    return Object.keys(e).length === 0;
  };
  const validateDocs = () => {
    if (!docs.patientPhoto || !docs.housePhoto || !docs.aadhaarCard) {
      setDocErr('All 3 documents are required before continuing · മൂന്ന് ഡോക്കുമെന്റുകളും നൽകണം');
      return false;
    }
    setDocErr('');
    return true;
  };

  const validateSection = (s: number): boolean => {
    const e: Record<string, string> = {};
    // Section 2: Contact
    if (s === 2) {
      if (!d.addressHouse?.trim()) e.addressHouse = 'Address is required · വിലാസം നൽകണം';
      if (!d.addressPO?.trim())    e.addressPO    = 'Post office is required · പോസ്റ്റ് ഓഫീസ് നൽകണം';
      if (!d.city?.trim())         e.city         = 'City is required · നഗരം നൽകണം';
      if (!d.district?.trim())     e.district     = 'District is required · ജില്ല നൽകണം';
      if (!d.state?.trim())        e.state        = 'State is required · സംസ്ഥാനം നൽകണം';
      if (!d.homePhone?.trim() && !p.phone.trim()) e.homePhone = 'At least one phone number required · ഫോൺ നൽകണം';
    }
    // Section 3: Family — height and weight required; parent fields required if age < 20
    if (s === 3) {
      if (Number(p.age) < 20) {
        if (!d.fatherName?.trim())  e.fatherName  = 'Father\'s name is required · പിതാവിന്റെ പേര് നൽകണം';
        if (!d.motherName?.trim())  e.motherName  = 'Mother\'s name is required · മാതാവിന്റെ പേര് നൽകണം';
        if (!d.parentsPhone?.trim()) e.parentsPhone = 'Parents\' phone is required · ഫോൺ നൽകണം';
        else if (!/^\d{10}$/.test(d.parentsPhone.replace(/\s/g, ''))) e.parentsPhone = 'Enter 10-digit number · 10 അക്ക നമ്പർ നൽകണം';
      }
      if (!d.height?.trim()) e.height = 'Height is required · ഉയരം നൽകണം';
      if (!d.weight?.trim()) e.weight = 'Weight is required · ഭാരം നൽകണം';
    }
    // Section 4: Occupation
    if (s === 4) {
      if (!d.occupation?.trim())               e.occupation               = 'Occupation is required · തൊഴിൽ നൽകണം';
      if (!d.householdIncomeMonthly?.trim())   e.householdIncomeMonthly   = 'Monthly income is required · വരുമാനം നൽകണം';
      if (!d.householdAssets?.trim())          e.householdAssets          = 'Household assets required · ആസ്തി നൽകണം';
      if (!d.totalHouseholdAssetValue?.trim()) e.totalHouseholdAssetValue = 'Total asset value required · ആസ്തി മൂല്യം നൽകണം';
      if (!d.ownsHouse)                        e.ownsHouse                = 'Please select · തിരഞ്ഞെടുക്കുക';
    }
    // Section 5: Referral
    if (s === 5) {
      if (!d.howDidYouKnow) e.howDidYouKnow = 'Please select how you heard about us · തിരഞ്ഞെടുക്കുക';
    }
    // Section 6: Medical
    if (s === 6) {
      if (!d.dateLostLimb)           e.dateLostLimb    = 'Date of limb loss is required · തീയതി നൽകണം';
      if (!d.howLostLeg)             e.howLostLeg      = 'Please select how you lost your limb · കാരണം തിരഞ്ഞെടുക്കുക';
      if (!d.legsLostCount)          e.legsLostCount   = 'Please select number of legs lost · തിരഞ്ഞെടുക്കുക';
      if (!d.rightLeg)               e.rightLeg        = 'Right leg level required · തിരഞ്ഞെടുക്കുക';
      if (!d.leftLeg)                e.leftLeg         = 'Left leg level required · തിരഞ്ഞെടുക്കുക';
      if (!d.limbLossDetails?.trim()) e.limbLossDetails = 'Please describe the loss · വിവരം നൽകണം';
      if (!d.hospitalName?.trim())   e.hospitalName    = 'Hospital name is required · ഹോസ്പിറ്റൽ നൽകണം';
    }
    // Section 7: Prosthetic
    if (s === 7) {
      if (!d.usedProsthetic) e.usedProsthetic = 'Please select Yes or No · തിരഞ്ഞെടുക്കുക';
      if (d.usedProsthetic === 'yes') {
        if (!d.prostheticYears?.trim())  e.prostheticYears  = 'Please enter years used · വർഷം നൽകണം';
        if (!d.prostheticSource?.trim()) e.prostheticSource = 'Please enter where you got it from · എവിടെ നിന്ന് എന്ന് നൽകണം';
      }
      if (d.usedProsthetic) {
        if (!d.whyNewProsthetic?.trim()) e.whyNewProsthetic = 'Please describe why you need a new prosthetic · കാരണം നൽകണം';
      }
    }
    if (Object.keys(e).length > 0) { setDErr(x => ({ ...x, ...e })); return false; }
    return true;
  };

  const handleNext = () => {
    if (sec === 0 && !validatePersonal()) return;
    if (sec === 1 && !validateDocs())    return;
    if (!validateSection(sec))           return;
    goTo(sec + 1);
  };

  // ── Final submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      // Step 1: Initial registration with personal info + documents
      const fd = new FormData();
      fd.append('fullName', [p.firstName, p.lastName].filter(Boolean).join(' '));
      fd.append('age',      p.age);
      fd.append('gender',   p.gender);
      fd.append('phone',    p.phone);
      if (p.email)    fd.append('email',    p.email);
      if (docs.patientPhoto) fd.append('patientPhoto', docs.patientPhoto);
      if (docs.housePhoto)   fd.append('housePhoto',   docs.housePhoto);
      if (docs.aadhaarCard)  fd.append('aadhaarCard',  docs.aadhaarCard);

      const r1   = await fetch(`${API_URL}/api/register`, { method: 'POST', body: fd });
      const j1   = await r1.json();
      if (!r1.ok) throw new Error(j1.message || 'Registration failed');
      const regId = j1.registrationId;

      // Step 2: Save all detail fields
      const details: Record<string, string> = {
        firstName: p.firstName, lastName: p.lastName,
        dateOfBirth: p.dateOfBirth, maritalStatus: p.maritalStatus,
        ...d,
      };
      const r2 = await fetch(`${API_URL}/api/patients/${regId}/details`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(details),
      });
      if (!r2.ok) {
        const j2 = await r2.json();
        if (j2.duplicate) {
          throw new Error(
            `ഈ പേരും ജനന തീയതിയും പിൻ കോഡും ഉള്ള ഒരു രോഗി ഇതിനകം രജിസ്റ്റർ ചെയ്തിട്ടുണ്ട്.\nThis patient is already registered with the same name, date of birth and PIN code.`
          );
        }
        throw new Error(j2.message || 'Failed to save details.');
      }

      router.push(`/success?id=${regId}&at=${encodeURIComponent(new Date().toISOString())}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Section content ──────────────────────────────────────────────────────────
  const renderSection = () => {
    switch (sec) {

      // ─ 0: Personal ─────────────────────────────────────────────────────────
      case 0: return (
        <>
          <div className="reg-grid-3" style={{ marginBottom: 16 }}>
            <F label="First Name" sub="പേര്" err={pErr.firstName}>
              <input style={{ ...inp, ...(pErr.firstName ? { borderColor: '#EF4444', background: '#FEF2F2' } : {}) }}
                placeholder="e.g. Arun" value={p.firstName} onChange={e => sp('firstName', e.target.value)} />
            </F>
            <F label="Last Name" sub="കുടുംബപ്പേര്">
              <input style={inp} placeholder="e.g. Menon" value={p.lastName} onChange={e => sp('lastName', e.target.value)} />
            </F>
            <F label="Date of Birth" sub="ജനന തീയതി" err={pErr.dateOfBirth}>
              <input style={{ ...inp, ...(pErr.dateOfBirth ? { borderColor: '#EF4444', background: '#FEF2F2' } : {}) }} type="date" value={p.dateOfBirth} onChange={e => spDob(e.target.value)} />
            </F>
          </div>
          <div className="reg-grid-3" style={{ marginBottom: 16 }}>
            <F label="Age" sub={p.dateOfBirth ? 'Auto-calculated · സ്വയം കണക്കാക്കി' : 'പ്രായം'} err={pErr.age}>
              <input style={{ ...inp, ...(pErr.age ? { borderColor: '#EF4444', background: '#FEF2F2' } : {}), ...(p.dateOfBirth ? { background: '#F3F4F6', color: '#6B7280' } : {}) }}
                type="number" placeholder="Years" value={p.age} onChange={e => sp('age', e.target.value)}
                readOnly={!!p.dateOfBirth} />
            </F>
            <F label="Sex / Gender" sub="ലിംഗം" err={pErr.gender}>
              <select style={{ ...sel, ...(pErr.gender ? { borderColor: '#EF4444', background: '#FEF2F2' } : {}) }}
                value={p.gender} onChange={e => sp('gender', e.target.value)}>
                <option value="">Select / തിരഞ്ഞെടുക്കുക</option>
                <option value="male">Male · പുരുഷൻ</option>
                <option value="female">Female · സ്ത്രീ</option>
                <option value="other">Other · മറ്റ്</option>
              </select>
            </F>
            <F label="Marital Status" sub="വിവാഹാവസ്ഥ" err={pErr.maritalStatus}>
              <select style={{ ...sel, ...(pErr.maritalStatus ? { borderColor: '#EF4444', background: '#FEF2F2' } : {}) }} value={p.maritalStatus} onChange={e => sp('maritalStatus', e.target.value)}>
                <option value="">Select / തിരഞ്ഞെടുക്കുക</option>
                <option value="single">Single · അവിവാഹിതൻ/അവിവാഹിത</option>
                <option value="married">Married · വിവാഹിതൻ/വിവാഹിത</option>
                <option value="widowed">Widowed · വിധവ/വിധുരൻ</option>
                <option value="divorced">Divorced · വിവാഹമോചിതൻ/വിവാഹമോചിത</option>
              </select>
            </F>
          </div>
          <div className="reg-grid-3" style={{ marginBottom: 4 }}>
            <F label="Phone Number" sub="ഫോൺ നമ്പർ" err={pErr.phone}>
              <div style={{ display: 'flex', border: `1.5px solid ${pErr.phone ? '#EF4444' : C.border}`, borderRadius: 10, overflow: 'hidden' }}>
                <span style={{ display: 'flex', alignItems: 'center', padding: '0 18px', background: '#F9FAFB', borderRight: `1px solid ${C.border}`, fontSize: 16, fontWeight: 500, color: C.textSub, flexShrink: 0 }}>+91</span>
                <input style={{ ...inp, borderLeft: 'none', borderRadius: '0 10px 10px 0', flex: 1, width: 'auto', ...(pErr.phone ? { background: '#FEF2F2' } : {}) }}
                  type="tel" placeholder="XXXXX XXXXX" value={p.phone} onChange={e => sp('phone', e.target.value)} />
              </div>
            </F>
            <F label="Home Phone" sub="വീട്ടിലെ ഫോൺ" err={dErr.homePhone}>
              <input style={{ ...inp, ...(dErr.homePhone ? { borderColor: '#EF4444', background: '#FEF2F2' } : {}) }} type="tel" placeholder="+91 XXXXX XXXXX" value={d.homePhone || ''} onChange={e => sd('homePhone', e.target.value)} />
            </F>
            <F label="Email" sub="ഇ-മെയിൽ (optional)">
              <input style={inp} type="email" placeholder="email@example.com" value={p.email} onChange={e => sp('email', e.target.value)} />
            </F>
          </div>
        </>
      );

      // ─ 1: Documents ────────────────────────────────────────────────────────
      case 1: return (
        <>
          {docErr && (
            <div style={{ marginBottom: 14, padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, fontSize: 12, color: '#DC2626' }}>
              ⚠ {docErr}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {ALL_DOCS.map(doc => {
              const file = docs[doc.key];
              const pr   = prvw[doc.key];
              const url  = urls[doc.key];
              const pct  = pr?.compressedSize ? Math.round((1 - pr.compressedSize / pr.originalSize) * 100) : null;
              const isCompressing = compressing === doc.key;
              return (
                <label key={doc.key} style={{
                  display: 'block', border: `1.5px dashed ${file ? C.mid : C.border}`,
                  borderRadius: 14, padding: '18px 16px', cursor: 'pointer',
                  background: file ? C.light : C.surface, transition: 'all 0.2s',
                }}>
                  <input type="file" accept={doc.accept} style={{ display: 'none' }}
                    onChange={e => handleDocFile(doc.key, e)} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    {url ? (
                      <img src={url} alt={doc.en} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 10, border: `2px solid ${C.mid}`, flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 56, height: 56, background: C.light, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.blue, flexShrink: 0 }}>
                        {doc.icon}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: file ? C.blue : C.text, marginBottom: 3 }}>
                        {isCompressing ? 'Compressing...' : doc.en}{file ? ' ✓' : ''}
                      </div>
                      <div style={{ fontSize: 13, color: C.textMuted }} lang="ml">{doc.ml}</div>
                      {pr && (
                        <div style={{ fontSize: 12, color: C.textSub, marginTop: 5 }}>
                          {pr.name} · {fmt(pr.originalSize)}
                          {pr.compressedSize && pct ? <> → <strong style={{ color: C.blue }}>{fmt(pr.compressedSize)}</strong> · {pct}% saved</> : null}
                        </div>
                      )}
                      {!file && <div style={{ fontSize: 12, color: C.textMuted, marginTop: 5 }}>Tap to upload · Max 5 MB</div>}
                      {file && <div style={{ fontSize: 12, color: C.blue, marginTop: 5 }}>Tap to change · മാറ്റുക</div>}
                    </div>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${file ? C.blue : C.border}`, background: file ? C.blue : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {file && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', border: `1px solid ${C.border}`, borderRadius: 10, marginTop: 14 }}>
            <div>
              <span style={{ fontSize: 13, fontWeight: 500, color: C.text }}>Auto-compress images</span>
              <span style={{ fontSize: 11, color: C.textMuted, display: 'block', marginTop: 2 }}>ചിത്രങ്ങൾ സ്വയം ചെറുതാക്കുക</span>
            </div>
            <div style={{ width: 42, height: 24, borderRadius: 12, position: 'relative', cursor: 'pointer', background: compress ? C.blue : '#D1D5DB', transition: 'background 0.2s' }}
              onClick={() => setCompress(v => !v)}>
              <div style={{ position: 'absolute', top: 3, width: 18, height: 18, background: 'white', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.15)', transition: 'all 0.2s', right: compress ? 3 : 'auto', left: compress ? 'auto' : 3 }} />
            </div>
          </div>
        </>
      );

      // ─ 2: Contact ──────────────────────────────────────────────────────────
      case 2: return (
        <>
          <div style={{ marginBottom: 16 }}>
            <F label="Address / House Name" sub="വീടിന്റെ പേര്" err={dErr.addressHouse}>
              <input style={{ ...inp, ...(dErr.addressHouse ? { borderColor: '#EF4444', background: '#FEF2F2' } : {}) }} placeholder="House name or number" value={d.addressHouse || ''} onChange={e => sd('addressHouse', e.target.value)} />
            </F>
          </div>
          <div className="reg-grid-2" style={{ marginBottom: 16 }}>
            <F label="PO / Post Office" sub="പോസ്റ്റ് ഓഫീസ്" err={dErr.addressPO}><input style={{ ...inp, ...(dErr.addressPO ? { borderColor: '#EF4444', background: '#FEF2F2' } : {}) }} placeholder="Post office" value={d.addressPO || ''} onChange={e => sd('addressPO', e.target.value)} /></F>
            <F label="City / Town" sub="നഗരം" err={dErr.city}><input style={{ ...inp, ...(dErr.city ? { borderColor: '#EF4444', background: '#FEF2F2' } : {}) }} placeholder="City or town" value={d.city || ''} onChange={e => sd('city', e.target.value)} /></F>
            <F label="State" sub="സംസ്ഥാനം" err={dErr.state}>
              <Combobox
                placeholder="Select or type state · സംസ്ഥാനം തിരഞ്ഞെടുക്കുക"
                value={d.state || ''}
                onChange={v => { sd('state', v); sd('district', ''); }}
                options={['Andhra Pradesh · ആന്ധ്രാ പ്രദേശ്','Arunachal Pradesh · അരുണാചൽ പ്രദേശ്','Assam · അസം','Bihar · ബിഹാർ','Chhattisgarh · ഛത്തീസ്ഗഢ്','Goa · ഗോവ','Gujarat · ഗുജറാത്ത്','Haryana · ഹരിയാന','Himachal Pradesh · ഹിമാചൽ പ്രദേശ്','Jharkhand · ജാർഖണ്ഡ്','Karnataka · കർണാടക','Kerala · കേരളം','Madhya Pradesh · മധ്യ പ്രദേശ്','Maharashtra · മഹാരാഷ്ട്ര','Manipur · മണിപ്പൂർ','Meghalaya · മേഘാലയ','Mizoram · മിസോറം','Nagaland · നാഗാലാൻഡ്','Odisha · ഒഡിഷ','Punjab · പഞ്ചാബ്','Rajasthan · രാജസ്ഥാൻ','Sikkim · സിക്കിം','Tamil Nadu · തമിഴ്നാട്','Telangana · തെലങ്കാന','Tripura · ത്രിപുര','Uttar Pradesh · ഉത്തർ പ്രദേശ്','Uttarakhand · ഉത്തരാഖണ്ഡ്','West Bengal · പശ്ചിമ ബംഗാൾ','Andaman and Nicobar Islands · ആൻഡമാൻ നിക്കോബാർ','Chandigarh · ചണ്ഡീഗഢ്','Dadra and Nagar Haveli and Daman and Diu · ദാദ്ര നഗർ ഹവേലി ദമൻ ദിയു','Delhi · ഡൽഹി','Jammu and Kashmir · ജമ്മു കശ്മീർ','Ladakh · ലഡാക്ക്','Lakshadweep · ലക്ഷദ്വീപ്','Puducherry · പുതുച്ചേരി']}
              />
            </F>
            <F label="District" sub="ജില്ല" err={dErr.district}>
              {!d.state || d.state.includes('Kerala') ? (
                <Combobox
                  placeholder="Select or type district · ജില്ല തിരഞ്ഞെടുക്കുക"
                  value={d.district || ''}
                  onChange={v => sd('district', v)}
                  options={['Alappuzha · ആലപ്പുഴ','Ernakulam · എറണാകുളം','Idukki · ഇടുക്കി','Kannur · കണ്ണൂർ','Kasaragod · കാസർഗോഡ്','Kollam · കൊല്ലം','Kottayam · കോട്ടയം','Kozhikode · കോഴിക്കോട്','Malappuram · മലപ്പുറം','Palakkad · പാലക്കാട്','Pathanamthitta · പത്തനംതിട്ട','Thiruvananthapuram · തിരുവനന്തപുരം','Thrissur · തൃശ്ശൂർ','Wayanad · വയനാട്']}
                />
              ) : (
                <input
                  style={{ ...inp, ...(dErr.district ? { borderColor: '#EF4444', background: '#FEF2F2' } : {}) }}
                  placeholder="Enter district · ജില്ല നൽകുക"
                  value={d.district || ''}
                  onChange={e => sd('district', e.target.value)}
                />
              )}
            </F>
            <F label="Zipcode / PIN" sub="പിൻ കോഡ്"><input style={inp} placeholder="6-digit PIN" value={d.zipcode || ''} onChange={e => sd('zipcode', e.target.value)} /></F>
            <F label="Country" sub="രാജ്യം">
              <Combobox
                placeholder="Select or type country · രാജ്യം തിരഞ്ഞെടുക്കുക"
                value={d.country || ''}
                onChange={v => sd('country', v)}
                options={['India · ഇന്ത്യ','Afghanistan · അഫ്ഗാനിസ്ഥാൻ','Australia · ഓസ്‌ട്രേലിയ','Bangladesh · ബംഗ്ലാദേശ്','Bhutan · ഭൂട്ടാൻ','Canada · കാനഡ','China · ചൈന','France · ഫ്രാൻസ്','Germany · ജർമ്മനി','Indonesia · ഇൻഡോനേഷ്യ','Iran · ഇറാൻ','Iraq · ഇറാഖ്','Italy · ഇറ്റലി','Japan · ജപ്പാൻ','Malaysia · മലേഷ്യ','Maldives · മാലദ്വീപ്','Myanmar · മ്യാൻമാർ','Nepal · നേപ്പാൾ','New Zealand · ന്യൂസിലൻഡ്','Pakistan · പാകിസ്ഥാൻ','Philippines · ഫിലിപ്പൈൻസ്','Qatar · ഖത്തർ','Russia · റഷ്യ','Saudi Arabia · സൗദി അറേബ്യ','Singapore · സിംഗപ്പൂർ','South Korea · ദക്ഷിണ കൊറിയ','Sri Lanka · ശ്രീലങ്ക','Thailand · തായ്‌ലൻഡ്','Turkey · തുർക്കി','United Arab Emirates · യുഎഇ','United Kingdom · യുണൈറ്റഡ് കിംഗ്ഡം','United States · അമേരിക്ക']}
              />
            </F>
          </div>
        </>
      );

      // ─ 3: Family ───────────────────────────────────────────────────────────
      case 3: return (
        <>
          {Number(p.age) < 20 && (
            <>
              <div style={subHead}>Parent / Guardian</div>
              <div className="reg-grid-3" style={{ marginBottom: 4 }}>
                <F label="Father's Name" sub="പിതാവ്" err={dErr.fatherName}><input style={{ ...inp, ...(dErr.fatherName ? { borderColor: '#EF4444', background: '#FEF2F2' } : {}) }} placeholder="Father's full name" value={d.fatherName || ''} onChange={e => sd('fatherName', e.target.value)} /></F>
                <F label="Mother's Name" sub="മാതാവ്" err={dErr.motherName}><input style={{ ...inp, ...(dErr.motherName ? { borderColor: '#EF4444', background: '#FEF2F2' } : {}) }} placeholder="Mother's full name" value={d.motherName || ''} onChange={e => sd('motherName', e.target.value)} /></F>
                <F label="Parents' Phone" sub="ഫോൺ" err={dErr.parentsPhone}><input style={{ ...inp, ...(dErr.parentsPhone ? { borderColor: '#EF4444', background: '#FEF2F2' } : {}) }} type="tel" placeholder="+91 XXXXX XXXXX" value={d.parentsPhone || ''} onChange={e => sd('parentsPhone', e.target.value)} /></F>
              </div>
              <div style={divider} />
            </>
          )}
          {p.maritalStatus === 'married' && (
            <>
              <div style={subHead}>Spouse &amp; Children</div>
              <div className="reg-grid-3" style={{ marginBottom: 4 }}>
                <F label="Spouse Name" sub="പങ്കാളി"><input style={inp} placeholder="Spouse's full name" value={d.spouseName || ''} onChange={e => sd('spouseName', e.target.value)} /></F>
                <F label="Spouse Occupation" sub="തൊഴിൽ"><input style={inp} placeholder="Occupation" value={d.spouseOccupation || ''} onChange={e => sd('spouseOccupation', e.target.value)} /></F>
                <F label="Spouse Phone" sub="ഫോൺ"><input style={inp} type="tel" placeholder="+91 XXXXX XXXXX" value={d.spousePhone || ''} onChange={e => sd('spousePhone', e.target.value)} /></F>
                <F label="No. of Children" sub="കുട്ടികൾ"><input style={inp} type="number" placeholder="0" min="0" value={d.childrenCount || ''} onChange={e => sd('childrenCount', e.target.value)} /></F>
                <F label="Years Married" sub="വർഷം"><input style={inp} type="number" placeholder="Years" min="0" value={d.yearsMarried || ''} onChange={e => sd('yearsMarried', e.target.value)} /></F>
              </div>
              <div style={divider} />
            </>
          )}
          <div style={subHead}>Physical Details</div>
          <div className="reg-grid-2">
            <F label="Height" sub="ഉയരം" err={dErr.height}><input style={{ ...inp, ...(dErr.height ? { borderColor: '#EF4444', background: '#FEF2F2' } : {}) }} placeholder="e.g. 165 cm" value={d.height || ''} onChange={e => sd('height', e.target.value)} /></F>
            <F label="Weight" sub="ഭാരം" err={dErr.weight}><input style={{ ...inp, ...(dErr.weight ? { borderColor: '#EF4444', background: '#FEF2F2' } : {}) }} placeholder="e.g. 65 kg" value={d.weight || ''} onChange={e => sd('weight', e.target.value)} /></F>
          </div>
        </>
      );

      // ─ 4: Occupation ───────────────────────────────────────────────────────
      case 4: return (
        <>
          <div className="reg-grid-3">
            <F label="Occupation" sub="തൊഴിൽ" err={dErr.occupation}><input style={{ ...inp, ...(dErr.occupation ? { borderColor: '#EF4444', background: '#FEF2F2' } : {}) }} placeholder="e.g. Farmer, Teacher" value={d.occupation || ''} onChange={e => sd('occupation', e.target.value)} /></F>
            <F label="Monthly Household Income" sub="പ്രതിമാസ വരുമാനം" err={dErr.householdIncomeMonthly}><input style={{ ...inp, ...(dErr.householdIncomeMonthly ? { borderColor: '#EF4444', background: '#FEF2F2' } : {}) }} placeholder="₹ Amount" value={d.householdIncomeMonthly || ''} onChange={e => sd('householdIncomeMonthly', e.target.value)} /></F>
            <F label="Household Assets" sub="ആസ്തി" err={dErr.householdAssets}><input style={{ ...inp, ...(dErr.householdAssets ? { borderColor: '#EF4444', background: '#FEF2F2' } : {}) }} placeholder="Bike / Car / Land" value={d.householdAssets || ''} onChange={e => sd('householdAssets', e.target.value)} /></F>
            <F label="Total Asset Value" sub="മൊത്തം ആസ്തി മൂല്യം" err={dErr.totalHouseholdAssetValue}><input style={{ ...inp, ...(dErr.totalHouseholdAssetValue ? { borderColor: '#EF4444', background: '#FEF2F2' } : {}) }} placeholder="₹ Estimated" value={d.totalHouseholdAssetValue || ''} onChange={e => sd('totalHouseholdAssetValue', e.target.value)} /></F>
            <F label="Own a House?" sub="സ്വന്തമായി വീടുണ്ടോ?" err={dErr.ownsHouse}>
              <select style={{ ...sel, ...(dErr.ownsHouse ? { borderColor: '#EF4444', background: '#FEF2F2' } : {}) }} value={d.ownsHouse || ''} onChange={e => sd('ownsHouse', e.target.value)}>
                <option value="">Select / തിരഞ്ഞെടുക്കുക</option>
                <option value="yes">Yes · ഉണ്ട്</option>
                <option value="no">No · ഇല്ല</option>
                <option value="rented">Rented · വാടകയ്ക്ക്</option>
              </select>
            </F>
          </div>
        </>
      );

      // ─ 5: Referral ─────────────────────────────────────────────────────────
      case 5: return (
        <>
          <div className="reg-grid-2">
            <F label="How did you hear about us?" sub="ലൈഫ് & ലിംബ് നെ കുറിച്ച് അറിഞ്ഞത്" err={dErr.howDidYouKnow}>
              <select style={{ ...sel, ...(dErr.howDidYouKnow ? { borderColor: '#EF4444', background: '#FEF2F2' } : {}) }} value={d.howDidYouKnow || ''} onChange={e => sd('howDidYouKnow', e.target.value)}>
                <option value="">Select one / ഒന്ന് തിരഞ്ഞെടുക്കുക</option>
                <option value="doctor">Doctor / Hospital · ഡോക്ടർ / ആശുപത്രി</option>
                <option value="ngo">NGO / Social Worker · എൻജിഒ / സോഷ്യൽ വർക്കർ</option>
                <option value="friend">Friend / Family · സുഹൃത്ത് / കുടുംബം</option>
                <option value="social_media">Social Media · സോഷ്യൽ മീഡിയ</option>
                <option value="govt_camp">Government Camp · സർക്കാർ ക്യാമ്പ്</option>
                <option value="other">Other · മറ്റ്</option>
              </select>
            </F>
            <F label="Referred By" sub="ആരാണ് ശുപാർശ ചെയ്തത്"><input style={inp} placeholder="Name of referrer" value={d.referredBy || ''} onChange={e => sd('referredBy', e.target.value)} /></F>
          </div>
        </>
      );

      // ─ 6: Medical ──────────────────────────────────────────────────────────
      case 6: return (
        <>
          <div style={{ marginBottom: 14, padding: '12px 16px', background: C.light, borderRadius: 10, fontSize: 13, color: C.dark, display: 'flex', gap: 10 }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>ℹ️</span>
            <span>Please fill in as much detail as possible — this helps us prepare the right prosthetic solution.</span>
          </div>
          <div style={subHead}>Limb Loss Details</div>
          <div className="reg-grid-3" style={{ marginBottom: 16 }}>
            <F label="Date of Limb Loss" sub="കാലുകൾ നഷ്ടപ്പെട്ട തീയതി" err={dErr.dateLostLimb}><input style={{ ...inp, ...(dErr.dateLostLimb ? { borderColor: '#EF4444', background: '#FEF2F2' } : {}) }} type="date" value={d.dateLostLimb || ''} onChange={e => {
              const val = e.target.value;
              sd('dateLostLimb', val);
              if (val) {
                const lost = new Date(val);
                const today = new Date();
                let yrs = today.getFullYear() - lost.getFullYear();
                const m = today.getMonth() - lost.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < lost.getDate())) yrs--;
                if (yrs >= 0 && yrs < 130) sd('yearsLost', String(yrs));
              }
            }} /></F>
            <F label="How did you lose your limb?" sub="കാരണം" err={dErr.howLostLeg}>
              <select style={{ ...sel, ...(dErr.howLostLeg ? { borderColor: '#EF4444', background: '#FEF2F2' } : {}) }} value={d.howLostLeg || ''} onChange={e => sd('howLostLeg', e.target.value)}>
                <option value="">Select / തിരഞ്ഞെടുക്കുക</option>
                <option value="accident">Accident / Trauma · അപകടം / ആഘാതം</option>
                <option value="diabetes">Diabetes · പ്രമേഹം</option>
                <option value="cancer">Cancer · കാൻസർ</option>
                <option value="congenital">Congenital · ജന്മനാ</option>
                <option value="vascular">Vascular Disease · രക്തക്കുഴൽ രോഗം</option>
                <option value="other">Other · മറ്റ്</option>
              </select>
            </F>
            <F label="Years Since Loss" sub={d.dateLostLimb ? 'Auto-calculated · സ്വയം കണക്കാക്കി' : 'കാലു നഷ്ടപ്പെട്ടിട്ട് വർഷം'}><input style={{ ...inp, ...(d.dateLostLimb ? { background: '#F3F4F6', color: '#6B7280' } : {}) }} type="number" placeholder="Years" min="0" value={d.yearsLost || ''} onChange={e => sd('yearsLost', e.target.value)} readOnly={!!d.dateLostLimb} /></F>
            <F label="How many legs lost?" sub="എത്ര കാലുകൾ" err={dErr.legsLostCount}>
              <select style={{ ...sel, ...(dErr.legsLostCount ? { borderColor: '#EF4444', background: '#FEF2F2' } : {}) }} value={d.legsLostCount || ''} onChange={e => sd('legsLostCount', e.target.value)}>
                <option value="">Select / തിരഞ്ഞെടുക്കുക</option>
                <option value="1">One · ഒന്ന്</option>
                <option value="2">Both · രണ്ടും</option>
              </select>
            </F>
            <F label="Right Leg Level" sub="വലതു കാൽ" err={dErr.rightLeg}>
              <select style={{ ...sel, ...(dErr.rightLeg ? { borderColor: '#EF4444', background: '#FEF2F2' } : {}) }} value={d.rightLeg || ''} onChange={e => sd('rightLeg', e.target.value)}>
                <option value="">Select / തിരഞ്ഞെടുക്കുക</option>
                <option value="bk">Below Knee (BK) · മുട്ടിന് താഴെ</option>
                <option value="ak">Above Knee (AK) · മുട്ടിന് മുകളിൽ</option>
                <option value="hip">Hip Disarticulation · ഇടുപ്പ് വേർപെടൽ</option>
                <option value="na">Not applicable · ബാധകമല്ല</option>
              </select>
            </F>
            <F label="Left Leg Level" sub="ഇടതു കാൽ" err={dErr.leftLeg}>
              <select style={{ ...sel, ...(dErr.leftLeg ? { borderColor: '#EF4444', background: '#FEF2F2' } : {}) }} value={d.leftLeg || ''} onChange={e => sd('leftLeg', e.target.value)}>
                <option value="">Select / തിരഞ്ഞെടുക്കുക</option>
                <option value="bk">Below Knee (BK) · മുട്ടിന് താഴെ</option>
                <option value="ak">Above Knee (AK) · മുട്ടിന് മുകളിൽ</option>
                <option value="hip">Hip Disarticulation · ഇടുപ്പ് വേർപെടൽ</option>
                <option value="na">Not applicable · ബാധകമല്ല</option>
              </select>
            </F>
          </div>
          <div style={{ marginBottom: 16 }}>
            <F label="Describe the loss in detail" sub="കാലുകൾ നഷ്ടമായ വിവരം · Malayalam typing supported" err={dErr.limbLossDetails}>
              <MlTextarea placeholder="Please describe the circumstances and details..." value={d.limbLossDetails || ''} onChange={v => sd('limbLossDetails', v)} />
            </F>
          </div>
          <div style={divider} />
          <div style={subHead}>Hospital Information</div>
          <div className="reg-grid-3" style={{ marginBottom: 16 }}>
            <F label="Hospital Name" sub="ഹോസ്പിറ്റൽ" err={dErr.hospitalName}><input style={{ ...inp, ...(dErr.hospitalName ? { borderColor: '#EF4444', background: '#FEF2F2' } : {}) }} placeholder="Hospital name" value={d.hospitalName || ''} onChange={e => sd('hospitalName', e.target.value)} /></F>
            <F label="Doctor's Name" sub="ഡോക്ടർ"><input style={inp} placeholder="Doctor's full name" value={d.doctorName || ''} onChange={e => sd('doctorName', e.target.value)} /></F>
            <F label="Hospital Address" sub="അഡ്രസ്"><input style={inp} placeholder="Address" value={d.hospitalAddress || ''} onChange={e => sd('hospitalAddress', e.target.value)} /></F>
          </div>
          <div style={subHead}>Hospitalization Period</div>
          <div className="reg-grid-2">
            <F label="From" sub="മാസം / വർഷം"><input style={inp} type="month" value={d.hospitalizedFrom || ''} onChange={e => sd('hospitalizedFrom', e.target.value)} /></F>
            <F label="To" sub="മാസം / വർഷം"><input style={inp} type="month" value={d.hospitalizedTo || ''} onChange={e => sd('hospitalizedTo', e.target.value)} /></F>
          </div>
        </>
      );

      // ─ 7: Prosthetic ───────────────────────────────────────────────────────
      case 7: return (
        <>
          <div style={{ marginBottom: 20 }}>
            <F label="Have you used a prosthetic leg before?" sub="നിങ്ങൾ മുമ്പ് കൃത്രിമ കാൽ ഉപയോഗിച്ചിട്ടുണ്ടോ?" err={dErr.usedProsthetic}>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                {['yes', 'no'].map(val => (
                  <label key={val} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px', borderRadius: 40, cursor: 'pointer', border: `1.5px solid ${d.usedProsthetic === val ? C.dark : (dErr.usedProsthetic ? '#EF4444' : C.borderStrong)}`, background: d.usedProsthetic === val ? C.dark : 'white', color: d.usedProsthetic === val ? 'white' : C.textSub, fontSize: 13, fontWeight: 500, transition: 'all 0.2s', fontFamily: "'Inter', system-ui, sans-serif" }}>
                    <input type="radio" name="usedProsthetic" value={val} checked={d.usedProsthetic === val} onChange={() => sd('usedProsthetic', val)} style={{ display: 'none' }} />
                    {val === 'yes' ? '✓ Yes' : '✗ No'}
                  </label>
                ))}
              </div>
            </F>
          </div>
          {d.usedProsthetic === 'yes' && (
            <>
              <div className="reg-grid-2" style={{ marginBottom: 16 }}>
                <F label="Years using prosthetic" sub="എത്ര വർഷം" err={dErr.prostheticYears}><input style={{ ...inp, ...(dErr.prostheticYears ? { borderColor: '#EF4444', background: '#FEF2F2' } : {}) }} type="number" placeholder="Years" min="0" value={d.prostheticYears || ''} onChange={e => sd('prostheticYears', e.target.value)} /></F>
                <F label="Where did you get it from?" sub="എവിടെ നിന്ന്" err={dErr.prostheticSource}><input style={{ ...inp, ...(dErr.prostheticSource ? { borderColor: '#EF4444', background: '#FEF2F2' } : {}) }} placeholder="Source / organization" value={d.prostheticSource || ''} onChange={e => sd('prostheticSource', e.target.value)} /></F>
                <F label="Manufacturer / Brand" sub="നിർമ്മാണ കമ്പനി"><input style={inp} placeholder="Brand name" value={d.prostheticManufacturer || ''} onChange={e => sd('prostheticManufacturer', e.target.value)} /></F>
              </div>
              <F label="Why do you need a new prosthetic?" sub="പുതിയ കൃത്രിമ കാൽ വേണ്ടതിന്റെ കാരണം" err={dErr.whyNewProsthetic}>
                <MlTextarea placeholder="Describe why you need a new prosthetic leg..." value={d.whyNewProsthetic || ''} onChange={v => sd('whyNewProsthetic', v)} />
              </F>
            </>
          )}
          {d.usedProsthetic === 'no' && (
            <F label="Why do you need a new prosthetic?" sub="പുതിയ കൃത്രിമ കാൽ വേണ്ടതിന്റെ കാരണം" err={dErr.whyNewProsthetic}>
              <textarea style={{ ...txa, ...(dErr.whyNewProsthetic ? { borderColor: '#EF4444', background: '#FEF2F2' } : {}) }} placeholder="Describe why you need a new prosthetic leg..." value={d.whyNewProsthetic || ''} onChange={e => sd('whyNewProsthetic', e.target.value)} />
            </F>
          )}
        </>
      );

      // ─ 8: Review & Submit ──────────────────────────────────────────────────
      case 8: {
        const rv = (v: string | undefined) => v && v.trim() ? v : null;

        // Section summary card — shows heading + tick if any data filled, else a subtle "not filled" state
        const RSec = ({ icon, title, step, hasData, rows }: {
          icon: React.ReactNode; title: string; step: number;
          hasData: boolean; rows: [string, string | null][];
        }) => {
          const filled = rows.filter(([, v]) => v);
          return (
            <div style={{ marginBottom: 12, background: 'white', borderRadius: 16, border: `1.5px solid ${hasData ? C.border : C.border}`, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              {/* Header row */}
              <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, background: hasData ? C.light : '#FAFAFA', borderBottom: hasData ? `1px solid ${C.border}` : 'none' }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: hasData ? C.blue : '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: hasData ? 'white' : '#9CA3AF', flexShrink: 0, fontSize: 16 }}>
                  {hasData
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>
                    : icon}
                </div>
                <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, fontWeight: 700, color: hasData ? C.dark : C.textMuted, flex: 1 }}>{title}</span>
                <button onClick={() => goTo(step)} style={{ fontSize: 12, color: C.blue, background: 'none', border: `1px solid ${C.borderStrong}`, borderRadius: 20, cursor: 'pointer', padding: '3px 12px', fontWeight: 500 }}>Edit</button>
              </div>
              {/* Data rows — only shown if section has data */}
              {hasData && filled.length > 0 && (
                <div className="reg-review-grid" style={{ padding: '4px 0' }}>
                  {filled.map(([k, v]) => (
                    <div key={k} style={{ padding: '7px 16px', borderBottom: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 1, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k}</div>
                      <div style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{v}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        };

        const docsOk = !!(docs.patientPhoto && docs.housePhoto && docs.aadhaarCard);

        return (
          <>
            <div style={{ marginBottom: 8, padding: '10px 14px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, fontSize: 13, color: '#166534', display: 'flex', gap: 8, alignItems: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
              Review your details before submitting · സമർപ്പിക്കുന്നതിന് മുൻപ് പരിശോധിക്കുക
            </div>
            <div style={{ marginBottom: 20, marginTop: 16 }}>
              <RSec icon={SEC_ICONS[0]} title="Personal Information" step={0} hasData={!!(p.firstName || p.age)} rows={[
                ['First Name', rv(p.firstName)],
                ['Last Name', rv(p.lastName)],
                ['Date of Birth', rv(p.dateOfBirth)],
                ['Age', rv(p.age) ? `${p.age} yrs` : null],
                ['Gender', rv(p.gender)],
                ['Marital Status', rv(p.maritalStatus)],
                ['Phone', rv(p.phone) ? `+91 ${p.phone}` : null],
                ['Email', rv(p.email)],
              ]} />
              <RSec icon={SEC_ICONS[1]} title="Documents" step={1} hasData={docsOk} rows={[
                ['Patient Photo', docs.patientPhoto ? 'Uploaded ✓' : null],
                ['House Photo', docs.housePhoto ? 'Uploaded ✓' : null],
                ['Aadhaar Card', docs.aadhaarCard ? 'Uploaded ✓' : null],
              ]} />
              <RSec icon={SEC_ICONS[2]} title="Contact Information" step={2} hasData={!!(d.addressHouse || d.city)} rows={[
                ['Address', rv(d.addressHouse)],
                ['Post Office', rv(d.addressPO)],
                ['City', rv(d.city)],
                ['District', rv(d.district)],
                ['State', rv(d.state)],
                ['PIN', rv(d.zipcode)],
                ['Country', rv(d.country)],
                ['Home Phone', rv(d.homePhone)],
              ]} />
              <RSec icon={SEC_ICONS[3]} title="Family Details" step={3} hasData={!!(d.fatherName || d.spouseName || d.height)} rows={[
                ["Father", rv(d.fatherName)],
                ["Mother", rv(d.motherName)],
                ["Spouse", rv(d.spouseName)],
                ["Children", rv(d.childrenCount)],
                ["Height", rv(d.height)],
                ["Weight", rv(d.weight)],
              ]} />
              <RSec icon={SEC_ICONS[4]} title="Occupation & Financial" step={4} hasData={!!(d.occupation || d.householdIncomeMonthly)} rows={[
                ['Occupation', rv(d.occupation)],
                ['Monthly Income', rv(d.householdIncomeMonthly)],
                ['Assets', rv(d.householdAssets)],
                ['Owns House', rv(d.ownsHouse)],
              ]} />
              <RSec icon={SEC_ICONS[5]} title="Referral" step={5} hasData={!!(d.howDidYouKnow || d.referredBy)} rows={[
                ['How heard', rv(d.howDidYouKnow)],
                ['Referred By', rv(d.referredBy)],
              ]} />
              <RSec icon={SEC_ICONS[6]} title="Medical History" step={6} hasData={!!(d.howLostLeg || d.dateLostLimb)} rows={[
                ['Date of Loss', rv(d.dateLostLimb)],
                ['Cause', rv(d.howLostLeg)],
                ['Legs Lost', rv(d.legsLostCount)],
                ['Right Leg', rv(d.rightLeg)],
                ['Left Leg', rv(d.leftLeg)],
                ['Hospital', rv(d.hospitalName)],
                ['Doctor', rv(d.doctorName)],
              ]} />
              <RSec icon={SEC_ICONS[7]} title="Prosthetic Usage" step={7} hasData={!!(d.usedProsthetic)} rows={[
                ['Used Before', rv(d.usedProsthetic)],
                ['Years Used', rv(d.prostheticYears)],
                ['Source', rv(d.prostheticSource)],
                ['Manufacturer', rv(d.prostheticManufacturer)],
              ]} />
            </div>
            {error && (
              <div style={{ marginBottom: 16, padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, fontSize: 13, color: '#991B1B' }}>
                {error}
              </div>
            )}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={handleSubmit} disabled={loading} style={{ height: 54, background: C.amber, color: C.dark, border: 'none', borderRadius: 40, fontSize: 16, fontWeight: 700, cursor: 'pointer', padding: '0 40px', fontFamily: "'Inter', system-ui, sans-serif", opacity: loading ? 0.7 : 1, width: '100%', maxWidth: 340 }}>
                {loading ? 'Submitting...' : 'Submit Registration →'}
              </button>
            </div>
            <p style={{ textAlign: 'center', fontSize: 11, color: C.textMuted, marginTop: 14, lineHeight: 1.6 }}>
              By submitting you agree to share your details with Life and Limbs<br />
              സമർപ്പിക്കുന്നതിലൂടെ നിങ്ങൾ വിവരങ്ങൾ പങ്കിടാൻ സമ്മതിക്കുന്നു
            </p>
          </>
        );
      }

      default: return null;
    }
  };

  const isReview = sec === SECTIONS.length - 1;
  const isFirst  = sec === 0;

  return (
    <div style={{ background: C.surface, minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)', padding: '32px 0 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 260, height: 260, borderRadius: '50%', border: '44px solid rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -24, left: 200, width: 130, height: 130, borderRadius: '50%', border: '22px solid rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div className="reg-header-pad" style={{ maxWidth: 1140, margin: '0 auto' }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Life and Limb – Registration</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <div className="reg-title" style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: 5 }}>Patient Registration</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)' }}>
              രോഗി രജിസ്ട്രേഷൻ — Section {sec + 1} of {SECTIONS.length}
            </div>
          </div>
          <div style={{ background: 'white', borderRadius: 16, padding: '10px 18px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
            <img src="/logo.webp" alt="Life and Limbs" style={{ height: 100, width: 'auto', objectFit: 'contain', display: 'block' }} />
          </div>
        </div>
        {/* Stepper */}
        <div style={{ paddingBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            {SECTIONS.map((s, i) => (
              <div key={s.label} style={{ display: 'contents' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: i <= sec ? 'pointer' : 'default' }} onClick={() => { if (i <= sec) goTo(i); }}>
                  <div className="reg-step-circle" style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, fontWeight: 700, flexShrink: 0, background: i === sec ? C.amber : i < sec ? C.mid : 'rgba(255,255,255,0.1)', color: i === sec ? C.dark : 'white', transition: 'all 0.3s' }}>
                    {i < sec ? '✓' : i + 1}
                  </div>
                  <span className="reg-step-label" style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap', color: i === sec ? '#fff' : i < sec ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)' }}>{s.label}</span>
                </div>
                {i < SECTIONS.length - 1 && <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.12)', margin: '0 8px', minWidth: 8, maxWidth: 32 }} />}
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="reg-body-pad" style={{ maxWidth: 1140, margin: '0 auto' }}>
        <div style={cardBox}>
          {/* Section header bar */}
          <div className="reg-section-bar" style={{ borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: C.light, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.blue, flexShrink: 0 }}>{SEC_ICONS[sec]}</div>
            <div>
              <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 22, fontWeight: 700, color: C.dark }}>{SECTIONS[sec].title}</div>
              <div style={{ fontSize: 14, color: C.textMuted, marginTop: 3 }}>{SECTIONS[sec].sub}</div>
            </div>
          </div>
          <div className="reg-card-pad">{renderSection()}</div>
          {/* ── In-card nav ── */}
          {!isReview && (
            <div className="reg-nav-bar" style={{ borderTop: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 14, color: C.textMuted }}>
                Section <span style={{ fontWeight: 700, color: C.dark }}>{sec + 1}</span> of {SECTIONS.length}
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                {!isFirst && (
                  <button onClick={() => goTo(sec - 1)} style={{ height: 50, background: 'transparent', color: C.blue, border: `1.5px solid ${C.borderStrong}`, borderRadius: 40, fontSize: 15, fontWeight: 500, cursor: 'pointer', padding: '0 28px', fontFamily: "'Inter', system-ui, sans-serif" }}>
                    ← Back
                  </button>
                )}
                <button onClick={handleNext} style={{ height: 52, background: C.dark, color: 'white', border: 'none', borderRadius: 40, fontSize: 15, fontWeight: 700, cursor: 'pointer', padding: '0 36px', fontFamily: "'Inter', system-ui, sans-serif" }}>
                  {sec === SECTIONS.length - 2 ? 'Review →' : 'Next →'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PatientRegistrationPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>Loading...</div>}>
      <PatientForm />
    </Suspense>
  );
}
