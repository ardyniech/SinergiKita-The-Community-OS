import React from 'react';
import { Send, Users } from 'lucide-react';
import { Citizen } from '../../hooks/useLedgerCitizens';

interface LedgerRemindersTabProps {
  citizens: Citizen[];
  handleToggleDues: (citizen: Citizen) => void;
  handleSendReminder: (citizen: Citizen) => void;
}

export function LedgerRemindersTab({
  citizens,
  handleToggleDues,
  handleSendReminder
}: LedgerRemindersTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-3d-sm">
          <Users size={20} />
        </div>
        <div>
          <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-tight leading-tight">Civic Dues Tracking</h2>
          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest opacity-70">Monitor monthly capital contributions and enforce collection protocols.</p>
        </div>
      </div>

      <div className="rounded-[32px] border border-slate-200/50 overflow-hidden shadow-inner bg-slate-50/30">
        <div className="flex flex-col divide-y divide-slate-100 max-h-[400px] overflow-y-auto scrollbar-hide">
          {citizens.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] italic opacity-50">Zero citizen profiles identified.</p>
            </div>
          )}
          {citizens.map(cit => {
            const isPaid = cit.duesStatus === 'paid';
            return (
              <div key={cit.uid} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group hover:bg-white/60 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-3d-sm group-hover:border-indigo-200 group-hover:text-indigo-500 transition-all font-black text-xs uppercase">
                    {cit.displayName?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{cit.displayName}</h4>
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{cit.phoneNumber || 'NO_COMMS_ID'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <span className={`px-4 py-2 rounded-2xl font-black text-[9px] uppercase tracking-widest border shadow-3d-sm ${
                    isPaid ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-rose-500 text-white border-rose-400'
                  }`}>
                    {isPaid ? 'Settled' : 'Owed: Rp 50k'}
                  </span>

                  <button
                    onClick={() => handleToggleDues(cit)}
                    className="btn-3d px-3 py-2 bg-white text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-200 shadow-3d-sm hover:text-indigo-600 transition-all active:translate-y-0.5"
                    title="Override Status"
                  >
                    Modify
                  </button>

                  {!isPaid && (
                    <button
                      onClick={() => handleSendReminder(cit)}
                      className="btn-3d flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] border border-indigo-400 shadow-3d-sm transition-all active:translate-y-0.5"
                      title="Transmit Digital Collection Notice"
                    >
                      <Send size={12} /> Dispatch
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
