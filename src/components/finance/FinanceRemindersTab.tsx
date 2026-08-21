import React from 'react';
import { Send, Users } from 'lucide-react';
import { Citizen } from './types';

interface FinanceRemindersTabProps {
  citizens: Citizen[];
}

export function FinanceRemindersTab({ citizens }: FinanceRemindersTabProps) {
  const handleSendWA = (citizen: Citizen) => {
    const text = `Halo ${citizen.displayName || 'Bapak/Ibu'}, mengingatkan untuk pembayaran iuran warga bulan ini. Terima kasih atas partisipasi dan gotong royongnya!`;
    const url = `https://wa.me/${citizen.phoneNumber || ''}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800 shadow-xs">
      <div className="px-3 py-3 flex items-center gap-2 bg-blue-50/30 dark:bg-blue-900/10 border-b border-slate-100 dark:border-slate-800">
        <Send className="text-blue-600" size={16} />
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-600">
          Pengingat Tagihan & Iuran
        </h3>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {citizens.length === 0 ? (
          <div className="px-3 py-12 text-center text-slate-400 italic text-xs font-medium">
            Belum ada data warga terdaftar
          </div>
        ) : (
          citizens.map((citizen) => (
            <div
              key={citizen.uid}
              className="px-3 py-3.5 flex items-center justify-between gap-3 active:bg-slate-50 dark:active:bg-slate-800/50 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <h4 className="text-[13px] font-black text-slate-900 dark:text-slate-100 truncate">
                  {citizen.displayName || citizen.email}
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Status:</span>
                  <span className={`text-[10px] font-black uppercase tracking-tight ${
                    citizen.duesStatus === 'paid' ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {citizen.duesStatus === 'paid' ? 'Lunas' : 'Belum Lunas'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleSendWA(citizen)}
                className="shrink-0 w-10 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center shadow-sm shadow-emerald-200 transition active:scale-95"
                title="Kirim WhatsApp"
              >
                <Send size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
