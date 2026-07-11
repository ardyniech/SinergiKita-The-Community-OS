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
    <header className="mb-4 bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center px-4 relative z-40">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <img 
            src="/src/assets/images/sinergikita_logo_minimalist_1783798322236.jpg" 
            alt="SinergiKita Logo" 
            className="w-9 h-9 rounded-xl shadow-sm border border-gray-100" 
            referrerPolicy="no-referrer"
          />
          <div>
            <h1 className="text-lg font-black tracking-tighter text-gray-900 leading-none">SinergiKita</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`} />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {isOnline ? 'System Online' : 'Offline Mode'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {profile && (
          <div className="hidden sm:flex flex-col items-end mr-2">
            <p className="text-[11px] font-bold text-gray-900 leading-tight">{profile.displayName || profile.email}</p>
            <div className="flex items-center gap-2">
              {profile.tenantId && (
                <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono font-bold">
                  ID: {profile.tenantId}
                </span>
              )}
              <p className="text-[9px] text-blue-600 font-bold uppercase tracking-tighter">{profile.role}</p>
            </div>
          </div>
        )}
        
        <NotificationCenter />
        
        {profile && profile.role !== 'superadmin' && (
          <button 
            onClick={() => setIsProfileOpen(true)}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
            title="Pengaturan Profil"
          >
            <User size={18} />
          </button>
        )}

        <button 
          onClick={() => signOut(auth)}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
          title="Keluar"
        >
          <LogOut size={18} />
        </button>

        <ProfileSettings isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      </div>
    </header>
  );
}
