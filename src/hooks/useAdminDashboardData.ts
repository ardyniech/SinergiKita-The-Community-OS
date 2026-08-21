import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { AppUser } from '../types';

export function useAdminDashboardData() {
  const { profile } = useAuth();
  const [pendingMembersCount, setPendingMembersCount] = useState(0);
  const [recentMembers, setRecentMembers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.tenantId) return;

    const q = query(
      collection(db, 'users'),
      where('tenantId', '==', profile.tenantId)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const allMembers = snap.docs.map(d => ({ id: d.id, ...d.data() } as AppUser));
      
      const pending = allMembers.filter(m => !m.isApproved || m.status === 'pending');
      setPendingMembersCount(pending.length);
      
      const recent = allMembers
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        .slice(0, 3);
      setRecentMembers(recent);
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile?.tenantId]);

  return { pendingMembersCount, recentMembers, loading };
}
