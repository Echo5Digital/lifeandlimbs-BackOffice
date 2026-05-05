"use client";
import { useState, CSSProperties } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles: Record<string, CSSProperties> = {
  page: {
    background: "#F4F6F8",
    minHeight: "100vh",
    padding: "24px 16px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  card: {
    background: "white",
    borderRadius: 14,
    border: "1px solid #E5E7EB",
    maxWidth: 580,
    margin: "0 auto",
    overflow: "hidden",
  },
  header: {
    background: "white",
    padding: "20px 20px 0",
    borderBottom: "1px solid #F0F0F0",
  },
  headerTop: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  logo: {
    width: 38, height: 38,
    background: "#F0FAF4",
    borderRadius: 10,
    display: "flex", alignItems: "center", justifyContent: "center",
    border: "1px solid #C8EDD5",
    flexShrink: 0,
  },
  body: { padding: "20px 20px 24px" },
  sectionLabel: {
    fontSize: 10, fontWeight: 500, color: "#9CA3AF",
    letterSpacing: "0.6px", textTransform: "uppercase",
    marginBottom: 14, paddingBottom: 8,
    borderBottom: "1px solid #F0F0F0",
  },
  input: {
    width: "100%", height: 44, padding: "0 12px",
    border: "1px solid #E5E7EB", borderRadius: 9,
    fontSize: 14, color: "#111827", background: "white",
    outline: "none", boxSizing: "border-box", fontFamily: "inherit",
  },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  phoneWrap: {
    display: "flex", border: "1px solid #E5E7EB",
    borderRadius: 9, overflow: "hidden",
  },
  phonePrefix: {
    display: "flex", alignItems: "center", padding: "0 12px",
    background: "#F9FAFB", borderRight: "1px solid #E5E7EB",
    fontSize: 14, fontWeight: 500, color: "#374151", flexShrink: 0,
  },
  uploadZone: {
    display: "block", border: "1.5px dashed #D1D5DB",
    borderRadius: 11, padding: "20px 16px", textAlign: "center",
    background: "#FAFAFA", cursor: "pointer", marginBottom: 10,
  },
  uploadIcon: {
    width: 40, height: 40, background: "#F0FAF4", borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    margin: "0 auto 10px",
  },
  sizePill: {
    display: "inline-block", marginTop: 8, fontSize: 11,
    background: "#FEF9EC", color: "#92660A",
    padding: "3px 10px", borderRadius: 20, border: "0.5px solid #F9E4A0",
  },
  previewRow: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "10px 12px", border: "1px solid #E5E7EB",
    borderRadius: 9, marginBottom: 10, background: "#FAFAFA",
  },
  previewThumb: {
    width: 44, height: 44, borderRadius: 7, background: "#F0FAF4",
    display: "flex", alignItems: "center", justifyContent: "center",
    border: "0.5px solid #C8EDD5", flexShrink: 0,
  },
  compressBar: { height: 3, background: "#E5E7EB", borderRadius: 2, marginTop: 5 },
  compressFill: { height: "100%", background: "#1A6B3A", borderRadius: 2 },
  compressToggleRow: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "10px 12px", border: "1px solid #E5E7EB", borderRadius: 9, marginBottom: 8,
  },
  toggle: {
    width: 42, height: 24, borderRadius: 12,
    position: "relative", cursor: "pointer", flexShrink: 0, transition: "background 0.2s",
  },
  toggleDot: {
    position: "absolute", top: 3, width: 18, height: 18,
    background: "white", borderRadius: "50%",
    boxShadow: "0 1px 3px rgba(0,0,0,0.15)", transition: "all 0.2s",
  },
  docGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 },
  docCard: {
    border: "1px solid #E5E7EB", borderRadius: 9,
    padding: "10px 12px", cursor: "pointer", background: "white", display: "block",
  },
  docCardDone: { borderColor: "#A7D7B5", background: "#F8FDF9" },
  docTop: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  docIconWrap: {
    width: 30, height: 30, background: "#F0FAF4", borderRadius: 7,
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
  },
  docCheck: {
    width: 18, height: 18, background: "#1A6B3A", borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  reviewRow: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    padding: "9px 0", borderBottom: "1px solid #F5F5F5",
  },
  chipGreen: {
    fontSize: 11, background: "#F0FAF4", color: "#1A6B3A",
    padding: "3px 9px", borderRadius: 20, border: "0.5px solid #C8EDD5",
  },
  chipAmber: {
    fontSize: 11, background: "#FEF9EC", color: "#92660A",
    padding: "3px 9px", borderRadius: 20, border: "0.5px solid #F9E4A0",
  },
  warningBox: {
    marginTop: 12, padding: "10px 14px", background: "#FEF9EC",
    borderRadius: 9, border: "1px solid #F9E4A0",
    fontSize: 12, color: "#92660A", lineHeight: 1.6,
  },
  btnGreen: {
    width: "100%", height: 48, background: "#1A6B3A", color: "white",
    border: "none", borderRadius: 11, fontSize: 15, fontWeight: 500,
    cursor: "pointer", display: "flex", alignItems: "center",
    justifyContent: "center", gap: 8, marginTop: 20, fontFamily: "inherit",
  },
  btnOutline: {
    width: "100%", height: 44, background: "white", color: "#1A6B3A",
    border: "1.5px solid #A7D7B5", borderRadius: 11, fontSize: 14,
    fontWeight: 500, cursor: "pointer", display: "flex",
    alignItems: "center", justifyContent: "center", gap: 8,
    marginTop: 10, fontFamily: "inherit",
  },
  successCircle: {
    width: 64, height: 64, background: "#F0FAF4", borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    margin: "0 auto 16px", border: "2px solid #A7D7B5",
  },
  regIdPill: {
    display: "inline-block", margin: "12px 0 6px", fontSize: 13,
    background: "#F0FAF4", color: "#1A6B3A",
    padding: "6px 18px", borderRadius: 20, fontWeight: 500,
  },
  statusRow: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "10px 14px", background: "#FAFAFA",
    borderRadius: 9, border: "1px solid #E5E7EB", marginTop: 14,
  },
  statusDot: { width: 8, height: 8, background: "#F59E0B", borderRadius: "50%", flexShrink: 0 },
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface PersonalData {
  fullName: string; age: string; gender: string;
  phone: string; email: string; district: string; injuryDesc: string;
}
interface DocumentData {
  patientPhoto: File | null; housePhoto: File | null;
  rationCard: File | null; aadhaarCard: File | null; medicalDocs: File | null;
}
interface PhotoPreview {
  name: string; originalSize: number; compressedSize: number | null;
}

