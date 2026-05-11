'use client';

import { useState } from 'react';
import axios from 'axios';
import { Patient, PatientStatus } from '@/lib/types';
import { formatIST } from '@/lib/utils';

function authHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

interface Props {
  patient: Patient;
  onClose: () => void;
  onStatusUpdated: (id: string, status: PatientStatus) => void;
  onDeleted: (id: string) => void;
}

const statusOptions: { value: PatientStatus; label: string }[] = [
  { value: 'new',                  label: 'New Registration' },
  { value: 'ready_for_evaluation', label: 'Ready For Evaluation' },
  { value: 'evaluated',            label: 'Evaluated' },
  { value: 'approved',             label: 'Approved' },
  { value: 'on_hold',              label: 'On Hold' },
  { value: 'rejected',             label: 'Rejected' },
  { value: 'completed',            label: 'Completed' },
];

const docLabels: { key: keyof Patient['documents']; label: string }[] = [
  { key: 'patientPhoto', label: 'Patient photo (shows lost leg)' },
  { key: 'housePhoto',   label: 'House with patient in front' },
  { key: 'aadhaarCard',  label: 'Aadhaar Card' },
];

// --- Label maps for stored enum values ---
const LABELS: Record<string, Record<string, string>> = {
  gender: { male: 'Male', female: 'Female', other: 'Other' },
  maritalStatus: { single: 'Single', married: 'Married', widowed: 'Widowed', divorced: 'Divorced' },
  legLevel: {
    bk:  'Below Knee (BK)',
    ak:  'Above Knee (AK)',
    hip: 'Hip Disarticulation',
    na:  'Not Applicable',
  },
  howLostLeg: {
    accident:   'Accident / Trauma',
    diabetes:   'Diabetes',
    cancer:     'Cancer',
    congenital: 'Congenital',
    vascular:   'Vascular Disease',
    other:      'Other',
  },
  legsLostCount: { '1': 'One leg', '2': 'Both legs' },
  usedProsthetic: { yes: 'Yes', no: 'No' },
  ownsHouse: { yes: 'Yes', no: 'No', rented: 'Rented' },
  howDidYouKnow: {
    doctor:       'Doctor / Hospital',
    ngo:          'NGO / Social Worker',
    friend:       'Friend / Family',
    social_media: 'Social Media',
    govt_camp:    'Government Camp',
    other:        'Other',
  },
};

function lbl(map: string, val: string | undefined | null): string | undefined {
  if (!val) return undefined;
  return LABELS[map]?.[val] ?? val;
}

// --- SVG icons ---
const Icons = {
  user:      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
  mapPin:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>,
  users:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="8" r="2.5"/><path d="M21 20c0-2.8-2-5-4.5-5.5"/></svg>,
  briefcase: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="12"/><path d="M2 12h20"/></svg>,
  share:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  activity:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>,
  prosthetic:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="2"/><path d="M12 7v5l3 3"/><path d="M9 12H6a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h2"/><path d="M15 17h2a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-3"/><line x1="10" y1="18" x2="10" y2="22"/><line x1="14" y1="18" x2="14" y2="22"/></svg>,
  paperclip: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>,
  clock:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>,
};

