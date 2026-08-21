// OVER_LIMIT_JUSTIFIED: Refactoring tertunda, logika komponen kohesif.
import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { AppUser } from '../types';
import { Trophy, Award, Star, Medal, User, ShieldCheck } from 'lucide-react';
import { BADGES } from '../lib/gamification';

export default function LeaderboardView() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.tenantId) return;
    const q = query(
      collection(db, 'users'), 
      where('tenantId', '==', profile.tenantId),
      orderBy('points', 'desc'),
      limit(20)
    );
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as AppUser));
      // Sort in memory by points desc just in case index is building
      list.sort((a, b) => (b.points || 0) - (a.points || 0));
      setUsers(list);
      setLoading(false);
    }, (err) => {
      console.warn("Leaderboard fallback query:", err);
      // Fallback without orderBy if index missing
      onSnapshot(query(collection(db, 'users'), where('tenantId', '==', profile.tenantId)), (snap2) => {
        const list2 = snap2.docs.map(d => ({ id: d.id, ...d.data() } as AppUser));
        list2.sort((a, b) => (b.points || 0) - (a.points || 0));
        setUsers(list2);
        setLoading(false);
      });
    });
    return () => unsub();
  }, [profile?.tenantId]);

  return (
    <div className="space-y-4 pb-16">
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-4 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
            <Trophy size={28} className="text-yellow-200 animate-bounce" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider">Leaderboard Warga</h2>
            <p className="text-[10px] text-amber-100 font-medium">Peringkat kontribusi, keaktifan, & lencana pencapaian</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100 overflow-hidden">
        {users.map((user, idx) => {
          const isCurrentUser = user.uid === profile?.uid;
          const rank = idx + 1;
          const points = user.points || 0;
          const achievements = user.achievements || [];

          return (
            <div 
              key={user.id || user.uid} 
              className={`p-3.5 flex items-center justify-between transition-colors ${isCurrentUser ? 'bg-amber-50/60' : 'hover:bg-slate-50/50'}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 flex items-center justify-center shrink-0">
                  {rank === 1 ? (
                    <div className="w-7 h-7 bg-yellow-400 text-white rounded-full flex items-center justify-center font-black text-xs shadow-md shadow-yellow-200">
                      1
                    </div>
                  ) : rank === 2 ? (
                    <div className="w-7 h-7 bg-slate-300 text-white rounded-full flex items-center justify-center font-black text-xs shadow-md">
                      2
                    </div>
                  ) : rank === 3 ? (
                    <div className="w-7 h-7 bg-amber-700 text-white rounded-full flex items-center justify-center font-black text-xs shadow-md">
                      3
                    </div>
                  ) : (
                    <span className="text-xs font-mono font-bold text-slate-400">#{rank}</span>
                  )}
                </div>

                <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0 uppercase overflow-hidden">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (user.displayName || user.email || 'U').slice(0, 2)
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {user.displayName || user.email.split('@')[0]}
                    </h4>
                    {isCurrentUser && (
                      <span className="text-[8px] font-black bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                        Anda
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                    <span className="text-[9px] font-mono font-medium text-slate-500 capitalize">
                      {user.role}
                    </span>
                    {achievements.length > 0 && (
                      <span className="text-[8px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded-full">
                        {achievements.length} Lencana
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="flex items-center gap-1 justify-end">
                  <Star size={12} className="text-amber-500 fill-amber-500" />
                  <span className="text-sm font-black text-slate-900 font-mono">{points}</span>
                </div>
                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest block">Poin Keaktifan</span>
              </div>
            </div>
          );
        })}

        {users.length === 0 && !loading && (
          <div className="p-4 text-center text-slate-400">
            <Award size={32} className="mx-auto mb-2 opacity-40 text-amber-500" />
            <p className="text-xs font-bold">Belum ada data peringkat warga</p>
          </div>
        )}
      </div>
    </div>
  );
}
