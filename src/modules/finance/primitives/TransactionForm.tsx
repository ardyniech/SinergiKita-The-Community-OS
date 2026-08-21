import React, { useState } from 'react';
import { Plus, Download, Loader2 } from 'lucide-react';
import { Transaction } from '../../../shared/models';

interface TransactionFormProps {
  onAdd: (data: Partial<Transaction>) => Promise<void>;
  onUpload: (file: File) => Promise<void>;
  uploading: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function TransactionForm({ onAdd, onUpload, uploading, isSubmitting, onCancel }: TransactionFormProps) {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'credit' | 'debit'>('credit');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAdd({
      description: desc,
      amount: Number(amount),
      type,
      date,
      status: 'completed'
    });
    onCancel();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="liquid-glass p-6 rounded-[32px] border-white/60 shadow-3d-lg space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-3d-sm">
            <Plus size={18} />
          </div>
          <h3 className="text-[12px] font-black uppercase text-slate-900 tracking-tight">Catat Mutasi Baru</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest px-1">Keterangan</label>
            <input
              type="text" required value={desc} onChange={e => setDesc(e.target.value)}
              className="w-full text-[11px] font-black p-3.5 bg-white border border-slate-200 rounded-xl outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest px-1">Jumlah (Rp)</label>
            <input
              type="number" required value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full text-[11px] font-black p-3.5 bg-white border border-slate-200 rounded-xl outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest px-1">Tipe</label>
            <select
              value={type} onChange={e => setType(e.target.value as 'credit' | 'debit')}
              className="w-full text-[11px] font-black p-3.5 bg-white border border-slate-200 rounded-xl outline-none"
            >
              <option value="credit">Pemasukan (+)</option>
              <option value="debit">Pengeluaran (-)</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest px-1">Tanggal</label>
            <input
              type="date" required value={date} onChange={e => setDate(e.target.value)}
              className="w-full text-[11px] font-black p-3.5 bg-white border border-slate-200 rounded-xl outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onCancel} className="px-6 py-3 text-[10px] text-slate-500 uppercase font-black tracking-widest">Batal</button>
          <button type="submit" disabled={isSubmitting} className="btn-3d bg-indigo-600 text-white uppercase font-black text-[10px] tracking-widest px-8 py-3 rounded-xl shadow-3d-sm">
            {isSubmitting ? 'Memproses...' : 'Simpan Transaksi'}
          </button>
        </div>
      </form>

      <div className="liquid-glass p-5 rounded-[24px] border-white/60 shadow-3d-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-3d-sm">
            <Download size={24} />
          </div>
          <div>
            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-none mb-1">OCR Scan Nota</h3>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Scan nota fisik untuk ekstraksi data otomatis.</p>
          </div>
        </div>
        <input type="file" id="ocr-upload" className="hidden" onChange={e => e.target.files?.[0] && onUpload(e.target.files[0])} />
        <label htmlFor="ocr-upload" className="btn-3d cursor-pointer bg-slate-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} 
          Import Nota
        </label>
      </div>
    </div>
  );
}
