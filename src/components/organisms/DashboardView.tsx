import React from 'react';
import { Settings, ShieldCheck, BellRing, Landmark, Share2, Users, Wallet, Rocket, Store, BookMarked, Megaphone, MessageSquare } from 'lucide-react';
import { NavCard } from '../molecules/NavCard';
import DashboardStats from '../DashboardStats';
import CommunityInsights from '../CommunityInsights';
import ActivityLog from '../ActivityLog';
import QuickIncidentReport from '../QuickIncidentReport';
import IncidentMap from '../IncidentMap';
import RecentIncidentsFeed from '../RecentIncidentsFeed';
import ResponseTimeCard from '../ResponseTimeCard';
import SmartTipsCard from '../SmartTipsCard';
import { isAdmin } from '../../lib/permissions';
import { AppProfile, Tenant } from '../../types';

interface DashboardViewProps {
  profile: AppProfile | null;
  tenant: Tenant | null;
  stats: { emergencies: number; members: number };
  onNavigate: (view: any) => void;
  isSuperAdmin: boolean;
}

export function DashboardView({ profile, tenant, stats, onNavigate, isSuperAdmin }: DashboardViewProps) {
  const enabledModules = tenant?.enabledModules || ['emergency', 'finance', 'social', 'directory', 'marketplace', 'announcements', 'chat', 'ai'];
  const featureOrder = tenant?.moduleOrder || [];
  const dashboardOrder = tenant?.dashboardOrder || ['insights', 'stats', 'tips', 'reports', 'map', 'features', 'feed', 'logs'];

  const navItems = [
    { id: 'emergency', title: 'Alarm SOS', subtitle: 'Darurat', icon: BellRing, color: 'bg-rose-50 text-rose-600', data: { label: 'Aktif', value: `${stats.emergencies} SOS` } },
    { id: 'finance', title: 'Kas Sinergi', subtitle: 'Iuran', icon: Landmark, color: 'bg-orange-50 text-orange-600', data: { label: 'Status', value: 'Sehat' } },
    { id: 'social', title: 'Kepedulian', subtitle: 'Info Sosial', icon: Share2, color: 'bg-rose-50 text-rose-600', data: { label: 'Update', value: 'Lihat' } },
    { id: 'directory', title: 'Database', subtitle: 'Warga', icon: Users, color: 'bg-blue-50 text-blue-600', data: { label: 'Total', value: `${stats.members} Orang` } },
    { id: 'koperasi', title: 'Koperasi', subtitle: 'Ekonomi', icon: Wallet, color: 'bg-green-50 text-green-600' },
    { id: 'funding', title: 'Funding', subtitle: 'Modal', icon: Rocket, color: 'bg-blue-50 text-blue-600' },
    { id: 'marketplace', title: 'Pasar Brotherhood', subtitle: 'Shop', icon: Store, color: 'bg-orange-50 text-orange-600' },
    { id: 'learning', title: 'Panduan', subtitle: 'Edukasi', icon: BookMarked, color: 'bg-blue-50 text-blue-600' },
    { id: 'announcements', title: 'Warta', subtitle: 'Info Terbaru', icon: Megaphone, color: 'bg-orange-50 text-orange-600' },
    { id: 'chat', title: 'Obrolan', subtitle: 'Komunitas', icon: MessageSquare, color: 'bg-green-50 text-green-600' },
    { id: 'settings', title: 'Setting', subtitle: 'Admin', icon: Settings, color: 'bg-gray-100 text-gray-600', show: isAdmin(profile) || isSuperAdmin },
    { id: 'superadmin', title: 'Master', subtitle: 'Console', icon: ShieldCheck, color: 'bg-blue-600 text-white', show: isSuperAdmin },
  ]
    .filter(item => (item.show !== false) && (item.id === 'settings' || item.id === 'superadmin' || enabledModules.includes(item.id as any)))
    .sort((a, b) => {
      const indexA = featureOrder.indexOf(a.id as any);
      const indexB = featureOrder.indexOf(b.id as any);
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });

  const renderBlock = (blockId: string) => {
    switch (blockId) {
      case 'insights': return isAdmin(profile) && enabledModules.includes('ai') && <CommunityInsights key="insights" />;
      case 'stats': return (enabledModules.includes('directory') || enabledModules.includes('emergency') || enabledModules.includes('finance')) && <DashboardStats key="stats" onNavigate={onNavigate} />;
      case 'tips': return enabledModules.includes('ai') && <SmartTipsCard key="tips" />;
      case 'reports': return enabledModules.includes('emergency') && <div key="reports" className="space-y-4"><QuickIncidentReport /><ResponseTimeCard /></div>;
      case 'map': return enabledModules.includes('emergency') && <IncidentMap key="map" />;
      case 'features': return (
        <div key="features" className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {navItems.map(item => <NavCard key={item.id} id={item.id as any} {...item} onClick={onNavigate} />)}
        </div>
      );
      case 'feed': return enabledModules.includes('emergency') && <RecentIncidentsFeed key="feed" />;
      case 'logs': return isAdmin(profile) && enabledModules.includes('directory') && <ActivityLog key="logs" />;
      default: return null;
    }
  };

  return <>{dashboardOrder.map(blockId => renderBlock(blockId))}</>;
}
