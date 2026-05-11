'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { formatIST } from '@/lib/utils';

const STATUS_BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

function SuccessContent() {
  const params   = useSearchParams();
  const regId    = params.get('id') || 'LNL-XXXX-00000';
  const at       = params.get('at') || new Date().toISOString();
  const { date, time } = formatIST(at);
  const statusUrl = `${STATUS_BASE}/status?id=${regId}`;

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

          <p className="text-gray-600 mt-3 text-base">We&apos;ll contact you shortly</p>
          <p className="text-sm text-gray-400" lang="ml">ഞങ്ങൾ ഉടൻ ബന്ധപ്പെടും</p>

          {/* Divider */}
          <div className="my-5 border-t border-gray-100"></div>

          {/* Registration ID */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-500 mb-1">Registration ID · രജിസ്ട്രേഷൻ ഐഡി</p>
            <p className="text-xl font-bold text-[#0369a1] tracking-wide">{regId}</p>
          </div>

          {/* Timestamp */}
          <div className="mt-3 text-sm text-gray-600">
            {date} · <span className="text-gray-400">{time} IST</span>
          </div>

          {/* Divider */}
          <div className="my-5 border-t border-gray-100"></div>

          {/* QR Code */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">
              Scan to check your application status
            </p>
            <p className="text-xs text-gray-400 mb-4" lang="ml">
              അപേക്ഷയുടെ നില പരിശോധിക്കാൻ QR സ്കാൻ ചെയ്യുക
            </p>
            <div className="flex justify-center">
              <div className="p-3 bg-white border-2 border-[#0369a1] rounded-2xl inline-block shadow-sm">
                <QRCodeSVG
                  value={statusUrl}
                  size={180}
                  bgColor="#ffffff"
                  fgColor="#0c4a6e"
                  level="M"
                  marginSize={0}
                />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Save this screenshot · ഈ സ്ക്രീൻഷോട്ട് സേവ് ചെയ്യുക
            </p>
            <p className="text-[11px] text-gray-300 mt-1 break-all">{statusUrl}</p>
          </div>

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
