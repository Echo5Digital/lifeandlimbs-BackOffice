'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Patient, PatientStatus, AdminStats } from '@/lib/types';
import AdminTable from '@/components/AdminTable/AdminTable';
import PatientModal from '@/components/AdminTable/PatientModal';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function authHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Key summary cards shown at the top of the dashboard
const statCards: { key: PatientStatus; label: string; color: string; bg: string; border: string }[] = [
  { key: 'new',                  label: 'New',               color: 'text-[#0369a1]', bg: 'bg-[#f0f9ff]', border: 'border-[#BAE6FD]' },
  { key: 'ready_for_evaluation', label: 'Ready to Evaluate', color: 'text-[#6D28D9]', bg: 'bg-[#F5F3FF]', border: 'border-[#C4B5FD]' },
  { key: 'evaluated',            label: 'Evaluated',         color: 'text-[#065F46]', bg: 'bg-[#ECFDF5]', border: 'border-[#6EE7B7]' },
  { key: 'approved',             label: 'Approved',          color: 'text-[#0369a1]', bg: 'bg-[#f0f9ff]', border: 'border-[#BAE6FD]' },
  { key: 'on_hold',              label: 'On Hold',           color: 'text-[#4B5563]', bg: 'bg-[#F3F4F6]', border: 'border-[#D1D5DB]' },
  { key: 'rejected',             label: 'Rejected',          color: 'text-[#991B1B]', bg: 'bg-[#FEF2F2]', border: 'border-[#FECACA]' },
  { key: 'completed',            label: 'Completed',         color: 'text-[#065F46]', bg: 'bg-[#F0FDF4]', border: 'border-[#86EFAC]' },
];

export default function AdminDashboard() {
  const router = useRouter();

  const [patients,  setPatients]  = useState<Patient[]>([]);
  const [stats,     setStats]     = useState<AdminStats>({});
  const [districts, setDistricts] = useState<string[]>([]);
  const [loading,   setLoading]   = useState(true);

  // Filters
  const [filterStatus,   setFilterStatus]   = useState('all');
  const [filterDistrict, setFilterDistrict] = useState('all');
  const [search,         setSearch]         = useState('');
  const [dateFrom,       setDateFrom]       = useState('');
  const [dateTo,         setDateTo]         = useState('');
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
          ...(dateFrom && { dateFrom }),
          ...(dateTo   && { dateTo }),
        },
        headers: authHeaders(),
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
  }, [filterStatus, filterDistrict, search, dateFrom, dateTo, page, router]);

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

  const handleDeleted = (id: string) => {
    setPatients((prev) => prev.filter((p) => p._id !== id));
    fetchPatients();
  };

  const handleLogout = async () => {
    localStorage.removeItem('adminToken');
    await axios.post(`${API}/api/admin/logout`, {}, { headers: authHeaders(), withCredentials: true });
    router.push('/admin/login');
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB] px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-[#0369a1] rounded-xl p-1.5 flex items-center justify-center">
            <img src="/logo.webp" alt="Life and Limb" className="w-14 h-14 object-contain" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#0369a1]">Admin Dashboard</h1>
            <p className="text-xs text-[#9CA3AF]">Life and Limb – Registration · Patient Registrations</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/')}
            className="px-3 py-2 text-sm border border-[#0369a1] text-[#0369a1] rounded-[9px] hover:bg-[#f0f9ff] min-h-0 transition-colors"
          >
            + New
          </button>
          <button
            onClick={() => router.push('/admin/reports')}
            className="px-3 py-2 text-sm border border-[#6D28D9] text-[#6D28D9] rounded-[9px] hover:bg-[#F5F3FF] min-h-0 transition-colors"
          >
            Reports
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
        {/* Stats row — tab style, each card filters the table */}
        <div className="flex overflow-x-auto bg-white border border-[#E5E7EB] rounded-[14px]">
          <button
            onClick={() => { setFilterStatus('all'); setPage(1); }}
            className={`flex-1 min-w-[70px] px-4 py-3 text-left border-r border-[#E5E7EB] transition-colors hover:bg-gray-50 ${filterStatus === 'all' ? 'border-b-2 border-b-[#0369a1]' : 'border-b-2 border-b-transparent'}`}
          >
            <div className="text-xl font-bold text-[#374151]">
              {Object.values(stats).reduce((a: number, b) => a + (b ?? 0), 0)}
            </div>
            <div className="text-xs text-[#9CA3AF] mt-0.5 whitespace-nowrap">All</div>
          </button>
          {statCards.map((card) => {
            const active = filterStatus === card.key;
            return (
              <button
                key={card.key}
                onClick={() => { setFilterStatus(card.key); setPage(1); }}
                className={`flex-1 min-w-[70px] px-4 py-3 text-left border-r border-[#E5E7EB] last:border-r-0 transition-colors hover:bg-gray-50 ${active ? 'border-b-2 border-b-[#0369a1]' : 'border-b-2 border-b-transparent'}`}
              >
                <div className={`text-xl font-bold ${card.color}`}>{stats[card.key] ?? 0}</div>
                <div className="text-xs text-[#9CA3AF] mt-0.5 whitespace-nowrap">{card.label}</div>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="h-10 px-3 border border-[#E5E7EB] rounded-[9px] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0369a1]"
          >
            <option value="all">All Status</option>
            <option value="new">New Registration</option>
            <option value="ready_for_evaluation">Ready For Evaluation</option>
            <option value="evaluated">Evaluated</option>
            <option value="approved">Approved</option>
            <option value="on_hold">On Hold</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={filterDistrict}
            onChange={(e) => { setFilterDistrict(e.target.value); setPage(1); }}
            className="h-10 px-3 border border-[#E5E7EB] rounded-[9px] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0369a1]"
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
            className="h-10 px-3 border border-[#E5E7EB] rounded-[9px] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0369a1] flex-1 min-w-[160px]"
          />

          {/* Date range — filters by status change date when a status is selected, else by registration date */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#9CA3AF] whitespace-nowrap">
              {filterStatus !== 'all' ? 'Status date:' : 'Reg. date:'}
            </span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="h-10 px-3 border border-[#E5E7EB] rounded-[9px] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0369a1]"
            />
            <span className="text-xs text-[#9CA3AF]">–</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="h-10 px-3 border border-[#E5E7EB] rounded-[9px] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0369a1]"
            />
            {(dateFrom || dateTo) && (
              <button
                onClick={() => { setDateFrom(''); setDateTo(''); setPage(1); }}
                className="h-10 px-3 text-xs text-[#9CA3AF] hover:text-[#374151] border border-[#E5E7EB] rounded-[9px] bg-white min-h-0"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12 text-[#9CA3AF]">Loading patients...</div>
        ) : (
          <AdminTable patients={patients} onView={setSelectedPatient} onDeleted={handleDeleted} />
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
          onDeleted={handleDeleted}
        />
      )}
    </main>
  );
}
