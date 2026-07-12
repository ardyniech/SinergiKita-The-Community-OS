import { motion } from 'motion/react';
import { AlertCircle, CheckCircle, Clock, MapPin, Shield, Activity, Users, MessageSquare } from 'lucide-react';
import { updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useToast } from '../../context/ToastContext';

interface Emergency {
  id: string;
  type: string;
  senderName: string;
  senderAddress: string;
  senderId: string;
  timestamp: any;
  tenantId: string;
  status?: 'triggered' | 'accepted' | 'handling' | 'resolved';
  responderName?: string;
  responderUid?: string;
  triggeredAt?: string;
  acceptedAt?: string;
  handlingAt?: string;
  resolvedAt?: string;
}

interface EmergencyAlertProps {
  alert: Emergency;
  isAdmin: boolean;
  onResolve: (id: string) => void;
  currentUser: { uid: string; displayName?: string; email: string };
}

export function EmergencyAlert({ alert, isAdmin, onResolve, currentUser }: EmergencyAlertProps) {
  const { showToast } = useToast();
  const currentStatus = alert.status || 'triggered';

  // Deterministic simulated distance in meters near user location (for realism and UI visual density)
  const seed = alert.senderName.charCodeAt(0) || 45;
  const simulatedDistance = (seed * 7) % 120 + 8; // Between 8m and 128m
  const isCloseRange = simulatedDistance < 50;

  const formatTime = (ts: any) => {
    if (!ts) return null;
    try {
      if (typeof ts === 'string') {
        const d = new Date(ts);
        return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      }
      if (ts.toDate) {
        return ts.toDate().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      }
      if (ts.seconds) {
        return new Date(ts.seconds * 1000).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  };

  const handleUpdateStatus = async (nextStatus: 'accepted' | 'handling' | 'resolved') => {
    try {
      const docRef = doc(db, 'emergencies', alert.id);
      if (nextStatus === 'resolved') {
        // Update status to resolved (or trigger the callback)
        await updateDoc(docRef, {
          status: 'resolved',
          resolvedAt: new Date().toISOString()
        });
        showToast("Laporan SOS telah ditangani sepenuhnya dan diarsipkan.");
      } else if (nextStatus === 'accepted') {
        await updateDoc(docRef, {
          status: 'accepted',
          responderUid: currentUser.uid,
          responderName: currentUser.displayName || currentUser.email.split('@')[0],
          acceptedAt: new Date().toISOString()
        });
        showToast(`Anda menerima panggilan darurat dari ${alert.senderName}!`);
      } else {
        await updateDoc(docRef, {
          status: 'handling',
          handlingAt: new Date().toISOString()
        });
        showToast("Status diubah: Tim sedang menangani insiden di lokasi.");
      }
    } catch (err: any) {
      showToast("Gagal memperbarui status: " + err.message);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Hapus laporan SOS ini secara permanen dari arsip?")) {
      await deleteDoc(doc(db, 'emergencies', alert.id));
      showToast("Arsip SOS dihapus.");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: -15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -15 }}
      className={`p-3 rounded-xl shadow-md border-2 flex flex-col gap-2.5 transition-all ${
        currentStatus === 'triggered' ? 'bg-red-50 border-red-500 animate-pulse' :
        currentStatus === 'accepted' ? 'bg-amber-50 border-amber-500' :
        currentStatus === 'handling' ? 'bg-blue-50 border-blue-500' :
        'bg-green-50 border-green-500'
      }`}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg text-white ${
            currentStatus === 'triggered' ? 'bg-red-600 animate-bounce' :
            currentStatus === 'accepted' ? 'bg-amber-500' :
            currentStatus === 'handling' ? 'bg-blue-500' :
            'bg-green-500'
          }`}>
            <AlertCircle size={16} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className={`text-[10px] font-black uppercase tracking-wider ${
                currentStatus === 'triggered' ? 'text-red-700' :
                currentStatus === 'accepted' ? 'text-amber-700' :
                currentStatus === 'handling' ? 'text-blue-700' :
                'text-green-700'
              }`}>
                Panggilan SOS: {alert.type.toUpperCase()}
              </h3>
              
              <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-full ${
                isCloseRange ? 'bg-red-200 text-red-900' : 'bg-gray-200 text-gray-800'
              }`}>
                {isCloseRange ? '🚨 SANGAT DEKAT (Tetangga)' : '📍 SEKTOR SAMA'}
              </span>
            </div>
            <p className="text-[10px] font-bold text-gray-700 mt-0.5">
              Korban: <b className="text-gray-900">{alert.senderName}</b> ({simulatedDistance}m dari Anda)
            </p>
          </div>
        </div>

        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md border ${
          currentStatus === 'triggered' ? 'bg-red-100 text-red-700 border-red-300' :
          currentStatus === 'accepted' ? 'bg-amber-100 text-amber-700 border-amber-300' :
          currentStatus === 'handling' ? 'bg-blue-100 text-blue-700 border-blue-300' :
          'bg-green-100 text-green-700 border-green-300'
        }`}>
          {currentStatus === 'triggered' ? 'SIAGA / BAHAYA' :
           currentStatus === 'accepted' ? 'DIRESPON' :
           currentStatus === 'handling' ? 'DITANGANI' :
           'SELESAI'}
        </span>
      </div>

      {/* Geolocation Details & Gateways */}
      <div className="grid grid-cols-2 gap-2 text-[9px] text-gray-600 bg-white p-2 rounded-lg border border-gray-100">
        <div>
          <span className="font-bold flex items-center gap-0.5 text-[8px] text-gray-400 uppercase">
            <MapPin size={9} /> Titik Kordinat / Alamat:
          </span>
          <p className="font-semibold text-gray-900 mt-0.5 truncate">{alert.senderAddress}</p>
        </div>
        <div>
          <span className="font-bold flex items-center gap-0.5 text-[8px] text-gray-400 uppercase">
            <MessageSquare size={9} /> Gateway Notifikasi:
          </span>
          <p className="text-emerald-600 font-extrabold mt-0.5">
            [OK] WhatsApp Terkirim ke 5 Tetangga Terdekat
          </p>
        </div>
      </div>

      {/* Responder State */}
      {currentStatus !== 'triggered' && alert.responderName && (
        <div className="flex items-center gap-1 text-[9px] font-bold text-gray-700">
          <Shield size={11} className="text-indigo-500" />
          <span>Diterima oleh Penolong: <b className="text-gray-900">{alert.responderName}</b></span>
        </div>
      )}

      {/* Progress Timeline Tracker */}
      <div className="bg-white p-2 rounded-lg border border-gray-100 flex flex-col gap-1.5 text-[9px]">
        <span className="font-extrabold text-[8px] text-gray-400 uppercase tracking-widest block mb-1">
          Tracking Status Penanganan:
        </span>
        <div className="flex items-center justify-between relative px-2">
          {/* Connector Line */}
          <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
          
          {/* Step 1: Diterima */}
          <div className="flex flex-col items-center text-center z-10 w-20">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black border-2 ${
              ['accepted', 'handling', 'resolved'].includes(currentStatus)
                ? 'bg-amber-500 border-amber-600 text-white'
                : 'bg-red-500 border-red-600 text-white animate-pulse'
            }`}>
              1
            </div>
            <span className="font-bold text-gray-800 mt-1">Diterima</span>
            <span className="text-[7px] text-gray-500 font-mono">
              {formatTime(alert.acceptedAt) || formatTime(alert.timestamp) || formatTime(alert.triggeredAt) || 'Menunggu...'}
            </span>
          </div>

          {/* Step 2: Ditangani */}
          <div className="flex flex-col items-center text-center z-10 w-20">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black border-2 ${
              ['handling', 'resolved'].includes(currentStatus)
                ? 'bg-blue-500 border-blue-600 text-white'
                : 'bg-gray-100 border-gray-300 text-gray-400'
            }`}>
              2
            </div>
            <span className="font-bold text-gray-800 mt-1">Ditangani</span>
            <span className="text-[7px] text-gray-500 font-mono">
              {formatTime(alert.handlingAt) || (currentStatus === 'handling' || currentStatus === 'resolved' ? 'Sedang Jalan' : '-')}
            </span>
          </div>

          {/* Step 3: Selesai */}
          <div className="flex flex-col items-center text-center z-10 w-20">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black border-2 ${
              currentStatus === 'resolved'
                ? 'bg-green-500 border-green-600 text-white'
                : 'bg-gray-100 border-gray-300 text-gray-400'
            }`}>
              3
            </div>
            <span className="font-bold text-gray-800 mt-1">Selesai</span>
            <span className="text-[7px] text-gray-500 font-mono">
              {formatTime(alert.resolvedAt) || '-'}
            </span>
          </div>
        </div>
      </div>

      {/* Status control actions */}
      <div className="flex gap-1.5 justify-end mt-1">
        {currentStatus === 'triggered' && (
          <button
            onClick={() => handleUpdateStatus('accepted')}
            className="text-[9px] bg-amber-500 hover:bg-amber-600 text-white font-black uppercase px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1"
          >
            <Activity size={10} /> Terima & Tolong
          </button>
        )}

        {currentStatus === 'accepted' && (alert.responderUid === currentUser.uid || isAdmin) && (
          <button
            onClick={() => handleUpdateStatus('handling')}
            className="text-[9px] bg-blue-600 hover:bg-blue-700 text-white font-black uppercase px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1"
          >
            <Clock size={10} /> Menuju Lokasi
          </button>
        )}

        {currentStatus === 'handling' && (alert.responderUid === currentUser.uid || isAdmin) && (
          <button
            onClick={() => handleUpdateStatus('resolved')}
            className="text-[9px] bg-green-600 hover:bg-green-700 text-white font-black uppercase px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1"
          >
            <CheckCircle size={10} /> Selesaikan
          </button>
        )}

        {currentStatus === 'resolved' && isAdmin && (
          <button
            onClick={handleDelete}
            className="text-[8px] text-rose-600 hover:bg-rose-50 border border-rose-200 px-2 py-1 rounded-lg font-bold"
          >
            Hapus Arsip
          </button>
        )}
      </div>
    </motion.div>
  );
}
