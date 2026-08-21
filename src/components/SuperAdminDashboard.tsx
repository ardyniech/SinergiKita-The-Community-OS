import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Tenant, CommunityModule } from '../types';
import { Search, LayoutGrid, X, ShieldCheck, CheckSquare, Square, AlertCircle, Coins } from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'motion/react';
import { handleFirestoreError, OperationType } from '../lib/firestore-utils';
import { SuperAdminHeader } from './molecules/SuperAdminHeader';
import { TenantCard } from './molecules/TenantCard';
import { PendingTenantsList } from './molecules/PendingTenantsList';

const monetizableModulesList: { id: CommunityModule; label: string; desc: string; isPremium: boolean }[] = [
  { id: 'emergency', label: 'Alarm Darurat (SOS)', desc: 'Sistem tanggap darurat & SOS warga real-time', isPremium: false },
  { id: 'finance', label: 'Buku Kas & Keuangan', desc: 'Arus kas, iuran, & laporan warga', isPremium: false },
  { id: 'social', label: 'Santunan & Gotong Royong', desc: 'Galang dana & santunan sosial warga', isPremium: false },
  { id: 'directory', label: 'Direktori Kontak Warga', desc: 'Kontak darurat & database profil warga', isPremium: false },
  { id: 'koperasi', label: 'Koperasi Warga', desc: 'Simpan pinjam & dana talangan syariah/mikro', isPremium: true },
  { id: 'funding', label: 'Crowdfunding Gotong Royong', desc: 'Pendanaan modal usaha bersama warga', isPremium: true },
  { id: 'pos', label: 'Kasir Toko & UMKM (POS)', desc: 'Aplikasi kasir penjualan digital UMKM', isPremium: true },
  { id: 'learning', label: 'Pojok Belajar & Panduan', desc: 'Pusat edukasi & tutorial operasional warga', isPremium: false },
  { id: 'announcements', label: 'Warta Pengumuman', desc: 'Penyebaran warta resmi & pengumuman RT/RW', isPremium: false },
  { id: 'chat', label: 'Obrolan Warga (Chat)', desc: 'Ruang obrolan grup diskusi instan', isPremium: false },
  { id: 'marketplace', label: 'Pasar Brotherhood', desc: 'E-commerce internal & lapak jual beli warga', isPremium: true },
  { id: 'ai', label: 'Kecerdasan Buatan (AI)', desc: 'Asisten pintar, tips otomatis, & riset data', isPremium: true },
  { id: 'map', label: 'Peta Lingkungan (Maps)', desc: 'Peta visual pemetaan lokasi & titik fasilitas', isPremium: true },
  { id: 'stats', label: 'Statistik & KPI Kompleks', desc: 'Dashboard analisis performa kas & warga', isPremium: true },
  { id: 'ptt', label: 'Radio HT PTT (Walkie Talkie)', desc: 'Koneksi suara patroli siaga warga terintegrasi', isPremium: true },
];

