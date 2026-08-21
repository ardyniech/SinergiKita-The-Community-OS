import React from 'react';
import { Package, Plus, ClipboardList, Clock } from 'lucide-react';

interface InventoryHeaderProps {
  onAddItem: () => void;
  activeTab: 'catalog' | 'my-loans' | 'admin-loans';
  setActiveTab: (tab: 'catalog' | 'my-loans' | 'admin-loans') => void;
  isAdmin: boolean;
  activeLoansCount: number;
}

export function InventoryHeader({
  onAddItem,
  activeTab,
  setActiveTab,
  isAdmin,
  activeLoansCount
}: InventoryHeaderProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
            <Package size={18} />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900">Inventaris & Logistik RT</h2>
            <p className="text-[10px] text-slate-400">Peminjaman alat & perlengkapan bersama</p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={onAddItem}
            className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
          >
            <Plus size={14} />
            <span>Tambah Aset</span>
          </button>
        )}
      </div>

      <div className={`grid gap-1 p-1 bg-slate-100/80 rounded-xl ${isAdmin ? 'grid-cols-3' : 'grid-cols-2'}`}>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'catalog' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package size={13} className={activeTab === 'catalog' ? 'text-teal-600' : 'text-slate-400'} />
          <span>Katalog</span>
        </button>

        <button
          onClick={() => setActiveTab('my-loans')}
          className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'my-loans' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock size={13} className={activeTab === 'my-loans' ? 'text-teal-600' : 'text-slate-400'} />
          <span>Pinjaman Saya</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveTab('admin-loans')}
            className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'admin-loans' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ClipboardList size={13} className={activeTab === 'admin-loans' ? 'text-teal-600' : 'text-slate-400'} />
            <span>Kelola ({activeLoansCount})</span>
          </button>
        )}
      </div>
    </div>
  );
}
