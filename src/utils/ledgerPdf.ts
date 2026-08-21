import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction } from '../types';

export function exportLedgerToPDF(transactions: Transaction[], tenantId?: string, systemBalance: number = 0) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text('Laporan Pertanggungjawaban Mutasi Kas SinergiKita', 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Komunitas Tenant ID: ${tenantId || 'N/A'}`, 14, 30);
  doc.text(`Total Saldo Kas: Rp ${systemBalance.toLocaleString()}`, 14, 36);
  doc.text(`Dicetak pada: ${new Date().toLocaleString()}`, 14, 42);

  autoTable(doc, {
    startY: 48,
    head: [['ID', 'Deskripsi', 'Tanggal', 'Tipe', 'Jumlah (Rp)']],
    body: transactions.map(t => [t.id, t.description, t.date, t.type.toUpperCase(), t.amount.toLocaleString()]),
    headStyles: { fillColor: [79, 70, 229], textColor: 255 },
    alternateRowStyles: { fillColor: [249, 250, 251] },
  });

  doc.save(`ledger-${new Date().toISOString().slice(0, 10)}.pdf`);
}
