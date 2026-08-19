import { LogOut, User as UserIcon, ShieldCheck, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Badge } from '../atoms/Badge';
import { isAdmin, getRoleLabel } from '../../lib/permissions';

export const SmartHeader = () => {
  const { profile, tenant } = useAuth();

  return (
    <header className="px-2.5 py-2.5 border-b border-slate-200 bg-white/90 backdrop-blur-md relative overflow-hidden animate-in fade-in duration-300 shadow-xs">
      {/* Top accent glowing line */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />
      
      <div className="flex items-center justify-between gap-2 relative z-10">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-center overflow-hidden shrink-0 shadow-xs relative">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5" />
            {tenant?.logoUrl ? (
              <img src={tenant.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Building2 className="text-cyan-600 relative z-10" size={16} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <span className="text-[8px] font-mono font-bold text-cyan-600 uppercase tracking-wider leading-none bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200/50">
                ONLINE
              </span>
            </div>
            <h1 className="text-sm font-black text-slate-900 tracking-tight leading-tight mt-0.5 truncate">
              {tenant?.name || 'SinergiKita'}
            </h1>
            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
              <Badge 
                icon={isAdmin(profile) || profile?.role === 'superadmin' ? ShieldCheck : UserIcon} 
                label={getRoleLabel(profile?.role || 'member')} 
                variant={isAdmin(profile) || profile?.role === 'superadmin' ? 'orange' : 'blue'}
              />
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => signOut(auth)}
          className="min-h-[44px] min-w-[44px] bg-white border border-slate-200 hover:border-rose-300 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50/50 transition-all shadow-xs cursor-pointer group shrink-0"
          title="Sign Out"
        >
          <LogOut size={16} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </header>
  );
};
