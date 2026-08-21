import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FinanceRecord } from './types';

export function exportFinancePDF(records: FinanceRecord[]) {
  const docPdf = new jsPDF();
  docPdf.text('Laporan Buku Kas Komunitas', 14, 15);
  autoTable(docPdf, {
    startY: 20,
    head: [['Tanggal', 'Kategori', 'Keterangan', 'Tipe', 'Nominal']],
    body: records.map(r => [
      r.date?.slice(0, 10),
      r.category,
      r.description,
      r.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      `Rp ${Number(r.amount).toLocaleString('id-ID')}`
    ])
  });
  docPdf.save('Laporan-Kas-SinergiKita.pdf');
}
