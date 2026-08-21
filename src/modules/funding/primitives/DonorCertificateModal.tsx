import React from 'react';
import { Award, Share2, Download, X, CheckCircle2 } from 'lucide-react';
import { generateCertificateData } from '../logic/fundingUtils';

interface DonorCertificateModalProps {
  contributorName: string;
  projectTitle: string;
  amount: number;
  tenantName: string;
  onClose: () => void;
}

export function DonorCertificateModal({
  contributorName,
  projectTitle,
  amount,
  tenantName,
  onClose
}: DonorCertificateModalProps) {
  const dateStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const cert = generateCertificateData({
    contributorName,
    projectTitle,
    amount,
    tenantName,
    dateStr
  });

  const handleShare = () => {
    const text = `🏆 *PIAGAM APRESIASI GOTONG ROYONG*\nNo: ${cert.certId}\nTerima kasih kepada *${cert.contributorName}* atas donasi *${cert.amountStr}* untuk *${cert.projectTitle}* di lingkungan ${cert.tenantName}.\nMari dukung bersama!`;
    navigator.clipboard.writeText(text);
    alert('Teks piagam berhasil disalin!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-sm bg-white rounded-2xl p-4 shadow-2xl border border-amber-200/80 space-y-3 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-amber-100 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <div className="flex items-center gap-1.5 text-amber-700">
            <Award size={16} />
            <span className="text-xs font-bold">Sertifikat Donatur Digital</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>

        <div className="bg-gradient-to-b from-amber-50/50 via-white to-amber-50/30 border-2 border-amber-300/80 rounded-xl p-3.5 text-center space-y-2 relative">
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto border border-amber-200 shadow-xs">
            <Award size={22} />
          </div>

          <div>
            <h4 className="text-[11px] font-black text-amber-900 tracking-wider uppercase">{cert.title}</h4>
            <p className="text-[9px] text-slate-500 mt-0.5">{cert.subtitle}</p>
          </div>

          <div className="py-1">
            <p className="text-sm font-black text-slate-900">{cert.contributorName}</p>
            <p className="text-xs font-bold text-emerald-700">{cert.amountStr}</p>
          </div>

          <p className="text-[10px] text-slate-600 font-medium">
            Atas partisipasinya dalam proyek <span className="font-bold text-slate-800">"{cert.projectTitle}"</span>
          </p>

          <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-[9px] text-slate-400">
            <span>{cert.tenantName}</span>
            <span>{cert.dateStr}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => window.print()}
            className="w-full h-8.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download size={13} />
            <span>Cetak / PDF</span>
          </button>
          <button
            onClick={handleShare}
            className="w-full h-8.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <Share2 size={13} />
            <span>Bagikan WA</span>
          </button>
        </div>
      </div>
    </div>
  );
}
