import { Users, UserPlus, ChartBar, ShieldCheck } from 'lucide-react';
import { MemberBulkActions } from './MemberBulkActions';
import { AppUser, AppProfile } from '../../types';
import { CSVExportButton } from '../../shared/atoms/CSVExportButton';
import { getMemberLabel } from '../../lib/terminology';
import { useAuth } from '../../context/AuthContext';

interface MemberHeaderProps {
  members: AppUser[];
  profile: AppProfile | null;
  showRegister: boolean;
  setShowRegister: (val: boolean) => void;
  showAnalytics: boolean;
  setShowAnalytics: (val: boolean) => void;
  showPermissions?: boolean;
  setShowPermissions?: (val: boolean) => void;
}

export function MemberHeader({ 
  members, 
  profile, 
  showRegister, 
  setShowRegister, 
  showAnalytics, 
  setShowAnalytics,
  showPermissions = false,
  setShowPermissions
}: MemberHeaderProps) {
  const { tenant } = useAuth();
  const memberLabel = getMemberLabel(tenant?.type);

  const exportColumns = [
    { key: 'displayName', label: 'Nama Lengkap' },
    { key: 'email', label: 'Email' },
    { key: 'phoneNumber', label: 'No. Handphone' },
    { key: 'role', label: 'Peran' },
    { key: 'status', label: 'Status' },
    { key: 'isApproved', label: 'Disetujui' }
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 liquid-glass p-4 rounded-3xl border-white/60 shadow-3d-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-3d-sm border border-white/20">
            <Users size={20} />
          </div>
          <div>
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-tight leading-tight">Registry {memberLabel}</h2>
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest opacity-70">Identity Database Management</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2.5">
          <MemberBulkActions members={members} />
          <CSVExportButton 
            data={members} 
            filename={`data-${memberLabel.toLowerCase()}`} 
            columns={exportColumns}
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        <button 
          onClick={() => setShowRegister(!showRegister)}
          className={`btn-3d flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
            showRegister ? 'bg-rose-500 text-white border-rose-400' : 'bg-white/60 text-blue-600 border-white/80 hover:bg-white'
          }`}
        >
          <UserPlus size={16} />
          {showRegister ? 'Cancel' : 'Add New'}
        </button>
        
        {setShowPermissions && (
          <button 
            onClick={() => setShowPermissions(!showPermissions)}
            className={`btn-3d flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              showPermissions ? 'bg-rose-500 text-white border-rose-400' : 'bg-white/60 text-indigo-600 border-white/80 hover:bg-white'
            }`}
          >
            <ShieldCheck size={16} />
            {showPermissions ? 'Cancel' : 'Permissions'}
          </button>
        )}

        <button 
          onClick={() => setShowAnalytics(!showAnalytics)}
          className={`btn-3d flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
            showAnalytics ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white/60 text-slate-600 border-white/80 hover:bg-white'
          }`}
        >
          <ChartBar size={16} />
          {showAnalytics ? 'Close' : 'Analytics'}
        </button>
      </div>
    </div>
  );
}
