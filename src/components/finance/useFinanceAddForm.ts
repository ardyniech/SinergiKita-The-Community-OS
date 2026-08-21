import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useAudit } from '../../context/AuditContext';
import { auth, db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export function useFinanceAddForm(onClose: () => void, onSuccess: () => void) {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const { addAuditEntry } = useAudit();

  const [type, setType] = useState<'income' | 'expense'>('income');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Iuran Warga');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      showToast("Nominal tidak valid");
      return;
    }

    setSubmitting(true);
    try {
      if (type === 'expense' && numAmount > 1000000) {
        await addDoc(collection(db, 'pending_approvals'), {
          tenantId: profile?.tenantId,
          description: description.trim(),
          amount: numAmount,
          type: 'debit',
          date: new Date().toISOString(),
          createdBy: profile?.displayName || profile?.email || 'Bendahara',
          createdByUid: profile?.uid,
          approvals: [profile?.uid],
          approverNames: [profile?.displayName || profile?.email || 'Bendahara'],
          status: 'pending',
          createdAt: serverTimestamp()
        });
        showToast("Pengeluaran > Rp 1jt membutuhkan persetujuan dual-sign dari pengurus!");
      } else {
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch('/api/finances', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            type,
            amount: numAmount,
            description: description.trim(),
            category
          })
        });

        if (!res.ok) throw new Error("Gagal mencatat transaksi");
        showToast("Transaksi kas berhasil dicatat!");
      }

      addAuditEntry(`Finance record added: ${type} Rp ${numAmount}`);
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || "Gagal mencatat transaksi");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    type,
    setType,
    amount,
    setAmount,
    description,
    setDescription,
    category,
    setCategory,
    submitting,
    handleSubmit
  };
}