// ─── Field Wrapper ────────────────────────────────────────────────────────────
function Field({ label, labelMl, optional, children }: {
  label: string; labelMl: string; optional?: boolean; children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <span style={{ fontSize: 14, fontWeight: 500, color: "#374151" }}>
        {label}
        {optional && (
          <span style={{ fontSize: 11, color: "#9CA3AF", background: "#F3F4F6", padding: "2px 6px", borderRadius: 5, marginLeft: 6 }}>
            optional
          </span>
        )}
      </span>
      <span style={{ display: "block", fontSize: 12, color: "#9CA3AF", marginTop: 2, marginBottom: 6 }}>
        {labelMl}
      </span>
      {children}
    </div>
  );
}

// ─── Step 1: Personal Details ─────────────────────────────────────────────────
function StepPersonal({ data, onChange, onNext }: {
  data: PersonalData;
  onChange: (key: keyof PersonalData, val: string) => void;
  onNext: () => void;
}) {
  return (
    <div style={styles.body}>
      <div style={styles.sectionLabel}>Personal Details · വ്യക്തിഗത വിവരങ്ങൾ</div>

      <Field label="Full Name" labelMl="പൂർണ്ണ നാമം">
        <input style={styles.input} type="text"
          placeholder="Enter your full name · പേര് നൽകുക"
          value={data.fullName} onChange={e => onChange("fullName", e.target.value)} />
      </Field>

      <div style={styles.row2}>
        <Field label="Age" labelMl="പ്രായം">
          <input style={styles.input} type="number" placeholder="Years · വർഷം"
            value={data.age} onChange={e => onChange("age", e.target.value)} />
        </Field>
        <Field label="Gender" labelMl="ലിംഗം">
          <select style={styles.input} value={data.gender} onChange={e => onChange("gender", e.target.value)}>
            <option value="">Select · തിരഞ്ഞെടുക്കുക</option>
            <option value="male">Male · പുരുഷൻ</option>
            <option value="female">Female · സ്ത്രീ</option>
            <option value="other">Other · മറ്റ്</option>
          </select>
        </Field>
      </div>

      <Field label="Phone Number" labelMl="ഫോൺ നമ്പർ">
        <div style={styles.phoneWrap}>
          <span style={styles.phonePrefix}>+91</span>
          <input
            style={{ ...styles.input, borderLeft: "none", borderRadius: "0 9px 9px 0", flex: 1, width: "auto" }}
            type="tel" placeholder="XXXXX XXXXX"
            value={data.phone} onChange={e => onChange("phone", e.target.value)} />
        </div>
      </Field>

      <Field label="Email" labelMl="ഇ-മെയിൽ (ഐച്ഛികം)" optional>
        <input style={styles.input} type="email" placeholder="email@example.com"
          value={data.email} onChange={e => onChange("email", e.target.value)} />
      </Field>

      <Field label="District / Address" labelMl="ജില്ല / വിലാസം">
        <input style={styles.input} type="text"
          placeholder="Enter district and address · ജില്ലയും വിലാസവും നൽകുക"
          value={data.district} onChange={e => onChange("district", e.target.value)} />
      </Field>

      <Field label="Injury Description" labelMl="പരിക്കിന്റെ വിവരണം">
        <textarea
          style={{ ...styles.input, height: 90, padding: "10px 12px", resize: "none" }}
          placeholder="Describe the injury / amputation · പരിക്ക് വിവരിക്കുക"
          value={data.injuryDesc} onChange={e => onChange("injuryDesc", e.target.value)} />
      </Field>

      <button style={styles.btnGreen} onClick={onNext}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <polyline points="9,18 15,12 9,6"/>
        </svg>
        Next: Upload Documents · അടുത്തത്: രേഖകൾ
      </button>
    </div>
  );
}

