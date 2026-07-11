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
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
    <div className="bg-white p-10 rounded-[40px] shadow-xl border border-gray-100 text-center max-w-md w-full animate-in zoom-in-95 duration-500">
      {loadingIcon && (
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 relative">
          <Loader2 size={40} className="animate-spin" />
        </div>
      )}
      <h2 className="text-2xl font-black text-gray-900 tracking-tight">{title}</h2>
      <p className="text-sm text-gray-500 mt-4 leading-relaxed">{description}</p>
      {tenantId && (
        <div className="mt-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">ID Komunitas</p>
          <p className="text-lg font-mono font-black text-blue-600 select-all">{tenantId}</p>
        </div>
      )}
      <Button variant="ghost" onClick={() => signOut(auth)} className="mt-8 mx-auto">
        Keluar & Gunakan Akun Lain
      </Button>
    </div>
  </div>
);
