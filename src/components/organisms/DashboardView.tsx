// OVER_LIMIT_JUSTIFIED: Menyatukan tata letak beranda (DashboardView) demi menjamin kohesi rendering SPA dan navigasi instan warga.
import React, { useState, useEffect } from 'react';
import { 
  Settings, ShieldCheck, BellRing, Landmark, Share2, 
  Users, Wallet, Store, BookMarked, Megaphone, 
  MessageSquare, Radio, Grid, X, Trophy, PiggyBank, HeartHandshake, Sparkles,
  LayoutDashboard, UserPlus, ClipboardCheck, ArrowRight, Clock
} from 'lucide-react';
import { NavCard } from '../molecules/NavCard';
import DashboardStats from '../DashboardStats';
import ActivityLog from '../ActivityLog';
import QuickIncidentReport from '../QuickIncidentReport';
import IncidentMap from '../IncidentMap';
import RecentIncidentsFeed from '../RecentIncidentsFeed';
import DashboardChatWidget from '../DashboardChatWidget';
import { InteractiveOnboarding } from '../onboarding/InteractiveOnboarding';
import { isAdmin } from '../../lib/permissions';
import { AppProfile, Tenant } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { getMemberLabel, getCommunityLabel } from '../../lib/terminology';
import { useAdminDashboardData } from '../../hooks/useAdminDashboardData';

interface DashboardViewProps {
  profile: AppProfile | null;
  tenant: Tenant | null;
  stats: { emergencies: number; members: number };
  onNavigate: (view: any) => void;
  isSuperAdmin: boolean;
}

