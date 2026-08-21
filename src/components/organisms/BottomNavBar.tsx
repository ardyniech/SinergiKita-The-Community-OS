import React, { useRef } from 'react';
import { Home, AlertTriangle, Wallet, Users, ChevronUp } from 'lucide-react';

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
  const navItems = [
    { id: 'dashboard', label: 'Beranda', icon: Home },
    { id: 'emergency', label: 'Darurat', icon: AlertTriangle, badge: activeAlertsCount },
    { id: 'finance', label: 'Buku Kas', icon: Wallet },
    { id: 'directory', label: 'Warga', icon: Users },
  ];

  // Gesture Swipe Up detection
  const touchStartY = useRef<number>(0);
  const touchStartX = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY;
    const currentX = e.touches[0].clientX;
    const deltaY = touchStartY.current - currentY;
    const deltaX = Math.abs(touchStartX.current - currentX);

    // If dragged up by at least 30px and primarily vertical drag
    if (deltaY > 30 && deltaX < 45) {
      onOpenMenu();
    }
  };

  // Mouse gesture simulation for desktop testing
  const mouseDownY = useRef<number | null>(null);
  const handleMouseDown = (e: React.MouseEvent) => {
    mouseDownY.current = e.clientY;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (mouseDownY.current === null) return;
    const deltaY = mouseDownY.current - e.clientY;
    if (deltaY > 30) {
      onOpenMenu();
      mouseDownY.current = null;
    }
  };

  const handleMouseUp = () => {
    mouseDownY.current = null;
  };

  return (
    <nav 
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto px-3 pb-[calc(env(safe-area-inset-bottom,12px)+8px)] pt-1 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] select-none cursor-grab active:cursor-grabbing"
    >
      {/* Visual Gesture Handle Area */}
      <div className="w-full flex flex-col items-center justify-center py-1 mb-1 group">
        <div className="w-10 h-1 bg-slate-200 group-hover:bg-slate-300 rounded-full transition-colors" />
        <div className="flex items-center gap-0.5 mt-0.5 text-[8px] font-bold text-slate-400 uppercase tracking-widest">
          <ChevronUp size={8} className="animate-bounce" />
          <span>Usap Ke Atas Untuk Menu</span>
        </div>
      </div>

      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          const isEmergency = item.id === 'emergency';

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative flex flex-col items-center justify-center min-w-[64px] py-1 transition-all cursor-pointer group active:scale-90 ${
                isActive ? 'text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {/* Active Pill Highlight */}
              {isActive && (
                <span className="absolute -top-3 w-8 h-1 bg-blue-600 rounded-full shadow-xs" />
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
                  <Icon size={20} />
                </div>

                {/* Badge Counter */}
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="absolute -top-1 -right-1.5 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>

              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-black text-blue-600' : 'font-semibold text-slate-500'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

