import React from 'react';
import { FileText, Clock, User, Home, CheckCircle2, XCircle, Eye, Share2 } from 'lucide-react';
import { LetterRequest } from '../../../shared/models/letters';
import { formatLetterType, getLetterStatusBadge, generateLetterWhatsAppMessage } from '../logic/letterUtils';

interface LetterCardProps {
  letter: LetterRequest;
  tenantName: string;
  isAdmin: boolean;
  onPreview: (letter: LetterRequest) => void;
  onApprove?: (letter: LetterRequest) => void;
  onReject?: (letter: LetterRequest) => void;
}

export const LetterCard: React.FC<LetterCardProps> = ({
  letter,
  tenantName,
  isAdmin,
  onPreview,
  onApprove,
  onReject
}) => {
  const badge = getLetterStatusBadge(letter.status);

  const handleShareWA = () => {
    const text = generateLetterWhatsAppMessage({
      tenantName,
      citizenName: letter.citizenName,
      letterType: letter.letterType,
      purpose: letter.purpose,
      houseNumber: letter.houseNumber
    });
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="text-[10px] font-medium text-slate-400">
            {letter.letterNumber ? `No: ${letter.letterNumber}` : 'Pengajuan Baru'}
          </span>
          <h3 className="text-xs font-bold text-slate-900 truncate">
            {formatLetterType(letter.letterType)}
          </h3>
        </div>
        <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md border ${badge.color} shrink-0`}>
          {badge.label}
        </span>
      </div>

      <div className="p-2 bg-slate-50 rounded-lg space-y-1 text-[11px] text-slate-600">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-slate-500 font-medium">
            <User size={12} /> {letter.citizenName}
          </span>
          <span className="flex items-center gap-1 text-slate-500">
            <Home size={12} /> No. {letter.houseNumber}
          </span>
        </div>
        <div className="text-slate-700">
          <span className="text-slate-400">Keperluan: </span>
          <span className="font-medium">{letter.purpose}</span>
        </div>
        {letter.notes && (
          <div className="text-rose-600 text-[10px]">
            <span>Catatan: {letter.notes}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-1 gap-2">
        <button
          onClick={handleShareWA}
          className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md"
        >
          <Share2 size={11} />
          <span>Kirim WA</span>
        </button>

        <div className="flex items-center gap-1.5">
          {letter.status === 'approved' && (
            <button
              onClick={() => onPreview(letter)}
              className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-md text-[10px] font-bold"
            >
              <Eye size={12} />
              <span>Lihat Surat</span>
            </button>
          )}

          {isAdmin && letter.status === 'submitted' && (
            <>
              {onReject && (
                <button
                  onClick={() => onReject(letter)}
                  className="p-1 text-rose-600 hover:bg-rose-50 rounded-md"
                  title="Tolak"
                >
                  <XCircle size={16} />
                </button>
              )}
              {onApprove && (
                <button
                  onClick={() => onApprove(letter)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[10px] font-bold"
                >
                  <CheckCircle2 size={12} />
                  <span>Terbitkan</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
