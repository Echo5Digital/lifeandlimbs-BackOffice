'use client';

import { FormData } from '@/lib/types';
import { DocFiles } from '@/components/DocumentUpload/DocumentUpload';

interface Props {
  formData: FormData;
  files: DocFiles;
}

const docLabels: Record<string, string> = {
  patientPhoto: 'Patient Photo',
  housePhoto: 'House Photo',
  rationCard: 'Ration Card',
  aadhaarCard: 'Aadhaar Card',
  medicalDocs: 'Medical Records',
};

export default function Step3Review({ formData, files }: Props) {
  const uploadedDocs = Object.entries(files).filter(([, v]) => v !== null).map(([k]) => k);
  const pendingDocs  = Object.entries(files).filter(([, v]) => v === null).map(([k]) => k);

  const rows: { label: string; ml: string; value: string }[] = [
    { label: 'Full Name',          ml: 'പൂർണ്ണ നാമം',       value: formData.fullName },
    { label: 'Age',                ml: 'പ്രായം',             value: formData.age },
    { label: 'Gender',             ml: 'ലിംഗം',             value: formData.gender ? formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1) : '' },
    { label: 'Phone',              ml: 'ഫോൺ നമ്പർ',         value: formData.phone },
    { label: 'Email',              ml: 'ഇ-മെയിൽ',           value: formData.email || '—' },
    { label: 'District / Address', ml: 'ജില്ല / വിലാസം',     value: formData.district },
    { label: 'Injury Description', ml: 'പരിക്കിന്റെ വിവരണം', value: formData.injuryDesc },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold text-[#374151] mb-4">
        Review & Submit{' '}
        <span className="text-base font-normal text-[#9CA3AF]" lang="ml">അവലോകനം & സമർപ്പിക്കുക</span>
      </h2>

      {/* Personal Details Summary */}
      <div className="border border-[#E5E7EB] rounded-[14px] overflow-hidden mb-4">
        {rows.map((row, i) => (
          <div key={i} className={`flex px-4 py-3 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
            <div className="w-1/2">
              <div className="text-sm font-medium text-[#374151]">{row.label}</div>
              <div className="text-xs text-[#9CA3AF]" lang="ml">{row.ml}</div>
            </div>
            <div className="w-1/2 text-sm text-[#374151] text-right break-words">{row.value}</div>
          </div>
        ))}
      </div>

      {/* Documents */}
      <div className="mb-4">
        <div className="text-sm font-medium text-[#374151] mb-2">Documents · <span lang="ml">രേഖകൾ</span></div>
        <div className="flex flex-wrap gap-2">
          {uploadedDocs.map((k) => (
            <span key={k} className="inline-flex items-center gap-1 px-3 py-1 bg-[#F0FAF4] text-[#1A6B3A] text-xs rounded-full border border-[#86EFAC]">
              ✓ {docLabels[k]}
            </span>
          ))}
          {pendingDocs.map((k) => (
            <span key={k} className="inline-flex items-center gap-1 px-3 py-1 bg-[#FEF9EC] text-[#92660A] text-xs rounded-full border border-[#FDE68A]">
              ⏳ {docLabels[k]} · pending
            </span>
          ))}
        </div>
      </div>

      {/* Pending warning */}
      {pendingDocs.length > 0 && (
        <div className="p-4 bg-[#FEF9EC] border border-[#FDE68A] rounded-[9px] mb-4 text-sm text-[#92660A]">
          <div>⚠️ {pendingDocs.length} document{pendingDocs.length > 1 ? 's' : ''} pending. You can still submit — admin will follow up.</div>
          <div className="mt-1" lang="ml">{pendingDocs.length} രേഖകൾ ബാക്കിയുണ്ട്. സമർപ്പിക്കാം — അഡ്മിൻ ബന്ധപ്പെടും.</div>
        </div>
      )}

      {/* Footer note */}
      <p className="text-xs text-[#9CA3AF] text-center mt-4">
        By submitting you agree to share your details with Life and Limbs Foundation
        <br />
        <span lang="ml">സമർപ്പിക്കുന്നതിലൂടെ നിങ്ങൾ Life and Limbs Foundation-മായി വിവരങ്ങൾ പങ്കിടാൻ സമ്മതിക്കുന്നു</span>
      </p>
    </div>
  );
}