// ─── Step 2: Documents Upload (step-by-step) ─────────────────────────────────
const ALL_DOCS: { key: keyof DocumentData; icon: string; en: string; ml: string; accept: string; required?: boolean }[] = [
  { key: "patientPhoto", icon: "📷", en: "Patient Photo",   ml: "നഷ്ടപ്പെട്ട കാല്‌ (കൾ) കാണിക്കുന്ന നിങ്ങളുടെ പൂർണ്ണ ചിത്രം", accept: "image/*", required: true },
  { key: "housePhoto",   icon: "🏠", en: "House Photo",     ml: "മുന്നിൽ നിന്ന് നിങ്ങളുടെ വീടിന്റെ മുഴുവൻ ചിത്രം",            accept: "image/*" },
  { key: "rationCard",   icon: "🪪", en: "Ration Card",     ml: "നിങ്ങളുടെ റേഷൻ കാർഡിന്റെ ചിത്രം",                            accept: "image/*,application/pdf" },
  { key: "aadhaarCard",  icon: "📋", en: "Aadhaar Card",    ml: "നിങ്ങളുടെ ആധാർ കാർഡിന്റെ ചിത്രം",                            accept: "image/*,application/pdf" },
  { key: "medicalDocs",  icon: "🏥", en: "Medical Records", ml: "മെഡിക്കൽ ഡോക്യുമെന്റേഷന്റെ ചിത്രം",                          accept: "image/*,application/pdf" },
];

interface FilePreview { name: string; originalSize: number; compressedSize: number | null; }

