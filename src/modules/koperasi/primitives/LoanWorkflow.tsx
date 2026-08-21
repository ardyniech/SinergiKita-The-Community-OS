import React, { useState } from 'react';
import { Plus, AlertCircle, HandCoins } from 'lucide-react';
import { KoperasiLoan } from '../../../shared/models';
import { LoanApplicationForm } from './LoanApplicationForm';
import { LoanCardItem } from './LoanCardItem';

interface LoanWorkflowProps {
  loans: KoperasiLoan[];
  isAdmin: boolean;
  submitting: boolean;
  onApply: (amount: number, tenor: number, purpose: string, guarantor: string) => Promise<void>;
  onUpdateStatus: (id: string, status: 'approved' | 'rejected') => Promise<void>;
}

export function LoanWorkflow({
  loans,
  isAdmin,
  submitting,
  onApply,
  onUpdateStatus
}: LoanWorkflowProps) {
  const [showForm, setShowForm] = useState(false);

  const handleFormApply = async (amount: number, tenor: number, purpose: string, guarantor: string) => {
    await onApply(amount, tenor, purpose, guarantor);
    setShowForm(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-xs font-bold text-slate-900">Pinjaman Modal Mandiri Warga</h3>
          <p className="text-[10px] text-slate-500">Akses permodalan gotong royong antar anggota</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
          >
            <Plus size={14} />
            <span>Ajukan Pinjaman</span>
          </button>
        )}
      </div>

      {showForm && (
        <LoanApplicationForm
          submitting={submitting}
          onApply={handleFormApply}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="space-y-2">
        {loans.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-1">
            <HandCoins className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-500">Belum ada pengajuan pinjaman aktif.</p>
            <p className="text-[10px] text-slate-400">Anggota dapat mengajukan pinjaman usaha modal mandiri.</p>
          </div>
        ) : (
          loans.map(loan => (
            <LoanCardItem
              key={loan.id}
              loan={loan}
              isAdmin={isAdmin}
              onUpdateStatus={onUpdateStatus}
            />
          ))
        )}
      </div>
    </div>
  );
}
