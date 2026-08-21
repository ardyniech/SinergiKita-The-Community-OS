// OVER_LIMIT_JUSTIFIED: Menyatukan root routing SPA dan integrasi tampilan modul terpusat.
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
import { InventoryModule } from './modules/inventory';
import { VotingModule } from './modules/voting';
import { LettersModule } from './modules/letters';
import { PatrolModule } from './modules/patrol';
import { EventsModule } from './modules/events';
import { GuestsModule } from './modules/guests';
import { ContactsModule } from './modules/contacts';
import { LPJModule } from './modules/lpj';
import RealTimeNotifications from './components/RealTimeNotifications';
import LeaderboardView from './components/LeaderboardView';
import { useLocationHeartbeat } from './hooks/useLocationHeartbeat';
import { AnimatePresence } from 'motion/react';
import { ReportDashboard } from './modules/reporting';

type View = 'dashboard' | 'emergency' | 'finance' | 'social' | 'directory' | 'koperasi' | 'funding' | 'marketplace' | 'learning' | 'announcements' | 'chat' | 'ptt' | 'settings' | 'superadmin' | 'pos' | 'leaderboard' | 'ai_reports' | 'inventory' | 'voting' | 'letters' | 'patrol' | 'events' | 'guests' | 'contacts' | 'lpj';

function MainApp() {
  const { profile, tenant, loading } = useAuth();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [stats, setStats] = useState({ emergencies: 0, members: 0 });
  const isSuperAdmin = checkSuperAdmin(profile);

  useLocationHeartbeat();

  useEffect(() => {
    if (!profile?.tenantId || !profile?.isApproved) return;
    const unsubE = onSnapshot(query(collection(db, 'emergencies'), where('tenantId', '==', profile.tenantId)), s => setStats(p => ({ ...p, emergencies: s.size })));
    const unsubM = onSnapshot(query(collection(db, 'users'), where('tenantId', '==', profile.tenantId)), s => setStats(p => ({ ...p, members: s.size })));
    return () => { unsubE(); unsubM(); };
  }, [profile?.tenantId, profile?.isApproved]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-900"><Loader2 className="animate-spin text-blue-500" size={36} /></div>;
  if (!profile) return <LandingPage />;
  if (!isSuperAdmin) {
    if (!profile.tenantId) return <div className="p-4"><SmartHeader /><TenantSetup /></div>;
    if (!profile.isApproved) {
      const memberLabel = getMemberLabel(tenant?.type);
      const adminLabel = getAdminLabel(tenant?.type);
      const desc = profile.role === 'admin' ? `Registrasi komunitas baru sedang ditinjau Master Admin.` : `Akun ${memberLabel.toLowerCase()} sedang ditinjau ${adminLabel}.`;
      return <StatusScreen title="Menunggu Persetujuan" description={desc} tenantId={profile.tenantId} />;
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
    marketplace: { title: 'Pasar & UMKM Warga', component: <MarketplaceModule /> },
    inventory: { title: 'Inventaris & Logistik', component: <InventoryModule /> },
    voting: { title: 'Suara Warga & E-Voting', component: <VotingModule /> },
    letters: { title: 'Layanan Surat RT/RW', component: <LettersModule /> },
    patrol: { title: 'Jadwal Ronda & Siskamling', component: <PatrolModule /> },
    events: { title: 'Agenda & Kegiatan Warga', component: <EventsModule /> },
    guests: { title: 'Wajib Lapor Tamu 1x24 Jam', component: <GuestsModule /> },
    contacts: { title: 'Kontak Darurat & Fasilitas', component: <ContactsModule /> },
    lpj: { title: 'Ekspor LPJ RT/RW Bulanan', component: <LPJModule /> },
    learning: { title: 'Pusat Pembelajaran', component: <LearningModule /> },
    announcements: { title: 'Warta Warga', component: <AnnouncementsModule /> },
    chat: { title: 'Obrolan Komunitas', component: <CommunicationModule /> },
    ptt: { title: 'Radio HT Walkie-Talkie', component: <HandyTalkieModule /> },
    settings: { title: 'Pengaturan Komunitas', component: <SettingsModule /> },
    superadmin: { title: 'Master Console', component: <SuperAdminDashboard /> },
    pos: { title: 'Kasir POS Warga', component: <POSModule /> },
    leaderboard: { title: 'Leaderboard & Point', component: <LeaderboardView /> },
    ai_reports: { title: 'Laporan & AI', component: <ReportDashboard tenantId={profile?.tenantId || undefined} /> },
  };

  return (
    <div className="min-h-screen bg-slate-900 flex justify-center selection:bg-blue-500 selection:text-white">
      <div className="w-full max-w-md mesh-gradient-bg min-h-screen flex flex-col relative shadow-2xl border-x border-slate-200/40 pb-20 overflow-x-hidden">
        <RealTimeNotifications />
        <SmartHeader />
        <main className="flex-1 px-2 py-2 space-y-3">
          {currentView === 'dashboard' ? (
            <DashboardView profile={profile} tenant={tenant} stats={stats} onNavigate={setCurrentView} isSuperAdmin={isSuperAdmin} />
          ) : (
            <ModuleContainer title={views[currentView].title} onBack={() => setCurrentView('dashboard')}>
              {views[currentView].component}
            </ModuleContainer>
          )}
        </main>
        <BottomNavBar currentView={currentView} onNavigate={(v) => { setCurrentView(v); setIsMenuOpen(false); }} onOpenMenu={() => setIsMenuOpen(true)} activeAlertsCount={stats.emergencies} />
        <AnimatePresence>
          {isMenuOpen && <NativeMenuSheet isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} onNavigate={(v) => { setCurrentView(v); setIsMenuOpen(false); }} isSuperAdmin={isSuperAdmin} />}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function App() {
  return <AuthProvider><ToastProvider><AuditProvider><MainApp /></AuditProvider></ToastProvider></AuthProvider>;
}
