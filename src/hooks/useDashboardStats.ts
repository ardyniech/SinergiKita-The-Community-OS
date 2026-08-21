import { useState, useEffect, useMemo } from 'react';
import { Transaction, AppUser } from '../types';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Users, BellRing, Wallet, Rocket, Megaphone, BookMarked } from 'lucide-react';
import { getMemberLabel } from '../lib/terminology';

export function useDashboardStats() {
  const { profile, tenant } = useAuth();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ members: 0, emergencies: 0, koperasi: 0, projects: 0, announcements: 0, learning: 0 });
  const [rawTransactions, setRawTransactions] = useState<Transaction[]>([]);
  const [rawUsers, setRawUsers] = useState<AppUser[]>([]);
  const [rawEmergencies, setRawEmergencies] = useState<any[]>([]);
  
  const memberLabel = getMemberLabel(tenant?.type);

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
      onSnapshot(q('koperasi_loans'), s => setCounts(prev => ({ ...prev, koperasi: s.size })), (e) => console.warn("DashboardStats koperasi error:", e)),
      onSnapshot(q('funding_projects'), s => setCounts(prev => ({ ...prev, projects: s.size })), (e) => console.warn("DashboardStats projects error:", e)),
      onSnapshot(q('announcements'), s => setCounts(prev => ({ ...prev, announcements: s.size })), (e) => console.warn("DashboardStats announcements error:", e)),
      onSnapshot(q('learning_lessons'), s => setCounts(prev => ({ ...prev, learning: s.size })), (e) => console.warn("DashboardStats learning error:", e))
    ];
    return () => unsubscribes.forEach(unsub => unsub());
  }, [profile?.tenantId, profile?.isApproved]);

  const enabledModules = tenant?.enabledModules || ['emergency', 'finance', 'social', 'directory', 'marketplace', 'announcements', 'chat', 'ai'];

  const kpis = [
    { id: 'directory', label: memberLabel, value: counts.members, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'emergency', label: 'SOS Aktif', value: counts.emergencies, icon: BellRing, color: 'text-rose-600', bg: 'bg-rose-50' },
    { id: 'koperasi', label: 'Koperasi', value: counts.koperasi, icon: Wallet, color: 'text-green-600', bg: 'bg-green-50' },
    { id: 'funding', label: 'Proyek', value: counts.projects, icon: Rocket, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'announcements', label: 'Warta', value: counts.announcements, icon: Megaphone, color: 'text-orange-600', bg: 'bg-orange-50' },
    { id: 'learning', label: 'Materi', value: counts.learning, icon: BookMarked, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ].filter(kpi => enabledModules.includes(kpi.id as any));

  const chartData = useMemo(() => {
    const months = Array.from({length: 6}).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return { 
        name: d.toLocaleString('id-ID', { month: 'short' }), 
        year: d.getFullYear(), 
        month: d.getMonth(),
        growth: 0,
        kas: 0,
        sos: 0
      };
    });

    rawUsers.forEach(user => {
      if (user.createdAt) {
        const d = new Date(user.createdAt);
        const m = months.find(x => x.year === d.getFullYear() && x.month === d.getMonth());
        if (m) m.growth += 1;
      } else {
        months[0].growth += 1; 
      }
    });

    let accumulatedGrowth = 0;
    months.forEach(m => {
      accumulatedGrowth += m.growth;
      m.growth = accumulatedGrowth;
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

    let accumulatedKas = 0;
    months.forEach(m => {
      accumulatedKas += m.kas;
      m.kas = accumulatedKas;
    });

    return months;
  }, [rawUsers, rawTransactions, rawEmergencies]);

  return {
    balance,
    loading,
    kpis,
    chartData,
    enabledModules,
    memberLabel
  };
}
