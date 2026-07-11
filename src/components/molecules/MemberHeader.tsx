import { Users, UserPlus, ChartBar } from 'lucide-react';
import { MemberBulkActions } from './MemberBulkActions';
import { AppUser, AppProfile } from '../../types';

interface MemberHeaderProps {
  members: AppUser[];
  profile: AppProfile | null;
  showRegister: boolean;
  setShowRegister: (val: boolean) => void;
  showAnalytics: boolean;
  setShowAnalytics: (val: boolean) => void;
}

export function MemberHeader({ 
  members, 
  profile, 
  showRegister, 
  setShowRegister, 
  showAnalytics, 
  setShowAnalytics 
}: MemberHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
          <Users size={18} />
        </div>
        <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest truncate">Direktori Warga</h2>
      </div>
      
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <MemberBulkActions members={members} />
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowRegister(!showRegister)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              showRegister ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white text-blue-600 border border-blue-100 hover:bg-blue-50'
            }`}
          >
            <UserPlus size={14} />
            {showRegister ? 'Batal' : 'Daftar Baru'}
          </button>
          <button 
            onClick={() => setShowAnalytics(!showAnalytics)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              showAnalytics ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
            }`}
          >
            <ChartBar size={14} />
            {showAnalytics ? 'Tutup Analitik' : 'Analitik'}
          </button>
        </div>
      </div>
    </div>
  );
}
