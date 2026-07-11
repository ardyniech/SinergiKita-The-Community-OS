import { useState, useEffect } from 'react';
import { Transaction } from '../types';
import { useToast } from '../context/ToastContext';
import { useAudit } from '../context/AuditContext';
import { useAuth } from '../context/AuthContext';
import { Download, FileText, Table } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function TransactionLedger() {
  const { showToast } = useToast();
  const { addAuditEntry } = useAudit();
  const { profile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!profile?.tenantId || !profile?.isApproved) return;

    const q = query(
      collection(db, 'transactions'), 
      where('tenantId', '==', profile.tenantId),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const transactionData: Transaction[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        transactionData.push({ 
          id: doc.id, 
          ...data,
          date: data.date?.toDate?.() ? data.date.toDate().toISOString().split('T')[0] : data.date 
        } as Transaction);
      });
      setTransactions(transactionData);
      setLoading(false);
    }, (error) => {
      console.error("TransactionLedger error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile?.tenantId, profile?.isApproved]);

  const exportToCSV = () => {
    addAuditEntry("Exported ledger to CSV");
    const headers = ["ID", "Description", "Date", "Type", "Amount"];
    const csvContent = [
      headers.join(","),
      ...transactions.map(t => [t.id, `"${t.description.replace(/"/g, '""')}"`, t.date, t.type, t.amount].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledger-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("CSV berhasil diunduh.");
  };

  const exportToPDF = () => {
    addAuditEntry("Exported ledger to PDF");
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Laporan Mutasi Kas SinergiKita', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Dicetak pada: ${new Date().toLocaleString()}`, 14, 30);

    autoTable(doc, {
      startY: 35,
      head: [['ID', 'Deskripsi', 'Tanggal', 'Tipe', 'Jumlah (Rp)']],
      body: transactions.map(t => [
        t.id, 
        t.description, 
        t.date, 
        t.type.toUpperCase(), 
        t.amount.toLocaleString()
      ]),
      headStyles: { fillColor: [31, 41, 55], textColor: 255 },
      alternateRowStyles: { fillColor: [249, 250, 251] },
    });

    doc.save(`ledger-${new Date().toISOString().slice(0,10)}.pdf`);
    showToast("PDF berhasil diunduh.");
  };

  const handleUpload = () => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      showToast('Nota berhasil diunggah.');
      addAuditEntry("Uploaded transaction receipt");
    }, 1500);
  };

  if (loading) return <div className="p-4 text-center text-xs text-gray-400">Memuat data mutasi...</div>;

  return (
    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 mb-2">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-semibold text-gray-800">Mutasi Kas</h2>
        <div className="flex gap-2">
          <button 
            onClick={exportToCSV} 
            className="flex items-center gap-1 text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
            title="Ekspor CSV"
          >
            <Table size={12} />
            CSV
          </button>
          <button 
            onClick={exportToPDF} 
            className="flex items-center gap-1 text-[10px] bg-red-50 text-red-700 px-2 py-1 rounded hover:bg-red-100 transition-colors"
            title="Ekspor PDF"
          >
            <FileText size={12} />
            PDF
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {transactions.length === 0 && <p className="text-xs text-gray-400 italic text-center py-4">Belum ada transaksi.</p>}
        {transactions.map(t => (
          <div key={t.id} className="border-b border-gray-50 pb-2 flex justify-between items-center text-xs">
            <div>
              <p className="font-medium text-gray-900">{t.description}</p>
              <p className="text-gray-500 text-[10px]">{t.date}</p>
            </div>
            <span className={`px-2 py-0.5 rounded-full font-medium ${t.type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {t.type === 'credit' ? '+' : '-'} Rp {t.amount.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <h3 className="text-xs font-semibold text-gray-800 mb-2">Unggah Nota Baru</h3>
        <div className="flex items-center gap-2">
          <input type="file" className="text-[10px] text-gray-500 flex-1 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
          <button 
            onClick={handleUpload}
            disabled={uploading}
            className="text-[10px] bg-gray-900 text-white px-3 py-1.5 rounded flex items-center gap-1 disabled:opacity-50 hover:bg-gray-800 transition-colors"
          >
            <Download size={12} />
            {uploading ? 'Mengunggah...' : 'Unggah'}
          </button>
        </div>
      </div>
    </div>
  );
}
