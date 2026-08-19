import React, { useState } from 'react';
import { Settings, ShieldCheck, BellRing, Landmark, Share2, Users, Wallet, Rocket, Store, BookMarked, Megaphone, MessageSquare, Radio, Grid, X, HelpCircle } from 'lucide-react';
import { NavCard } from '../molecules/NavCard';
import DashboardStats from '../DashboardStats';
import ActivityLog from '../ActivityLog';
import QuickIncidentReport from '../QuickIncidentReport';
import IncidentMap from '../IncidentMap';
import RecentIncidentsFeed from '../RecentIncidentsFeed';
import DashboardChatWidget from '../DashboardChatWidget';
import { isAdmin } from '../../lib/permissions';
import { AppProfile, Tenant } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardViewProps {
  profile: AppProfile | null;
  tenant: Tenant | null;
  stats: { emergencies: number; members: number };
  onNavigate: (view: any) => void;
  isSuperAdmin: boolean;
}

export function DashboardView({ profile, tenant, stats, onNavigate, isSuperAdmin }: DashboardViewProps) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  
  // Guarantee 'ptt' and finance modules are always present
  const enabledModules = [...(tenant?.enabledModules || ['emergency', 'finance', 'social', 'directory', 'marketplace', 'announcements', 'chat', 'ptt', 'ai']), 'ptt'];
  
  const isAdminOrOfficer = profile && ['admin', 'ketua', 'bendahara', 'sekretaris'].includes(profile.role);

  const baseDashboardOrder = tenant?.dashboardOrder || ['stats', 'ptt', 'reports', 'map', 'features', 'feed', 'chat', 'logs'];
  const dashboardOrder = [...baseDashboardOrder];
  
  // Always ensure 'ptt' banner is in dashboardOrder to make sure it is rendered
  if (!dashboardOrder.includes('ptt')) {
    const statsIndex = dashboardOrder.indexOf('stats');
    if (statsIndex !== -1) {
      dashboardOrder.splice(statsIndex + 1, 0, 'ptt');
    } else {
      dashboardOrder.unshift('ptt');
    }
  }

  // Primary features shown directly in 2-column layout (highly focused)
  const primaryNavItems = [
    { id: 'emergency', title: 'Alarm SOS', subtitle: 'Darurat', icon: BellRing, color: 'bg-rose-50 text-rose-600', data: { label: 'Aktif', value: `${stats.emergencies} SOS` } },
    { id: 'finance', title: 'Finance Community', subtitle: 'Kas, Koperasi, Funding', icon: Landmark, color: 'bg-orange-50 text-orange-600' },
    { id: 'directory', title: 'Database', subtitle: 'Warga', icon: Users, color: 'bg-blue-50 text-blue-600' },
    { id: 'marketplace', title: 'Pasar Brotherhood', subtitle: 'Shop', icon: Store, color: 'bg-emerald-50 text-emerald-600' },
    { id: 'announcements', title: 'Warta', subtitle: 'Info Terbaru', icon: Megaphone, color: 'bg-indigo-50 text-indigo-600' },
  ];

  // Secondary features hidden in slide-up overlay to prevent clutter
  const secondaryNavItems = [
    { id: 'chat', title: 'Obrolan', subtitle: 'Komunitas', icon: MessageSquare, color: 'bg-teal-50 text-teal-600' },
    { id: 'social', title: 'Kepedulian', subtitle: 'Bantuan Sosial', icon: Share2, color: 'bg-rose-50 text-rose-500' },
    { id: 'learning', title: 'Panduan', subtitle: 'Edukasi Warga', icon: BookMarked, color: 'bg-cyan-50 text-cyan-600' },
    { id: 'pos', title: 'Kasir POS', subtitle: 'Point of Sale', icon: Wallet, color: 'bg-amber-50 text-amber-600' },
    { id: 'settings', title: 'Setting Admin', subtitle: 'Konfigurasi', icon: Settings, color: 'bg-gray-100 text-gray-700', show: isAdmin(profile) || isSuperAdmin },
    { id: 'superadmin', title: 'Master Console', subtitle: 'Sistem Pusat', icon: ShieldCheck, color: 'bg-blue-600 text-white', show: isSuperAdmin },
  ].filter(item => item.show !== false);

  const renderBlock = (blockId: string) => {
    switch (blockId) {
      case 'ptt': return (
        <div 
          onClick={() => onNavigate('ptt')}
          className="bg-slate-900 rounded-2xl p-3.5 border-2 border-slate-800 shadow-xl relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all mb-1"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-cyan-500/20 transition-colors" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-900/50 border border-cyan-400">
                <Radio className="text-white animate-pulse" size={18} />
              </div>
              <div>
                <h3 className="text-white font-black text-[11px] uppercase tracking-tight">Handy Talkie (PTT)</h3>
                <p className="text-cyan-400 text-[8px] font-mono font-bold tracking-widest">CHANNEL_01 • TERHUBUNG</p>
              </div>
            </div>
            <div className="px-2.5 py-1 bg-slate-800 rounded-lg border border-slate-700">
              <span className="text-[8px] font-black text-white uppercase tracking-widest group-hover:text-cyan-400 transition-colors">Buka HT →</span>
            </div>
          </div>
        </div>
      );
      case 'stats': return (enabledModules.includes('directory') || enabledModules.includes('emergency') || enabledModules.includes('finance')) && <DashboardStats key="stats" onNavigate={onNavigate} />;
      case 'reports': return enabledModules.includes('emergency') && <QuickIncidentReport key="reports" />;
      case 'map': return enabledModules.includes('emergency') && <IncidentMap key="map" />;
      case 'features': return (
        <div key="features" className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {primaryNavItems.map(item => (
              <NavCard key={item.id} id={item.id as any} {...item} onClick={onNavigate} />
            ))}
            {/* Custom card for opening more services */}
            <div 
              id="layanan-lainnya"
              onClick={() => setShowMoreMenu(true)}
              className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-sm relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all flex flex-col justify-between h-[85px]"
            >
              <div className="flex justify-between items-start">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                  <Grid size={18} className="group-hover:rotate-45 transition-transform" />
                </div>
                <span className="text-[8px] font-black bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full tracking-wider">LAYANAN</span>
              </div>
              <div className="mt-2">
                <h4 className="text-[11px] font-black text-slate-800 leading-tight">Menu Lainnya</h4>
                <p className="text-[9px] text-slate-400 font-bold leading-none mt-0.5 uppercase tracking-wide">6+ Modul Komunitas</p>
              </div>
            </div>
          </div>

          {/* More Services Popup Sheet */}
          <AnimatePresence>
            {showMoreMenu && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center p-0">
                <motion.div 
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 220 }}
                  className="bg-white rounded-t-[28px] max-w-lg w-full p-4 border-t border-slate-100 shadow-2xl relative flex flex-col max-h-[85vh]"
                >
                  {/* Pull bar */}
                  <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-4" />
                  
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Layanan Komunitas</h3>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5">Modul Layanan Tambahan</p>
                    </div>
                    <button 
                      onClick={() => setShowMoreMenu(false)}
                      className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 overflow-y-auto pb-4 custom-scrollbar">
                    {secondaryNavItems.map(item => (
                      <div 
                        key={item.id} 
                        onClick={() => {
                          setShowMoreMenu(false);
                          onNavigate(item.id);
                        }}
                        className="bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-xl p-3 cursor-pointer active:scale-[0.98] transition-all flex flex-col justify-between h-[85px] group"
                      >
                        <div className="flex justify-between items-start">
                          <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center`}>
                            <item.icon size={18} />
                          </div>
                        </div>
                        <div className="mt-2">
                          <h4 className="text-[11px] font-black text-slate-800 leading-tight">{item.title}</h4>
                          <p className="text-[9px] text-slate-400 font-bold leading-none mt-0.5 uppercase tracking-wide">{item.subtitle}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      );
      case 'feed': return enabledModules.includes('emergency') && <RecentIncidentsFeed key="feed" />;
      case 'chat': return enabledModules.includes('chat') && <DashboardChatWidget key="chat" />;
      case 'logs': return isAdmin(profile) && enabledModules.includes('directory') && <ActivityLog key="logs" />;
      default: return null;
    }
  };

  return (
    <div className="w-full mx-auto py-1 space-y-2">
      {dashboardOrder.map(blockId => (
        <div key={blockId} className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both">
          {renderBlock(blockId)}
        </div>
      ))}
    </div>
  );
}
