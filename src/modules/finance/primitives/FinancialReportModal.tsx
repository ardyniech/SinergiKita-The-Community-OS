import React, { useState, useMemo } from 'react';
import { X, FileText, Share2, Printer, Check, TrendingUp, TrendingDown } from 'lucide-react';
import { Transaction, Tenant } from '../../../shared/models';
import { aggregateByCategory, generateMonthlyReportText } from '../logic/reportUtils';

interface FinancialReportModalProps {
  tenant: Tenant | null;
  transactions: Transaction[];
  totalIncome: number;
  totalExpense: number;
  balance: number;
  onClose: () => void;
}

export function FinancialReportModal({
  tenant,
  transactions,
  totalIncome,
  totalExpense,
  balance,
  onClose
}: FinancialReportModalProps) {
  const [copied, setCopied] = useState(false);
  const currentMonth = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const expenseBreakdown = useMemo(() => aggregateByCategory(transactions, 'debit'), [transactions]);
  const incomeBreakdown = useMemo(() => aggregateByCategory(transactions, 'credit'), [transactions]);

  const reportText = useMemo(() => generateMonthlyReportText({
    tenantName: tenant?.name || 'Komunitas SinergiKita',
    period: currentMonth,
    totalIncome,
    totalExpense,
    balance,
    topExpenses: expenseBreakdown
  }), [tenant, currentMonth, totalIncome, totalExpense, balance, expenseBreakdown]);

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-sm w-full p-4 shadow-xl border border-slate-200 space-y-3 print:m-0 print:p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 print:hidden">
          <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
            <FileText size={15} className="text-blue-600" />
            <span>Rekap Laporan Kas Bulanan</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X size={16} />
          </button>
        </div>

        {/* Printable Section */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-2.5 text-xs">
          <div className="text-center pb-2 border-b border-slate-200">
            <h3 className="font-black text-slate-900 text-sm">{tenant?.name || 'Buku Kas Komunitas'}</h3>
            <p className="text-[11px] font-semibold text-blue-600">Periode: {currentMonth}</p>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-center bg-white p-2 rounded-lg border border-slate-100">
            <div>
              <p className="text-[9px] text-slate-400">Masuk</p>
              <p className="text-[11px] font-black text-emerald-600 truncate">Rp {totalIncome.toLocaleString('id-ID')}</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-400">Keluar</p>
              <p className="text-[11px] font-black text-rose-600 truncate">Rp {totalExpense.toLocaleString('id-ID')}</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-400">Saldo</p>
              <p className="text-[11px] font-black text-slate-900 truncate">Rp {balance.toLocaleString('id-ID')}</p>
            </div>
          </div>

          {/* Breakdown */}
          {expenseBreakdown.length > 0 && (
            <div className="space-y-1 pt-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Pos Pengeluaran Terbesar:</p>
              <div className="space-y-1">
                {expenseBreakdown.slice(0, 3).map((item) => (
                  <div key={item.category} className="flex justify-between text-[11px] text-slate-700">
                    <span className="truncate">{item.category} ({item.percentage}%)</span>
                    <span className="font-semibold shrink-0">Rp {item.amount.toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1 print:hidden">
          <button
            onClick={handleCopy}
            className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
            <span>{copied ? 'Tersalin!' : 'Bagikan WA'}</span>
          </button>
          <button
            onClick={() => window.print()}
            className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <Printer size={14} />
            <span>Cetak Rekap</span>
          </button>
        </div>
      </div>
    </div>
  );
}
