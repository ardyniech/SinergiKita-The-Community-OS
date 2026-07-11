import { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, CheckCircle2 } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { CommunityModule } from '../../../types';

const featureModules: { id: CommunityModule; label: string; desc: string }[] = [
  { id: 'emergency', label: 'Alarm Darurat', desc: 'Sistem SOS warga real-time' },
  { id: 'finance', label: 'Laporan Keuangan', desc: 'Transparansi kas & iuran' },
  { id: 'social', label: 'Sosial & Gotong Royong', desc: 'Bantuan antar warga & proposal' },
  { id: 'directory', label: 'Direktori Warga', desc: 'Data & profil anggota komunitas' },
  { id: 'koperasi', label: 'Koperasi', desc: 'Simpan pinjam & kesejahteraan' },
  { id: 'funding', label: 'Founding Bisnis', desc: 'Crowdfunding usaha bersama' },
  { id: 'pos', label: 'Kasir (POS)', desc: 'Sistem penjualan UMKM komunitas' },
  { id: 'learning', label: 'Panduan Edukasi', desc: 'Materi & tutorial untuk warga' },
  { id: 'announcements', label: 'Warta Warga', desc: 'Pengumuman & informasi terbaru' },
  { id: 'chat', label: 'Obrolan Komunitas', desc: 'Ruang diskusi antar warga' },
  { id: 'marketplace', label: 'Pasar Brotherhood', desc: 'Ekosistem jual beli antar warga' },
  { id: 'ai', label: 'Kecerdasan Buatan (AI)', desc: 'Analisis pintar & tips otomatis untuk komunitas' },
  { id: 'settings', label: 'Pengaturan Admin', desc: 'Konfigurasi modul & branding' },
  { id: 'superadmin', label: 'Master Console', desc: 'Akses pusat seluruh tenant' },
];

export default function FeatureOrderSettings() {
  const { profile, tenant, isSuperAdmin } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [orderedFeatures, setOrderedFeatures] = useState<CommunityModule[]>([]);

  useEffect(() => {
    if (tenant) {
      const defaultFeatureOrder = featureModules
        .filter(m => {
          if (m.id === 'superadmin') return isSuperAdmin;
          if (m.id === 'settings') return true;
          return true;
        })
        .map(m => m.id);
      const existingFeatureOrder = tenant.moduleOrder || [];
      const combinedFeatures = [...existingFeatureOrder];
      defaultFeatureOrder.forEach(id => {
        if (!combinedFeatures.includes(id)) combinedFeatures.push(id);
      });
      setOrderedFeatures(combinedFeatures.filter(id => defaultFeatureOrder.includes(id)));
    }
  }, [tenant, isSuperAdmin]);

  const toggleModule = async (moduleId: CommunityModule) => {
    if (!profile?.tenantId) return;
    setLoading(true);
    try {
      const current = tenant?.enabledModules || ['emergency', 'finance', 'social', 'directory'];
      const next = current.includes(moduleId) 
        ? current.filter(id => id !== moduleId)
        : [...current, moduleId];
      
      await updateDoc(doc(db, 'tenants', profile.tenantId), {
        enabledModules: next
      });
      showToast("Pengaturan modul diperbarui.");
    } catch (err) {
      showToast("Gagal memperbarui pengaturan.");
    } finally {
      setLoading(false);
    }
  };

  const moveItem = async (index: number, direction: 'up' | 'down') => {
    const list = [...orderedFeatures];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;
    
    setOrderedFeatures(list);

    if (!profile?.tenantId) return;
    try {
      await updateDoc(doc(db, 'tenants', profile.tenantId), {
        moduleOrder: list
      });
    } catch (error) {
      showToast("Gagal menyimpan urutan.");
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-3 flex items-center gap-2 px-1">
        Urutan & Status Kartu Fitur
      </h3>
      <div className="grid grid-cols-1 gap-2">
        {orderedFeatures.map((modId, index) => {
          const mod = featureModules.find(m => m.id === modId);
          if (!mod) return null;
          const isActive = (tenant?.enabledModules || ['emergency', 'finance', 'social', 'directory']).includes(mod.id);
          return (
            <div
              key={mod.id}
              className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                isActive 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-gray-50 border-gray-100'
              }`}
            >
              <div className="flex flex-col gap-1 pr-2 border-r border-gray-100">
                <button 
                  onClick={() => moveItem(index, 'up')}
                  disabled={index === 0}
                  className="p-1 hover:bg-white rounded text-gray-400 disabled:opacity-10 transition-all active:scale-90"
                >
                  <ChevronUp size={14} />
                </button>
                <button 
                  onClick={() => moveItem(index, 'down')}
                  disabled={index === orderedFeatures.length - 1}
                  className="p-1 hover:bg-white rounded text-gray-400 disabled:opacity-10 transition-all active:scale-90"
                >
                  <ChevronDown size={14} />
                </button>
              </div>

              <button
                onClick={() => toggleModule(mod.id)}
                disabled={loading}
                className="flex-1 flex items-center justify-between text-left group"
              >
                <div className="flex-1">
                  <h4 className={`text-[12px] font-black ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>{mod.label}</h4>
                  <p className="text-[10px] text-gray-500 leading-none mt-1">{mod.desc}</p>
                </div>
                <div className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'border-2 border-gray-200 text-transparent'
                }`}>
                  <CheckCircle2 size={12} />
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
