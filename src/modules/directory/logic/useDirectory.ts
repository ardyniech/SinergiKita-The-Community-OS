import { useState, useEffect, useRef } from 'react';
import { AppUser } from '../../../shared/models';
import { memberStorage } from '../storage/memberStorage';
import { dispatcher } from '../../../core/dispatcher';

export type FilterType = 'all' | 'active' | 'pending' | 'inactive';

export function useDirectory(tenantId: string | null) {
  const [members, setMembers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  
  const [editingMember, setEditingMember] = useState<AppUser | null>(null);
  const [deletingMember, setDeletingMember] = useState<AppUser | null>(null);

  useEffect(() => {
    if (!tenantId) return;
    return memberStorage.subscribeToMembers(tenantId, (data) => {
      setMembers(data);
      setLoading(false);
    });
  }, [tenantId]);

  const handleUpdateRole = async (memberId: string, role: any) => {
    await memberStorage.updateMember(memberId, { role });
    dispatcher.emit('AUDIT_LOG', `Updated member ${memberId} role to ${role}`);
  };

  const handleApprove = async (memberId: string) => {
    await memberStorage.updateMember(memberId, { isApproved: true, status: 'active' });
    dispatcher.emit('AUDIT_LOG', `Approved member ${memberId}`);
  };

  const filtered = members.filter(m => {
    const matchesSearch = (m.displayName || m.email || '').toLowerCase().includes(searchTerm.toLowerCase());
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

  return {
    members,
    loading,
    searchTerm,
    setSearchTerm,
    filter,
    setFilter,
    editingMember,
    setEditingMember,
    deletingMember,
    setDeletingMember,
    handleUpdateRole,
    handleApprove,
    filtered,
    stats
  };
}
