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
  patients: Patient[];
  onView: (patient: Patient) => void;
  onDeleted: (id: string) => void;
}

const statusBadge: Record<PatientStatus, string> = {
  new:                  'bg-[#EFF6FF] text-[#1D4ED8]',
  ready_for_evaluation: 'bg-[#F5F3FF] text-[#6D28D9]',
  evaluated:            'bg-[#ECFDF5] text-[#065F46]',
  approved:             'bg-[#f0f9ff] text-[#0369a1]',
  on_hold:              'bg-[#F3F4F6] text-[#4B5563]',
  rejected:             'bg-[#FEF2F2] text-[#991B1B]',
};

export const statusLabel: Record<PatientStatus, string> = {
  new:                  'New Registration',
  ready_for_evaluation: 'Ready For Evaluation',
  evaluated:            'Evaluated',
  approved:             'Approved',
  on_hold:              'On Hold',
  rejected:             'Rejected',
};

export default function AdminTable({ patients, onView, onDeleted }: Props) {
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deleting,  setDeleting]  = useState(false);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/patients/${id}`,
        { headers: authHeaders(), withCredentials: true }
      );
      onDeleted(id);
    } catch {
      // silent — modal still has its own error handling
    } finally {
      setDeleting(false);
      setConfirmId(null);
    }
  };

  if (patients.length === 0) {
    return (
      <div className="text-center py-12 text-[#9CA3AF]">
        No patients found · <span lang="ml">രോഗികൾ ഒന്നും കണ്ടെത്തിയില്ല</span>
      </div>
    );
  }

  return (
    <div className="admin-table-wrap overflow-x-auto rounded-[14px] border border-[#E5E7EB]">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-[#E5E7EB]">
            <th className="text-left px-4 py-3 font-medium text-[#374151]">Patient</th>
            <th className="text-left px-4 py-3 font-medium text-[#374151]">Phone</th>
            <th className="text-left px-4 py-3 font-medium text-[#374151]">Registered</th>
            <th className="text-left px-4 py-3 font-medium text-[#374151]">Status</th>
            <th className="text-left px-4 py-3 font-medium text-[#374151]">Docs</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {patients.map((p, i) => {
            const { date, time } = formatIST(p.registeredAt);
            const docCount = p.docCount ?? 0;

            return (
              <tr key={p._id} className={`border-b border-[#E5E7EB] hover:bg-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}>
                <td data-label="Patient" className="px-4 py-3">
                  <div className="font-semibold text-[#374151]">{p.fullName}</div>
                  <div className="text-xs text-[#9CA3AF]">{p.age}y · {p.gender}</div>
                </td>
                <td data-label="Phone" className="px-4 py-3 text-[#374151]">{p.phone}</td>
                <td data-label="Registered" className="px-4 py-3">
                  <div className="text-[#374151]">{date}</div>
                  <div className="text-xs text-[#9CA3AF]">{time}</div>
                </td>
                <td data-label="Status" className="px-4 py-3">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusBadge[p.status]}`}>
                    {statusLabel[p.status]}
                  </span>
                </td>
                <td data-label="Docs" className="px-4 py-3 text-[#374151]">{docCount}/3</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onView(p)}
                      className="px-3 py-1.5 bg-[#0369a1] text-white text-xs rounded-[7px] hover:bg-[#025f8f] min-h-0 transition-colors"
                    >
                      View →
                    </button>
                    {confirmId === p._id ? (
                      <>
                        <button
                          onClick={() => handleDelete(p._id)}
                          disabled={deleting}
                          className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-[7px] hover:bg-red-700 min-h-0 transition-colors disabled:opacity-60"
                        >
                          {deleting ? '...' : 'Yes'}
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          disabled={deleting}
                          className="px-3 py-1.5 bg-gray-100 text-[#374151] text-xs rounded-[7px] hover:bg-gray-200 min-h-0 transition-colors"
                        >
                          No
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setConfirmId(p._id)}
                        className="px-3 py-1.5 bg-white border border-red-300 text-red-600 text-xs rounded-[7px] hover:bg-red-50 min-h-0 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
