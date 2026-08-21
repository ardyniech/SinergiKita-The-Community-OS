import { LogOut, User as UserIcon, ShieldCheck, Building2, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Badge } from '../atoms/Badge';
import { isAdmin, getRoleLabel } from '../../lib/permissions';
import { getCommunityLabel } from '../../lib/terminology';

export const SmartHeader = () => {
  const { profile, tenant } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const userName = profile?.displayName || profile?.email?.split('@')[0] || 'Warga';

  return (
    <header className="sticky top-0 z-40 pt-[env(safe-area-inset-top,8px)] px-3 py-2">
      <div className="liquid-glass rounded-2xl p-2.5 flex items-center justify-between gap-2 shadow-3d-lg border-white/40">
        {/* Left: Community & Greeting */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 via-blue-600 to-indigo-800 rounded-xl p-0.5 shadow-3d-sm shrink-0 flex items-center justify-center relative group">
            <div className="absolute inset-0 bg-white/20 rounded-xl animate-pulse group-hover:opacity-0 transition-opacity" />
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center overflow-hidden shadow-inner">
              {tenant?.logoUrl ? (
                <img src={tenant.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Building2 className="text-blue-600" size={20} />
              )}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] flex items-center gap-1 opacity-70">
                <Sparkles size={11} className="text-amber-500 shrink-0" />
                {getGreeting()}
              </span>
            </div>
            <h1 className="text-[15px] font-black text-slate-900 tracking-tight leading-tight truncate">
              {userName}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold text-slate-600 truncate leading-none">{tenant?.name || 'SinergiKita'}</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] shrink-0" />
                  <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest leading-none">{getCommunityLabel(tenant?.type)}</span>
                </div>
              </div>
              <div className="h-6 w-[1px] bg-slate-200/50 mx-0.5 shrink-0" />
              <Badge 
                icon={isAdmin(profile) || profile?.role === 'superadmin' ? ShieldCheck : UserIcon} 
                label={getRoleLabel(profile?.role || 'member')} 
                variant={isAdmin(profile) || profile?.role === 'superadmin' ? 'orange' : 'blue'}
                className="scale-90 origin-left"
              />
            </div>
          </div>
        </div>

        {/* Right: Logout Action */}
        <button 
          onClick={() => signOut(auth)}
          className="btn-3d w-10 h-10 bg-white/80 hover:bg-rose-50 hover:text-rose-600 border border-white/60 rounded-xl flex items-center justify-center text-slate-500 transition-all cursor-pointer shrink-0 active:translate-y-0.5"
          title="Keluar"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

