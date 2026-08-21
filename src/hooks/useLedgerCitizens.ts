import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useToast } from '../context/ToastContext';
import { useAudit } from '../context/AuditContext';

export interface Citizen {
  uid: string;
  displayName: string;
  email: string;
  role: string;
  duesStatus?: 'paid' | 'unpaid';
  duesAmount?: number;
  phoneNumber?: string;
}

export function useLedgerCitizens(tenantId?: string, isApproved?: boolean) {
  const { showToast } = useToast();
  const { addAuditEntry } = useAudit();
  const [citizens, setCitizens] = useState<Citizen[]>([]);

  useEffect(() => {
    if (!tenantId || !isApproved) return;

    const qCit = query(collection(db, 'users'), where('tenantId', '==', tenantId));
    const unsubCit = onSnapshot(qCit, (snapshot) => {
      const citizenData: Citizen[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        citizenData.push({
          uid: doc.id,
          displayName: data.displayName || data.email?.split('@')[0] || 'Warga',
          email: data.email,
          role: data.role || 'member',
          duesStatus: data.duesStatus || 'unpaid',
          duesAmount: Number(data.duesAmount) || 50000,
          phoneNumber: data.phoneNumber || '+628123456789'
        } as Citizen);
      });
      setCitizens(citizenData);
    });

    return () => unsubCit();
  }, [tenantId, isApproved]);

  const handleToggleDues = async (citizen: Citizen) => {
    try {
      const nextStatus = citizen.duesStatus === 'paid' ? 'unpaid' : 'paid';
      await updateDoc(doc(db, 'users', citizen.uid), { duesStatus: nextStatus });
      showToast(`Status iuran ${citizen.displayName} diubah menjadi ${nextStatus === 'paid' ? 'LUNAS' : 'BELUM LUNAS'}`);
    } catch (err: any) {
      showToast("Gagal memperbarui status: " + err.message);
    }
  };

  const handleSendReminder = (citizen: Citizen) => {
    addAuditEntry(`Sent automated dues reminder to ${citizen.displayName} (${citizen.phoneNumber})`);
    showToast(
      `📲 [MOCK WHATSAPP/SMS GATEWAY] Terkirim ke ${citizen.phoneNumber}:\n"Halo ${citizen.displayName}, pengingat iuran SinergiKita Anda sebesar Rp ${citizen.duesAmount?.toLocaleString()} belum terbayar. Harap selesaikan iuran untuk kesejahteraan warga. Terima kasih!"`
    );
  };

  return { citizens, handleToggleDues, handleSendReminder };
}
