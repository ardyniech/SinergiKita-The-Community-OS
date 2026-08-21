import React, { useState } from 'react';
import { X, UserPlus, AlertCircle } from 'lucide-react';
import { PatrolOfficer } from '../../../shared/models/patrol';

interface AddOfficerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (officer: PatrolOfficer) => void;
}

export const AddOfficerModal: React.FC<AddOfficerModalProps> = ({
  isOpen,
  onClose,
  onAdd
}) => {
  const [name, setName] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [isLeader, setIsLeader] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama petugas wajib diisi');
      return;
    }
    onAdd({
      name: name.trim(),
      houseNumber: houseNumber.trim(),
      phone: phone.trim(),
      isLeader
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
        <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <UserPlus size={16} className="text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900">Tambah Petugas Ronda</h3>
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
            <label className="text-[10px] font-bold text-slate-600 block mb-1">Nama Petugas / Warga</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Pak Budi"
              className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-600 block mb-1">No. Rumah / Blok</label>
            <input
              type="text"
              value={houseNumber}
              onChange={(e) => setHouseNumber(e.target.value)}
              placeholder="Contoh: A3/12"
              className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-600 block mb-1">Nomor WhatsApp (Opsional)</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Contoh: 08123456789"
              className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isLeader"
              checked={isLeader}
              onChange={(e) => setIsLeader(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="isLeader" className="text-xs text-slate-700 font-medium">
              Jadikan Komandan Regu (Danru)
            </label>
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
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs"
            >
              Tambahkan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
