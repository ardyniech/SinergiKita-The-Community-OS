import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from './shared/utils/firebase';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AuditProvider } from './context/AuditContext';
import { Loader2 } from 'lucide-react';
import { SmartHeader } from './components/organisms/SmartHeader';
import { BottomNavBar } from './components/organisms/BottomNavBar';
import { NativeMenuSheet } from './components/organisms/NativeMenuSheet';
import { ModuleContainer } from './components/organisms/ModuleContainer';
import { StatusScreen } from './components/organisms/StatusScreen';
import { DashboardView } from './components/organisms/DashboardView';
import { isSuperAdmin as checkSuperAdmin } from './lib/permissions';
import { getMemberLabel, getAdminLabel } from './lib/terminology';
import EmergencySystem from './components/EmergencySystem';
import { DirectoryModule as MemberDirectory } from './modules/directory';
import { KoperasiModule } from './modules/koperasi';
import { FinanceModule } from './modules/finance';
import { FundingModule } from './modules/funding';
import { SocialModule } from './modules/social';
import { LearningModule } from './modules/learning';
import AnnouncementsModule from './components/AnnouncementsModule';
import CommunicationModule from './components/CommunicationModule';
import HandyTalkieModule from './components/HandyTalkieModule';
import SettingsModule from './components/SettingsModule';
import LandingPage from './components/LandingPage';
import TenantSetup from './components/TenantSetup';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import { MarketplaceModule } from './modules/marketplace';
import { POSModule } from './modules/pos';
import RealTimeNotifications from './components/RealTimeNotifications';
import LeaderboardView from './components/LeaderboardView';
import { useLocationHeartbeat } from './hooks/useLocationHeartbeat';
import { AnimatePresence } from 'motion/react';

type View = 'dashboard' | 'emergency' | 'finance' | 'social' | 'directory' | 'koperasi' | 'funding' | 'marketplace' | 'learning' | 'announcements' | 'chat' | 'ptt' | 'settings' | 'superadmin' | 'pos' | 'leaderboard';

function MainApp() {
  const { profile, tenant, loading } = useAuth();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [stats, setStats] = useState({ emergencies: 0, members: 0 });
  const isSuperAdmin = checkSuperAdmin(profile);

  useLocationHeartbeat();

  useEffect(() => {
    if (!profile?.tenantId || !profile?.isApproved) return;
    const unsubE = onSnapshot(
      query(collection(db, 'emergencies'), where('tenantId', '==', profile.tenantId)), 
      s => setStats(prev => ({ ...prev, emergencies: s.size })),
      e => console.warn("App emergencies snapshot error:", e)
    );
    const unsubM = onSnapshot(
      query(collection(db, 'users'), where('tenantId', '==', profile.tenantId)), 
      s => setStats(prev => ({ ...prev, members: s.size })),
      e => console.warn("App users snapshot error:", e)
    );
    return () => { unsubE(); unsubM(); };
  }, [profile?.tenantId, profile?.isApproved]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-900"><Loader2 className="animate-spin text-blue-500" size={36} /></div>;
  if (!profile) return <LandingPage />;
  if (!isSuperAdmin) {
    if (!profile.tenantId) return <div className="p-4"><SmartHeader /><TenantSetup /></div>;
    if (!profile.isApproved) {
      const memberLabel = getMemberLabel(tenant?.type);
      const adminLabel = getAdminLabel(tenant?.type);
      const description = profile.role === 'admin'
        ? `Registrasi komunitas baru Anda sedang dalam proses peninjauan oleh Master Admin. Harap tunggu persetujuan agar sistem SinergiKita dapat diaktifkan.`
        : `Akun ${memberLabel.toLowerCase()} Anda sedang ditinjau oleh ${adminLabel} Komunitas.`;
      return <StatusScreen title="Menunggu Persetujuan" description={description} tenantId={profile.tenantId} />;
    }
  }

  const views: Record<View, { title: string; component: React.ReactNode }> = {
    dashboard: { title: 'Dashboard', component: null },
    emergency: { title: 'Alarm SOS Darurat', component: <EmergencySystem /> },
    finance: { title: 'Buku Kas Komunitas', component: <FinanceModule /> },
    social: { title: 'Aksi Kepedulian Warga', component: <SocialModule /> },
    directory: { title: 'Direktori Warga', component: <MemberDirectory /> },
    koperasi: { title: 'Koperasi Simpan Pinjam', component: <KoperasiModule /> },
    funding: { title: 'Patungan Warga', component: <FundingModule /> },
    marketplace: { title: 'Market Komunitas', component: <MarketplaceModule /> },
    learning: { title: 'Pusat Pembelajaran', component: <LearningModule /> },
    announcements: { title: 'Warta Warga', component: <AnnouncementsModule /> },
    chat: { title: 'Obrolan Komunitas', component: <CommunicationModule /> },
    ptt: { title: 'Radio HT Walkie-Talkie', component: <HandyTalkieModule /> },
    settings: { title: 'Pengaturan Komunitas', component: <SettingsModule /> },
    superadmin: { title: 'Master Console', component: <SuperAdminDashboard /> },
    pos: { title: 'Kasir POS Warga', component: <POSModule /> },
    leaderboard: { title: 'Leaderboard & Point', component: <LeaderboardView /> },
  };

  return (
    <div className="min-h-screen bg-slate-900 flex justify-center selection:bg-blue-500 selection:text-white">
      {/* Native Mobile App Container Frame */}
      <div className="w-full max-w-md mesh-gradient-bg min-h-screen flex flex-col relative shadow-2xl border-x border-slate-200/40 pb-20 overflow-x-hidden">
        <RealTimeNotifications />
        <SmartHeader />

        <main className="flex-1 px-2 py-2 space-y-3">
          {currentView === 'dashboard' ? (
            <DashboardView 
              profile={profile} 
              tenant={tenant} 
              stats={stats} 
              onNavigate={setCurrentView} 
              isSuperAdmin={isSuperAdmin} 
            />
          ) : (
            <ModuleContainer 
              title={views[currentView].title} 
              onBack={() => setCurrentView('dashboard')}
            >
              {views[currentView].component}
            </ModuleContainer>
          )}
        </main>

        {/* Native Fixed Bottom Bar & Drawer */}
        <BottomNavBar 
          currentView={currentView} 
          onNavigate={(v) => { setCurrentView(v); setIsMenuOpen(false); }}
          onOpenMenu={() => setIsMenuOpen(true)}
          activeAlertsCount={stats.emergencies}
        />

        <AnimatePresence>
          {isMenuOpen && (
            <NativeMenuSheet 
              isOpen={isMenuOpen} 
              onClose={() => setIsMenuOpen(false)} 
              onNavigate={(v) => { setCurrentView(v); setIsMenuOpen(false); }}
              isSuperAdmin={isSuperAdmin}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function App() {
  return <AuthProvider><ToastProvider><AuditProvider><MainApp /></AuditProvider></ToastProvider></AuthProvider>;
}


