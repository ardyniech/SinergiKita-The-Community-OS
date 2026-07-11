import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from './lib/firebase';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AuditProvider } from './context/AuditContext';
import { Loader2 } from 'lucide-react';
import { SmartHeader } from './components/organisms/SmartHeader';
import { ModuleContainer } from './components/organisms/ModuleContainer';
import { StatusScreen } from './components/organisms/StatusScreen';
import { DashboardView } from './components/organisms/DashboardView';
import { isSuperAdmin as checkSuperAdmin } from './lib/permissions';
import EmergencySystem from './components/EmergencySystem';
import FinanceModule from './components/FinanceModule';
import SocialModule from './components/SocialModule';
import MemberDirectory from './components/MemberDirectory';
import KoperasiModule from './components/KoperasiModule';
import FundingModule from './components/FundingModule';
import POSModule from './components/POSModule';
import LearningModule from './components/LearningModule';
import AnnouncementsModule from './components/AnnouncementsModule';
import CommunicationModule from './components/CommunicationModule';
import SettingsModule from './components/SettingsModule';
import Login from './components/Login';
import TenantSetup from './components/TenantSetup';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import MarketplaceModule from './components/MarketplaceModule';
import RealTimeNotifications from './components/RealTimeNotifications';

type View = 'dashboard' | 'emergency' | 'finance' | 'social' | 'directory' | 'koperasi' | 'funding' | 'marketplace' | 'learning' | 'announcements' | 'chat' | 'settings' | 'superadmin' | 'pos';

function MainApp() {
  const { profile, tenant, loading } = useAuth();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [stats, setStats] = useState({ emergencies: 0, members: 0 });
  const isSuperAdmin = checkSuperAdmin(profile);

  useEffect(() => {
    if (!profile?.tenantId || !profile?.isApproved) return;
    const unsubE = onSnapshot(query(collection(db, 'emergencies'), where('tenantId', '==', profile.tenantId)), s => setStats(prev => ({ ...prev, emergencies: s.size })));
    const unsubM = onSnapshot(query(collection(db, 'users'), where('tenantId', '==', profile.tenantId)), s => setStats(prev => ({ ...prev, members: s.size })));
    return () => { unsubE(); unsubM(); };
  }, [profile?.tenantId, profile?.isApproved]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;
  if (!profile) return <Login />;
  if (!isSuperAdmin) {
    if (!profile.tenantId) return <div className="p-4"><SmartHeader /><TenantSetup /></div>;
    if (!profile.isApproved) return <StatusScreen title="Menunggu Persetujuan" description="Akun Anda sedang ditinjau oleh Admin Komunitas." tenantId={profile.tenantId} />;
  }

  const views: Record<View, { title: string; component: React.ReactNode }> = {
    dashboard: { title: 'Dashboard', component: null },
    emergency: { title: 'Alarm SOS', component: <EmergencySystem /> },
    finance: { title: 'Kas Sinergi', component: <FinanceModule /> },
    social: { title: 'Kepedulian', component: <SocialModule /> },
    directory: { title: 'Warga', component: <MemberDirectory /> },
    koperasi: { title: 'Koperasi', component: <KoperasiModule /> },
    funding: { title: 'Funding', component: <FundingModule /> },
    marketplace: { title: 'Pasar Brotherhood', component: <MarketplaceModule /> },
    learning: { title: 'Panduan', component: <LearningModule /> },
    announcements: { title: 'Warta Warga', component: <AnnouncementsModule /> },
    chat: { title: 'Obrolan', component: <CommunicationModule /> },
    settings: { title: 'Pengaturan', component: <SettingsModule /> },
    superadmin: { title: 'Master Console', component: <SuperAdminDashboard /> },
    pos: { title: 'Kasir (POS)', component: <POSModule /> },
  };

  if (currentView !== 'dashboard') return <ModuleContainer title={views[currentView].title} onBack={() => setCurrentView('dashboard')}>{views[currentView].component}</ModuleContainer>;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-8 max-w-4xl mx-auto">
      <RealTimeNotifications />
      <SmartHeader />
      <main className="px-4 space-y-4">
        <DashboardView profile={profile} tenant={tenant} stats={stats} onNavigate={setCurrentView} isSuperAdmin={isSuperAdmin} />
      </main>
    </div>
  );
}

export default function App() {
  return <AuthProvider><ToastProvider><AuditProvider><MainApp /></AuditProvider></ToastProvider></AuthProvider>;
}