// --- Detail section component ---
function DetailSection({
  title,
  icon,
  rows,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ReactNode;
  rows: [string, string | number | boolean | undefined | null][];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const filled = rows.some(([, v]) => v !== undefined && v !== null && v !== '' && v !== false);

  return (
    <div className="border border-[#E5E7EB] rounded-[10px] overflow-hidden">
      <button
        onClick={() => setOpen((o: boolean) => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors min-h-0"
      >
        <div className="flex items-center gap-2">
          <span className="text-[#6B7280]">{icon}</span>
          <span className="text-sm font-semibold text-[#374151]">{title}</span>
          {filled && (
            <span className="inline-flex items-center justify-center w-4 h-4 bg-[#0369a1] text-white rounded-full text-[9px] font-bold">✓</span>
          )}
        </div>
        <span className="text-[#9CA3AF] text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="grid grid-cols-2 gap-px bg-[#E5E7EB]">
          {rows.map(([label, val]) => {
            const display =
              val === undefined || val === null || val === ''
                ? '—'
                : typeof val === 'boolean'
                ? val ? 'Yes' : 'No'
                : String(val);
            return (
              <div key={label} className="bg-white px-3 py-2">
                <div className="text-[10px] text-[#9CA3AF] uppercase tracking-wide">{label}</div>
                <div className="text-sm text-[#374151] font-medium mt-0.5 break-words">{display}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function PatientModal({ patient, onClose, onStatusUpdated, onDeleted }: Props) {
  const [status, setStatus]         = useState<PatientStatus>(patient.status);
  const [saving, setSaving]         = useState(false);
  const [lightbox, setLightbox]     = useState<string | null>(null);
  const [saveMsg, setSaveMsg]       = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting]     = useState(false);

  const { date, time } = formatIST(patient.registeredAt);

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/patients/${patient._id}/status`,
        { status },
        { headers: authHeaders(), withCredentials: true }
      );
      onStatusUpdated(patient._id, status);
      setSaveMsg('Status updated successfully.');
    } catch {
      setSaveMsg('Failed to update status.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/patients/${patient._id}`,
        { headers: authHeaders(), withCredentials: true }
      );
      onDeleted(patient._id);
      onClose();
    } catch {
      setSaveMsg('Failed to delete patient.');
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  const hasDetails = !!(patient.detailsSubmittedAt || patient.firstName || patient.dateOfBirth);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
        <div className="bg-white rounded-[14px] w-full max-w-2xl max-h-[95vh] overflow-y-auto shadow-xl">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB] sticky top-0 bg-white rounded-t-[14px] z-10">
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
            <div className="p-3 bg-[#f0f9ff] rounded-[9px] text-sm flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="font-medium text-[#0369a1]">Registered:</span>{' '}
                <span className="text-[#374151]">{date} · {time} IST</span>
              </div>
              {hasDetails && patient.detailsSubmittedAt && (() => {
                const d = formatIST(patient.detailsSubmittedAt!);
                return (
                  <div className="text-xs text-[#9CA3AF]">
                    Details submitted: {d.date} · {d.time}
                  </div>
                );
              })()}
            </div>

            {/* Basic patient info */}
            <DetailSection
              title="Basic Information"
              icon={Icons.user}
              defaultOpen={true}
              rows={[
                ['Full Name', patient.fullName],
                ['Age', patient.age ? `${patient.age} yrs` : undefined],
                ['Gender', lbl('gender', patient.gender)],
                ['Date of Birth', patient.dateOfBirth],
                ['Phone', patient.phone ? `+91 ${patient.phone}` : undefined],
                ['Home Phone', patient.homePhone],
                ['Email', patient.email],
                ['District', patient.district],
                ['Marital Status', lbl('maritalStatus', patient.maritalStatus)],
              ]}
            />

            {/* Address */}
            <DetailSection
              title="Address"
              icon={Icons.mapPin}
              rows={[
                ['House / Street', patient.addressHouse || patient.address],
                ['Post Office', patient.addressPO],
                ['City', patient.city],
                ['State', patient.state],
                ['Pincode', patient.zipcode],
                ['Country', patient.country],
              ]}
            />

            {/* Family */}
            <DetailSection
              title="Family Details"
              icon={Icons.users}
              rows={[
                ["Father's Name", patient.fatherName],
                ["Mother's Name", patient.motherName],
                ["Spouse's Name", patient.spouseName],
                ["Spouse's Occupation", patient.spouseOccupation],
                ["Spouse's Phone", patient.spousePhone],
                ['Years Married', patient.yearsMarried],
                ['Number of Children', patient.childrenCount],
                ["Parents' Phone", patient.parentsPhone],
              ]}
            />

            {/* Occupation & Financial */}
            <DetailSection
              title="Occupation & Financial"
              icon={Icons.briefcase}
              rows={[
                ['Occupation', patient.occupation],
                ['Monthly Household Income', patient.householdIncomeMonthly],
                ['Household Assets', patient.householdAssets],
                ['Total Asset Value', patient.totalHouseholdAssetValue],
                ['Owns House', lbl('ownsHouse', patient.ownsHouse)],
                ['Height', patient.height],
                ['Weight', patient.weight],
              ]}
            />

            {/* Referral */}
            <DetailSection
              title="Referral"
              icon={Icons.share}
              rows={[
                ['How Did You Know', lbl('howDidYouKnow', patient.howDidYouKnow)],
                ['Referred By', patient.referredBy],
              ]}
            />

            {/* Limb Loss / Medical */}
            <DetailSection
              title="Limb Loss & Medical History"
              icon={Icons.activity}
              rows={[
                ['Date Lost Limb', patient.dateLostLimb],
                ['How Lost Leg', lbl('howLostLeg', patient.howLostLeg)],
                ['Years Since Loss', patient.yearsLost ? `${patient.yearsLost} yrs` : undefined],
                ['Number of Legs Lost', lbl('legsLostCount', patient.legsLostCount)],
                ['Right Leg', lbl('legLevel', patient.rightLeg)],
                ['Left Leg', lbl('legLevel', patient.leftLeg)],
                ['Limb Loss Details', patient.limbLossDetails],
                ['Injury Description', patient.injuryDesc],
                ['Hospital Name', patient.hospitalName],
                ['Doctor Name', patient.doctorName],
                ['Hospital Address', patient.hospitalAddress],
                ['Hospitalized From', patient.hospitalizedFrom],
                ['Hospitalized To', patient.hospitalizedTo],
              ]}
            />

            {/* Prosthetic */}
            <DetailSection
              title="Prosthetic History"
              icon={Icons.prosthetic}
              rows={[
                ['Used Prosthetic Before', lbl('usedProsthetic', patient.usedProsthetic)],
                ['Years Used', patient.prostheticYears],
                ['Why New Prosthetic', patient.whyNewProsthetic],
                ['Previous Source', patient.prostheticSource],
                ['Manufacturer', patient.prostheticManufacturer],
              ]}
            />

            {/* Documents */}
            <div>
              <div className="text-sm font-semibold text-[#374151] mb-2 flex items-center gap-2">
                <span className="text-[#6B7280]">{Icons.paperclip}</span> Documents
              </div>
              <div className="grid grid-cols-3 gap-2">
                {docLabels.map(({ key, label }) => {
                  const url = patient.documents[key];
                  return (
                    <div key={key} className={`border rounded-[9px] p-2 text-sm ${url ? 'border-[#0369a1] bg-[#f0f9ff]' : 'border-[#E5E7EB] bg-gray-50'}`}>
                      <div className="text-[10px] text-[#9CA3AF] leading-tight mb-1">{label}</div>
                      {url ? (
                        <img
                          src={url}
                          alt={label}
                          className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80"
                          onClick={() => setLightbox(url)}
                        />
                      ) : (
                        <div className="text-xs text-[#9CA3AF] h-20 flex items-center justify-center">Not uploaded</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status history */}
            {patient.statusHistory && patient.statusHistory.length > 0 && (
              <div className="border border-[#E5E7EB] rounded-[10px] overflow-hidden">
                <div className="px-3 py-2.5 bg-gray-50 text-sm font-semibold text-[#374151] flex items-center gap-2">
                  <span className="text-[#6B7280]">{Icons.clock}</span> Status History
                </div>
                <div className="divide-y divide-[#E5E7EB]">
                  {[...patient.statusHistory].reverse().map((h, i) => {
                    const d = new Date(h.changedAt);
                    const dateStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                    const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
                    return (
                      <div key={i} className="flex items-center justify-between px-3 py-2 bg-white">
                        <span className="text-sm text-[#374151] font-medium capitalize">{h.status.replace(/_/g, ' ')}</span>
                        <span className="text-xs text-[#9CA3AF]">{dateStr} · {timeStr}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Status update */}
            <div className="border-t border-[#E5E7EB] pt-4">
              <label className="block text-sm font-medium text-[#374151] mb-1">Update Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PatientStatus)}
                className="w-full h-11 px-3 border border-[#E5E7EB] rounded-[9px] text-base focus:outline-none focus:ring-2 focus:ring-[#0369a1] bg-white"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {saveMsg && (
              <div className={`text-sm p-2 rounded-[9px] ${saveMsg.includes('success') ? 'bg-[#f0f9ff] text-[#0369a1]' : 'bg-red-50 text-red-700'}`}>
                {saveMsg}
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={saving || deleting}
              className="w-full py-3 bg-[#0369a1] text-white rounded-[9px] font-semibold hover:bg-[#025f8f] disabled:opacity-60 transition-colors"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>

            {/* Delete section */}
            <div className="border-t border-[#E5E7EB] pt-4">
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  disabled={deleting}
                  className="w-full py-3 bg-white text-red-600 border border-red-300 rounded-[9px] font-semibold hover:bg-red-50 disabled:opacity-60 transition-colors"
                >
                  Delete Patient Record
                </button>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-[9px] p-4 space-y-3">
                  <p className="text-sm font-semibold text-red-700">Are you sure you want to permanently delete this patient record?</p>
                  <p className="text-xs text-red-500">This cannot be undone. All data for <strong>{patient.fullName}</strong> ({patient.registrationId}) will be removed.</p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="flex-1 py-2.5 bg-red-600 text-white rounded-[9px] font-semibold hover:bg-red-700 disabled:opacity-60 transition-colors text-sm"
                    >
                      {deleting ? 'Deleting...' : 'Yes, Delete'}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      disabled={deleting}
                      className="flex-1 py-2.5 bg-white text-[#374151] border border-[#E5E7EB] rounded-[9px] font-semibold hover:bg-gray-50 disabled:opacity-60 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
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
