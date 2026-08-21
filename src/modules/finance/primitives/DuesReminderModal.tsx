import React, { useState, useMemo } from 'react';
import { X, BellRing, Copy, Check, MessageSquare } from 'lucide-react';
import { DuesBilling, Tenant } from '../../../shared/models';
import { generateDuesReminderText } from '../logic/reportUtils';

interface DuesReminderModalProps {
  tenant: Tenant | null;
  billing: DuesBilling;
  onClose: () => void;
}

export function DuesReminderModal({
  tenant,
  billing,
  onClose
}: DuesReminderModalProps) {
  const [copied, setCopied] = useState(false);

  const reminderText = useMemo(() => generateDuesReminderText({
    tenantName: tenant?.name || 'Komunitas SinergiKita',
    billing,
    qrisHolder: tenant?.paymentInfo?.accountHolder,
    bankName: tenant?.paymentInfo?.bankName,
    bankAccount: tenant?.paymentInfo?.accountNumber
  }), [tenant, billing]);

  const handleCopy = () => {
    navigator.clipboard.writeText(reminderText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(reminderText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-sm w-full p-4 shadow-xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
            <BellRing size={15} className="text-amber-600" />
            <span>Kirim Pengingat Iuran (WhatsApp)</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X size={16} />
          </button>
        </div>

        <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200 text-xs space-y-2">
          <p className="font-bold text-amber-900 text-[11px]">Pratinjau Pesan Broadcast:</p>
          <div className="bg-white p-2.5 rounded-lg border border-amber-200/80 font-mono text-[10px] text-slate-700 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
            {reminderText}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleCopy}
            className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
          </button>
          <button
            onClick={handleOpenWhatsApp}
            className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <MessageSquare size={14} />
            <span>Kirim WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}
