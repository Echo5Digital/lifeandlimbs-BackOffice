'use client';

export default function AdminReports() {
  return (
    <div className="min-h-screen bg-[#f0f9ff] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-10 max-w-md w-full text-center">

        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-[#f0f9ff] border border-[#BAE6FD] flex items-center justify-center mx-auto mb-5">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#0369a1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10,9 9,9 8,9"/>
          </svg>
        </div>

        <h1 className="text-xl font-bold text-[#0c4a6e] mb-2">Reports</h1>
        <p className="text-sm text-[#64748b] mb-6 leading-relaxed">
          Detailed reports — patient statistics, district-wise summaries, and export tools — are coming soon.
        </p>

        {/* Placeholder feature list */}
        <div className="text-left space-y-2 mb-6">
          {[
            'District-wise patient summary',
            'Status progression reports',
            'Monthly registration trends',
            'Export to PDF / Excel',
          ].map((item) => (
            <div key={item} className="flex items-center gap-2.5 text-sm text-[#94a3b8]">
              <span className="w-4 h-4 rounded-full border border-[#CBD5E1] flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>

        <a
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0369a1] text-white text-sm font-semibold rounded-[9px] hover:bg-[#025f8f] transition-colors"
        >
          ← Back to Dashboard
        </a>
      </div>
    </div>
  );
}