function StepDocuments({ data, onChange, onNext, onBack }: {
  data: DocumentData;
  onChange: (key: keyof DocumentData, val: File) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [docStep, setDocStep]             = useState(0); // 0–4
  const [compressEnabled, setCompressEnabled] = useState(true);
  const [compressing, setCompressing]     = useState(false);
  const [previews, setPreviews]           = useState<Partial<Record<keyof DocumentData, FilePreview>>>({});

  const current = ALL_DOCS[docStep];

  const compress = async (file: File): Promise<File> => {
    const imageCompression = (await import("browser-image-compression")).default;
    return imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1280, useWebWorker: true, fileType: "image/jpeg" });
  };

  const fmt = (b: number) => b < 1048576 ? (b / 1024).toFixed(0) + " KB" : (b / 1048576).toFixed(1) + " MB";

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const originalSize = file.size;
    const needsCompression = compressEnabled && file.type.startsWith("image/") && file.size > 1048576;
    if (needsCompression) {
      setCompressing(true);
      try {
        const compressed = await compress(file);
        onChange(current.key, compressed as File);
        setPreviews(p => ({ ...p, [current.key]: { name: file.name, originalSize, compressedSize: compressed.size } }));
      } catch {
        onChange(current.key, file);
        setPreviews(p => ({ ...p, [current.key]: { name: file.name, originalSize, compressedSize: null } }));
      } finally { setCompressing(false); }
    } else {
      onChange(current.key, file);
      setPreviews(p => ({ ...p, [current.key]: { name: file.name, originalSize, compressedSize: null } }));
    }
  };

  const goNextDoc = () => {
    if (docStep < ALL_DOCS.length - 1) setDocStep(s => s + 1);
    else onNext();
  };
  const goPrevDoc = () => {
    if (docStep > 0) setDocStep(s => s - 1);
    else onBack();
  };

  const preview = previews[current.key];
  const uploaded = data[current.key];
  const pct = preview?.compressedSize
    ? Math.round((1 - preview.compressedSize / preview.originalSize) * 100)
    : null;

  const uploadedCount = ALL_DOCS.filter(d => data[d.key]).length;

  return (
    <div style={styles.body}>

      {/* Mini progress dots */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 18 }}>
        {ALL_DOCS.map((d, i) => {
          const isDone    = !!data[d.key];          // uploaded — solid green
          const isActive  = i === docStep;           // current — elongated green
          const isFuture  = !isDone && !isActive;    // not yet — gray
          return (
            <div key={d.key} style={{
              width: isActive ? 28 : 8,
              height: 8,
              borderRadius: 4,
              background: isDone ? "#1A6B3A" : isActive ? "#4ADE80" : "#E5E7EB",
              border: isDone ? "none" : isActive ? "2px solid #1A6B3A" : "none",
              transition: "all 0.3s",
              flexShrink: 0,
            }} />
          );
        })}
      </div>

      {/* Counter */}
      <div style={{ textAlign: "center", fontSize: 11, color: "#9CA3AF", marginBottom: 14 }}>
        {docStep + 1} of {ALL_DOCS.length} · {uploadedCount} uploaded
        {!current.required && <span style={{ marginLeft: 6, background: "#F3F4F6", color: "#9CA3AF", padding: "1px 7px", borderRadius: 10, fontSize: 10 }}>optional · ഐച്ഛികം</span>}
      </div>

      {/* Upload zone */}
      <label style={{
        ...styles.uploadZone,
        borderColor: uploaded ? "#A7D7B5" : "#D1D5DB",
        background: uploaded ? "#F8FDF9" : "#FAFAFA",
      }}>
        <input type="file" accept={current.accept} style={{ display: "none" }} onChange={handleFile} />

        {uploaded ? (
          // Uploaded state
          <>
            <div style={{ ...styles.uploadIcon, background: "#F0FAF4" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A6B3A" strokeWidth="2.5">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1A6B3A", marginBottom: 2 }}>
              {current.en} ✓
            </div>
            <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 6 }} lang="ml">
              {current.ml}
            </div>
            {preview && (
              <div style={{ fontSize: 12, color: "#6B7280" }}>
                {preview.name} · {fmt(preview.originalSize)}
                {preview.compressedSize && pct && (
                  <> → <strong style={{ color: "#1A6B3A" }}>{fmt(preview.compressedSize)}</strong> · {pct}% saved</>
                )}
              </div>
            )}
            <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 6 }}>Tap to change · മാറ്റുക</div>
            {preview?.compressedSize && pct && (
              <div style={{ ...styles.compressBar, marginTop: 8, maxWidth: 200, margin: "8px auto 0" }}>
                <div style={{ ...styles.compressFill, width: `${100 - pct}%` }} />
              </div>
            )}
          </>
        ) : (
          // Empty state
          <>
            <div style={styles.uploadIcon}>
              <span style={{ fontSize: 22 }}>{current.icon}</span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
              {compressing ? "Compressing... · ചെറുതാക്കുന്നു..." : current.en}
            </div>
            <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6 }} lang="ml">
              {current.ml}
            </div>
            <span style={styles.sizePill}>Max 5 MB · പരമാവധി 5 MB</span>
          </>
        )}
      </label>

      {/* Auto-compress toggle */}
      <div style={styles.compressToggleRow}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>Auto-compress images</span>
          <span style={{ fontSize: 11, color: "#9CA3AF", display: "block", marginTop: 2 }}>ചിത്രങ്ങൾ സ്വയം ചെറുതാക്കുക</span>
        </div>
        <div
          style={{ ...styles.toggle, background: compressEnabled ? "#1A6B3A" : "#D1D5DB" }}
          onClick={() => setCompressEnabled(v => !v)}
        >
          <div style={{ ...styles.toggleDot, right: compressEnabled ? 3 : "auto", left: compressEnabled ? "auto" : 3 }} />
        </div>
      </div>

      {!compressEnabled && (
        <div style={styles.warningBox}>⚠ Large files may take longer to upload · വലിയ ഫയലുകൾ സമയമെടുക്കും</div>
      )}

      {/* Navigation */}
      <div style={{ ...styles.row2, marginTop: 20, gap: 10 }}>
        <button style={{ ...styles.btnOutline, marginTop: 0 }} onClick={goPrevDoc}>
          ← {docStep === 0 ? "Back" : "Previous"}
        </button>
        <button style={{ ...styles.btnGreen, marginTop: 0, flex: 1 }} onClick={goNextDoc}>
          {docStep === ALL_DOCS.length - 1 ? (
            <>Review & Submit <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="9,18 15,12 9,6"/></svg></>
          ) : (
            <>Next: {ALL_DOCS[docStep + 1].en} <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="9,18 15,12 9,6"/></svg></>
          )}
        </button>
      </div>

      {/* Skip note for optional docs */}
      {!current.required && (
        <p style={{ textAlign: "center", fontSize: 11, color: "#9CA3AF", marginTop: 8 }}>
          You can skip this · <span lang="ml">ഇത് ഒഴിവാക്കാം</span>
        </p>
      )}
    </div>
  );
}

