import React from 'react';
import { X, Award, Download, ShieldCheck, HeartHandshake } from 'lucide-react';
import jsPDF from 'jspdf';
import { FundingContribution } from '../../types';
import { useToast } from '../../context/ToastContext';

interface FundingCertificateModalProps {
  contribution: FundingContribution;
  tenantName?: string;
  onClose: () => void;
}

export function FundingCertificateModal({ contribution, tenantName, onClose }: FundingCertificateModalProps) {
  const { showToast } = useToast();

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a5' });
      
      // Border decoration
      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(1.5);
      doc.rect(8, 8, 194, 132);
      
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(10, 10, 190, 128);

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(30, 41, 59);
      doc.text('PIAGAM PENGHARGAAN GOTONG ROYONG', 105, 28, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`Komunitas: ${tenantName || 'SinergiKita Community'}`, 105, 36, { align: 'center' });

      // Body text
      doc.setFontSize(11);
      doc.setTextColor(51, 65, 85);
      doc.text('Diberikan dengan penuh hormat dan apresiasi kepada:', 105, 52, { align: 'center' });

      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text(contribution.contributorName.toUpperCase(), 105, 64, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`Atas kontribusi dan keikutsertaan modal sosial sebesar:`, 105, 76, { align: 'center' });

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 185, 129);
      doc.text(`Rp ${contribution.amount.toLocaleString('id-ID')}`, 105, 85, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 116, 139);
      doc.text(`Untuk mendukung keberhasilan proyek warga: "${contribution.projectTitle}"`, 105, 95, { align: 'center' });

      // Signatures
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      doc.text(`Diterbitkan pada: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}`, 25, 120);
      doc.text('Tertanda, Pengurus Komunitas', 185, 120, { align: 'right' });

      doc.save(`Sertifikat_Donasi_${contribution.contributorName.replace(/\s+/g, '_')}.pdf`);
      showToast('Sertifikat penghargaan berhasil diunduh dalam format PDF!');
    } catch (e) {
      console.error("PDF error:", e);
      showToast('Gagal mengunduh sertifikat.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="text-amber-500" size={20} />
            <h3 className="text-sm font-black uppercase text-slate-800 dark:text-slate-100">
              Sertifikat Digital Donatur
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X size={18} />
          </button>
        </div>

        {/* Certificate Preview Box */}
        <div className="p-5 bg-gradient-to-b from-blue-50/60 to-white dark:from-slate-800 dark:to-slate-900 rounded-xl border-2 border-dashed border-blue-200 dark:border-blue-800 text-center space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Piagam Partisipasi Gotong Royong
          </span>
          <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100">
            {contribution.contributorName}
          </h2>
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            Kontribusi: Rp {contribution.amount.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
            Proyek: "{contribution.projectTitle}"
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Tutup
          </button>
          <button
            onClick={handleDownloadPDF}
            className="min-h-[44px] px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-black flex items-center gap-1.5 shadow-sm"
          >
            <Download size={14} /> Unduh Sertifikat (PDF)
          </button>
        </div>
      </div>
    </div>
  );
}
