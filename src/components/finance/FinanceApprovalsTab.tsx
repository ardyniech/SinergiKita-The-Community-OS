import React from 'react';
import { ShieldCheck, Check, Loader2 } from 'lucide-react';
import { PendingApproval } from './types';

interface FinanceApprovalsTabProps {
  pendingApprovals: PendingApproval[];
  profileUid?: string;
  profileName?: string;
  onApprove: (approvalId: string) => void;
  submittingId: string | null;
}

export function FinanceApprovalsTab({
  pendingApprovals,
  profileUid,
  profileName,
  onApprove,
  submittingId
}: FinanceApprovalsTabProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800 shadow-xs">
      <div className="px-3 py-3 flex items-center gap-2 bg-amber-50/30 dark:bg-amber-900/10 border-b border-slate-100 dark:border-slate-800">
        <ShieldCheck className="text-amber-500" size={16} />
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-600">
          Persetujuan Dual-Sign (&gt;1jt)
        </h3>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {pendingApprovals.length === 0 ? (
          <div className="px-3 py-12 text-center text-slate-400 italic text-xs font-medium">
            Tidak ada transaksi besar yang butuh persetujuan
          </div>
        ) : (
          pendingApprovals.map((item) => {
            const hasApproved = item.approvals?.includes(profileUid || '');
            const isSubmitting = submittingId === item.id;

            return (
              <div
                key={item.id}
                className="p-3 flex flex-col gap-3 active:bg-slate-50 dark:active:bg-slate-800/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[13px] font-black text-slate-900 dark:text-slate-100">{item.description}</h4>
                    <span className="text-[13px] font-black text-rose-600 tabular-nums">
                      Rp {item.amount.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                    <span>Oleh: {item.createdBy}</span>
                    <span>•</span>
                    <span className="text-amber-600">({item.approvals?.length || 0}/2 TTD)</span>
                  </div>
                  {item.approverNames?.length > 0 && (
                    <p className="text-[9px] text-slate-400 italic">
                      Disetujui: {item.approverNames.join(', ')}
                    </p>
                  )}
                </div>

                <button
                  disabled={hasApproved || isSubmitting}
                  onClick={() => onApprove(item.id)}
                  className="w-full h-10 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-100 dark:disabled:bg-slate-800 text-white dark:disabled:text-slate-500 rounded-xl text-[11px] font-black flex items-center justify-center gap-1.5 transition active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : hasApproved ? (
                    'Sudah Anda Setujui'
                  ) : (
                    <>
                      <Check size={14} /> Beri Tanda Tangan
                    </>
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
