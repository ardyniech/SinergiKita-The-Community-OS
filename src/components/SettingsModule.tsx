import { Settings, MessageCircle, Copy, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { isAdmin } from '../lib/permissions';
import AuditLog from './AuditLog';
import BrandingSettings from './organisms/settings/BrandingSettings';
import FeatureOrderSettings from './organisms/settings/FeatureOrderSettings';

export default function SettingsModule() {
  const { profile } = useAuth();
  const { showToast } = useToast();

  const shareInvite = () => {
    const text = `Halo! Ayo bergabung dengan komunitas kami di SinergiKita. Gunakan ID Komunitas: ${profile?.tenantId}. Daftar di: ${window.location.origin}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const copyId = () => {
    if (profile?.tenantId) {
      navigator.clipboard.writeText(profile.tenantId);
      showToast("ID Komunitas disalin!");
    }
  };

  if (!isAdmin(profile) && profile?.role !== 'superadmin') return null;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center text-gray-600">
            <Settings size={20} />
          </div>
          <div>
            <h2 className="text-base font-black text-gray-900 tracking-tight">Pengaturan</h2>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-0.5">Modul & Akses</p>
          </div>
        </div>
      </div>

      <BrandingSettings />

      <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <h3 className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-2.5 flex items-center gap-2">
          Undang Anggota
        </h3>
        <p className="text-[10px] text-blue-700 mb-3 leading-relaxed">
          Gunakan ID Komunitas untuk warga bergabung.
        </p>
        <div className="flex gap-2">
          <button 
            onClick={shareInvite}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#25D366] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-100"
          >
            <MessageCircle size={14} /> WhatsApp
          </button>
          <button 
            onClick={copyId}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white text-blue-600 border border-blue-200 rounded-xl text-[10px] font-black uppercase tracking-widest"
          >
            <Copy size={14} /> ID
          </button>
        </div>
      </div>

      <FeatureOrderSettings />

      <div className="mt-6 p-3 bg-orange-50 rounded-xl border border-orange-100 flex gap-2">
        <Info size={16} className="text-orange-500 shrink-0" />
        <p className="text-[9px] text-orange-800 leading-relaxed">
          Beberapa modul mungkin memerlukan pengaturan tambahan untuk berfungsi maksimal.
        </p>
      </div>

      <div className="mt-8">
        <AuditLog />
      </div>
    </div>
  );
}
