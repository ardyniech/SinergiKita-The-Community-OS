import React, { useState } from 'react';
import { X, PhoneCall, Plus, AlertCircle } from 'lucide-react';
import { ContactCategory } from '../../../shared/models/contacts';
import { getContactCategoryBadge } from '../logic/contactUtils';

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    category: ContactCategory;
    phone: string;
    address?: string;
    description?: string;
    isImportant?: boolean;
  }) => Promise<void>;
}

export const AddContactModal: React.FC<AddContactModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ContactCategory>('darurat');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('Nama fasilitas/instansi dan Nomor Telepon wajib diisi');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onSubmit({ name, category, phone, address, description, isImportant: true });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan kontak');
    } finally {
      setLoading(false);
    }
  };

  const categories: ContactCategory[] = [
    'darurat', 'kesehatan', 'keamanan', 'layanan_publik', 'fasilitas_rt'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
        <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <PhoneCall size={16} className="text-rose-600" />
            <h3 className="text-xs font-bold text-slate-900">Tambah Kontak Darurat / Fasilitas</h3>
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
            <label className="text-[10px] font-bold text-slate-600 block mb-1">Nama Instansi / Kontak</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Puskesmas Kecamatan / Pemadam Kebakaran"
              className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-600 block mb-1">Kategori</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ContactCategory)}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-rose-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{getContactCategoryBadge(cat).label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-600 block mb-1">Nomor Telepon / Hotline</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Contoh: 021-1234567 atau 0812xxxx"
              className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-rose-500 font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-600 block mb-1">Alamat (Opsional)</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Jl. Pemuda No. 12"
              className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-600 block mb-1">Catatan Tambahan (Opsional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Layanan siaga 24 jam gratis ambulans"
              rows={2}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-rose-500"
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
              className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs disabled:opacity-50"
            >
              <Plus size={13} />
              <span>{loading ? 'Menyimpan...' : 'Simpan Kontak'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
