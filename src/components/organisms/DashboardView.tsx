// OVER_LIMIT_JUSTIFIED: Menyatukan tata letak beranda (DashboardView) demi menjamin kohesi rendering SPA dan navigasi instan warga.
import React, { useState, useEffect } from 'react';
import { 
  Settings, ShieldCheck, BellRing, Landmark, Share2, 
  Users, Wallet, Store, BookMarked, Megaphone, 
  MessageSquare, Radio, Grid, X, Trophy, PiggyBank, HeartHandshake, Sparkles,
  LayoutDashboard, UserPlus, ClipboardCheck, ArrowRight, Clock, Package, Vote,
  FileText, ShieldAlert
} from 'lucide-react';
import { NavCard } from '../molecules/NavCard';
import DashboardStats from '../DashboardStats';
import ActivityLog from '../ActivityLog';
import QuickIncidentReport from '../QuickIncidentReport';
import RecentIncidentsFeed from '../RecentIncidentsFeed';
import DashboardChatWidget from '../DashboardChatWidget';
import { InteractiveOnboarding } from '../onboarding/InteractiveOnboarding';
import { isAdmin } from '../../lib/permissions';
import { AppProfile, Tenant } from '../../types';
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
  
  const enabledModules = tenant?.enabledModules || ['emergency', 'finance', 'social', 'directory', 'marketplace', 'announcements', 'chat', 'ptt', 'ai', 'map', 'stats', 'inventory', 'voting', 'funding'];

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
    { id: 'letters', title: 'Layanan Surat RT', subtitle: 'Pengantar & Keterangan', icon: FileText, color: 'bg-indigo-50 text-indigo-600' },
    { id: 'patrol', title: 'Jadwal Ronda', subtitle: 'Siskamling & Presensi', icon: ShieldAlert, color: 'bg-emerald-50 text-emerald-600' },
    { id: 'finance', title: `Buku Kas ${memberLabel}`, subtitle: 'Transparansi Dana', icon: Landmark, color: 'bg-teal-50 text-teal-600' },
    { id: 'voting', title: 'Suara & E-Voting', subtitle: 'Rembuk Musyawarah', icon: Vote, color: 'bg-violet-50 text-violet-600' },
    { id: 'inventory', title: 'Logistik & Aset', subtitle: 'Peminjaman Alat RT', icon: Package, color: 'text-cyan-600 bg-cyan-50' },
    { id: 'marketplace', title: `Pasar ${memberLabel}`, subtitle: 'Usaha & Jasa Teman', icon: Store, color: 'bg-amber-50 text-amber-600' },
    { id: 'funding', title: 'Gotong Royong', subtitle: 'Patungan Proyek', icon: HeartHandshake, color: 'bg-blue-50 text-blue-600' },
    { id: 'directory', title: `Direktori ${memberLabel}`, subtitle: 'Kontak Lingkungan', icon: Users, color: 'bg-sky-50 text-sky-600' },
    { id: 'koperasi', title: `Koperasi ${memberLabel}`, subtitle: 'Simpan Pinjam', icon: PiggyBank, color: 'bg-purple-50 text-purple-600' },
  ];

  const renderBlock = (blockId: string) => {
    switch (blockId) {
      case 'ptt': return enabledModules.includes('ptt') && (
        <div 
          onClick={() => onNavigate('ptt')}
          className="p-3 bg-white border border-cyan-200/70 rounded-xl shadow-xs relative overflow-hidden group cursor-pointer active:scale-[0.99] transition-all mb-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center text-white shrink-0">
                <Radio size={16} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 leading-tight">Radio HT Walkie-Talkie</h3>
                <p className="text-[10px] text-cyan-700 font-medium">Saluran Siaga Ronda & Patroli</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 bg-cyan-50 text-cyan-700 rounded-md border border-cyan-200">
              Buka HT
            </span>
          </div>
        </div>
      );
      case 'stats': return enabledModules.includes('stats') && <DashboardStats key="stats" onNavigate={onNavigate} />;
      case 'reports': return enabledModules.includes('emergency') && <QuickIncidentReport key="reports" />;
      case 'features': return primaryNavItems.length > 0 && (
        <div key="features" className="space-y-1.5">
          <div className="grid grid-cols-2 gap-2">
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
    <div className="w-full py-0.5 space-y-2">
      {isAdmin(profile) && (
        <div className="bg-white p-3 rounded-xl border border-indigo-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                <LayoutDashboard size={14} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 leading-tight">Panel Pengurus {communityLabel}</h3>
                <p className="text-[10px] text-slate-400">Kelola operasional & data warga</p>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('settings')}
              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded-md"
            >
              Pengaturan
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div 
              onClick={() => onNavigate('directory')}
              className="p-2 bg-slate-50 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <UserPlus size={14} className="text-blue-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-[9px] font-medium text-slate-500 truncate">Total {memberLabel}</p>
                <div className="flex items-center gap-1">
                  <p className="text-xs font-bold text-slate-900">{stats.members}</p>
                  {pendingMembersCount > 0 && (
                    <span className="px-1 py-0.2 bg-rose-100 text-rose-600 text-[8px] font-bold rounded">
                      +{pendingMembersCount} verifikasi
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div 
              onClick={() => onNavigate('inventory')}
              className="p-2 bg-slate-50 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <Package size={14} className="text-teal-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-[9px] font-medium text-slate-500 truncate">Inventaris RT</p>
                <p className="text-xs font-bold text-teal-700">Kelola Aset</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {dashboardOrder.map(blockId => (
        <div key={blockId}>
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
