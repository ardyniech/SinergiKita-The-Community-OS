// OVER_LIMIT_JUSTIFIED: Refactoring tertunda, logika komponen kohesif.
import React from 'react';
import { Plus, FileText, Download } from 'lucide-react';
import { Transaction } from '../../types';
import { CSVExportButton } from '../../shared/atoms/CSVExportButton';

interface LedgerTransactionsListProps {
  systemBalance: number;
  transactions: Transaction[];
  isAdminRole: boolean;
  showAddForm: boolean;
  setShowAddForm: (val: boolean) => void;
  exportToPDF: () => void;
  handleUpload: () => void;
  uploading: boolean;
  newDesc: string;
  setNewDesc: (val: string) => void;
  newAmount: string;
  setNewAmount: (val: string) => void;
  newType: 'credit' | 'debit';
  setNewType: (val: 'credit' | 'debit') => void;
  newDate: string;
  setNewDate: (val: string) => void;
  isSubmitting: boolean;
  handleAddTransaction: (e: React.FormEvent) => void;
}

export function LedgerTransactionsList({
  systemBalance,
  transactions,
  isAdminRole,
  showAddForm,
  setShowAddForm,
  exportToPDF,
  handleUpload,
  uploading,
  newDesc,
  setNewDesc,
  newAmount,
  setNewAmount,
  newType,
  setNewType,
  newDate,
  setNewDate,
  isSubmitting,
  handleAddTransaction
}: LedgerTransactionsListProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-tight leading-tight">Digital Transaction Ledger</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Aggregate Balance: <span className="text-indigo-600">Rp {systemBalance.toLocaleString()}</span></p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {isAdminRole && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn-3d flex items-center justify-center gap-2 flex-1 sm:flex-none px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-400 shadow-3d-sm transition-all active:translate-y-0.5"
            >
              <Plus size={16} /> Record Mutasi
            </button>
          )}
          <CSVExportButton
            data={transactions}
            filename="ledger-kas"
            columns={[
              { key: "id", label: "ID" },
              { key: "description", label: "Deskripsi" },
              { key: "date", label: "Tanggal" },
              { key: "type", label: "Tipe" },
              { key: "amount", label: "Jumlah (Rp)" }
            ]}
            className="btn-3d flex items-center justify-center gap-2 flex-1 sm:flex-none px-4 py-2.5 bg-white text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 shadow-3d-sm transition-all active:translate-y-0.5"
          />
          <button
            onClick={exportToPDF}
            className="btn-3d flex items-center justify-center gap-2 flex-1 sm:flex-none px-4 py-2.5 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-400 shadow-3d-sm transition-all active:translate-y-0.5"
          >
            <FileText size={16} /> Export PDF
          </button>
        </div>
      </div>

      {showAddForm && isAdminRole && (
        <form onSubmit={handleAddTransaction} className="liquid-glass p-6 rounded-[32px] border-white/60 shadow-3d-lg space-y-5 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-3d-sm">
              <Plus size={18} />
            </div>
            <h3 className="text-[12px] font-black uppercase text-slate-900 tracking-tight">Record New Protocol</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[9px] font-black uppercase text-slate-400 tracking-widest px-1">Transaction Identity</label>
              <input
                type="text"
                required
                placeholder="Description of capital movement"
                className="w-full text-[11px] font-black p-3.5 bg-white border border-slate-200/50 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-inner"
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[9px] font-black uppercase text-slate-400 tracking-widest px-1">Capital Amount (Rp)</label>
              <input
                type="number"
                inputMode="numeric"
                required
                placeholder="0"
                className="w-full text-[11px] font-black p-3.5 bg-white border border-slate-200/50 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-inner"
                value={newAmount}
                onChange={e => setNewAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[9px] font-black uppercase text-slate-400 tracking-widest px-1">Movement Protocol</label>
              <select
                className="w-full text-[11px] font-black p-3.5 bg-white border border-slate-200/50 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-inner appearance-none"
                value={newType}
                onChange={e => setNewType(e.target.value as 'credit' | 'debit')}
              >
                <option value="credit">Deposit (Credit)</option>
                <option value="debit">Withdrawal (Debit)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[9px] font-black uppercase text-slate-400 tracking-widest px-1">Execution Date</label>
              <input
                type="date"
                required
                className="w-full text-[11px] font-black p-3.5 bg-white border border-slate-200/50 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-inner"
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-6 py-3 text-[10px] text-slate-500 uppercase font-black tracking-widest hover:text-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-3d bg-emerald-600 text-white uppercase font-black text-[10px] tracking-[0.2em] px-8 py-3 rounded-xl shadow-3d-sm border border-emerald-500 active:translate-y-0.5"
            >
              {isSubmitting ? 'Executing...' : 'Commit Protocol'}
            </button>
          </div>
        </form>
      )}

      <div className="rounded-[32px] border border-slate-200/50 overflow-hidden shadow-inner bg-slate-50/30">
        <div className="flex flex-col divide-y divide-slate-100 max-h-[400px] overflow-y-auto scrollbar-hide">
          {transactions.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] italic opacity-50">Zero financial movements cataloged.</p>
            </div>
          )}
          {transactions.map(t => (
            <div key={t.id} className="p-4 flex justify-between items-center group hover:bg-white/60 transition-all">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-3d-sm border ${
                  t.type === 'credit' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                }`}>
                  <FileText size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-none mb-1">{t.description}</p>
                  <p className="text-slate-400 text-[8px] font-bold uppercase tracking-widest">
                    {t.date} { (t as any).recordedBy && <span className="opacity-60">• {(t as any).recordedBy}</span> }
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-4 py-2 rounded-2xl font-black text-[11px] tracking-tighter border shadow-3d-sm ${
                  t.type === 'credit' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-rose-500 text-white border-rose-400'
                }`}>
                  {t.type === 'credit' ? '+' : '-'} Rp {t.amount.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="liquid-glass p-5 rounded-[24px] border-white/60 shadow-3d-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-3d-sm">
            <Download size={24} />
          </div>
          <div>
            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-none mb-1">OCR Physical Registry</h3>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Upload receipts for algorithmic verification.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input type="file" className="hidden" id="nota-upload" onChange={handleUpload} />
          <label
            htmlFor="nota-upload"
            className="btn-3d w-full sm:w-auto text-[10px] bg-slate-900 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all font-black uppercase tracking-[0.15em] cursor-pointer shadow-3d-sm active:translate-y-0.5"
          >
            <Download size={14} />
            {uploading ? 'Scanning Protocol...' : 'Import Nota'}
          </label>
        </div>
      </div>
    </div>
  );
}
