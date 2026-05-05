'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { formatIST } from '@/lib/utils';

function SuccessContent() {
  const params   = useSearchParams();
  const router   = useRouter();
  const regId    = params.get('id') || 'LNL-XXXX-00000';
  const at       = params.get('at') || new Date().toISOString();
  const { date, time } = formatIST(at);

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-white border border-[#E5E7EB] rounded-[14px] p-6 shadow-sm text-center">
          {/* Green checkmark */}
          <div className="w-20 h-20 bg-[#F0FAF4] border-4 border-[#1A6B3A] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-[#1A6B3A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-xl font-bold text-[#1A6B3A] mb-1">Submitted successfully!</h1>
          <p className="text-base text-[#9CA3AF]" lang="ml">സഫലമായി സമർപ്പിച്ചു!</p>

          <p className="text-base text-[#374151] mt-2">We will contact you soon</p>
          <p className="text-sm text-[#9CA3AF]" lang="ml">ഞങ്ങൾ ഉടൻ ബന്ധപ്പെടും</p>

          {/* Registration ID */}
          <div className="mt-4 inline-block px-4 py-2 bg-[#F0FAF4] border border-[#86EFAC] rounded-full">
            <span className="text-sm text-[#9CA3AF] mr-2">Registration ID</span>
            <span className="font-bold text-[#1A6B3A] text-base">{regId}</span>
          </div>

          {/* Timestamp */}
          <div className="mt-3 text-sm text-[#374151]">
            {date} · <span className="text-[#9CA3AF]">{time} IST</span>
          </div>

          {/* Status row */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            <div className="text-left">
              <div className="text-sm font-medium text-[#374151]">
                Status: New Registration — Admin review pending
              </div>
              <div className="text-xs text-[#9CA3AF] mt-0.5" lang="ml">
                പുതിയ രജിസ്ട്രേഷൻ — അഡ്മിൻ അവലോകനം ആവശ്യമാണ്
              </div>
            </div>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={() => router.push('/')}
            className="mt-6 w-full py-3 border border-[#1A6B3A] text-[#1A6B3A] rounded-[9px] text-base font-medium hover:bg-[#F0FAF4] transition-colors"
          >
            Register another patient · <span lang="ml">മറ്റൊരു രോഗിയെ ചേർക്കുക</span>
          </button>
        </div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
