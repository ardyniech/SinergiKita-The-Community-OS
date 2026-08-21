import React from 'react';
import { InventoryLoan } from '../../../shared/models';
import { getLoanStatusBadge } from '../logic/inventoryUtils';
import { Calendar, User, CheckCircle2, RotateCcw, XCircle, Inbox } from 'lucide-react';

interface LoanHistoryListProps {
  loans: InventoryLoan[];
  isAdminView?: boolean;
  onUpdateStatus?: (loan: InventoryLoan, status: InventoryLoan['status']) => void;
}

export function LoanHistoryList({ loans, isAdminView = false, onUpdateStatus }: LoanHistoryListProps) {
  if (loans.length === 0) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-xl space-y-1">
        <Inbox className="w-8 h-8 text-slate-300 mx-auto" />
        <p className="text-xs font-semibold text-slate-600">Belum Ada Data Peminjaman</p>
        <p className="text-[10px] text-slate-400">Peminjaman aset RT akan tercatat di sini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold text-slate-900">
          {isAdminView ? 'Daftar Pengajuan Logistik Warga' : 'Riwayat Peminjaman Anda'}
        </h3>
        <span className="text-[10px] text-slate-400">{loans.length} Berkas</span>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-xl divide-y divide-slate-100 overflow-hidden shadow-xs">
        {loans.map((loan) => {
          const badge = getLoanStatusBadge(loan.status);
          return (
            <div key={loan.id} className="p-2.5 space-y-2 hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-slate-900 truncate">{loan.itemName}</span>
                    <span className="text-[10px] font-black text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-100">
                      {loan.quantity} unit
                    </span>
                  </div>
                  {isAdminView && (
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                      <User size={10} className="text-slate-400" />
                      <span>{loan.borrowerName} {loan.borrowerHouseNo ? `(${loan.borrowerHouseNo})` : ''}</span>
                    </div>
                  )}
                  <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1 font-normal">
                    Keperluan: {loan.purpose}
                  </p>
                </div>

                <span className={`px-2 py-0.5 rounded border text-[10px] font-bold shrink-0 ${badge.color}`}>
                  {badge.label}
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-1">
                  <Calendar size={11} />
                  <span>{loan.startDate} s/d {loan.endDate}</span>
                </div>

                {isAdminView && onUpdateStatus && (
                  <div className="flex items-center gap-1">
                    {loan.status === 'requested' && (
                      <>
                        <button
                          onClick={() => onUpdateStatus(loan, 'approved')}
                          className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold border border-emerald-200 flex items-center gap-1"
                        >
                          <CheckCircle2 size={10} /> Setujui
                        </button>
                        <button
                          onClick={() => onUpdateStatus(loan, 'rejected')}
                          className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded text-[10px] font-bold border border-rose-200 flex items-center gap-1"
                        >
                          <XCircle size={10} /> Tolak
                        </button>
                      </>
                    )}
                    {loan.status === 'approved' && (
                      <button
                        onClick={() => onUpdateStatus(loan, 'in_use')}
                        className="px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded text-[10px] font-bold border border-indigo-200"
                      >
                        Serahkan Barang
                      </button>
                    )}
                    {loan.status === 'in_use' && (
                      <button
                        onClick={() => onUpdateStatus(loan, 'returned')}
                        className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold flex items-center gap-1"
                      >
                        <RotateCcw size={10} /> Tandai Kembali
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
