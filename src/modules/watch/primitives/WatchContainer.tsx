import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { WatchRequest } from '../../../shared/models/watchRequests';
import { createWatchRequest, confirmWatchRequest, completeWatchRequest, subscribeActiveWatchRequests } from '../storage/watchStorage';
import { WatchCard } from './WatchCard';
import { Eye, Plus, MapPin, Navigation } from 'lucide-react';
import { getGPSLocation } from '../../../hooks/useEmergency';

export const WatchContainer: React.FC = () => {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [requests, setRequests] = useState<WatchRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [destination, setDestination] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!profile?.tenantId) return;

    const unsub = subscribeActiveWatchRequests(profile.tenantId, (data) => {
      setRequests(data);
      setLoading(false);
    });

    return () => unsub();
  }, [profile?.tenantId]);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.tenantId || !profile?.uid) return;
    if (!destination.trim()) {
      showToast('Harap masukkan rute atau tujuan perjalanan');
      return;
    }

    setIsSubmitting(true);
    try {
      const gps = await getGPSLocation();
      const name = profile.displayName || profile.email?.split('@')[0] || 'Driver';
      
      const newReq = await createWatchRequest(
        profile.tenantId,
        profile.uid,
        name,
        destination,
        gps?.latitude,
        gps?.longitude
      );

      if (newReq) {
        showToast('Permintaan pantau perjalanan berhasil dikirim!');
        setDestination('');
      } else {
        showToast('Gagal mengirim permintaan pantau');
      }
    } catch (err) {
      showToast('Gagal mendapatkan lokasi GPS');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirm = async (id: string) => {
    if (!profile?.uid) return;
    const name = profile.displayName || profile.email?.split('@')[0] || 'Driver';
    const success = await confirmWatchRequest(id, profile.uid, name);
    if (success) {
      showToast('Anda sekarang memantau rekan driver ini!');
    }
  };

  const handleComplete = async (id: string) => {
    const success = await completeWatchRequest(id);
    if (success) {
      showToast('Terima kasih! Perjalanan selesai dengan aman.');
    }
  };

  return (
    <div className="space-y-3 px-1">
      {/* Form Minta Pantau */}
      <form onSubmit={handleRequest} className="p-3 bg-white border border-slate-100 rounded-xl shadow-xs space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <Navigation size={14} className="text-indigo-600 animate-pulse" />
          <span>Minta Pantau Perjalanan (Jalur Rawan)</span>
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Contoh: Kalideres ke Cengkareng (jalan gelap)"
            className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-lg text-xs focus:outline-none focus:border-indigo-500 placeholder-slate-400"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-xs active:scale-95 disabled:opacity-50"
          >
            <Plus size={14} />
            <span>Kirim</span>
          </button>
        </div>
      </form>

      {/* Daftar Minta Pantau Aktif */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1 px-1">
          <Eye size={13} className="text-slate-400" />
          <span>Pantau Perjalanan Rekan Driver</span>
        </h3>

        {loading ? (
          <div className="p-4 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-100">
            Memuat data perjalanan...
          </div>
        ) : requests.length === 0 ? (
          <div className="p-6 text-center bg-white rounded-xl border border-slate-100 space-y-1">
            <Eye size={20} className="mx-auto text-slate-300" />
            <p className="text-xs font-bold text-slate-700">Aman Terkendali</p>
            <p className="text-[10px] text-slate-400">Tidak ada rekan driver yang meminta pantauan saat ini.</p>
          </div>
        ) : (
          <div className="grid gap-2">
            {requests.map((req) => (
              <WatchCard
                key={req.id}
                request={req}
                currentUserId={profile?.uid || ''}
                onConfirm={handleConfirm}
                onComplete={handleComplete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchContainer;
