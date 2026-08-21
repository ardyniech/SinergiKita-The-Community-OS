import { useState, useEffect, useRef } from 'react';
import { GripVertical, AlertTriangle, Lock, ShieldAlert } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { CommunityModule } from '../../../types';
import { getMemberLabel } from '../../../lib/terminology';

export default function FeatureOrderSettings() {
  const { profile, tenant, isSuperAdmin } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [orderedFeatures, setOrderedFeatures] = useState<CommunityModule[]>([]);
  const [activeDragIndex, setActiveDragIndex] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const memberLabel = getMemberLabel(tenant?.type);

  const featureModules: { id: CommunityModule; label: string; desc: string; isPremium: boolean }[] = [
    { id: 'emergency', label: `Alarm SOS ${memberLabel}`, desc: `Sistem SOS ${memberLabel.toLowerCase()} real-time`, isPremium: false },
    { id: 'finance', label: `Buku Kas ${memberLabel}`, desc: `Transparansi dana & iuran ${memberLabel.toLowerCase()}`, isPremium: false },
    { id: 'social', label: 'Santunan & Gotong Royong', desc: `Bantuan & proposal ${memberLabel.toLowerCase()}`, isPremium: false },
    { id: 'directory', label: `Direktori ${memberLabel}`, desc: `Data & profil ${memberLabel.toLowerCase()} komunitas`, isPremium: false },
    { id: 'koperasi', label: `Koperasi ${memberLabel}`, desc: 'Simpan pinjam & kesejahteraan', isPremium: true },
    { id: 'funding', label: 'Funding Proyek', desc: `Crowdfunding usaha bersama ${memberLabel.toLowerCase()}`, isPremium: true },
    { id: 'pos', label: `Kasir POS ${memberLabel}`, desc: 'Sistem penjualan UMKM komunitas', isPremium: true },
    { id: 'learning', label: 'Panduan Edukasi', desc: `Materi & tutorial untuk ${memberLabel.toLowerCase()}`, isPremium: false },
    { id: 'announcements', label: `Warta ${memberLabel}`, desc: 'Pengumuman & informasi terbaru', isPremium: false },
    { id: 'chat', label: `Obrolan ${memberLabel}`, desc: `Ruang diskusi antar ${memberLabel.toLowerCase()}`, isPremium: false },
    { id: 'marketplace', label: `Pasar ${memberLabel}`, desc: `Jual beli antar ${memberLabel.toLowerCase()}`, isPremium: true },
    { id: 'ai', label: 'Kecerdasan Buatan (AI)', desc: 'Analisis pintar & tips otomatis untuk komunitas', isPremium: true },
    { id: 'map', label: 'Peta Lingkungan', desc: 'Peta lokasi fasilitas & insiden', isPremium: true },
    { id: 'stats', label: 'Statistik & KPI', desc: 'Dashboard ringkasan analisis kas & data', isPremium: true },
    { id: 'ptt', label: 'Radio HT PTT', desc: `Radio walkie-talkie suara siaga ${memberLabel.toLowerCase()}`, isPremium: true },
    { id: 'settings', label: 'Pengaturan Admin', desc: 'Konfigurasi modul & branding', isPremium: false },
    { id: 'superadmin', label: 'Master Console', desc: 'Akses pusat seluruh tenant', isPremium: false },
  ];

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
    
    // Check master account license locking
    const defaultUnlocked = ['emergency', 'finance', 'social', 'directory', 'learning', 'announcements', 'chat'];
    const unlockedModules = tenant?.unlockedModules || defaultUnlocked;
    const isUnlocked = unlockedModules.includes(moduleId) || ['settings', 'superadmin'].includes(moduleId);
    
    if (!isUnlocked) {
      showToast("Fitur ini Terkunci! Hubungi Master Admin untuk mengaktifkan lisensi premium.");
      return;
    }

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

  const handleDragEnd = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).draggable = false;
    setActiveDragIndex(null);
    saveOrderToDatabase(orderedFeatures);
  };

  // --- Mobile Touch & Hold Dragging Events ---
  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    if (!isEditMode) return;
    const target = e.target as HTMLElement;
    if (!target.closest('.drag-handle')) return;
    
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
          <p className="text-[8px] text-slate-400 font-mono mt-0.5 tracking-tight">
            {isEditMode 
              ? <>GESER IKON <span className="text-cyan-600 font-bold">⠿</span> UNTUK MENGATUR URUTAN</>
              : "KLIK 'EDIT URUTAN' UNTUK MENGATUR POSISI"}
          </p>
        </div>

        <button
          onClick={() => setIsEditMode(!isEditMode)}
          className={`h-7 px-3 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border ${
            isEditMode 
              ? 'bg-cyan-600 border-cyan-600 text-white shadow-sm shadow-cyan-200' 
              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
          }`}
        >
          {isEditMode ? 'Selesai' : 'Edit Urutan'}
        </button>
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

          const defaultUnlocked = ['emergency', 'finance', 'social', 'directory', 'learning', 'announcements', 'chat'];
          const unlockedModules = tenant?.unlockedModules || defaultUnlocked;
          const isUnlocked = unlockedModules.includes(mod.id) || ['settings', 'superadmin'].includes(mod.id);

          return (
            <div
              key={mod.id}
              data-index={index}
              draggable="false"
              onMouseDown={(e) => {
                if (!isEditMode) return;
                const target = e.target as HTMLElement;
                if (target.closest('.drag-handle')) {
                  e.currentTarget.draggable = true;
                }
              }}
              onDragStart={(e) => isEditMode && handleDragStart(e, index)}
              onDragOver={(e) => isEditMode && handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              onTouchStart={(e) => isEditMode && handleTouchStart(e, index)}
              onTouchMove={isEditMode ? handleTouchMove : undefined}
              onTouchEnd={isEditMode ? handleTouchEnd : undefined}
              style={{ touchAction: isEditMode ? 'none' : 'auto' }}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all select-none ${
                isDragging 
                  ? 'bg-cyan-50 border-cyan-400 scale-[1.01] shadow-lg z-20 opacity-100 border-solid ring-2 ring-cyan-500/20'
                  : !isUnlocked
                    ? 'bg-slate-100/40 border-slate-200/50 opacity-60'
                    : isActive 
                      ? 'bg-slate-50/50 border-slate-200 hover:border-slate-300' 
                      : 'bg-white border-slate-100 opacity-80'
              }`}
            >
              {/* Drag Handle - Only trigger for this area */}
              {isEditMode && (
                <div className="drag-handle text-slate-300 cursor-grab active:cursor-grabbing p-1.5 -ml-1 hover:text-slate-500 hover:bg-slate-100/50 rounded-lg transition-colors">
                  <GripVertical size={14} />
                </div>
              )}

              {/* Title & Description */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[7px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                    ID:{mod.id.toUpperCase()}
                  </span>
                  {!isUnlocked && (
                    <span className="flex items-center gap-0.5 text-[7px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-1 rounded border border-amber-200/50">
                      <Lock size={7} /> Locked
                    </span>
                  )}
                  {isActive && isUnlocked && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                  )}
                </div>
                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-tight mt-0.5 flex items-center gap-1">
                  {mod.label}
                </h4>
                <p className="text-[9px] text-slate-500 leading-tight">
                  {mod.desc}
                </p>
              </div>

              {/* iOS-style toggle Switch or Lock Icon */}
              {!isUnlocked ? (
                <div 
                  onClick={() => showToast("Modul ini dikunci oleh Master Admin (Butuh Lisensi Monetisasi).")}
                  className="p-1.5 rounded-lg bg-slate-100 text-slate-400 hover:text-amber-600 hover:bg-amber-50 cursor-pointer transition-colors"
                >
                  <Lock size={12} />
                </div>
              ) : (
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

