import { useState, useEffect } from 'react';
import { InventoryItem, InventoryLoan, AppUser } from '../../../shared/models';
import { inventoryStorage } from '../storage/inventoryStorage';
import { dispatcher } from '../../../core/dispatcher';

export function useInventory(tenantId: string | null, profile: AppUser | null) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loans, setLoans] = useState<InventoryLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!tenantId) {
      setLoading(false);
      return;
    }
    const unsubItems = inventoryStorage.subscribeToItems(tenantId, (data) => {
      setItems(data);
      setLoading(false);
    });

    const unsubLoans = inventoryStorage.subscribeToLoans(tenantId, (data) => {
      setLoans(data);
    });

    return () => {
      unsubItems();
      unsubLoans();
    };
  }, [tenantId]);

  const handleAddItem = async (data: Partial<InventoryItem>) => {
    if (!tenantId || !profile) return;
    setSubmitting(true);
    try {
      await inventoryStorage.createItem(tenantId, data);
      dispatcher.emit('AUDIT_LOG', `Barang Ditambahkan: ${data.name}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestLoan = async (data: {
    itemId: string;
    itemName: string;
    quantity: number;
    startDate: string;
    endDate: string;
    purpose: string;
  }) => {
    if (!tenantId || !profile) return;
    setSubmitting(true);
    try {
      await inventoryStorage.requestLoan(tenantId, {
        ...data,
        borrowerId: profile.uid,
        borrowerName: profile.displayName || profile.email.split('@')[0],
        borrowerPhone: profile.phone || '',
        borrowerHouseNo: profile.houseNumber || ''
      });
      dispatcher.emit('AUDIT_LOG', `Peminjaman Diajukan: ${data.itemName} (${data.quantity} unit)`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateLoanStatus = async (loan: InventoryLoan, newStatus: InventoryLoan['status']) => {
    setSubmitting(true);
    try {
      await inventoryStorage.updateLoanStatus(loan.id, loan.itemId, newStatus, loan.quantity);
      dispatcher.emit('AUDIT_LOG', `Status Pinjaman Diubah: ${loan.itemName} -> ${newStatus}`);
    } finally {
      setSubmitting(false);
    }
  };

  const myLoans = loans.filter(l => l.borrowerId === profile?.uid);

  return {
    items,
    loans,
    myLoans,
    loading,
    submitting,
    handleAddItem,
    handleRequestLoan,
    handleUpdateLoanStatus
  };
}
