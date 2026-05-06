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
<div className="bg-white rounded-2xl p-8 shadow-lg text-center border border-gray-100">

  {/* Success Icon */}
  <div className="relative w-24 h-24 mx-auto mb-5">
    <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-30"></div>
    <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-md">
      <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
      </svg>
    </div>
  </div>

  {/* Title */}
  <h1 className="text-2xl font-bold text-gray-800">Submitted successfully!</h1>
  <p className="text-sm text-gray-500 mt-1" lang="ml">സഫലമായി സമർപ്പിച്ചു!</p>

  {/* Subtitle */}
  <p className="text-gray-600 mt-3 text-base">
    We’ll contact you shortly
  </p>
  <p className="text-sm text-gray-400" lang="ml">ഞങ്ങൾ ഉടൻ ബന്ധപ്പെടും</p>

  {/* Divider */}
  <div className="my-5 border-t border-gray-100"></div>

  {/* Registration ID */}
  <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
    <p className="text-xs text-gray-500">Registration ID</p>
    <p className="text-lg font-semibold text-blue-700">{regId}</p>
  </div>

  {/* Timestamp */}
  <div className="mt-3 text-sm text-gray-600">
    {date} · <span className="text-gray-400">{time} IST</span>
  </div>

  {/* CTA */}
  {/* <button
    onClick={() => router.push('/')}
    className="mt-6 w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 shadow-sm"
  >
    Register another patient
    <span className="block text-xs opacity-80" lang="ml">
      മറ്റൊരു രോഗിയെ ചേർക്കുക
    </span>
  </button> */}
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
