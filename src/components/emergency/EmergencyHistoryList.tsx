import React from 'react';
import { History } from 'lucide-react';
import { EmergencyAlert } from '../molecules/EmergencyAlert';
import { useAuth } from '../../context/AuthContext';
import { isAdmin as checkAdmin } from '../../lib/permissions';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useToast } from '../../context/ToastContext';

interface EmergencyHistoryListProps {
  emergencies: any[];
}

export function EmergencyHistoryList({ emergencies }: EmergencyHistoryListProps) {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const isAdmin = checkAdmin(profile);

  const handleResolve = async (id: string) => {
    try {
      await updateDoc(doc(db, 'emergencies', id), {
        status: 'resolved',
        resolvedAt: new Date().toISOString()
      });
      showToast("Laporan darurat berhasil diselesaikan.");
    } catch (e) {
      showToast("Gagal menyelesaikan laporan darurat.");
    }
  };

  const currentUser = {
    uid: profile?.uid || '',
    displayName: profile?.displayName || '',
    email: profile?.email || ''
  };

  return (
    <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
      <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
        <History size={16} /> Riwayat Alarm Darurat (24 Jam)
      </h3>

      <div className="space-y-2">
        {emergencies.length === 0 ? (
          <p className="text-center text-slate-400 italic text-xs py-4">Lingkungan aman & kondusif. Tidak ada panggilan SOS aktif.</p>
        ) : (
          emergencies.map((item) => (
            <EmergencyAlert
              key={item.id}
              alert={item}
              isAdmin={isAdmin}
              onResolve={handleResolve}
              currentUser={currentUser}
            />
          ))
        )}
      </div>
    </div>
  );
}
