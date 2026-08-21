import React from 'react';
import { Loader2 } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Button } from '../atoms/Button';

interface StatusScreenProps {
  title: string;
  description: string;
  tenantId?: string | null;
  loadingIcon?: boolean;
}

export const StatusScreen = ({ title, description, tenantId, loadingIcon = true }: StatusScreenProps) => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 text-center max-w-sm w-full animate-in zoom-in-95 duration-300">
      {loadingIcon && (
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 relative shadow-inner">
          <Loader2 size={32} className="animate-spin" />
        </div>
      )}
      <h2 className="text-lg font-black text-slate-900 tracking-tight">{title}</h2>
      <p className="text-xs text-slate-600 mt-2.5 leading-relaxed font-medium">{description}</p>
      {tenantId && (
        <div className="mt-5 p-3.5 bg-blue-50/60 rounded-xl border border-blue-100/80">
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Kode ID Komunitas Anda</p>
          <p className="text-base font-mono font-black text-slate-900 select-all tracking-wider">{tenantId}</p>
        </div>
      )}
      <Button variant="ghost" onClick={() => signOut(auth)} className="mt-6 mx-auto text-xs font-bold text-slate-500 hover:text-slate-800">
        Keluar & Gunakan Akun Lain
      </Button>
    </div>
  </div>
);
