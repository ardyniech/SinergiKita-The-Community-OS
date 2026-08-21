import { useAuth } from '../context/AuthContext';
import NotificationCenter from './NotificationCenter';
import ProfileSettings from './ProfileSettings';
import { LogOut, User } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useState } from 'react';

export default function Header({ isOnline }: { isOnline: boolean }) {
  const { profile } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="mb-3 bg-white p-3 rounded-2xl shadow-xs border border-slate-100 flex justify-between items-center px-3.5 relative z-40">
      <div className="flex items-center gap-3">
        <img 
          src="/src/assets/images/sinergikita_logo_minimalist_1783798322236.jpg" 
          alt="SinergiKita Logo" 
          className="w-9 h-9 rounded-2xl shadow-2xs border border-slate-100 object-cover" 
          referrerPolicy="no-referrer"
        />
        <div>
          <h1 className="text-base font-black text-slate-900 tracking-tight leading-none">SinergiKita</h1>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-[10px] font-bold text-slate-500">
              {isOnline ? 'Terhubung Sistem' : 'Mode Luring'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {profile && (
          <div className="hidden sm:flex flex-col items-end mr-1.5">
            <p className="text-xs font-bold text-slate-900 leading-tight">{profile.displayName || profile.email}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {profile.tenantId && (
                <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded-md font-mono font-bold border border-blue-100/60">
                  ID: {profile.tenantId}
                </span>
              )}
              <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">{profile.role}</span>
            </div>
          </div>
        )}
        
        <NotificationCenter />
        
        {profile && profile.role !== 'superadmin' && (
          <button 
            onClick={() => setIsProfileOpen(true)}
            className="w-9 h-9 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all flex items-center justify-center cursor-pointer border border-transparent hover:border-blue-100"
            title="Pengaturan Profil"
          >
            <User size={18} />
          </button>
        )}

        <button 
          onClick={() => signOut(auth)}
          className="w-9 h-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all flex items-center justify-center cursor-pointer border border-transparent hover:border-rose-100"
          title="Keluar"
        >
          <LogOut size={18} />
        </button>

        <ProfileSettings isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      </div>
    </header>
  );
}
