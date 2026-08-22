import React, { useState, useEffect } from 'react';
import { ShieldAlert, Eye, Radio, Newspaper, ShieldCheck, MapPin, Calendar } from 'lucide-react';
import { OjolSafetyDashboard } from './OjolSafetyDashboard';
import { AssemblyZoneMap } from './AssemblyZoneMap';
import { BulletinContainer } from '../../bulletin/primitives/BulletinContainer';
import { WatchContainer } from '../../watch/primitives/WatchContainer';
import HandyTalkieModule from '../../../components/HandyTalkieModule';
import { VerificationList } from '../../verification/primitives/VerificationList';
import { PatrolContainer } from '../../patrol/primitives/PatrolContainer';
import { useAuth } from '../../../context/AuthContext';
import { isAdmin as checkAdmin } from '../../../lib/permissions';
import { subscribeActiveLocationsCount, subscribeActiveEmergenciesCount, subscribeActiveLocations, ActiveDriver } from '../storage/ojolStats';
import { subscribeActiveWatchRequests } from '../../watch/storage/watchStorage';

export const OjolCompleteHub: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'watch' | 'ptt' | 'bulletin' | 'patrol' | 'verification'>('dashboard');
  const isAdmin = checkAdmin(profile);

  const [stats, setStats] = useState({ drivers: 0, watch: 0, sos: 0 });
  const [activeDrivers, setActiveDrivers] = useState<ActiveDriver[]>([]);
  const tenantId = profile?.tenantId || '';

  useEffect(() => {
    if (!tenantId) return;
    const unsubs = [
      subscribeActiveLocationsCount(tenantId, (n) => setStats((s) => ({ ...s, drivers: n }))),
      subscribeActiveWatchRequests(tenantId, (list) => setStats((s) => ({ ...s, watch: list.length }))),
      subscribeActiveEmergenciesCount(tenantId, (n) => setStats((s) => ({ ...s, sos: n }))),
      subscribeActiveLocations(tenantId, setActiveDrivers),
    ];
    return () => unsubs.forEach((u) => u());
  }, [tenantId]);

  return (
    <div className="space-y-3 pb-6 px-1">
      {/* Sub Nav Tab Komunitas Ojol */}
      <div className="bg-slate-900 p-1 rounded-xl flex items-center justify-between gap-1 overflow-x-auto no-scrollbar border border-slate-800">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: <ShieldAlert size={12} /> },
          { id: 'watch', label: 'Pantau', icon: <Eye size={12} /> },
          { id: 'ptt', label: 'HT Suara', icon: <Radio size={12} /> },
          { id: 'bulletin', label: 'Papan Info', icon: <Newspaper size={12} /> },
          { id: 'patrol', label: 'Piket', icon: <Calendar size={12} /> },
          ...(isAdmin ? [{ id: 'verification', label: 'Verifikasi', icon: <ShieldCheck size={12} /> }] : []),
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all shrink-0 ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Konten Berdasarkan Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-3">
          <OjolSafetyDashboard
            activeDriversCount={stats.drivers}
            pendingWatchCount={stats.watch}
            activeSosCount={stats.sos}
            onNavigateToWatch={() => setActiveTab('watch')}
            onNavigateToEmergency={() => {}}
            onNavigateToPTT={() => setActiveTab('ptt')}
          />
          <AssemblyZoneMap drivers={activeDrivers} currentUserId={profile?.uid} />
        </div>
      )}

      {activeTab === 'watch' && <WatchContainer />}

      {activeTab === 'ptt' && <HandyTalkieModule />}

      {activeTab === 'bulletin' && <BulletinContainer />}

      {activeTab === 'patrol' && <PatrolContainer />}

      {activeTab === 'verification' && <VerificationList />}
    </div>
  );
};

export default OjolCompleteHub;
