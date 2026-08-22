import React from 'react';
import { ShieldCheck, ShieldAlert, Check, X, Phone, User } from 'lucide-react';
import { AppUser } from '../../../shared/models';

interface RiderVerificationCardProps {
  member: AppUser;
  onVerify: (memberId: string, status: boolean) => void;
}

export const RiderVerificationCard: React.FC<RiderVerificationCardProps> = ({ member, onVerify }) => {
  const isVerified = (member as any).isVerifiedRider || member.isApproved;

  return (
    <div className="p-3 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
            {member.displayName?.charAt(0) || <User size={14} />}
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">{member.displayName || member.email?.split('@')[0]}</h4>
            <span className="text-[10px] text-slate-400 block">{member.role?.toUpperCase() || 'DRIVER'}</span>
          </div>
        </div>

        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
          isVerified
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-amber-50 text-amber-700 border-amber-200'
        }`}>
          {isVerified ? <ShieldCheck size={10} /> : <ShieldAlert size={10} />}
          <span>{isVerified ? 'TERVERIFIKASI' : 'BELUM VERIFIKASI'}</span>
        </span>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-600">
        <div className="flex items-center gap-1">
          <Phone size={12} className="text-slate-400" />
          <span>{member.phoneNumber || 'Tanpa no. telepon'}</span>
        </div>

        <div className="flex gap-1.5">
          {!isVerified ? (
            <button
              onClick={() => onVerify(member.id || member.uid, true)}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-colors flex items-center gap-1"
            >
              <Check size={12} />
              <span>Verifikasi Driver</span>
            </button>
          ) : (
            <button
              onClick={() => onVerify(member.id || member.uid, false)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold transition-colors flex items-center gap-1"
            >
              <X size={12} />
              <span>Batalkan</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
