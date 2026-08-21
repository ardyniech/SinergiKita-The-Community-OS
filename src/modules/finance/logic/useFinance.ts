import { useState, useEffect } from 'react';
import { Transaction, DuesBilling, DuesPayment } from '../../../shared/models';
import { financeStorage } from '../storage/financeStorage';
import { duesStorage } from '../storage/duesStorage';
import { dispatcher } from '../../../core/dispatcher';

export function useFinance(tenantId: string | null, userId?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [billings, setBillings] = useState<DuesBilling[]>([]);
  const [payments, setPayments] = useState<DuesPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubTx = financeStorage.subscribeToTransactions(tenantId, (data) => {
      setTransactions(data);
      setLoading(false);
    });
    const unsubDues = duesStorage.subscribeToDuesBillings(tenantId, (data) => {
      setBillings(data);
    });
    const unsubPay = duesStorage.subscribeToDuesPayments(tenantId, (data) => {
      setPayments(data);
    });

    return () => {
      unsubTx();
      unsubDues();
      unsubPay();
    };
  }, [tenantId]);

  const totalIncome = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const systemBalance = totalIncome - totalExpense;

  const recordTransaction = async (data: Partial<Transaction>) => {
    if (!tenantId) return;
    await financeStorage.addTransaction(tenantId, data);
    dispatcher.emit('AUDIT_LOG', `Catat mutasi kas: ${data.description}`);
  };

  const createDuesBilling = async (data: Omit<DuesBilling, 'id' | 'createdAt' | 'tenantId'>) => {
    if (!tenantId) return;
    await duesStorage.addDuesBilling(tenantId, { ...data, tenantId });
    dispatcher.emit('AUDIT_LOG', `Buat tagihan iuran: ${data.title}`);
  };

  const submitPayment = async (data: Omit<DuesPayment, 'id' | 'paidAt' | 'status' | 'tenantId'>) => {
    if (!tenantId) return;
    await duesStorage.submitDuesPayment(tenantId, { ...data, tenantId });
    dispatcher.emit('AUDIT_LOG', `Kirim konfirmasi bayar iuran: ${data.duesTitle}`);
  };

  const verifyPayment = async (payment: DuesPayment, verifiedBy: string) => {
    if (!tenantId) return;
    await duesStorage.verifyPayment(payment.id, verifiedBy);
    // Automatically record to ledger
    await financeStorage.addTransaction(tenantId, {
      description: `[Iuran] ${payment.duesTitle || 'Iuran Warga'} - ${payment.userName}`,
      amount: payment.amount,
      type: 'credit',
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      recordedBy: verifiedBy
    });
    dispatcher.emit('AUDIT_LOG', `Verifikasi iuran ${payment.userName} untuk ${payment.duesTitle}`);
  };

  const updatePaymentInfo = async (info: { qrisImageUrl?: string; bankName?: string; bankAccountNumber?: string; bankAccountHolder?: string }) => {
    if (!tenantId) return;
    await duesStorage.updateTenantPaymentInfo(tenantId, info);
    dispatcher.emit('AUDIT_LOG', `Perbarui info QRIS & Rekening Kas Komunitas`);
  };

  return {
    transactions,
    billings,
    payments,
    loading,
    totalIncome,
    totalExpense,
    systemBalance,
    recordTransaction,
    createDuesBilling,
    submitPayment,
    verifyPayment,
    updatePaymentInfo
  };
}
