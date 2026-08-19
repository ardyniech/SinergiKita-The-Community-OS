import React, { useState } from 'react';
import { 
  Settings, ShieldCheck, BellRing, Landmark, Share2, 
  Users, Wallet, Store, BookMarked, Megaphone, 
  MessageSquare, Radio, Grid, X, Trophy, PiggyBank, HeartHandshake 
} from 'lucide-react';
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
  
  const enabledModules = [...(tenant?.enabledModules || ['emergency', 'finance', 'social', 'directory', 'marketplace', 'announcements', 'chat', 'ptt', 'ai']), 'ptt'];

  const baseDashboardOrder = tenant?.dashboardOrder || ['stats', 'ptt', 'reports', 'map', 'features', 'feed', 'chat', 'logs'];
  const dashboardOrder = [...baseDashboardOrder];
  
  if (!dashboardOrder.includes('ptt')) {
    const statsIndex = dashboardOrder.indexOf('stats');
    if (statsIndex !== -1) {
      dashboardOrder.splice(statsIndex + 1, 0, 'ptt');
    } else {
      dashboardOrder.unshift('ptt');
    }
  }

  // Primary features shown in 2-column layout
  const primaryNavItems = [
    { id: 'emergency', title: 'Alarm SOS Cepat', subtitle: 'Siaga Bantuan', icon: BellRing, color: 'bg-rose-50 text-rose-600', data: { label: 'Siaga', value: `${stats.emergencies} Aktif` } },
    { id: 'finance', title: 'Buku Kas Warga', subtitle: 'Transparansi Dana', icon: Landmark, color: 'bg-emerald-50 text-emerald-600' },
    { id: 'koperasi', title: 'Koperasi Warga', subtitle: 'Simpan Pinjam', icon: PiggyBank, color: 'bg-teal-50 text-teal-600' },
    { id: 'funding', title: 'Gotong Royong', subtitle: 'Proyek Bersama', icon: HeartHandshake, color: 'bg-blue-50 text-blue-600' },
    { id: 'directory', title: 'Direktori Warga', subtitle: 'Kontak Lingkungan', icon: Users, color: 'bg-indigo-50 text-indigo-600' },
    { id: 'marketplace', title: 'Pasar Warga', subtitle: 'Usaha & Jasa Teman', icon: Store, color: 'bg-amber-50 text-amber-600' },
  ];

  // Secondary features inside drawer
  const secondaryNavItems = [
    { id: 'announcements', title: 'Warta Pengumuman', subtitle: 'Kabar Resmi', icon: Megaphone, color: 'bg-indigo-50 text-indigo-600' },
    { id: 'chat', title: 'Ruang Obrolan', subtitle: 'Diskusi Santai', icon: MessageSquare, color: 'bg-teal-50 text-teal-600' },
    { id: 'social', title: 'Santunan & Peduli', subtitle: 'Bantuan Warga', icon: Share2, color: 'bg-rose-50 text-rose-500' },
    { id: 'learning', title: 'Pojok Belajar', subtitle: 'Panduan & Edukasi', icon: BookMarked, color: 'bg-cyan-50 text-cyan-600' },
    { id: 'pos', title: 'Kasir Toko (POS)', subtitle: 'Pencatatan Penjualan', icon: Wallet, color: 'bg-amber-50 text-amber-600' },
    { id: 'leaderboard', title: 'Papan Penghargaan', subtitle: 'Apresiasi Warga', icon: Trophy, color: 'bg-yellow-50 text-yellow-600' },
    { id: 'settings', title: 'Pengaturan Admin', subtitle: 'Kelola Komunitas', icon: Settings, color: 'bg-gray-100 text-gray-700', show: isAdmin(profile) || isSuperAdmin },
    { id: 'superadmin', title: 'Pusat Kendali', subtitle: 'Konsol Master', icon: ShieldCheck, color: 'bg-blue-600 text-white', show: isSuperAdmin },
  ].filter(item => item.show !== false);

  const renderBlock = (blockId: string) => {
    switch (blockId) {
      case 'ptt': return (
        <div 
          onClick={() => onNavigate('ptt')}
          className="bg-slate-900 rounded-xl p-3 border border-slate-800 shadow-md relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all mb-1"
        >
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center shadow-md border border-cyan-400">
                <Radio className="text-white animate-pulse" size={16} />
              </div>
              <div>
                <h3 className="text-white font-black text-xs tracking-tight">Radio Handy Talkie (PTT)</h3>
                <p className="text-cyan-400 text-[9px] font-medium tracking-wide">Saluran Patroli Siaga • Terhubung</p>
              </div>
            </div>
            <div className="px-2.5 py-1 bg-slate-800 rounded-lg border border-slate-700">
              <span className="text-[9px] font-bold text-white group-hover:text-cyan-400 transition-colors">Buka HT →</span>
            </div>
          </div>
        </div>
      );
      case 'stats': return (enabledModules.includes('directory') || enabledModules.includes('emergency') || enabledModules.includes('finance')) && <DashboardStats key="stats" onNavigate={onNavigate} />;
      case 'reports': return enabledModules.includes('emergency') && <QuickIncidentReport key="reports" />;
      case 'map': return enabledModules.includes('emergency') && <IncidentMap key="map" />;
      case 'features': return (
        <div key="features" className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {primaryNavItems.map(item => (
              <NavCard key={item.id} id={item.id as any} {...item} onClick={onNavigate} />
            ))}
            {/* More Services Card */}
            <div 
              id="layanan-lainnya"
              onClick={() => setShowMoreMenu(true)}
              className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all flex flex-col justify-between min-h-[85px]"
            >
              <div className="flex justify-between items-start">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                  <Grid size={16} />
                </div>
                <span className="text-[8px] font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded-full tracking-wider">MORE</span>
              </div>
              <div className="mt-2">
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 leading-tight">Menu Lainnya</h4>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide mt-0.5">8+ Fitur Warga</p>
              </div>
            </div>
          </div>

          {/* More Services Sheet */}
          <AnimatePresence>
            {showMoreMenu && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center p-0 backdrop-blur-xs">
                <motion.div 
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 220 }}
                  className="bg-white dark:bg-slate-900 rounded-t-2xl max-w-lg w-full p-4 border-t border-slate-200 dark:border-slate-800 shadow-2xl relative flex flex-col max-h-[85vh]"
                >
                  <div className="w-12 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-3" />
                  
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h3 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">Layanan Komunitas</h3>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Modul Layanan Lengkap</p>
                    </div>
                    <button 
                      onClick={() => setShowMoreMenu(false)}
                      className="min-h-[44px] min-w-[44px] rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 overflow-y-auto pb-4">
                    {secondaryNavItems.map(item => (
                      <div 
                        key={item.id} 
                        onClick={() => {
                          setShowMoreMenu(false);
                          onNavigate(item.id);
                        }}
                        className="bg-slate-50/70 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl p-3 cursor-pointer active:scale-[0.98] transition-all flex flex-col justify-between min-h-[85px] group"
                      >
                        <div className="flex justify-between items-start">
                          <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center`}>
                            <item.icon size={16} />
                          </div>
                        </div>
                        <div className="mt-2">
                          <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 leading-tight">{item.title}</h4>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide mt-0.5">{item.subtitle}</p>
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
