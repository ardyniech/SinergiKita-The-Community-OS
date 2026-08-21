import React, { useState } from 'react';
import { Building2, Copy, Check, AlertCircle } from 'lucide-react';
import { Tenant } from '../../../shared/models';

interface QrisDisplayCardProps {
  tenant: Tenant | null;
}

export function QrisDisplayCard({ tenant }: QrisDisplayCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center space-y-2">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
        Metode QRIS & Transfer Bank
      </span>

      {tenant?.qrisImageUrl ? (
        <div className="space-y-1">
          <div className="bg-white p-2 rounded-lg border border-slate-200 inline-block mx-auto shadow-xs">
            <img 
              src={tenant.qrisImageUrl} 
              alt="QRIS Komunitas" 
              className="w-40 h-40 object-contain mx-auto"
              referrerPolicy="no-referrer"
            />
          </div>
          <p className="text-[10px] text-slate-500">Scan via BCA, Mandiri, BRI, GoPay, OVO, ShopeePay</p>
        </div>
      ) : (
        <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-left text-xs text-amber-800 space-y-1">
          <div className="flex items-center gap-1 font-bold">
            <AlertCircle size={14} /> Belum Ada Stiker QRIS
          </div>
          <p className="text-[10px] text-amber-700">Silakan gunakan transfer bank atau serahkan tunai.</p>
        </div>
      )}

      {tenant?.bankAccountNumber && (
        <div className="pt-2 border-t border-slate-200 text-left space-y-0.5 text-xs">
          <div className="flex items-center justify-between font-semibold text-slate-700">
            <span className="flex items-center gap-1"><Building2 size={13} /> {tenant.bankName || 'Bank'}</span>
            <button
              type="button"
              onClick={() => handleCopy(tenant.bankAccountNumber || '')}
              className="text-blue-600 hover:text-blue-700 text-[10px] font-bold flex items-center gap-0.5"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'Tersalin' : 'Salin Rek'}
            </button>
          </div>
          <p className="font-mono font-bold text-slate-900">{tenant.bankAccountNumber}</p>
          {tenant.bankAccountHolder && (
            <p className="text-[10px] text-slate-500">a.n. {tenant.bankAccountHolder}</p>
          )}
        </div>
      )}
    </div>
  );
}