export default function SuperAdminDashboard() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTenantForLicense, setSelectedTenantForLicense] = useState<Tenant | null>(null);
  const [savingLicense, setSavingLicense] = useState(false);
  const dragControls = useDragControls();

  useEffect(() => {
    return onSnapshot(query(collection(db, 'tenants')), (snap) => {
      const data = snap.docs.map(d => {
        const d_ = d.data();
        return { id: d.id, ...d_, createdAt: d_.createdAt?.toMillis?.() || d_.createdAt || Date.now() } as Tenant;
      }).sort((a, b) => b.createdAt - a.createdAt);
      setTenants(data); setLoading(false);
    });
  }, []);

  const handleApprove = async (id: string, status: 'approved' | 'pending') => {
    await updateDoc(doc(db, 'tenants', id), { status });
    const t = tenants.find(x => x.id === id);
    if (t) {
      if (status === 'approved') {
        await updateDoc(doc(db, 'users', t.ownerId), { role: 'admin', tenantId: id, isApproved: true });
      } else {
        await updateDoc(doc(db, 'users', t.ownerId), { isApproved: false });
      }
    }
  };

  const handleToggleLicenseModule = async (moduleId: CommunityModule) => {
    if (!selectedTenantForLicense) return;
    setSavingLicense(true);
    try {
      const currentUnlocked = selectedTenantForLicense.unlockedModules || [
        'emergency', 'finance', 'social', 'directory', 'learning', 'announcements', 'chat'
      ];
      const nextUnlocked = currentUnlocked.includes(moduleId)
        ? currentUnlocked.filter(id => id !== moduleId)
        : [...currentUnlocked, moduleId];
      
      const updatedTenant = { ...selectedTenantForLicense, unlockedModules: nextUnlocked };
      
      await updateDoc(doc(db, 'tenants', selectedTenantForLicense.id), {
        unlockedModules: nextUnlocked
      });
      setSelectedTenantForLicense(updatedTenant);
    } catch (err) {
      console.error("Gagal mengubah lisensi modul:", err);
    } finally {
      setSavingLicense(false);
    }
  };

  const filtered = tenants.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.id.toLowerCase().includes(searchTerm.toLowerCase()));
  const stats = { total: tenants.length, pending: tenants.filter(t => t.status === 'pending').length, approved: tenants.filter(t => t.status === 'approved').length };

  if (loading) return <div className="flex items-center justify-center p-20"><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <SuperAdminHeader stats={stats} />
      
      {/* 1. Pending Approvals Sub-Component List */}
      <PendingTenantsList tenants={tenants} onApprove={handleApprove} />

      {/* 2. Search & Full Tenant Database */}
      <div className="border-t border-gray-100 pt-5 space-y-4">
        <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">
          Database Semua Komunitas ({filtered.length})
        </h3>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Cari ID atau nama komunitas..." 
              className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm outline-none text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-300 transition-all" 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
          </div>
          <button className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm text-gray-500"><LayoutGrid size={20} /></button>
        </div>

        <div className="grid gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-16 rounded-3xl border-2 border-dashed border-gray-100 text-center">
                <h3 className="text-sm font-bold text-gray-900">Tidak ada hasil</h3>
              </motion.div>
            ) : (
              filtered.map((t, i) => (
                <TenantCard 
                  key={t.id} 
                  tenant={t} 
                  index={i} 
                  onApprove={handleApprove} 
                  onManageLicense={(tenant) => setSelectedTenantForLicense(tenant)}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Monetization / Feature License Sheet Modal */}
      <AnimatePresence>
        {selectedTenantForLicense && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-end justify-center p-0">
            <div className="absolute inset-0" onClick={() => setSelectedTenantForLicense(null)} />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              drag="y"
              dragControls={dragControls}
              dragListener={false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0.05, bottom: 0.95 }}
              onDragEnd={(event, info) => {
                if (info.offset.y > 100 || info.velocity.y > 300) {
                  setSelectedTenantForLicense(null);
                }
              }}
              className="bg-white rounded-t-3xl border-t border-slate-200/80 shadow-2xl max-w-md w-full relative z-10 flex flex-col max-h-[85vh] pb-[calc(env(safe-area-inset-bottom,16px)+12px)]"
            >
              {/* Drag Handle Area */}
              <div 
                onPointerDown={(e) => dragControls.start(e)}
                className="w-full flex flex-col items-center justify-center pt-3 pb-2 bg-slate-50/50 border-b border-slate-100 shrink-0 cursor-grab active:cursor-grabbing select-none rounded-t-3xl"
              >
                <div className="w-12 h-1.5 bg-slate-300 rounded-full mb-1" />
                <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Tarik untuk menutup
                </div>
              </div>
              
              <div className="p-4 flex flex-col flex-1 overflow-hidden">
              
              {/* Header */}
              <div className="flex justify-between items-start mb-4 shrink-0">
                <div className="flex items-start gap-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Coins size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-950 uppercase tracking-tight">
                      Lisensi Fitur Monetisasi
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                      Komunitas: {selectedTenantForLicense.name}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedTenantForLicense(null)}
                  className="p-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Notice */}
              <div className="p-2.5 bg-amber-50/50 border border-amber-200/60 rounded-2xl mb-3 flex items-start gap-2 shrink-0">
                <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
                  Fitur berbayar / premium yang ditandai 👑 hanya dapat diaktifkan oleh admin tenant jika lisensinya dicentang (di-unlocked) di bawah ini.
                </p>
              </div>

              {/* Modules Checklist scroll container */}
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5">
                {monetizableModulesList.map((mod) => {
                  const unlockedList = selectedTenantForLicense.unlockedModules || [
                    'emergency', 'finance', 'social', 'directory', 'learning', 'announcements', 'chat'
                  ];
                  const isUnlocked = unlockedList.includes(mod.id);
                  return (
                    <div 
                      key={mod.id}
                      onClick={() => !savingLicense && handleToggleLicenseModule(mod.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                        isUnlocked 
                          ? 'bg-emerald-50/40 border-emerald-200/80 hover:border-emerald-300' 
                          : 'bg-white border-slate-100 hover:border-slate-200 opacity-75'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <button className={`shrink-0 transition-colors ${isUnlocked ? 'text-emerald-600' : 'text-slate-300'}`}>
                          {isUnlocked ? <CheckSquare size={16} /> : <Square size={16} />}
                        </button>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-[11px] font-black text-slate-900 leading-tight">
                              {mod.label}
                            </h4>
                            {mod.isPremium && (
                              <span className="text-[7px] font-black bg-amber-100 text-amber-700 px-1 py-0.2 rounded uppercase tracking-wider">
                                👑 Premium
                              </span>
                            )}
                          </div>
                          <p className="text-[9px] text-slate-500 leading-tight mt-0.5 truncate">
                            {mod.desc}
                          </p>
                        </div>
                      </div>
                      <span className="text-[8px] font-mono font-bold text-slate-400 bg-slate-50 border border-slate-100 px-1 py-0.5 rounded shrink-0">
                        {mod.id.toUpperCase()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

