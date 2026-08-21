import React, { useState } from 'react';
import { X, UserPlus, AlertCircle, Send } from 'lucide-react';

interface ReportGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    guestName: string;
    guestNik?: string;
    guestPhone?: string;
    relationship: string;
    arrivalDate: string;
    stayDurationDays: number;
    vehicleNumber?: string;
    purpose: string;
  }) => Promise<void>;
}

export const ReportGuestModal: React.FC<ReportGuestModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [guestName, setGuestName] = useState('');
  const [guestNik, setGuestNik] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [relationship, setRelationship] = useState('Saudara / Kerabat');
  const [arrivalDate, setArrivalDate] = useState(new Date().toISOString().split('T')[0]);
  const [stayDurationDays, setStayDurationDays] = useState(2);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !purpose.trim()) {
      setError('Nama tamu dan maksud kunjungan wajib diisi');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onSubmit({
        guestName,
        guestNik,
        guestPhone,
        relationship,
        arrivalDate,
        stayDurationDays: Number(stayDurationDays),
        vehicleNumber,
        purpose
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal melaporkan tamu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150 max-h-[90vh] flex flex-col">
        <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <UserPlus size={16} className="text-teal-600" />
            <h3 className="text-xs font-bold text-slate-900">Form Lapor Tamu Menginap</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:bg-slate-200 rounded-full">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3.5 space-y-2.5 overflow-y-auto">
          {error && (
            <div className="p-2 bg-rose-50 text-rose-700 text-[11px] rounded-lg flex items-center gap-1.5">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-[10px] font-bold text-slate-600 block mb-1">Nama Lengkap Tamu</label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-1">NIK Tamu (Opsional)</label>
              <input
                type="text"
                value={guestNik}
                onChange={(e) => setGuestNik(e.target.value)}
                placeholder="No. KTP Tamu"
                className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-1">No. WA / HP Tamu</label>
              <input
                type="text"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder="08123xxxx"
                className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-600 block mb-1">Hubungan / Status Tamu</label>
            <select
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-teal-500"
            >
              <option value="Saudara / Kerabat">Saudara / Kerabat</option>
              <option value="Teman / Kolega">Teman / Kolega</option>
              <option value="Tamu Kedinasan / Kerja">Tamu Kedinasan / Kerja</option>
              <option value="Pekerja Bangunan / Renovasi">Pekerja Bangunan / Renovasi</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-1">Tanggal Kedatangan</label>
              <input
                type="date"
                value={arrivalDate}
                onChange={(e) => setArrivalDate(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-1">Rencana Menginap</label>
              <select
                value={stayDurationDays}
                onChange={(e) => setStayDurationDays(Number(e.target.value))}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-teal-500"
              >
                <option value={1}>1 Hari (1 Malam)</option>
                <option value={2}>2 Hari (2 Malam)</option>
                <option value={3}>3 Hari (3 Malam)</option>
                <option value={7}>1 Minggu</option>
                <option value={14}>2 Minggu / Lebih</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-600 block mb-1">Plat Nomor Kendaraan (Opsional)</label>
            <input
              type="text"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              placeholder="Contoh: B 1234 CD (Mobil / Motor)"
              className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-teal-500 font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-600 block mb-1">Maksud & Keperluan Kunjungan</label>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Contoh: Silaturahmi keluarga liburan akhir pekan"
              rows={2}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-teal-500"
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
              className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-xs disabled:opacity-50"
            >
              <Send size={13} />
              <span>{loading ? 'Kirim...' : 'Kirim Laporan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
