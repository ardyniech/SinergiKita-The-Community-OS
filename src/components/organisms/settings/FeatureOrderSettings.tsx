import { useState, useEffect, useRef } from 'react';
import { GripVertical, AlertTriangle } from 'lucide-react';
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
  const [activeDragIndex, setActiveDragIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
      showToast(`Modul ${featureModules.find(m => m.id === moduleId)?.label} diperbarui.`);
    } catch (err) {
      showToast("Gagal memperbarui status modul.");
    } finally {
      setLoading(false);
    }
  };

  // Save the state to firebase when drag ends
  const saveOrderToDatabase = async (finalList: CommunityModule[]) => {
    if (!profile?.tenantId) return;
    try {
      await updateDoc(doc(db, 'tenants', profile.tenantId), {
        moduleOrder: finalList
      });
    } catch (error) {
      showToast("Gagal menyimpan urutan modul.");
    }
  };

  // --- Desktop Drag & Drop Events ---
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setActiveDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (activeDragIndex === null || activeDragIndex === index) return;
    
    const list = [...orderedFeatures];
    const itemToMove = list[activeDragIndex];
    list.splice(activeDragIndex, 1);
    list.splice(index, 0, itemToMove);
    
    setActiveDragIndex(index);
    setOrderedFeatures(list);
  };

  const handleDragEnd = () => {
    setActiveDragIndex(null);
    saveOrderToDatabase(orderedFeatures);
  };

  // --- Mobile Touch & Hold Dragging Events ---
  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    setActiveDragIndex(index);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (activeDragIndex === null) return;
    
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!element) return;
    
    const card = element.closest('[data-index]');
    if (card) {
      const targetIndex = parseInt(card.getAttribute('data-index') || '', 10);
      if (!isNaN(targetIndex) && targetIndex !== activeDragIndex) {
        const list = [...orderedFeatures];
        const itemToMove = list[activeDragIndex];
        list.splice(activeDragIndex, 1);
        list.splice(targetIndex, 0, itemToMove);
        
        setActiveDragIndex(targetIndex);
        setOrderedFeatures(list);
      }
    }
  };

  const handleTouchEnd = () => {
    setActiveDragIndex(null);
    saveOrderToDatabase(orderedFeatures);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
            Aktivasi & Urutan Modul Fitur
          </h3>
          <p className="text-[8px] text-slate-400 font-mono mt-0.5">// SENTUH & TAHAN UNTUK GESER POSISI</p>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="grid grid-cols-1 gap-1.5"
      >
        {orderedFeatures.map((modId, index) => {
          const mod = featureModules.find(m => m.id === modId);
          if (!mod) return null;
          
          const isActive = (tenant?.enabledModules || ['emergency', 'finance', 'social', 'directory']).includes(mod.id);
          const isDragging = activeDragIndex === index;

          return (
            <div
              key={mod.id}
              data-index={index}
              draggable="true"
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              onTouchStart={(e) => handleTouchStart(e, index)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{ touchAction: 'none' }}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all select-none ${
                isDragging 
                  ? 'bg-cyan-50 border-cyan-300 scale-[1.02] shadow-md z-10 opacity-90 border-dashed'
                  : isActive 
                    ? 'bg-slate-50/50 border-slate-200 hover:border-slate-300' 
                    : 'bg-white border-slate-100 opacity-60'
              }`}
            >
              {/* Drag Handle - touch and hold anywhere, but GripVertical provides standard cue */}
              <div className="text-slate-400 cursor-grab active:cursor-grabbing p-1 -ml-1 hover:text-slate-600">
                <GripVertical size={13} />
              </div>

              {/* Title & Description */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[7px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                    ID:{mod.id.toUpperCase()}
                  </span>
                  {mod.id === 'emergency' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  )}
                </div>
                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-tight mt-0.5">
                  {mod.label}
                </h4>
                <p className="text-[9px] text-slate-500 leading-tight">
                  {mod.desc}
                </p>
              </div>

              {/* iOS-style toggle Switch */}
              <button
                onClick={() => toggleModule(mod.id)}
                disabled={loading}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isActive ? 'bg-cyan-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    isActive ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

