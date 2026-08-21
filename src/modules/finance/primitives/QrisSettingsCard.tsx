import React, { useState } from 'react';
import { SlidersHorizontal, QrCode, Building2, Check, Save } from 'lucide-react';
import { Tenant } from '../../../shared/models';

interface QrisSettingsCardProps {
  tenant: Tenant | null;
  onSaveSettings: (info: { qrisImageUrl?: string; bankName?: string; bankAccountNumber?: string; bankAccountHolder?: string }) => Promise<void>;
}

export function QrisSettingsCard({ tenant, onSaveSettings }: QrisSettingsCardProps) {
  const [qrisUrl, setQrisUrl] = useState(tenant?.qrisImageUrl || '');
  const [bankName, setBankName] = useState(tenant?.bankName || '');
  const [accNumber, setAccNumber] = useState(tenant?.bankAccountNumber || '');
  const [accHolder, setAccHolder] = useState(tenant?.bankAccountHolder || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSaveSettings({
        qrisImageUrl: qrisUrl.trim() || undefined,
        bankName: bankName.trim() || undefined,
        bankAccountNumber: accNumber.trim() || undefined,
        bankAccountHolder: accHolder.trim() || undefined
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs space-y-3">
      <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100 text-slate-900">
        <SlidersHorizontal size={16} className="text-blue-600" />
        <h3 className="text-xs font-bold">Pengaturan QRIS & Rekening Kas</h3>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-500">URL Gambar QRIS Komunitas</label>
        <input
          type="url"
          placeholder="https://example.com/qris-rt.png"
          value={qrisUrl}
          onChange={e => setQrisUrl(e.target.value)}
          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
        />
        <p className="text-[9px] text-slate-400">Masukkan link gambar stiker QRIS resmi komunitas (misal via Google Drive link gambar langsung/Imgur/Cloudinary).</p>
      </div>

      {qrisUrl && (
        <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-center">
          <p className="text-[10px] font-bold text-slate-500 mb-1">Pratinjau QRIS:</p>
          <img src={qrisUrl} alt="Preview QRIS" className="w-32 h-32 object-contain mx-auto bg-white p-1 rounded border border-slate-200" referrerPolicy="no-referrer" />
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500">Nama Bank / e-Wallet</label>
          <input
            type="text"
            placeholder="Contoh: BCA / Mandiri"
            value={bankName}
            onChange={e => setBankName(e.target.value)}
            className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500">Nomor Rekening</label>
          <input
            type="text"
            placeholder="Contoh: 1234567890"
            value={accNumber}
            onChange={e => setAccNumber(e.target.value)}
            className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-500">Atas Nama Rekening</label>
        <input
          type="text"
          placeholder="Contoh: Kas RT 05 RW 02"
          value={accHolder}
          onChange={e => setAccHolder(e.target.value)}
          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-colors"
      >
        {saved ? <Check size={14} /> : <Save size={14} />}
        {saved ? 'Pengaturan Berhasil Disimpan!' : saving ? 'Menyimpan...' : 'Simpan Pengaturan Pembayaran'}
      </button>
    </form>
  );
}
