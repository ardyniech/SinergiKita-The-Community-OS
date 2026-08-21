import React from 'react';
import { useDirectory } from '../logic/useDirectory';
import { MemberCard } from './MemberCard';
import { MemberStats } from './MemberStats';
import { MemberFilters } from './MemberFilters';
import { useAuth } from '../../../context/AuthContext';
import { AppUser } from '../../../shared/models';

export const DirectoryContainer: React.FC = () => {
  const { profile } = useAuth();
  const { 
    filtered, 
    stats, 
    searchTerm, 
    setSearchTerm, 
    filter, 
    setFilter,
    loading 
  } = useDirectory(profile?.tenantId || null);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin' || profile?.role === 'ketua';

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="liquid-glass rounded-[40px] p-4 sm:p-6 shadow-3d-lg border-white/60">
      {isAdmin && (
        <div className="mb-8">
          <MemberStats stats={stats} />
        </div>
      )}

      <div className="mb-8">
        <MemberFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filter={filter}
          setFilter={setFilter}
          isAdmin={isAdmin}
        />
      </div>

      <div className="space-y-5">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Warga tidak ditemukan</p>
          </div>
        ) : (
          filtered.map(member => (
            <MemberCard
              key={member.id || member.uid}
              member={member}
              isAdmin={isAdmin}
              currentUserId={profile?.uid}
              onEdit={() => {}}
              onMessage={() => {}}
              onCapturePhoto={() => {}}
            />
          ))
        )}
      </div>
    </div>
  );
};
