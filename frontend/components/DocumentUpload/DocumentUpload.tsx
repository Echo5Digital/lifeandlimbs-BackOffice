'use client';

import { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import { fileSizeMB } from '@/lib/utils';

interface FileInfo {
  file: File;
  originalSize: number;
  compressedSize: number;
  preview: string;
}

interface DocCardProps {
  icon: string;
  label: string;
  ml: string;
  fieldName: string;
  fileInfo: FileInfo | null;
  onFile: (fieldName: string, file: File, originalSize: number, compressedSize: number, preview: string) => void;
  autoCompress: boolean;
}

function DocCard({ icon, label, ml, fieldName, fileInfo, onFile, autoCompress }: DocCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [compressing, setCompressing] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.files?.[0];
    if (!raw) return;

    const originalSize = raw.size;
    let finalFile = raw;
    setCompressing(true);

    if (autoCompress && raw.type.startsWith('image/')) {
      try {
        const compressed = await imageCompression(raw, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1280,
          useWebWorker: true,
        });
        finalFile = new File([compressed], raw.name, { type: compressed.type });
      } catch {
        finalFile = raw;
      }
    }

    setCompressing(false);
    const preview = URL.createObjectURL(finalFile);
    onFile(fieldName, finalFile, originalSize, finalFile.size, preview);
  };

  const saved = fileInfo
    ? Math.round(((fileInfo.originalSize - fileInfo.compressedSize) / fileInfo.originalSize) * 100)
    : 0;

  return (
    <div
      className={`border rounded-[14px] p-3 cursor-pointer transition-colors ${
        fileInfo ? 'border-[#1A6B3A] bg-[#F0FAF4]' : 'border-[#E5E7EB] bg-white'
      }`}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={handleFile}
      />
      <div className="flex items-start justify-between">
        <div>
          <div className="text-2xl mb-1">{icon}</div>
          <div className="text-sm font-medium text-[#374151]">{label}</div>
          <div className="text-xs text-[#9CA3AF]" lang="ml">{ml}</div>
        </div>
        {fileInfo && (
          <div className="w-6 h-6 bg-[#1A6B3A] rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        {compressing && (
          <div className="text-xs text-[#1A6B3A] animate-pulse">Compressing...</div>
        )}
      </div>

      {fileInfo && (
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <img src={fileInfo.preview} alt="" className="w-10 h-10 rounded object-cover border border-[#E5E7EB]" />
            <div className="text-xs text-[#374151] flex-1 min-w-0">
              <div className="truncate font-medium">{fileInfo.file.name}</div>
              <div className="text-[#9CA3AF]">
                {fileSizeMB(fileInfo.originalSize)} MB → {fileSizeMB(fileInfo.compressedSize)} MB
                {saved > 0 && <span className="text-[#1A6B3A] ml-1">· {saved}% saved</span>}
              </div>
              {/* Compression progress bar */}
              <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1A6B3A] rounded-full transition-all"
                  style={{ width: `${Math.max(10, 100 - saved)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {!fileInfo && (
        <div className="mt-2 text-xs text-[#9CA3AF]">Tap to upload · അപ്‌ലോഡ് ചെയ്യുക</div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// Patient Photo Upload Zone
// ──────────────────────────────────────────────
interface PhotoZoneProps {
  fileInfo: FileInfo | null;
  onFile: (fieldName: string, file: File, originalSize: number, compressedSize: number, preview: string) => void;
  autoCompress: boolean;
}

function PatientPhotoZone({ fileInfo, onFile, autoCompress }: PhotoZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [compressing, setCompressing] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.files?.[0];
    if (!raw) return;
    const originalSize = raw.size;
    let finalFile = raw;
    setCompressing(true);

    if (autoCompress) {
      try {
        const compressed = await imageCompression(raw, { maxSizeMB: 1, maxWidthOrHeight: 1280, useWebWorker: true });
        finalFile = new File([compressed], raw.name, { type: compressed.type });
      } catch {
        finalFile = raw;
      }
    }
    setCompressing(false);
    const preview = URL.createObjectURL(finalFile);
    onFile('patientPhoto', finalFile, originalSize, finalFile.size, preview);
  };

  const saved = fileInfo
    ? Math.round(((fileInfo.originalSize - fileInfo.compressedSize) / fileInfo.originalSize) * 100)
    : 0;

  return (
    <div
      className="border-2 border-dashed border-[#1A6B3A] rounded-[14px] p-6 text-center cursor-pointer bg-[#F0FAF4] mb-4"
      onClick={() => inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      {!fileInfo ? (
        <>
          <div className="text-4xl mb-2">📷</div>
          <div className="text-base font-semibold text-[#1A6B3A]">Tap to upload full body photo</div>
          <div className="text-sm text-[#9CA3AF] mt-1" lang="ml">ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യുക</div>
          <div className="text-sm text-[#374151] mt-1">Show injured leg/arm clearly</div>
          <div className="text-xs text-[#9CA3AF]" lang="ml">നഷ്ടപ്പെട്ട കാൽ/കൈ വ്യക്തമായി കാണിക്കുക</div>
          <div className="inline-block mt-3 px-3 py-1 bg-[#FEF9EC] text-[#92660A] text-xs rounded-full border border-[#FDE68A]">
            Max 5 MB · പരമാവധി 5 MB
          </div>
          {compressing && <div className="mt-2 text-sm text-[#1A6B3A] animate-pulse">Compressing image...</div>}
        </>
      ) : (
        <div className="flex items-center gap-3 text-left">
          <img src={fileInfo.preview} alt="Patient photo" className="w-16 h-16 rounded-lg object-cover border-2 border-[#1A6B3A]" />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-[#374151] truncate">{fileInfo.file.name}</div>
            <div className="text-xs text-[#9CA3AF] mt-0.5">
              Original: {fileSizeMB(fileInfo.originalSize)} MB →{' '}
              Compressed: {fileSizeMB(fileInfo.compressedSize)} MB
              {saved > 0 && <span className="text-[#1A6B3A] ml-1">· {saved}% saved</span>}
            </div>
            <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1A6B3A] rounded-full"
                style={{ width: `${Math.max(10, 100 - saved)}%` }}
              />
            </div>
            <div className="text-xs text-[#1A6B3A] mt-1">Tap to change · മാറ്റുക</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// Main DocumentUpload component
// ──────────────────────────────────────────────
export interface DocFiles {
  patientPhoto: FileInfo | null;
  housePhoto: FileInfo | null;
  rationCard: FileInfo | null;
  aadhaarCard: FileInfo | null;
  medicalDocs: FileInfo | null;
}

interface DocumentUploadProps {
  files: DocFiles;
  onFileChange: (fieldName: string, file: File, originalSize: number, compressedSize: number, preview: string) => void;
}

const docCards = [
  { icon: '🏠', label: 'House Photo',    ml: 'വീടിൻ്റെ ചിത്രം',  field: 'housePhoto' },
  { icon: '🪪', label: 'Ration Card',    ml: 'റേഷൻ കാർഡ്',       field: 'rationCard' },
  { icon: '📋', label: 'Aadhaar Card',   ml: 'ആധാർ കാർഡ്',       field: 'aadhaarCard' },
  { icon: '🏥', label: 'Medical Records', ml: 'മെഡിക്കൽ രേഖകൾ',  field: 'medicalDocs' },
];

export default function DocumentUpload({ files, onFileChange }: DocumentUploadProps) {
  const [autoCompress, setAutoCompress] = useState(true);

  return (
    <div>
      <h2 className="text-lg font-semibold text-[#374151] mb-1">
        Documents Upload{' '}
        <span className="text-base font-normal text-[#9CA3AF]" lang="ml">രേഖകൾ അപ്‌ലോഡ് ചെയ്യുക</span>
      </h2>
      <p className="text-sm text-[#9CA3AF] mb-4">All documents are optional · എല്ലാ രേഖകളും ഐച്ഛികമാണ്</p>

      {/* Auto-compress toggle */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-[9px] border border-[#E5E7EB] mb-4">
        <div>
          <div className="text-sm font-medium text-[#374151]">Auto-compress images</div>
          <div className="text-xs text-[#9CA3AF]" lang="ml">ചിത്രങ്ങൾ സ്വയം ചെറുതാക്കുക</div>
        </div>
        <button
          type="button"
          onClick={() => setAutoCompress(!autoCompress)}
          className={`relative w-12 h-6 rounded-full transition-colors focus:outline-none min-h-0 ${autoCompress ? 'bg-[#1A6B3A]' : 'bg-gray-300'}`}
        >
          <span
            className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${autoCompress ? 'translate-x-7' : 'translate-x-1'}`}
          />
        </button>
      </div>

      {!autoCompress && (
        <div className="mb-4 p-3 bg-[#FEF9EC] border border-[#FDE68A] rounded-[9px] text-sm text-[#92660A]">
          ⚠️ Large files may take longer to upload ·{' '}
          <span lang="ml">വലിയ ഫയലുകൾ സമയമെടുക്കും</span>
        </div>
      )}

      {/* Patient Photo */}
      <PatientPhotoZone
        fileInfo={files.patientPhoto}
        onFile={onFileChange}
        autoCompress={autoCompress}
      />

      {/* 2×2 Document Grid */}
      <div className="grid grid-cols-2 gap-3">
        {docCards.map((doc) => (
          <DocCard
            key={doc.field}
            icon={doc.icon}
            label={doc.label}
            ml={doc.ml}
            fieldName={doc.field}
            fileInfo={files[doc.field as keyof DocFiles]}
            onFile={onFileChange}
            autoCompress={autoCompress}
          />
        ))}
      </div>
    </div>
  );
}
