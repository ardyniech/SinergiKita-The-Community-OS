import React, { useEffect, useState } from 'react';
import { subscribePendingRiders, verifyRiderStatus } from '../storage/verificationStorage';
import { RiderVerificationCard } from './RiderVerificationCard';
import { AppUser } from '../../../shared/models';
import { ShieldCheck, Users } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export const VerificationList: React.FC = () => {
  const { profile } = useAuth();
  const [members, setMembers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.tenantId) return;

    const unsub = subscribePendingRiders(profile.tenantId, (data) => {
      setMembers(data);
      setLoading(false);
    });
    return () => unsub();
  }, [profile?.tenantId]);

  const handleVerify = async (docId: string, status: boolean) => {
    if (!profile?.tenantId) return;
    const verifierName = profile.displayName || profile.email?.split('@')[0] || 'Koordinator';
    await verifyRiderStatus(profile.tenantId, docId, status, verifierName);
  };

  return (
    <div className="space-y-2 px-1">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={16} className="text-emerald-600" />
          <h3 className="text-xs font-bold text-slate-800">Verifikasi Driver Pangkalan</h3>
        </div>
        <span className="text-[10px] text-slate-500 font-medium">
          Total: {members.filter((m) => !(m as any).isVerifiedRider && !m.isApproved).length} Driver
        </span>
      </div>

      {loading ? (
        <div className="p-4 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-100">
          Memuat data driver pangkalan...
        </div>
      ) : members.length === 0 ? (
        <div className="p-6 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <Users size={24} className="mx-auto text-slate-300" />
          <p className="text-xs font-bold text-slate-700">Belum Ada Anggota Terdaftar</p>
          <p className="text-[10px] text-slate-400">Anggota baru yang mendaftar akan tampil di sini untuk diverifikasi pengurus.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {members.filter((m) => !(m as any).isVerifiedRider && !m.isApproved).map((m) => (
            <RiderVerificationCard key={m.id || m.uid} member={m} onVerify={handleVerify} />
          ))}
        </div>
      )}
    </div>
  );
};
