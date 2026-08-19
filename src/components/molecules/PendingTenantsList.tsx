import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle, Clock, User, Phone, MapPin, Mail, 
  Building2, ArrowRight, ShieldCheck, Check, Loader2 
} from 'lucide-react';
import { Tenant, AppUser } from '../../types';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useToast } from '../../context/ToastContext';

interface PendingTenantsListProps {
  tenants: Tenant[];
  onApprove: (id: string, status: 'approved' | 'pending') => Promise<void>;
}

export function PendingTenantsList({ tenants, onApprove }: PendingTenantsListProps) {
  const { showToast } = useToast();
  const [owners, setOwners] = useState<Record<string, AppUser>>({});
  const [loadingOwners, setLoadingOwners] = useState<Record<string, boolean>>({});
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const pendingTenants = tenants.filter(t => t.status === 'pending');

  // Fetch owner user profile for pending tenants to show complete details
  useEffect(() => {
    pendingTenants.forEach(async (tenant) => {
      if (tenant.ownerId && !owners[tenant.ownerId] && !loadingOwners[tenant.ownerId]) {
        setLoadingOwners(prev => ({ ...prev, [tenant.ownerId]: true }));
        try {
          const userDoc = await getDoc(doc(db, 'users', tenant.ownerId));
          if (userDoc.exists()) {
            setOwners(prev => ({ 
              ...prev, 
              [tenant.ownerId]: { uid: tenant.ownerId, ...userDoc.data() } as AppUser 
            }));
          }
        } catch (err) {
          console.error("Error fetching owner profile:", err);
        } finally {
          setLoadingOwners(prev => ({ ...prev, [tenant.ownerId]: false }));
        }
      }
    });
  }, [pendingTenants, owners, loadingOwners]);

  const handleApproveAction = async (tenantId: string) => {
    setApprovingId(tenantId);
    try {
      await onApprove(tenantId, 'approved');
      showToast("🎉 Komunitas berhasil disetujui! Onboarding pengurus telah diaktifkan.");
    } catch (err: any) {
      showToast(`❌ Gagal menyetujui komunitas: ${err.message || err}`);
    } finally {
      setApprovingId(null);
    }
  };

  if (pendingTenants.length === 0) {
    return (
      <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 text-center">
        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
          <Check size={20} />
        </div>
        <h4 className="text-xs font-bold text-gray-800 uppercase tracking-tight">Semua Bersih!</h4>
        <p className="text-[10px] text-gray-400 mt-1">Tidak ada pendaftaran komunitas baru yang menunggu persetujuan.</p>
      </div>
    );
  }

  const getCommunityTypeName = (type?: string) => {
    switch (type) {
      case 'rt-rw': return 'Warga (RT/RW)';
      case 'paguyuban': return 'Paguyuban / Alumni';
      case 'umkm': return 'UMKM / Koperasi';
      case 'ojol': return 'Komunitas Ojol / Angkot';
      case 'petani': return 'Kelompok Tani';
      default: return 'Lainnya';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
          <Clock size={14} className="text-amber-500 animate-pulse" />
          Antrean Persetujuan Komunitas Baru ({pendingTenants.length})
        </h3>
        <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md uppercase tracking-tight">
          Menunggu Review
        </span>
      </div>

      <div className="grid gap-3">
        <AnimatePresence mode="popLayout">
          {pendingTenants.map((t, idx) => {
            const owner = owners[t.ownerId];
            const isOwnerLoading = loadingOwners[t.ownerId];

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-white p-4 rounded-xl border border-amber-100 shadow-xs hover:border-amber-300 hover:shadow-xs transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Community & Requester Details */}
                  <div className="space-y-3 flex-1">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-amber-50 text-amber-600 rounded-lg shrink-0 mt-0.5">
                        <Building2 size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black text-gray-900 uppercase tracking-tight">{t.name}</h4>
                          <span className="text-[8px] font-black text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded uppercase tracking-widest">
                            {getCommunityTypeName(t.type)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] font-mono font-bold text-gray-400 bg-gray-50 px-1 py-0.2 rounded">ID: {t.id}</span>
                          <span className="w-1 h-1 bg-gray-200 rounded-full" />
                          <span className="text-[9px] text-gray-400 font-bold">
                            Diajukan: {new Date(t.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Owner detail sheet */}
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100/50 text-[10px] space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-gray-700 uppercase tracking-tight text-[9px] border-b border-gray-200/50 pb-1 mb-1">
                        <User size={11} className="text-gray-400" /> Profil Pengaju (Calon Admin)
                      </div>
                      
                      {isOwnerLoading ? (
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Loader2 size={10} className="animate-spin" />
                          <span>Mengambil data pengaju...</span>
                        </div>
                      ) : owner ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-gray-900">{owner.displayName || 'Nama tidak diset'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Mail size={10} className="text-gray-400 shrink-0" />
                            <span className="truncate">{owner.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Phone size={10} className="text-gray-400 shrink-0" />
                            <span>{owner.phoneNumber || '-'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin size={10} className="text-gray-400 shrink-0" />
                            <span className="truncate">{owner.address || '-'}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-400 italic">Data pengaju tidak ditemukan.</div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 self-end md:self-center">
                    <button
                      onClick={() => handleApproveAction(t.id)}
                      disabled={approvingId !== null}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all shadow-sm shadow-emerald-100 active:scale-[0.98] disabled:opacity-50"
                    >
                      {approvingId === t.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <CheckCircle size={12} />
                      )}
                      Setujui (Approve)
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
