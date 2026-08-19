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
      }, (e) => {
        console.warn("DashboardStats transactions error:", e);
        setLoading(false);
      }),
      onSnapshot(q('users'), s => setCounts(prev => ({ ...prev, members: s.size })), (e) => console.warn("DashboardStats users error:", e)),
      onSnapshot(q('emergencies'), s => {
        const activeDocs = s.docs.filter(doc => {
          const data = doc.data();
          if (data.status === 'resolved') return false;
          if (!data.timestamp) return true;
          const date = data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
          const diffHours = (new Date().getTime() - date.getTime()) / (1000 * 60 * 60);
          return diffHours <= 24;
        });
        setCounts(prev => ({ ...prev, emergencies: activeDocs.length }));
      }, (e) => console.warn("DashboardStats emergencies error:", e)),
      onSnapshot(q('koperasi'), s => setCounts(prev => ({ ...prev, koperasi: s.size })), (e) => console.warn("DashboardStats koperasi error:", e)),
      onSnapshot(q('projects'), s => setCounts(prev => ({ ...prev, projects: s.size })), (e) => console.warn("DashboardStats projects error:", e)),
      onSnapshot(q('announcements'), s => setCounts(prev => ({ ...prev, announcements: s.size })), (e) => console.warn("DashboardStats announcements error:", e)),
      onSnapshot(q('learning'), s => setCounts(prev => ({ ...prev, learning: s.size })), (e) => console.warn("DashboardStats learning error:", e))
    ];
    return () => unsubscribes.forEach(unsub => unsub());
  }, [profile?.tenantId, profile?.isApproved]);


  const enabledModules = tenant?.enabledModules || ['emergency', 'finance', 'social', 'directory', 'marketplace', 'announcements', 'chat', 'ai'];

  const kpis = [
    { id: 'directory', label: 'Warga', value: counts.members, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'emergency', label: 'SOS Aktif', value: counts.emergencies, icon: BellRing, color: 'text-rose-600', bg: 'bg-rose-50' },
    { id: 'koperasi', label: 'Koperasi', value: counts.koperasi, icon: Wallet, color: 'text-green-600', bg: 'bg-green-50' },
    { id: 'funding', label: 'Proyek', value: counts.projects, icon: Rocket, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'announcements', label: 'Warta', value: counts.announcements, icon: Megaphone, color: 'text-orange-600', bg: 'bg-orange-50' },
    { id: 'learning', label: 'Materi', value: counts.learning, icon: BookMarked, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ].filter(kpi => enabledModules.includes(kpi.id as any));

  if (loading) return <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 animate-pulse h-64" />;

  return (
    <div className="mb-3">
      <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
        {enabledModules.includes('finance') && (
          <>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Saldo Kas Komunitas</h2>
                <p className="text-xl font-black text-gray-900 tracking-tight mt-1">
                  Rp {balance.toLocaleString()}
                </p>
              </div>
            </div>
          </>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {kpis.map((kpi) => <StatCard key={kpi.id} {...kpi} onClick={onNavigate} />)}
        </div>
      </div>
    </div>
  );
}

