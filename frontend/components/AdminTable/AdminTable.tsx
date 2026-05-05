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
  approved:              'bg-[#F0FAF4] text-[#1A6B3A]',
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
    <div className="overflow-x-auto rounded-[14px] border border-[#E5E7EB]">
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
                <td className="px-4 py-3">
                  <div className="font-semibold text-[#374151]">{p.fullName}</div>
                  <div className="text-xs text-[#9CA3AF]">{p.age}y · {p.gender}</div>
                </td>
                <td className="px-4 py-3 text-[#374151]">{p.phone}</td>
                <td className="px-4 py-3">
                  <div className="text-[#374151]">{date}</div>
                  <div className="text-xs text-[#9CA3AF]">{time}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusBadge[p.status]}`}>
                    {statusLabel[p.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#374151]">{docCount}/5</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onView(p)}
                    className="px-3 py-1.5 bg-[#1A6B3A] text-white text-xs rounded-[7px] hover:bg-[#155c30] min-h-0 transition-colors"
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
