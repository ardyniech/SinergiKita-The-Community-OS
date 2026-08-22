import { useState } from 'react';
import { Settings, MessageCircle, Copy, Info, Shield, Compass, Sliders, ListFilter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { isAdmin } from '../lib/permissions';
import AuditLog from './AuditLog';
import CommunitySettings from './organisms/settings/CommunitySettings';
import TemplateButtonsSettings from './organisms/settings/TemplateButtonsSettings';
import FeatureOrderSettings from './organisms/settings/FeatureOrderSettings';
import ManagerDashboard from './organisms/settings/ManagerDashboard';

export default function SettingsModule() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'manager' | 'order' | 'logs'>('profile');

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
    <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center text-gray-600">
          <Settings size={20} />
        </div>
        <div>
          <h2 className="text-base font-black text-gray-900 tracking-tight">Pengaturan</h2>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-0.5">Modul & Akses</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 border-b border-slate-100">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold shrink-0 transition-colors ${
            activeTab === 'profile' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Shield size={12} />
          <span>Profil</span>
        </button>
        <button
          onClick={() => setActiveTab('manager')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold shrink-0 transition-colors ${
            activeTab === 'manager' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Compass size={12} />
          <span>Kamus & Fitur</span>
        </button>
        <button
          onClick={() => setActiveTab('order')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold shrink-0 transition-colors ${
            activeTab === 'order' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Sliders size={12} />
          <span>Urutan</span>
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold shrink-0 transition-colors ${
            activeTab === 'logs' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <ListFilter size={12} />
          <span>Log</span>
        </button>
      </div>

      {/* Render Active Tab */}
      <div className="space-y-4">
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <CommunitySettings />
            
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
              <h3 className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                Undang Anggota
              </h3>
              <p className="text-[9px] text-blue-700 mb-3 leading-relaxed">
                Gunakan ID Komunitas untuk warga bergabung ke dalam sistem pangkalan.
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={shareInvite}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#25D366] text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-green-100"
                >
                  <MessageCircle size={14} /> WhatsApp
                </button>
                <button 
                  onClick={copyId}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-white text-blue-600 border border-blue-200 rounded-xl text-[9px] font-black uppercase tracking-widest"
                >
                  <Copy size={14} /> ID
                </button>
              </div>
            </div>
            
            <TemplateButtonsSettings />
          </div>
        )}

        {activeTab === 'manager' && <ManagerDashboard />}

        {activeTab === 'order' && (
          <div className="space-y-4">
            <FeatureOrderSettings />
            <div className="p-3 bg-orange-50 rounded-xl border border-orange-100 flex gap-2">
              <Info size={16} className="text-orange-500 shrink-0" />
              <p className="text-[9px] text-orange-800 leading-relaxed">
                Beberapa modul mungkin memerlukan pengaturan tambahan untuk berfungsi maksimal pada menu utama.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'logs' && <AuditLog />}
      </div>
    </div>
  );
}

