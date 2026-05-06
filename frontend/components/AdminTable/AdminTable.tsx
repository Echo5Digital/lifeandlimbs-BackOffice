'use client';

import { Patient, PatientStatus } from '@/lib/types';
import { formatIST } from '@/lib/utils';

interface Props {
  patients: Patient[];
  onView: (patient: Patient) => void;
}

const statusBadge: Record<PatientStatus, string> = {
  new:                   'bg-[#EFF6FF] text-[#1D4ED8]',
  ready_for_evaluation:  'bg-[#F5F3FF] text-[#6D28D9]',
  scheduling:            'bg-[#FEF9EC] text-[#92660A]',
  evaluated_pending:     'bg-[#FFF7ED] text-[#C2410C]',
  evaluated:             'bg-[#ECFDF5] text-[#065F46]',
  rejected:              'bg-[#FEF2F2] text-[#991B1B]',
  approved:              'bg-[#f0f9ff] text-[#0369a1]',
  completed:             'bg-[#D1FAE5] text-[#064E3B]',
  follow_up:             'bg-[#FAF5FF] text-[#7E22CE]',
  repairs:               'bg-[#FFF3E0] text-[#B45309]',
  on_hold:               'bg-[#F3F4F6] text-[#4B5563]',
  incomplete:            'bg-[#FEF2F2] text-[#B45309]',
};

export const statusLabel: Record<PatientStatus, string> = {
  new:                   'New Registration',
  ready_for_evaluation:  'Ready For Evaluation',
  scheduling:            'Scheduling',
  evaluated_pending:     'Evaluated-Pending Approval',
  evaluated:             'Evaluated',
  rejected:              'Rejected',
  approved:              'Approved',
  completed:             'Completed',
  follow_up:             'Follow-up',
  repairs:               'Repairs',
  on_hold:               'On Hold',
  incomplete:            'Application Incomplete',
};

export default function AdminTable({ patients, onView }: Props) {
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
                  <button
                    onClick={() => onView(p)}
                    className="px-3 py-1.5 bg-[#0369a1] text-white text-xs rounded-[7px] hover:bg-[#025f8f] min-h-0 transition-colors"
                  >
                    View →
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
