import React from 'react';
import { X, Printer, QrCode } from 'lucide-react';
import { LetterRequest } from '../../../shared/models/letters';
import { formatLetterType } from '../logic/letterUtils';

interface LetterPreviewModalProps {
  letter: LetterRequest;
  tenantName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const LetterPreviewModal: React.FC<LetterPreviewModalProps> = ({
  letter,
  tenantName,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const verifyUrl = `https://sinergikita.id/verify/${letter.id}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-3">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <h3 className="text-xs font-bold text-slate-900">Salinan Surat Digital Resmi</h3>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-[10px] font-bold"
            >
              <Printer size={12} />
              <span>Cetak</span>
            </button>
            <button onClick={onClose} className="p-1 text-slate-400 hover:bg-slate-200 rounded-full">
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto space-y-3 font-serif text-slate-900 text-[11px] leading-relaxed">
          {/* Header Surat */}
          <div className="text-center border-b-2 border-slate-900 pb-2 space-y-0.5">
            <h2 className="text-xs font-bold uppercase tracking-wider font-sans">{tenantName}</h2>
            <p className="text-[10px] text-slate-600 font-sans">PENGURUS LINGKUNGAN RT / RW</p>
            <p className="text-[9px] text-slate-400 font-sans">Sistem Administrasi Digital SinergiKita</p>
          </div>

          <div className="text-center space-y-0.5 pt-1">
            <h3 className="text-xs font-bold uppercase underline font-sans">
              {formatLetterType(letter.letterType)}
            </h3>
            <p className="text-[10px] font-mono text-slate-600">Nomor: {letter.letterNumber || '-'}</p>
          </div>

          <p>
            Yang bertanda tangan di bawah ini Pengurus Lingkungan menerangkan dengan sebenarnya bahwa:
          </p>

          <div className="space-y-1 pl-3 font-sans text-[11px]">
            <div className="grid grid-cols-3">
              <span className="text-slate-500">Nama Lengkap</span>
              <span className="col-span-2 font-bold">: {letter.citizenName}</span>
            </div>
            <div className="grid grid-cols-3">
              <span className="text-slate-500">NIK</span>
              <span className="col-span-2 font-mono">: {letter.nik}</span>
            </div>
            <div className="grid grid-cols-3">
              <span className="text-slate-500">Alamat / No. Rumah</span>
              <span className="col-span-2">: Blok / No. {letter.houseNumber}</span>
            </div>
          </div>

          <p>
            Adalah benar warga bertempat tinggal di lingkungan kami dan surat keterangan ini dibuat untuk keperluan:
          </p>

          <div className="p-2 bg-slate-50 border border-slate-200 rounded text-center font-sans font-medium text-slate-800 text-[11px]">
            &ldquo;{letter.purpose}&rdquo;
          </div>

          <p>
            Demikian surat keterangan ini kami berikan untuk dapat dipergunakan sebagaimana mestinya.
          </p>

          {/* Tanda Tangan & QR Verifikasi */}
          <div className="pt-3 flex items-end justify-between font-sans">
            <div className="space-y-1 text-center">
              <div className="p-1.5 bg-slate-50 border border-slate-200 rounded inline-block">
                <QrCode size={48} className="text-slate-800" />
              </div>
              <p className="text-[8px] text-slate-400">Verifikasi Digital</p>
            </div>

            <div className="text-center space-y-8">
              <div>
                <p className="text-[10px] text-slate-500">Diterbitkan oleh,</p>
                <p className="text-[10px] font-bold text-slate-800">{letter.signerRole || 'Pengurus RT'}</p>
              </div>
              <div className="border-t border-slate-400 pt-0.5">
                <p className="text-[10px] font-bold underline text-slate-900">
                  {letter.signerName || 'Pengurus'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
