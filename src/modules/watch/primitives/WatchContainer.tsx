import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { WatchRequest } from '../../../shared/models/watchRequests';
import { createWatchRequest, confirmWatchRequest, completeWatchRequest, subscribeActiveWatchRequests } from '../storage/watchStorage';
import { WatchCard } from './WatchCard';
import { Eye } from 'lucide-react';
import { getGPSLocation } from '../../../hooks/useEmergency';
import { WatchRequestForm } from './WatchRequestForm';

export const WatchContainer: React.FC = () => {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [requests, setRequests] = useState<WatchRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!profile?.tenantId) return;
    const unsub = subscribeActiveWatchRequests(profile.tenantId, (data) => {
      setRequests(data);
      setLoading(false);
    });
    return () => unsub();
  }, [profile?.tenantId]);

  const handleRequest = async (destination: string) => {
    if (!profile?.tenantId || !profile?.uid) return;
    setIsSubmitting(true);
    try {
      const gps = await getGPSLocation();
      const name = profile.displayName || profile.email?.split('@')[0] || 'Driver';
      const newReq = await createWatchRequest(profile.tenantId, profile.uid, name, destination, gps?.latitude, gps?.longitude);
      if (newReq) showToast('Permintaan pantau perjalanan berhasil dikirim!');
      else showToast('Gagal mengirim permintaan pantau');
    } catch {
      showToast('Gagal mendapatkan lokasi GPS');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirm = async (id: string) => {
    if (!profile?.uid) return;
    const name = profile.displayName || profile.email?.split('@')[0] || 'Driver';
    if (await confirmWatchRequest(id, profile.uid, name)) showToast('Anda sekarang memantau rekan driver ini!');
  };

  const handleComplete = async (id: string) => {
    if (await completeWatchRequest(id)) showToast('Terima kasih! Perjalanan selesai dengan aman.');
  };

  return (
    <div className="space-y-3 px-1">
      <WatchRequestForm isSubmitting={isSubmitting} onSubmit={handleRequest} />

      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1 px-1">
          <Eye size={13} className="text-slate-400" /><span>Pantau Perjalanan Rekan Driver</span>
        </h3>
        {loading ? (
          <div className="p-4 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-100">Memuat data perjalanan...</div>
        ) : requests.length === 0 ? (
          <div className="p-6 text-center bg-white rounded-xl border border-slate-100 space-y-1">
            <Eye size={20} className="mx-auto text-slate-300" />
            <p className="text-xs font-bold text-slate-700">Aman Terkendali</p>
            <p className="text-[10px] text-slate-400">Tidak ada rekan driver yang meminta pantauan saat ini.</p>
          </div>
        ) : (
          <div className="grid gap-2">
            {requests.map((req) => (
              <WatchCard key={req.id} request={req} currentUserId={profile?.uid || ''} onConfirm={handleConfirm} onComplete={handleComplete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchContainer;