export function DashboardView({ profile, tenant, stats, onNavigate, isSuperAdmin }: DashboardViewProps) {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const memberLabel = getMemberLabel(tenant?.type);
  const communityLabel = getCommunityLabel(tenant?.type);
  const { pendingMembersCount } = useAdminDashboardData();

  useEffect(() => {
    if (!profile?.uid) return;
    const storageKey = `sinergikita_onboarding_completed_${profile.uid}`;
    const completed = localStorage.getItem(storageKey);
    if (!completed) {
      setShowOnboarding(true);
    }
  }, [profile?.uid]);

  const handleCompleteOnboarding = () => {
    if (profile?.uid) {
      localStorage.setItem(`sinergikita_onboarding_completed_${profile.uid}`, 'true');
    }
    setShowOnboarding(false);
  };
  
  const enabledModules = tenant?.enabledModules || ['emergency', 'finance', 'social', 'directory', 'marketplace', 'announcements', 'chat', 'ptt', 'ai', 'map', 'stats'];

  const baseDashboardOrder = tenant?.dashboardOrder || ['stats', 'ptt', 'reports', 'map', 'features', 'feed', 'chat', 'logs'];
  const dashboardOrder = [...baseDashboardOrder];
  
  if (enabledModules.includes('ptt') && !dashboardOrder.includes('ptt')) {
    const statsIndex = dashboardOrder.indexOf('stats');
    if (statsIndex !== -1) {
      dashboardOrder.splice(statsIndex + 1, 0, 'ptt');
    } else {
      dashboardOrder.unshift('ptt');
    }
  }

  // Primary features shown in 2-column layout
  const primaryNavItems = [
    { id: 'emergency', title: `Alarm SOS ${memberLabel}`, subtitle: 'Siaga Bantuan', icon: BellRing, color: 'bg-rose-50 text-rose-600', data: { label: 'Siaga', value: `${stats.emergencies} Aktif` } },
    { id: 'finance', title: `Buku Kas ${memberLabel}`, subtitle: 'Transparansi Dana', icon: Landmark, color: 'bg-emerald-50 text-emerald-600' },
    { id: 'koperasi', title: `Koperasi ${memberLabel}`, subtitle: 'Simpan Pinjam', icon: PiggyBank, color: 'bg-teal-50 text-teal-600' },
    { id: 'funding', title: 'Gotong Royong', subtitle: 'Proyek Bersama', icon: HeartHandshake, color: 'bg-blue-50 text-blue-600' },
    { id: 'directory', title: `Direktori ${memberLabel}`, subtitle: 'Kontak Lingkungan', icon: Users, color: 'bg-indigo-50 text-indigo-600' },
    { id: 'marketplace', title: `Pasar ${memberLabel}`, subtitle: 'Usaha & Jasa Teman', icon: Store, color: 'bg-amber-50 text-amber-600' },
  ].filter(item => enabledModules.includes(item.id as any));

  // Secondary features inside drawer
  const secondaryNavItems = [
    { id: 'announcements', title: 'Warta Pengumuman', subtitle: 'Kabar Resmi', icon: Megaphone, color: 'bg-indigo-50 text-indigo-600' },
    { id: 'chat', title: 'Ruang Obrolan', subtitle: 'Diskusi Santai', icon: MessageSquare, color: 'bg-teal-50 text-teal-600' },
    { id: 'social', title: `Santunan & Peduli`, subtitle: `Bantuan ${memberLabel}`, icon: Share2, color: 'bg-rose-50 text-rose-500' },
    { id: 'learning', title: 'Pojok Belajar', subtitle: 'Panduan & Edukasi', icon: BookMarked, color: 'bg-cyan-50 text-cyan-600' },
    { id: 'pos', title: `Kasir Toko (POS)`, subtitle: 'Pencatatan Penjualan', icon: Wallet, color: 'bg-amber-50 text-amber-600' },
    { id: 'leaderboard', title: 'Papan Penghargaan', subtitle: `Apresiasi ${memberLabel}`, icon: Trophy, color: 'bg-yellow-50 text-yellow-600' },
    { id: 'settings', title: 'Pengaturan Admin', subtitle: 'Kelola Komunitas', icon: Settings, color: 'bg-gray-100 text-gray-700', show: isAdmin(profile) || isSuperAdmin },
    { id: 'superadmin', title: 'Pusat Kendali', subtitle: 'Konsol Master', icon: ShieldCheck, color: 'bg-blue-600 text-white', show: isSuperAdmin },
  ].filter(item => {
    if (item.show === false) return false;
    if (item.id === 'settings' || item.id === 'superadmin') return true;
    return enabledModules.includes(item.id as any);
  });

  const renderBlock = (blockId: string) => {
    switch (blockId) {
      case 'ptt': return enabledModules.includes('ptt') && (
        <div 
          onClick={() => onNavigate('ptt')}
          className="liquid-glass p-3 rounded-2xl border-cyan-500/20 shadow-3d-lg relative overflow-hidden group cursor-pointer active:translate-y-0.5 transition-all mb-4"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-indigo-500/5 pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-3d-sm text-white shrink-0 border border-white/20">
                <Radio className="animate-pulse" size={20} />
              </div>
              <div>
                <h3 className="text-[12px] font-black text-slate-900 tracking-tight uppercase leading-tight">Radio HT Digital</h3>
                <p className="text-[9px] font-black text-cyan-600 uppercase tracking-[0.15em] mt-0.5 opacity-80">Online • Saluran Patroli Siaga</p>
              </div>
            </div>
            <div className="btn-3d px-3 py-1.5 bg-cyan-500 text-white rounded-xl shadow-3d-sm border border-cyan-400">
              <span className="text-[10px] font-black uppercase tracking-widest">Connect</span>
            </div>
          </div>
        </div>
      );
      case 'stats': return enabledModules.includes('stats') && <DashboardStats key="stats" onNavigate={onNavigate} />;
      case 'reports': return enabledModules.includes('emergency') && <QuickIncidentReport key="reports" />;
      case 'map': return enabledModules.includes('map') && <IncidentMap key="map" />;
      case 'features': return primaryNavItems.length > 0 && (
        <div key="features" className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            {primaryNavItems.map(item => (
              <NavCard key={item.id} id={item.id as any} {...item} onClick={onNavigate} />
            ))}
          </div>
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
      {/* Admin Quick Control Panel - Only for Admins */}
      {isAdmin(profile) && (
        <div className="liquid-glass p-4 rounded-3xl space-y-4 mb-4 floating-soft shadow-3d-lg border-white/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-3d-sm border border-white/20">
                <LayoutDashboard size={20} />
              </div>
              <div>
                <h3 className="text-[13px] font-black text-slate-900 tracking-tight uppercase leading-tight">Admin Console</h3>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest opacity-70">{communityLabel}</p>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('settings')}
              className="btn-3d flex items-center gap-2 text-[10px] font-black text-indigo-700 bg-indigo-50/80 px-3 py-2 rounded-xl hover:bg-indigo-100 transition-all uppercase tracking-widest border border-indigo-100"
            >
              <Settings size={14} />
              Settings
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div 
              onClick={() => onNavigate('directory')}
              className="card-3d p-3 bg-white/40 rounded-2xl flex items-center gap-3 cursor-pointer hover:bg-white/60 transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-sm border border-white">
                <UserPlus size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-wider truncate">Total {memberLabel}</p>
                <div className="flex items-center gap-1.5">
                  <p className="text-[12px] font-black text-slate-900">{stats.members}</p>
                  {pendingMembersCount > 0 && (
                    <span className="px-1 py-0.5 bg-rose-100 text-rose-600 text-[8px] font-black rounded-md animate-pulse">
                      {pendingMembersCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="card-3d p-3 bg-white/40 rounded-2xl flex items-center gap-3 cursor-pointer hover:bg-white/60 transition-all">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm border border-white">
                <ClipboardCheck size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-wider truncate">Lisensi {communityLabel}</p>
                <p className="text-[11px] font-black text-emerald-600">Verifikasi ✓</p>
              </div>
            </div>
          </div>

          {/* Quick Recent Activity / New Members */}
          {pendingMembersCount > 0 && (
            <div 
              onClick={() => onNavigate('directory')}
              className="p-2.5 bg-rose-50/50 backdrop-blur-sm border border-rose-100/50 rounded-2xl flex items-center justify-between cursor-pointer group hover:bg-rose-50 transition-all"
            >
              <div className="flex items-center gap-2">
                <Clock size={12} className="text-rose-500" />
                <p className="text-[10px] font-black text-rose-700 uppercase tracking-tight">Butuh Persetujuan {memberLabel}</p>
              </div>
              <ArrowRight size={14} className="text-rose-400 group-hover:translate-x-1 transition-transform" />
            </div>
          )}
        </div>
      )}

      {/* Onboarding Trigger Card for New/Existing Citizens */}
      <div 
        onClick={() => setShowOnboarding(true)}
        className="card-3d bg-gradient-to-r from-blue-600 to-indigo-600 p-2.5 text-white shadow-3d-lg flex items-center justify-between gap-3 cursor-pointer hover:opacity-95 active:translate-y-0.5 transition-all mb-2"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 shadow-sm border border-white/10">
            <Sparkles size={14} className="text-amber-300" />
          </div>
          <div className="min-w-0">
            <h4 className="text-[11px] font-black tracking-tight leading-tight truncate">Panduan Singkat {memberLabel} 👋</h4>
            <p className="text-[9px] text-blue-100 font-medium truncate mt-0.5">Klik untuk melihat cara penggunaan fitur SinergiKita</p>
          </div>
        </div>
        <span className="btn-3d text-[9px] font-bold bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded-md backdrop-blur-xs shrink-0 whitespace-nowrap border border-white/10">
          Buka
        </span>
      </div>

      {dashboardOrder.map(blockId => (
        <div key={blockId} className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both">
          {renderBlock(blockId)}
        </div>
      ))}

      <InteractiveOnboarding
        isOpen={showOnboarding}
        onComplete={handleCompleteOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
    </div>
  );
}
