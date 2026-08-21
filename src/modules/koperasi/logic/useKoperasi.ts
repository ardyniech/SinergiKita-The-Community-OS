import { useState, useEffect } from 'react';
import { KoperasiRecord, KoperasiLoan, AppUser } from '../../../shared/models';
import { koperasiStorage } from '../storage/koperasiStorage';
import { dispatcher } from '../../../core/dispatcher';

export function useKoperasi(tenantId: string | null, profile: AppUser | null) {
  const [records, setRecords] = useState<KoperasiRecord[]>([]);
  const [loans, setLoans] = useState<KoperasiLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!tenantId) return;
    
    const unsubRecords = koperasiStorage.subscribeToRecords(tenantId, (data) => {
      setRecords(data);
      if (loans.length > 0 || !loading) setLoading(false);
    });

    const unsubLoans = koperasiStorage.subscribeToLoans(tenantId, (data) => {
      setLoans(data);
      setLoading(false);
    });

    return () => {
      unsubRecords();
      unsubLoans();
    };
  }, [tenantId]);

  const userDeposits = records
    .filter(r => r.uid === profile?.uid && r.type === 'deposit' && r.status === 'completed')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const totalKoperasiPool = records
    .filter(r => r.type === 'deposit' && r.status === 'completed')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const handleDeposit = async (amount: number, note: string) => {
    if (!tenantId || !profile) return;
    setSubmitting(true);
    try {
      await koperasiStorage.addDeposit(tenantId, {
        uid: profile.uid,
        userName: profile.displayName || profile.email.split('@')[0],
        amount,
        note
      });
      dispatcher.emit('AUDIT_LOG', `Member ${profile.displayName} deposited Rp ${amount.toLocaleString()}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyLoan = async (amount: number, tenorMonths: number, purpose: string, guarantorName: string) => {
    if (!tenantId || !profile) return;
    setSubmitting(true);
    try {
      const monthlyInstallment = Math.round(amount / tenorMonths);
      await koperasiStorage.addLoanApplication(tenantId, {
        uid: profile.uid,
        borrowerName: profile.displayName || profile.email.split('@')[0],
        amount,
        tenorMonths,
        purpose,
        guarantorName,
        monthlyInstallment
      });
      dispatcher.emit('AUDIT_LOG', `Member ${profile.displayName} applied for loan Rp ${amount.toLocaleString()}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateLoanStatus = async (loanId: string, status: 'approved' | 'rejected') => {
    if (!profile) return;
    const adminName = profile.displayName || profile.email;
    await koperasiStorage.updateLoanStatus(loanId, status, adminName);
    dispatcher.emit('AUDIT_LOG', `Loan ${loanId} ${status} by ${adminName}`);
  };

  return {
    records,
    loans,
    loading,
    submitting,
    userDeposits,
    totalKoperasiPool,
    handleDeposit,
    handleApplyLoan,
    handleUpdateLoanStatus
  };
}
