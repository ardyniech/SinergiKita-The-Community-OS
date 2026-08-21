import React from 'react';
import { CheckCircle2, Clock, XCircle, UserCheck } from 'lucide-react';
import { KoperasiLoan } from '../../../shared/models';

interface LoanCardItemProps {
  loan: KoperasiLoan;
  isAdmin: boolean;
  onUpdateStatus: (id: string, status: 'approved' | 'rejected') => Promise<void>;
}

export function LoanCardItem({ loan, isAdmin, onUpdateStatus }: LoanCardItemProps) {
  const isPending = loan.status === 'pending';
  const isApproved = loan.status === 'approved' || loan.status === 'active';
  const isRejected = loan.status === 'rejected';

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs space-y-2">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold ${
              isApproved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
              isRejected ? 'bg-rose-50 text-rose-700 border border-rose-200' :
              'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {isApproved && <CheckCircle2 size={11} />}
              {isPending && <Clock size={11} />}
              {isRejected && <XCircle size={11} />}
              <span className="capitalize">{loan.status}</span>
            </span>
            <span className="text-xs font-bold text-slate-800 truncate">{loan.borrowerName}</span>
          </div>
          <p className="text-[11px] font-semibold text-slate-700 mt-1 truncate">{loan.purpose}</p>
        </div>

        <div className="text-right shrink-0">
          <p className="text-xs font-black text-indigo-600">Rp {loan.amount.toLocaleString('id-ID')}</p>
          <p className="text-[10px] text-slate-400 font-medium">{loan.tenorMonths} Bulan</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[11px] text-slate-500">
        <div>
          <span>Cicilan: </span>
          <span className="font-bold text-slate-800">
            Rp {(loan.monthlyInstallment || Math.round(loan.amount / (loan.tenorMonths || 1))).toLocaleString('id-ID')}/bln
          </span>
          {loan.guarantorName && (
            <span className="text-[10px] text-slate-400 block">Penjamin: {loan.guarantorName}</span>
          )}
        </div>

        {isAdmin && isPending && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onUpdateStatus(loan.id, 'rejected')}
              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors"
            >
              Tolak
            </button>
            <button
              onClick={() => onUpdateStatus(loan.id, 'approved')}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
            >
              Setujui
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
