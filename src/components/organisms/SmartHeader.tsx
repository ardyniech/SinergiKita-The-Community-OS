import { LogOut, User as UserIcon, ShieldCheck, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Badge } from '../atoms/Badge';
import { isAdmin, getRoleLabel } from '../../lib/permissions';

export const SmartHeader = () => {
  const { profile, tenant } = useAuth();

  return (
    <header className="px-3 py-3 border-b border-slate-200 bg-white/80 backdrop-blur-md relative overflow-hidden animate-in fade-in duration-300 shadow-sm">
      {/* Top accent glowing line */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />
      
      <div className="flex items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-center overflow-hidden shrink-0 shadow-xs relative">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5" />
            {tenant?.logoUrl ? (
              <img src={tenant.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Building2 className="text-cyan-600 relative z-10" size={18} />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono font-bold text-cyan-600 uppercase tracking-widest leading-none bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200/50">
                SYSTEM OPERATIONAL
              </span>
            </div>
            <h1 className="text-base font-black text-slate-900 tracking-tight leading-none mt-1 truncate">
              {tenant?.name || 'Sinergi Kita'}
            </h1>
            <div className="flex items-center gap-1.5 mt-1">
              <Badge 
                icon={isAdmin(profile) || profile?.role === 'superadmin' ? ShieldCheck : UserIcon} 
                label={getRoleLabel(profile?.role || 'member')} 
                variant={isAdmin(profile) || profile?.role === 'superadmin' ? 'orange' : 'blue'}
              />
              <span className="text-[9px] font-mono font-medium text-slate-400 truncate max-w-[150px] bg-slate-50 px-1 py-0.2 rounded border border-slate-100">
                [{profile?.email}]
              </span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => signOut(auth)}
          className="w-8 h-8 bg-white border border-slate-200 hover:border-rose-300 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50/50 transition-all shadow-xs cursor-pointer group"
          title="Sign Out"
        >
          <LogOut size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </header>
  );
};
