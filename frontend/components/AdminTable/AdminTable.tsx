'use client';

import { Patient, PatientStatus } from '@/lib/types';
import { formatIST } from '@/lib/utils';

interface Props {
  patients: Patient[];
  onView: (patient: Patient) => void;
}

const statusBadge: Record<PatientStatus, string> = {
  new:      'bg-[#EFF6FF] text-[#1D4ED8]',
  review:   'bg-[#FEF9EC] text-[#92660A]',
  approved: 'bg-[#F0FAF4] text-[#1A6B3A]',
  rejected: 'bg-[#FEF2F2] text-[#991B1B]',
};

const statusLabel: Record<PatientStatus, string> = {
  new:      'New',
  review:   'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
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
                  <div className="text-xs text-[#9CA3AF]">{p.district} · {p.age}y</div>
                </td>
                <td className="px-4 py-3 text-[#374151]">{p.phone}</td>
                <td className="px-4 py-3">
                  <div className="text-[#374151]">{date}</div>
                  <div className="text-xs text-[#9CA3AF]">{time}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusBadge[p.status]}`}>
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
