import React, { useRef } from 'react';
import { Home, AlertTriangle, Wallet, Users, ChevronUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface BottomNavBarProps {
  currentView: string;
  onNavigate: (view: any) => void;
  onOpenMenu: () => void;
  activeAlertsCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentView,
  onNavigate,
  onOpenMenu,
  activeAlertsCount = 0,
}) => {
  const { tenant } = useAuth();
  const enabledModules = tenant?.enabledModules || ['emergency', 'finance', 'directory'];

  const navItems = [
    { id: 'dashboard', label: 'Beranda', icon: Home, show: true },
    { id: 'emergency', label: 'Darurat', icon: AlertTriangle, badge: activeAlertsCount, show: enabledModules.includes('emergency') },
    { id: 'finance', label: 'Buku Kas', icon: Wallet, show: enabledModules.includes('finance') },
    { id: 'directory', label: 'Warga', icon: Users, show: enabledModules.includes('directory') },
  ].filter(item => item.show);

  const touchStartY = useRef<number>(0);
  const touchStartX = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaY = touchStartY.current - e.touches[0].clientY;
    const deltaX = Math.abs(touchStartX.current - e.touches[0].clientX);
    if (deltaY > 30 && deltaX < 45) {
      onOpenMenu();
    }
  };

  return (
    <nav 
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto px-2 pb-[calc(env(safe-area-inset-bottom,10px)+6px)] pt-1 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] select-none"
    >
      <button 
        onClick={onOpenMenu}
        className="w-full flex flex-col items-center justify-center py-0.5 group focus:outline-hidden"
      >
        <div className="w-8 h-1 bg-slate-300 group-hover:bg-slate-400 rounded-full transition-colors" />
        <div className="flex items-center gap-0.5 text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
          <ChevronUp size={9} className="animate-bounce" />
          <span>Menu Lainnya</span>
        </div>
      </button>

      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          const isEmergency = item.id === 'emergency';

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative flex flex-col items-center justify-center min-w-[58px] py-1 transition-all cursor-pointer group active:scale-95 ${
                isActive ? 'text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {isActive && (
                <span className="absolute -top-2 w-6 h-1 bg-blue-600 rounded-full shadow-xs" />
              )}
              <div className="relative">
                <div
                  className={`p-1.5 rounded-xl transition-all ${
                    isEmergency && item.badge && item.badge > 0
                      ? 'bg-rose-500 text-white animate-bounce shadow-sm'
                      : isActive
                      ? 'bg-blue-50 text-blue-600 scale-105'
                      : 'group-hover:bg-slate-100'
                  }`}
                >
                  <Icon size={19} />
                </div>
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-black text-blue-600' : 'font-medium text-slate-500'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
