'use client';

import { useState } from 'react';
import axios from 'axios';
import { Patient, PatientStatus } from '@/lib/types';
import { formatIST } from '@/lib/utils';

interface Props {
  patient: Patient;
  onClose: () => void;
  onStatusUpdated: (id: string, status: PatientStatus) => void;
}

const statusOptions: { value: PatientStatus; label: string }[] = [
  { value: 'new',      label: 'New' },
  { value: 'review',   label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const docLabels: { key: keyof Patient['documents']; label: string }[] = [
  { key: 'patientPhoto', label: 'Patient Photo' },
  { key: 'housePhoto',   label: 'House Photo' },
  { key: 'rationCard',   label: 'Ration Card' },
  { key: 'aadhaarCard',  label: 'Aadhaar Card' },
  { key: 'medicalDocs',  label: 'Medical Records' },
];

export default function PatientModal({ patient, onClose, onStatusUpdated }: Props) {
  const [status, setStatus]     = useState<PatientStatus>(patient.status);
  const [saving, setSaving]     = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [saveMsg, setSaveMsg]   = useState('');

  const { date, time } = formatIST(patient.registeredAt);

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/patients/${patient._id}/status`,
        { status },
        { withCredentials: true }
      );
      onStatusUpdated(patient._id, status);
      setSaveMsg('Status updated successfully.');
    } catch {
      setSaveMsg('Failed to update status.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[14px] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#E5E7EB] sticky top-0 bg-white rounded-t-[14px]">
            <div>
              <div className="font-semibold text-[#374151] text-lg">{patient.fullName}</div>
              <div className="text-xs text-[#9CA3AF]">{patient.registrationId}</div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-[#9CA3AF] hover:text-[#374151] rounded-full hover:bg-gray-100 min-h-0"
            >
              ✕
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* Registration date */}
            <div className="p-3 bg-[#F0FAF4] rounded-[9px] text-sm">
              <span className="font-medium text-[#1A6B3A]">Registered:</span>{' '}
              <span className="text-[#374151]">{date} · {time} IST</span>
            </div>

            {/* Patient Info */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                ['Age', String(patient.age)],
                ['Gender', patient.gender],
                ['Phone', patient.phone],
                ['Email', patient.email || '—'],
                ['District', patient.district],
              ].map(([label, val]) => (
                <div key={label} className="border border-[#E5E7EB] rounded-[9px] p-2">
                  <div className="text-[#9CA3AF] text-xs">{label}</div>
                  <div className="text-[#374151] font-medium">{val}</div>
                </div>
              ))}
            </div>

            {patient.injuryDesc && (
              <div>
                <div className="text-xs text-[#9CA3AF] mb-1">Injury Description</div>
                <div className="text-sm text-[#374151] p-3 bg-gray-50 rounded-[9px]">{patient.injuryDesc}</div>
              </div>
            )}

            {/* Documents */}
            <div>
              <div className="text-sm font-medium text-[#374151] mb-2">Documents</div>
              <div className="grid grid-cols-2 gap-2">
                {docLabels.map(({ key, label }) => {
                  const url = patient.documents[key];
                  return (
                    <div key={key} className={`border rounded-[9px] p-2 text-sm ${url ? 'border-[#1A6B3A] bg-[#F0FAF4]' : 'border-[#E5E7EB] bg-gray-50'}`}>
                      <div className="text-xs text-[#9CA3AF]">{label}</div>
                      {url ? (
                        <img
                          src={url}
                          alt={label}
                          className="w-full h-20 object-cover rounded mt-1 cursor-pointer hover:opacity-80"
                          onClick={() => setLightbox(url)}
                        />
                      ) : (
                        <div className="text-xs text-[#9CA3AF] mt-1">Not uploaded</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status update */}
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1">Update Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PatientStatus)}
                className="w-full h-11 px-3 border border-[#E5E7EB] rounded-[9px] text-base focus:outline-none focus:ring-2 focus:ring-[#1A6B3A] bg-white"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {saveMsg && (
              <div className={`text-sm p-2 rounded-[9px] ${saveMsg.includes('success') ? 'bg-[#F0FAF4] text-[#1A6B3A]' : 'bg-red-50 text-red-700'}`}>
                {saveMsg}
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 bg-[#1A6B3A] text-white rounded-[9px] font-semibold hover:bg-[#155c30] disabled:opacity-60 transition-colors"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="Document" className="max-w-full max-h-full rounded-lg object-contain" />
          <button className="absolute top-4 right-4 text-white text-2xl min-h-0 bg-black/40 w-10 h-10 rounded-full">✕</button>
        </div>
      )}
    </>
  );
}