// ─── Step 3: Review & Submit ──────────────────────────────────────────────────
function StepReview({ personal, documents, onSubmit, onBack, loading }: {
  personal: PersonalData;
  documents: DocumentData;
  onSubmit: () => void;
  onBack: () => void;
  loading: boolean;
}) {
  const DOC_KEYS   = ["patientPhoto", "housePhoto", "rationCard", "aadhaarCard", "medicalDocs"] as const;
  const DOC_LABELS: Record<string, string> = {
    patientPhoto: "Patient Photo", housePhoto: "House Photo",
    rationCard: "Ration Card", aadhaarCard: "Aadhaar Card", medicalDocs: "Medical Records",
  };
  const uploaded = DOC_KEYS.filter(k =>  documents[k]);
  const pending  = DOC_KEYS.filter(k => !documents[k]);

  const rows: [string, string, string | null][] = [
    ["Full Name", personal.fullName  || "—", "പൂർണ്ണ നാമം"],
    ["Age",       personal.age ? `${personal.age} years` : "—", null],
    ["Gender",    personal.gender   || "—", null],
    ["Phone",     personal.phone ? `+91 ${personal.phone}` : "—", null],
    ["Email",     personal.email    || "Not provided", null],
    ["District",  personal.district || "—", null],
  ];

  return (
    <div style={styles.body}>
      <div style={styles.sectionLabel}>Personal Details · വ്യക്തിഗത വിവരങ്ങൾ</div>

      {rows.map(([label, val, ml]) => (
        <div key={label} style={styles.reviewRow}>
          <span style={{ fontSize: 12, color: "#9CA3AF" }}>{label}</span>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: val === "Not provided" ? 400 : 500, color: val === "Not provided" ? "#9CA3AF" : "#374151" }}>{val}</div>
            {ml && <div style={{ fontSize: 11, color: "#9CA3AF" }}>{ml}</div>}
          </div>
        </div>
      ))}

      <div style={{ marginTop: 16 }}>
        <div style={styles.sectionLabel}>Documents · രേഖകൾ</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
          {uploaded.map(k => <span key={k} style={styles.chipGreen}>✓ {DOC_LABELS[k]}</span>)}
          {pending.map(k  => <span key={k} style={styles.chipAmber}>{DOC_LABELS[k]} pending</span>)}
        </div>
      </div>

      {pending.length > 0 && (
        <div style={styles.warningBox}>
          <strong>{pending.length} document{pending.length > 1 ? "s" : ""} pending.</strong> You can still submit — admin will follow up.<br />
          <span style={{ fontSize: 11 }}>{pending.length} രേഖകൾ ബാക്കിയുണ്ട്. സമർപ്പിക്കാം — അഡ്മിൻ ബന്ധപ്പെടും.</span>
        </div>
      )}

      <button style={{ ...styles.btnGreen, opacity: loading ? 0.7 : 1 }} onClick={onSubmit} disabled={loading}>
        {loading ? "Submitting... · സമർപ്പിക്കുന്നു..." : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/>
            </svg>
            Confirm & Submit · സമർപ്പിക്കുക
          </>
        )}
      </button>
      <button style={styles.btnOutline} onClick={onBack}>← Back</button>
      <p style={{ fontSize: 11, color: "#9CA3AF", textAlign: "center", marginTop: 10, lineHeight: 1.6 }}>
        By submitting you agree to share your details with Life and Limbs Foundation<br />
        സമർപ്പിക്കുന്നതിലൂടെ നിങ്ങൾ വിവരങ്ങൾ പങ്കിടാൻ സമ്മതിക്കുന്നു
      </p>
    </div>
  );
}

