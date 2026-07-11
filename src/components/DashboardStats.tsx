import { useState, useEffect } from 'react';
import { Transaction } from '../types';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Users, BellRing, Wallet, Rocket, Megaphone, BookMarked } from 'lucide-react';
import { StatCard } from './molecules/StatCard';

interface DashboardStatsProps {
  onNavigate: (view: any) => void;
}

export default function DashboardStats({ onNavigate }: DashboardStatsProps) {
  const { profile, tenant } = useAuth();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ members: 0, emergencies: 0, koperasi: 0, projects: 0, announcements: 0, learning: 0 });

  useEffect(() => {
    if (!profile?.tenantId || !profile?.isApproved) return;
    const q = (path: string) => query(collection(db, path), where('tenantId', '==', profile.tenantId));
    const unsubscribes = [
      onSnapshot(q('transactions'), (snap) => {
        let total = 0;
        snap.forEach(doc => { total += (doc.data() as Transaction).type === 'credit' ? (doc.data() as Transaction).amount : -(doc.data() as Transaction).amount; });
        setBalance(total);
        setLoading(false);
      }),
      onSnapshot(q('users'), s => setCounts(prev => ({ ...prev, members: s.size }))),
      onSnapshot(q('emergencies'), s => setCounts(prev => ({ ...prev, emergencies: s.size }))),
      onSnapshot(q('koperasi'), s => setCounts(prev => ({ ...prev, koperasi: s.size }))),
      onSnapshot(q('projects'), s => setCounts(prev => ({ ...prev, projects: s.size }))),
      onSnapshot(q('announcements'), s => setCounts(prev => ({ ...prev, announcements: s.size }))),
      onSnapshot(q('learning'), s => setCounts(prev => ({ ...prev, learning: s.size })))
    ];
    return () => unsubscribes.forEach(unsub => unsub());
  }, [profile?.tenantId, profile?.isApproved]);

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const cashFlowStatus = balance > 1000000 ? 'healthy' : balance > 0 ? 'warning' : 'critical';
  const enabledModules = tenant?.enabledModules || ['emergency', 'finance', 'social', 'directory', 'marketplace', 'announcements', 'chat', 'ai'];

  const kpis = [
    { id: 'directory', label: 'Warga', value: counts.members, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'emergency', label: 'SOS Aktif', value: counts.emergencies, icon: BellRing, color: 'text-rose-600', bg: 'bg-rose-50' },
    { id: 'koperasi', label: 'Koperasi', value: counts.koperasi, icon: Wallet, color: 'text-green-600', bg: 'bg-green-50' },
    { id: 'funding', label: 'Proyek', value: counts.projects, icon: Rocket, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'announcements', label: 'Warta', value: counts.announcements, icon: Megaphone, color: 'text-orange-600', bg: 'bg-orange-50' },
    { id: 'learning', label: 'Materi', value: counts.learning, icon: BookMarked, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ].filter(kpi => enabledModules.includes(kpi.id as any));

  if (loading) return <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 animate-pulse h-64" />;

  return (
    <div className="space-y-4 mb-5">
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        {enabledModules.includes('finance') && (
          <>
            <div className="flex justify-between items-start mb-5">
              <div>
                <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Status Keuangan Komunitas</h2>
                <p className="text-3xl font-black text-gray-900 tracking-tighter">Rp {balance.toLocaleString()}</p>
              </div>
              <div className="flex flex-col gap-0.5 items-end">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${getStatusClasses(cashFlowStatus)}`}>Status: {cashFlowStatus}</span>
                <div className="flex gap-1 mt-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /><span className="text-[8px] font-bold text-gray-400 uppercase">Sinkron</span></div>
              </div>
            </div>
            <div className="h-1 bg-gray-50 rounded-full overflow-hidden mb-5"><div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${Math.min((balance/2000000)*100, 100)}%` }} /></div>
          </>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {kpis.map((kpi) => <StatCard key={kpi.id} {...kpi} onClick={onNavigate} />)}
        </div>
      </div>
    </div>
  );
}

