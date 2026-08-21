import React, { useState } from 'react';
import { Loader2, PackageCheck, X } from 'lucide-react';
import { InventoryItem } from '../../../shared/models';

interface BorrowRequestModalProps {
  item: InventoryItem;
  tenantName: string;
  submitting: boolean;
  onClose: () => void;
  onRequest: (data: { itemId: string; itemName: string; quantity: number; startDate: string; endDate: string; purpose: string }) => Promise<void>;
  onSuccessNotification: (msg: string) => void;
}

export function BorrowRequestModal({ item, submitting, onClose, onRequest, onSuccessNotification }: BorrowRequestModalProps) {
  const [quantity, setQuantity] = useState('1');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [purpose, setPurpose] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(quantity, 10);
    if (!qty || qty <= 0 || qty > item.availableQuantity || !purpose.trim()) return;

    await onRequest({ itemId: item.id, itemName: item.name, quantity: qty, startDate, endDate, purpose: purpose.trim() });
    onSuccessNotification(`Pengajuan pinjam ${item.name} berhasil dikirim!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-sm bg-white rounded-xl p-3.5 shadow-xl border border-slate-200 space-y-2.5">
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <div className="flex items-center gap-1.5 text-teal-700">
            <PackageCheck size={16} />
            <h3 className="text-xs font-bold text-slate-900">Form Peminjaman Barang</h3>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
        </div>

        <div className="p-2 bg-teal-50/70 rounded-lg border border-teal-100 flex justify-between items-center text-[10px]">
          <div>
            <p className="font-bold text-teal-900 truncate">{item.name}</p>
            <p className="text-slate-500">Tersedia: {item.availableQuantity} unit</p>
          </div>
          <span className="font-bold px-1.5 py-0.5 rounded bg-white text-teal-700 border border-teal-200">Gratis Warga</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
          <div>
            <label className="text-[10px] font-bold text-slate-600">Jumlah (Max: {item.availableQuantity})</label>
            <input
              type="number" required min="1" max={item.availableQuantity} value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full h-8.5 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-900 outline-none focus:border-teal-500 mt-0.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-slate-600">Tgl Pinjam</label>
              <input
                type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-8.5 px-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-teal-500 mt-0.5"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-600">Tgl Kembali</label>
              <input
                type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)}
                className="w-full h-8.5 px-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-teal-500 mt-0.5"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-600">Keperluan / Acara</label>
            <textarea
              required rows={2} placeholder="Contoh: Tasyakuran keluarga / kerja bakti RT"
              value={purpose} onChange={(e) => setPurpose(e.target.value)}
              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 outline-none focus:border-teal-500 mt-0.5 resize-none"
            />
          </div>

          <button
            type="submit" disabled={submitting || !purpose.trim()}
            className="w-full h-9 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs disabled:opacity-50 mt-1"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <PackageCheck size={14} />}
            <span>Kirim Pengajuan Pinjam</span>
          </button>
        </form>
      </div>
    </div>
  );
}
