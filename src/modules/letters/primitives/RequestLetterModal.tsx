import React, { useState } from 'react';
import { X, FileText, Send, AlertCircle } from 'lucide-react';
import { LetterType } from '../../../shared/models/letters';
import { formatLetterType } from '../logic/letterUtils';

interface RequestLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { letterType: LetterType; purpose: string; nik: string }) => Promise<void>;
  defaultNik?: string;
}

export const RequestLetterModal: React.FC<RequestLetterModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultNik = ''
}) => {
  const [letterType, setLetterType] = useState<LetterType>('domisili');
  const [purpose, setPurpose] = useState('');
  const [nik, setNik] = useState(defaultNik);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purpose.trim() || !nik.trim()) {
      setError('Harap isi NIK dan keperluan pengajuan');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onSubmit({ letterType, purpose, nik });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal mengajukan surat');
    } finally {
      setLoading(false);
    }
  };

  const letterOptions: LetterType[] = [
    'domisili',
    'pengantar_skck',
    'keterangan_usaha',
    'keterangan_tidak_mampu',
    'keterangan_kematian',
    'keterangan_kelahiran',
    'pengantar_umum'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
        <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900">Form Pengajuan Surat</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:bg-slate-200 rounded-full">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3.5 space-y-2.5">
          {error && (
            <div className="p-2 bg-rose-50 text-rose-700 text-[11px] rounded-lg flex items-center gap-1.5">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-[10px] font-bold text-slate-600 block mb-1">Jenis Surat</label>
            <select
              value={letterType}
              onChange={(e) => setLetterType(e.target.value as LetterType)}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-500"
            >
              {letterOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {formatLetterType(opt)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-600 block mb-1">NIK (Nomor Induk Kependudukan)</label>
            <input
              type="text"
              value={nik}
              onChange={(e) => setNik(e.target.value)}
              placeholder="Contoh: 3271xxxxxxxxxxxx"
              className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-600 block mb-1">Keperluan / Keterangan</label>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Contoh: Pengurusan pembukaan rekening bank / pendaftaran sekolah"
              rows={3}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 font-medium hover:bg-slate-100 rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs disabled:opacity-50"
            >
              <Send size={13} />
              <span>{loading ? 'Mengirim...' : 'Kirim Pengajuan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
