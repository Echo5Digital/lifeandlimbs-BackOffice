'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Patient, PatientStatus, AdminStats } from '@/lib/types';
import AdminTable from '@/components/AdminTable/AdminTable';
import PatientModal from '@/components/AdminTable/PatientModal';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const statCards = [
  { key: 'new',      label: 'New',          ml: 'പുതിയ',           color: 'text-[#185FA5]', bg: 'bg-[#EFF6FF]', border: 'border-[#BFDBFE]' },
  { key: 'review',   label: 'Under Review',  ml: 'പരിശോധനയിൽ',     color: 'text-[#854F0B]', bg: 'bg-[#FEF9EC]', border: 'border-[#FDE68A]' },
  { key: 'approved', label: 'Approved',       ml: 'അനുമതി ലഭിച്ചു', color: 'text-[#1A6B3A]', bg: 'bg-[#F0FAF4]', border: 'border-[#86EFAC]' },
  { key: 'rejected', label: 'Rejected',       ml: 'നിരസിച്ചു',       color: 'text-[#A32D2D]', bg: 'bg-[#FEF2F2]', border: 'border-[#FECACA]' },
] as const;

export default function AdminDashboard() {
  const router = useRouter();

  const [patients,  setPatients]  = useState<Patient[]>([]);
  const [stats,     setStats]     = useState<AdminStats>({ new: 0, review: 0, approved: 0, rejected: 0 });
  const [districts, setDistricts] = useState<string[]>([]);
  const [loading,   setLoading]   = useState(true);

  // Filters
  const [filterStatus,   setFilterStatus]   = useState('all');
  const [filterDistrict, setFilterDistrict] = useState('all');
  const [search,         setSearch]         = useState('');
  const [page,           setPage]           = useState(1);
  const [totalPages,     setTotalPages]     = useState(1);

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/admin/patients`, {
        params: {
          status:   filterStatus,
          district: filterDistrict,
          search,
          page,
          limit: 20,
        },
        withCredentials: true,
      });
      const { data, stats: s, districts: d, pages } = res.data;
      setPatients(data);
      setStats(s);
      setDistricts(d);
      setTotalPages(pages);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        router.push('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterDistrict, search, page, router]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleStatusUpdated = (id: string, status: PatientStatus) => {
    setPatients((prev) =>
      prev.map((p) => (p._id === id ? { ...p, status } : p))
    );
    // Refresh stats
    fetchPatients();
  };

  const handleLogout = async () => {
    await axios.post(`${API}/api/admin/logout`, {}, { withCredentials: true });
    router.push('/admin/login');
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB] px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-lg font-bold text-[#1A6B3A]">Admin Dashboard</h1>
          <p className="text-xs text-[#9CA3AF]">Life and Limbs Foundation · Patient Registrations</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/')}
            className="px-3 py-2 text-sm border border-[#1A6B3A] text-[#1A6B3A] rounded-[9px] hover:bg-[#F0FAF4] min-h-0 transition-colors"
          >
            + New
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-2 text-sm border border-[#E5E7EB] text-[#374151] rounded-[9px] hover:bg-gray-50 min-h-0 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statCards.map((card) => (
            <div key={card.key} className={`${card.bg} border ${card.border} rounded-[14px] p-4`}>
              <div className={`text-2xl font-bold ${card.color}`}>
                {stats[card.key]}
              </div>
              <div className="text-sm font-medium text-[#374151] mt-1">{card.label}</div>
              <div className="text-xs text-[#9CA3AF]" lang="ml">{card.ml}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="h-11 px-3 border border-[#E5E7EB] rounded-[9px] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A6B3A]"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={filterDistrict}
            onChange={(e) => { setFilterDistrict(e.target.value); setPage(1); }}
            className="h-11 px-3 border border-[#E5E7EB] rounded-[9px] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A6B3A]"
          >
            <option value="all">All Districts</option>
            {districts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search name or phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="h-11 px-3 border border-[#E5E7EB] rounded-[9px] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A6B3A] flex-1 min-w-[180px]"
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12 text-[#9CA3AF]">Loading patients...</div>
        ) : (
          <AdminTable patients={patients} onView={setSelectedPatient} />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-[#E5E7EB] rounded-[9px] text-sm disabled:opacity-40 min-h-0 hover:bg-gray-50"
            >
              ← Prev
            </button>
            <span className="text-sm text-[#374151]">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-[#E5E7EB] rounded-[9px] text-sm disabled:opacity-40 min-h-0 hover:bg-gray-50"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Patient detail modal */}
      {selectedPatient && (
        <PatientModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onStatusUpdated={handleStatusUpdated}
        />
      )}
    </main>
  );
}
