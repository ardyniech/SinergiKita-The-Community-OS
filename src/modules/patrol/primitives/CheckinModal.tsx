import React, { useState } from 'react';
import { X, UserCheck, AlertCircle, Check } from 'lucide-react';

interface CheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (status: 'hadir' | 'izin' | 'digantikan', report?: string, substituteName?: string) => Promise<void>;
  userName: string;
}

export const CheckinModal: React.FC<CheckinModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  userName
}) => {
  const [status, setStatus] = useState<'hadir' | 'izin' | 'digantikan'>('hadir');
  const [report, setReport] = useState('');
  const [substituteName, setSubstituteName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onSubmit(status, report, substituteName);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan absensi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
        <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <UserCheck size={16} className="text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900">Presensi Ronda Malam</h3>
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

          <div className="p-2 bg-emerald-50 rounded-lg text-emerald-800 text-[11px]">
            <p className="font-bold">Nama Petugas: {userName}</p>
            <p className="text-[10px] text-emerald-600">Presensi terekam ke sistem keamanan komunitas</p>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-600 block mb-1">Status Kehadiran</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['hadir', 'izin', 'digantikan'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`py-1.5 text-[11px] font-bold rounded-lg capitalize border transition-all ${
                    status === s
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {status === 'digantikan' && (
            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-1">Nama Pengganti</label>
              <input
                type="text"
                value={substituteName}
                onChange={(e) => setSubstituteName(e.target.value)}
                placeholder="Contoh: Pak Joko (Adik / Tetangga)"
                className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          <div>
            <label className="text-[10px] font-bold text-slate-600 block mb-1">Catatan / Laporan Situasi Pos</label>
            <textarea
              value={report}
              onChange={(e) => setReport(e.target.value)}
              placeholder="Contoh: Situasi lingkungan kondusif dan pintu gerbang barat telah dikunci."
              rows={2}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500"
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
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs disabled:opacity-50"
            >
              <Check size={13} />
              <span>{loading ? 'Menyimpan...' : 'Simpan Presensi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
