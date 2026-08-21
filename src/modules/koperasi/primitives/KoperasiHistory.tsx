import React from 'react';
import { KoperasiRecord } from '../../../shared/models';
import { History, ArrowDownLeft, Inbox } from 'lucide-react';

interface KoperasiHistoryProps {
  records: KoperasiRecord[];
  loading: boolean;
}

export function KoperasiHistory({ records, loading }: KoperasiHistoryProps) {
  if (loading) return null;

  return (
    <div className="space-y-2">
      <div className="flex flex-col px-1">
        <h3 className="text-xs font-bold text-slate-900">Riwayat Mutasi Koperasi</h3>
        <p className="text-[10px] text-slate-500">Transparansi pencatatan kas simpan pinjam</p>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-xl divide-y divide-slate-100 overflow-hidden shadow-xs">
        {records.length === 0 ? (
          <div className="p-8 text-center space-y-1">
            <Inbox className="w-6 h-6 text-slate-300 mx-auto" />
            <p className="text-xs font-medium text-slate-500">Belum ada riwayat transaksi</p>
          </div>
        ) : (
          records.map((r) => (
            <div key={r.id} className="p-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <ArrowDownLeft size={16} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{r.note || 'Setoran Simpanan'}</h4>
                  <p className="text-[10px] text-slate-400 truncate">
                    {r.userName} • {r.timestamp?.toDate ? r.timestamp.toDate().toLocaleDateString('id-ID') : 'Baru'}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-black text-emerald-600 tabular-nums">+ Rp {r.amount.toLocaleString('id-ID')}</p>
                <p className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1 rounded inline-block">Selesai</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
