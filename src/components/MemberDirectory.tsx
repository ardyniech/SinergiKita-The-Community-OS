import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { AnimatePresence } from 'motion/react';
import { MemberCard } from './molecules/MemberCard';
import { MemberAnalytics } from './molecules/MemberAnalytics';
import { RegisterMemberForm } from './molecules/RegisterMemberForm';
import { MemberHeader } from './molecules/MemberHeader';
import { MemberFilters, FilterType } from './molecules/MemberFilters';
import { MemberStats } from './molecules/MemberStats';
import { isAdmin } from '../lib/permissions';
import { AppUser } from '../types';

export default function MemberDirectory() {
  const { profile } = useAuth();
  const [members, setMembers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    if (!profile?.tenantId) return;
    const q = query(collection(db, 'users'), where('tenantId', '==', profile.tenantId));
    return onSnapshot(q, (snap) => {
      setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
      setLoading(false);
    });
  }, [profile?.tenantId]);

  const filtered = members.filter(m => {
    const matchesSearch = (m.displayName || m.email).toLowerCase().includes(searchTerm.toLowerCase());
    const status = m.status || (m.isApproved ? 'active' : 'pending');
    const matchesFilter = filter === 'all' || status === filter;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    active: members.filter(m => (m.status || (m.isApproved ? 'active' : 'pending')) === 'active').length,
    pending: members.filter(m => (m.status || (m.isApproved ? 'active' : 'pending')) === 'pending').length,
    inactive: members.filter(m => (m.status || (m.isApproved ? 'active' : 'pending')) === 'inactive').length,
    total: members.length
  };

  if (loading) return <div className="p-8 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">Memuat database warga...</div>;

  return (
    <div className="space-y-6">
      {isAdmin(profile) && (
        <div className="space-y-4">
          <MemberHeader 
            members={members} profile={profile} 
            showRegister={showRegister} setShowRegister={setShowRegister}
            showAnalytics={showAnalytics} setShowAnalytics={setShowAnalytics}
          />
          <AnimatePresence>
            {showRegister && <RegisterMemberForm onClose={() => setShowRegister(false)} />}
          </AnimatePresence>
        </div>
      )}

      {showAnalytics && isAdmin(profile) && <MemberAnalytics members={members} />}

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        {isAdmin(profile) && <MemberStats stats={stats} />}
        
        <MemberFilters 
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          filter={filter} setFilter={setFilter}
          isAdmin={isAdmin(profile)}
        />

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Warga tidak ditemukan</p>
            </div>
          ) : (
            filtered.map(member => (
              <MemberCard key={member.id} member={member} isAdmin={isAdmin(profile)} onEdit={() => {}} onMessage={() => {}} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