// ─── Step 4: Success ──────────────────────────────────────────────────────────
function StepSuccess({ regId, timestamp, onReset }: {
  regId: string; timestamp: string; onReset: () => void;
}) {
  return (
    <div style={{ ...styles.body, textAlign: "center", padding: "32px 24px 28px" }}>
      <div style={styles.successCircle}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1A6B3A" strokeWidth="2.5">
          <polyline points="20,6 9,17 4,12"/>
        </svg>
      </div>
      <div style={{ fontSize: 18, fontWeight: 500, color: "#111827", marginBottom: 4 }}>Submitted successfully!</div>
      <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.7 }}>
        സഫലമായി സമർപ്പിച്ചു!<br />
        We will contact you soon · ഞങ്ങൾ ഉടൻ ബന്ധപ്പെടും
      </div>
      <div style={styles.regIdPill}>{regId}</div>
      <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 16 }}>{timestamp}</div>
      <div style={styles.statusRow}>
        <div style={styles.statusDot} />
        <div style={{ fontSize: 12, color: "#6B7280" }}>
          Status: <strong style={{ color: "#374151" }}>New Registration</strong> — Admin review pending<br />
          <span style={{ fontSize: 11, color: "#9CA3AF" }}>പുതിയ രജിസ്ട്രേഷൻ — അഡ്മിൻ അവലോകനം ആവശ്യമാണ്</span>
        </div>
      </div>
      <button style={{ ...styles.btnOutline, marginTop: 20 }} onClick={onReset}>
        Register another patient · മറ്റൊരു രോഗിയെ ചേർക്കുക
      </button>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function RegistrationForm() {
  const [step, setStep]           = useState(0);
  const [loading, setLoading]     = useState(false);
  const [regId, setRegId]         = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [error, setError]         = useState("");

  const [personal, setPersonal] = useState<PersonalData>({
    fullName: "", age: "", gender: "", phone: "", email: "", district: "", injuryDesc: "",
  });
  const [documents, setDocuments] = useState<DocumentData>({
    patientPhoto: null, housePhoto: null, rationCard: null, aadhaarCard: null, medicalDocs: null,
  });

  const updatePersonal = (key: keyof PersonalData, val: string) =>
    setPersonal(p => ({ ...p, [key]: val }));
  const updateDocument = (key: keyof DocumentData, val: File) =>
    setDocuments(d => ({ ...d, [key]: val }));

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      Object.entries(personal).forEach(([k, v]) => formData.append(k, v));
      Object.entries(documents).forEach(([k, v]) => { if (v) formData.append(k, v as File); });

      const res  = await fetch(`${API_URL}/api/register`, { method: "POST", body: formData });
      const json = await res.json();

      if (!res.ok) throw new Error(json.message || "Submission failed");

      setRegId(json.registrationId || "LNL-2025-00001");
      setTimestamp(
        new Date().toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short",
        }) + " IST"
      );
      setStep(3);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission failed. Please try again.";
      setError(msg + " · ദയവായി വീണ്ടും ശ്രമിക്കുക.");
    } finally {
      setLoading(false);
    }
  };

  const STEPS = ["Personal", "Documents", "Review & Submit", "Done"];

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerTop}>
            <div style={styles.logo}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A6B3A" strokeWidth="2">
                <path d="M12 2C8.5 2 5 5.5 5 9.5c0 5.5 7 12.5 7 12.5s7-7 7-12.5C19 5.5 15.5 2 12 2z"/>
                <circle cx="12" cy="9.5" r="2.5" fill="#1A6B3A" stroke="none"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#6B7280" }}>Life and Limbs Foundation</div>
              <div style={{ fontSize: 16, fontWeight: 500, color: "#111827" }}>Patient Registration</div>
              <div style={{ fontSize: 12, color: "#9CA3AF" }}>രോഗി രജിസ്ട്രേഷൻ</div>
            </div>
          </div>

          {/* Step tabs */}
          <div style={{ display: "flex" }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{
                flex: 1, padding: "8px 4px", textAlign: "center", fontSize: 11,
                color: i <= step ? "#1A6B3A" : "#9CA3AF",
                fontWeight: i === step ? 500 : 400,
                borderBottom: i === step ? "2px solid #1A6B3A" : i < step ? "2px solid #A7D7B5" : "2px solid #F0F0F0",
                cursor: i < step ? "pointer" : "default",
                transition: "all 0.2s",
              }}
              onClick={() => { if (i < step) setStep(i); }}>
                {s}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        {step === 0 && <StepPersonal data={personal} onChange={updatePersonal} onNext={() => setStep(1)} />}
        {step === 1 && <StepDocuments data={documents} onChange={updateDocument} onNext={() => setStep(2)} onBack={() => setStep(0)} />}
        {step === 2 && (
          <>
            <StepReview personal={personal} documents={documents} onSubmit={handleSubmit} onBack={() => setStep(1)} loading={loading} />
            {error && (
              <div style={{ margin: "0 20px 16px", padding: "10px 14px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 9, fontSize: 12, color: "#991B1B" }}>
                {error}
              </div>
            )}
          </>
        )}
        {step === 3 && (
          <StepSuccess regId={regId} timestamp={timestamp} onReset={() => {
            setStep(0);
            setPersonal({ fullName: "", age: "", gender: "", phone: "", email: "", district: "", injuryDesc: "" });
            setDocuments({ patientPhoto: null, housePhoto: null, rationCard: null, aadhaarCard: null, medicalDocs: null });
          }} />
        )}
      </div>
    </div>
  );
}
