import { LogOut, User as UserIcon, ShieldCheck, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Badge } from '../atoms/Badge';
import { isAdmin, getRoleLabel } from '../../lib/permissions';

export const SmartHeader = () => {
  const { profile, tenant } = useAuth();

  return (
    <header className="px-4 py-5 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-white rounded-xl shadow-lg shadow-blue-100 border border-gray-50 flex items-center justify-center overflow-hidden">
            {tenant?.logoUrl ? (
              <img src={tenant.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Building2 className="text-blue-600" size={20} />
            )}
          </div>
          <div>
            <h1 className="text-lg font-black text-gray-900 tracking-tight leading-none mb-0.5">
              {tenant?.name || 'Sinergi Kita'}
            </h1>
            <div className="flex items-center gap-1.5">
              <Badge 
                icon={isAdmin(profile) || profile?.role === 'superadmin' ? ShieldCheck : UserIcon} 
                label={getRoleLabel(profile?.role || 'member')} 
                variant={isAdmin(profile) || profile?.role === 'superadmin' ? 'orange' : 'blue'}
              />
              <span className="text-[9px] font-bold text-gray-400 truncate max-w-[120px]">
                {profile?.email}
              </span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => signOut(auth)}
          className="w-9 h-9 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-all shadow-sm"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
};
