import { useState, useEffect, useMemo } from 'react';
import { Transaction, AppUser } from '../types';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Users, BellRing, Wallet, Rocket, Megaphone, BookMarked, Activity, TrendingUp } from 'lucide-react';
import { StatCard } from './molecules/StatCard';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from 'recharts';

interface DashboardStatsProps {
  onNavigate: (view: any) => void;
}

export default function DashboardStats({ onNavigate }: DashboardStatsProps) {
  const { profile, tenant } = useAuth();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ members: 0, emergencies: 0, koperasi: 0, projects: 0, announcements: 0, learning: 0 });
  const [rawTransactions, setRawTransactions] = useState<Transaction[]>([]);
  const [rawUsers, setRawUsers] = useState<AppUser[]>([]);
  const [rawEmergencies, setRawEmergencies] = useState<any[]>([]);

  useEffect(() => {
    if (!profile?.tenantId || !profile?.isApproved) return;
    const q = (path: string) => query(collection(db, path), where('tenantId', '==', profile.tenantId));
    const unsubscribes = [
      onSnapshot(q('transactions'), (snap) => {
        let total = 0;
        const txs: Transaction[] = [];
        snap.forEach(doc => { 
          const data = doc.data() as Transaction;
          total += data.type === 'credit' ? data.amount : -data.amount; 
          txs.push(data);
        });
        setBalance(total);
        setRawTransactions(txs);
        setLoading(false);
      }, (e) => {
        console.warn("DashboardStats transactions error:", e);
        setLoading(false);
      }),
      onSnapshot(q('users'), s => {
        setCounts(prev => ({ ...prev, members: s.size }));
        const usersData = s.docs.map(doc => doc.data() as AppUser);
        setRawUsers(usersData);
      }, (e) => console.warn("DashboardStats users error:", e)),
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
        setRawEmergencies(s.docs.map(doc => doc.data()));
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

  // Compute chart data for community growth
  const chartData = useMemo(() => {
    // Basic aggregation: last 6 months 
    const months = Array.from({length: 6}).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return { 
        name: d.toLocaleString('id-ID', { month: 'short' }), 
        year: d.getFullYear(), 
        month: d.getMonth(),
        warga: 0,
        kas: 0,
        sos: 0
      };
    });

    rawUsers.forEach(user => {
      if (user.createdAt) {
        const d = new Date(user.createdAt);
        const m = months.find(x => x.year === d.getFullYear() && x.month === d.getMonth());
        if (m) m.warga += 1;
      } else {
        // Fallback for older data without createdAt
        months[0].warga += 1; 
      }
    });

    // Accumulate sum of members over time
    let accumulatedWarga = 0;
    months.forEach(m => {
      accumulatedWarga += m.warga;
      m.warga = accumulatedWarga;
    });

    rawTransactions.forEach(tx => {
      const d = tx.date ? new Date(tx.date) : new Date();
      const m = months.find(x => x.year === d.getFullYear() && x.month === d.getMonth());
      if (m) {
        m.kas += (tx.type === 'credit' ? tx.amount : -tx.amount);
      }
    });

    rawEmergencies.forEach(e => {
      if (e.timestamp) {
        const date = e.timestamp.toDate ? e.timestamp.toDate() : new Date(e.timestamp);
        const m = months.find(x => x.year === date.getFullYear() && x.month === date.getMonth());
        if (m) m.sos += 1;
      }
    });

    // Accumulate sum of balance over time
    let accumulatedKas = 0;
    months.forEach(m => {
      accumulatedKas += m.kas;
      m.kas = accumulatedKas;
    });

    return months;
  }, [rawUsers, rawTransactions, rawEmergencies]);

  if (loading) return <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 animate-pulse h-64" />;

  return (
    <div className="mb-3 space-y-3">
      <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
        {enabledModules.includes('finance') && (
          <>
            <div className="flex justify-between items-start mb-3">
              <div>
                <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Saldo Kas Gotong Royong</h2>
                <p className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-0.5 tabular-nums">
                  Rp {balance.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {kpis.map((kpi) => <StatCard key={kpi.id} {...kpi} onClick={onNavigate} />)}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center">
            <TrendingUp size={12} />
          </div>
          <h2 className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Tren Perkembangan Warga</h2>
        </div>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorWarga" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorSos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
                itemStyle={{ fontWeight: 'bold' }}
              />
              <Area yAxisId="left" type="monotone" dataKey="warga" name="Warga" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorWarga)" />
              <Area yAxisId="left" type="monotone" dataKey="sos" name="SOS" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorSos)" />
              <Line yAxisId="right" type="monotone" dataKey="kas" name="Saldo Kas" stroke="#10b981" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

