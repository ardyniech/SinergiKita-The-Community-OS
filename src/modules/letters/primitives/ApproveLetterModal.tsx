import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { LetterRequest } from '../../../shared/models/letters';
import { generateLetterNumber } from '../logic/letterUtils';

interface ApproveLetterModalProps {
  letter: LetterRequest;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (letterNumber: string, signerName: string, signerRole: string) => Promise<void>;
  defaultSignerName?: string;
  defaultSignerRole?: string;
}

export const ApproveLetterModal: React.FC<ApproveLetterModalProps> = ({
  letter,
  isOpen,
  onClose,
  onConfirm,
  defaultSignerName = 'Ketua RT',
  defaultSignerRole = 'Ketua RT'
}) => {
  const [letterNumber, setLetterNumber] = useState(
    generateLetterNumber(letter.letterType, Math.floor(Math.random() * 900) + 100)
  );
  const [signerName, setSignerName] = useState(defaultSignerName);
  const [signerRole, setSignerRole] = useState(defaultSignerRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!letterNumber.trim() || !signerName.trim()) {
      setError('Harap isi nomor surat dan nama penandatangan');
      return;
    }
    setLoading(true);
    try {
      await onConfirm(letterNumber, signerName, signerRole);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menerbitkan surat');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
        <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="text-xs font-bold text-slate-900">Penerbitan & Tandatangan Surat</h3>
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
            <label className="text-[10px] font-bold text-slate-600 block mb-1">Nomor Surat Resmi</label>
            <input
              type="text"
              value={letterNumber}
              onChange={(e) => setLetterNumber(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-600 block mb-1">Nama Penandatangan / Pejabat RT</label>
            <input
              type="text"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-600 block mb-1">Jabatan</label>
            <input
              type="text"
              value={signerRole}
              onChange={(e) => setSignerRole(e.target.value)}
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
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs disabled:opacity-50"
            >
              <CheckCircle2 size={13} />
              <span>{loading ? 'Memproses...' : 'Terbitkan & Tanda Tangani'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
