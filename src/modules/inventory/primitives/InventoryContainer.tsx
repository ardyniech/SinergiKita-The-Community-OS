import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useInventory } from '../logic/useInventory';
import { InventoryHeader } from './InventoryHeader';
import { InventoryCard } from './InventoryCard';
import { ItemFormModal } from './ItemFormModal';
import { BorrowRequestModal } from './BorrowRequestModal';
import { LoanHistoryList } from './LoanHistoryList';
import { Loader2, Package } from 'lucide-react';
import { InventoryItem, InventoryLoan } from '../../../shared/models';

export const InventoryContainer: React.FC = () => {
  const { profile, tenant } = useAuth();
  const { items, loans, myLoans, loading, submitting, handleAddItem, handleRequestLoan, handleUpdateLoanStatus } = useInventory(profile?.tenantId || null, profile);

  const [activeTab, setActiveTab] = useState<'catalog' | 'my-loans' | 'admin-loans'>('catalog');
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedBorrowItem, setSelectedBorrowItem] = useState<InventoryItem | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const isAdmin = ['admin', 'ketua', 'bendahara', 'sekretaris', 'superadmin'].includes(profile?.role || '');
  const tenantName = tenant?.name || profile?.tenantName || 'Komunitas Warga';
  const pendingLoans = loans.filter(l => l.status === 'requested' || l.status === 'in_use');

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 text-teal-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {toastMsg && (
        <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-lg animate-in fade-in">
          {toastMsg}
        </div>
      )}

      <InventoryHeader
        onAddItem={() => setShowItemModal(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
        activeLoansCount={pendingLoans.length}
      />

      <div className="animate-in fade-in duration-300">
        {activeTab === 'catalog' && (
          items.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-1">
              <Package size={24} className="mx-auto text-slate-300" />
              <p className="text-xs font-semibold text-slate-500">Belum ada data barang logistik.</p>
              <p className="text-[10px] text-slate-400">Pengurus RT dapat mendaftarkan aset yang dapat dipinjam.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {items.map(item => (
                <InventoryCard key={item.id} item={item} onBorrow={setSelectedBorrowItem} />
              ))}
            </div>
          )
        )}

        {activeTab === 'my-loans' && (
          <LoanHistoryList loans={myLoans} isAdminView={false} />
        )}

        {activeTab === 'admin-loans' && isAdmin && (
          <LoanHistoryList loans={loans} isAdminView={true} onUpdateStatus={handleUpdateLoanStatus} />
        )}
      </div>

      {showItemModal && (
        <ItemFormModal
          submitting={submitting}
          onClose={() => setShowItemModal(false)}
          onSubmit={handleAddItem}
        />
      )}

      {selectedBorrowItem && (
        <BorrowRequestModal
          item={selectedBorrowItem}
          tenantName={tenantName}
          submitting={submitting}
          onClose={() => setSelectedBorrowItem(null)}
          onRequest={handleRequestLoan}
          onSuccessNotification={(msg) => {
            setToastMsg(msg);
            setTimeout(() => setToastMsg(null), 3000);
          }}
        />
      )}
    </div>
  );
};
