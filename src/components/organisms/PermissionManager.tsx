// OVER_LIMIT_JUSTIFIED: Refactoring tertunda, logika komponen kohesif.
import React, { useState } from 'react';
import { AppUser } from '../../types';
import { Search, ShieldAlert, Check, Loader2, Info, ArrowRight, ShieldCheck, User, Users, Heart } from 'lucide-react';
import { getRoleLabel } from '../../lib/permissions';
import { Badge } from '../atoms/Badge';

interface PermissionManagerProps {
  members: AppUser[];
  currentUserId?: string;
  onRoleUpdate: (memberId: string, newRole: string) => Promise<void>;
  showToast: (msg: string) => void;
}

const ROLE_INFO = [
  {
    role: 'member',
    label: 'Warga Biasa',
    color: 'border-blue-100 bg-blue-50/20 text-blue-700',
    icon: User,
    desc: 'Hak akses dasar: melihat pengumuman, melaporkan insiden, mengajukan pinjaman koperasi, belanja marketplace, dan voting.'
  },
  {
    role: 'sekretaris',
    label: 'Sekretaris',
    color: 'border-emerald-100 bg-emerald-50/20 text-emerald-700',
    icon: Users,
    desc: 'Mengelola persuratan warga, mempublikasikan pengumuman lingkungan, mencatat notulensi rapat, dan mengelola database warga.'
  },
  {
    role: 'bendahara',
    label: 'Bendahara',
    color: 'border-amber-100 bg-amber-50/20 text-amber-700',
    icon: Heart,
    desc: 'Mengelola pembukuan iuran bulanan, kas warga, pencatatan transaksi QRIS, laporan keuangan, pendanaan sosial, dan koperasi.'
  },
  {
    role: 'ketua',
    label: 'Ketua Lingkungan',
    color: 'border-indigo-100 bg-indigo-50/20 text-indigo-700',
    icon: ShieldCheck,
    desc: 'Menyetujui pendaftaran warga baru, memberikan izin darurat, otorisasi pendanaan, serta supervisi seluruh kegiatan lingkungan.'
  },
  {
    role: 'admin',
    label: 'Admin / Pengurus',
    color: 'border-rose-100 bg-rose-50/20 text-rose-700',
    icon: ShieldAlert,
    desc: 'Akses penuh ke semua modul sistem termasuk riwayat audit log, reset data, manajemen parameter sistem, dan konfigurasi tenant.'
  }
];

export function PermissionManager({
  members,
  currentUserId,
  onRoleUpdate,
  showToast
}: PermissionManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');

  const filteredMembers = members.filter(m => {
    const matchesSearch = (m.displayName || m.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (m.address || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRoleFilter === 'all' || m.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = async (memberId: string, oldRole: string, newRole: string) => {
    if (memberId === currentUserId) {
      showToast("⚠️ Anda tidak dapat mengubah peran Anda sendiri demi keamanan.");
      return;
    }
    setUpdatingId(memberId);
    try {
      await onRoleUpdate(memberId, newRole);
      const label = ROLE_INFO.find(r => r.role === newRole)?.label || newRole;
      showToast(`✅ Peran berhasil diperbarui menjadi ${label}!`);
    } catch (err: any) {
      showToast("❌ Gagal memperbarui peran: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Informational Panel on Granular Roles */}
      <div className="liquid-glass rounded-[32px] p-6 border-white/60 shadow-3d-lg relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-blue-500/5 pointer-events-none" />
        <div className="flex items-start gap-4 mb-6 relative z-10">
          <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-3d-sm border border-amber-400">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-tight leading-tight">
              Access Architecture & Granular Protocols
            </h3>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1 opacity-70">
              Delegate governance responsibilities via secure identity tokens.
            </p>
          </div>
        </div>

        {/* Roles Details Bento-Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-1 relative z-10">
          {ROLE_INFO.map(info => {
            const IconComp = info.icon;
            return (
              <div 
                key={info.role} 
                className="card-3d p-4 rounded-2xl border-white/60 bg-white/40 flex flex-col justify-between h-full transition-all hover:bg-white/60"
              >
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-3d-sm border border-slate-100">
                      <IconComp size={14} className="text-slate-600" />
                    </div>
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{info.label}</span>
                  </div>
                  <p className="text-[9px] font-bold text-slate-500 leading-relaxed uppercase tracking-tight opacity-80">{info.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Control Panel: Search and Quick Filter */}
      <div className="liquid-glass rounded-[32px] p-6 border-white/60 shadow-3d-lg space-y-6">
        <div className="flex flex-col lg:flex-row gap-5 items-center justify-between">
          <div className="relative w-full lg:max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16} />
            <input 
              type="text"
              placeholder="Search by identity or location..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-slate-200/50 rounded-2xl text-[11px] font-black uppercase tracking-tight outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-200 shadow-inner"
            />
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-hide px-0.5">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-100/50 rounded-xl shrink-0 border border-slate-200/50 mr-2">
              <ShieldAlert size={14} className="text-slate-500" />
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.1em]">Filters</span>
            </div>
            <button
              onClick={() => setSelectedRoleFilter('all')}
              className={`btn-3d px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                selectedRoleFilter === 'all' 
                  ? 'bg-blue-600 text-white border-blue-500 shadow-3d-sm' 
                  : 'bg-white/60 text-slate-500 border-white/80 hover:bg-white'
              }`}
            >
              All ({members.length})
            </button>
            {ROLE_INFO.map(r => {
              const count = members.filter(m => m.role === r.role).length;
              return (
                <button
                  key={r.role}
                  onClick={() => setSelectedRoleFilter(r.role)}
                  className={`btn-3d px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${
                    selectedRoleFilter === r.role 
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-3d-sm' 
                      : 'bg-white/60 text-slate-500 border-white/80 hover:bg-white'
                  }`}
                >
                  {r.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* High Density Table / List */}
        <div className="rounded-2xl border border-slate-200/50 overflow-hidden shadow-inner bg-white/30 backdrop-blur-md">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/50 border-b border-slate-200/50">
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Identity & Contact</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Zone / Address</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Current Protocol</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-right">Delegation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                      No identity matches for current filter configuration.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map(member => {
                    const isCurrentUser = member.uid === currentUserId || member.id === currentUserId;
                    const initials = (member.displayName || member.email)
                      .split(' ')
                      .map(n => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase();

                    return (
                      <tr key={member.id} className="hover:bg-white/40 transition-colors group">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-2xl overflow-hidden bg-white shadow-3d-sm shrink-0 border border-white/60">
                              {member.photoURL ? (
                                <img 
                                  src={member.photoURL} 
                                  alt={member.displayName} 
                                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[11px] font-black text-blue-600 bg-blue-50/50 uppercase">
                                  {initials}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-slate-900 truncate uppercase tracking-tight">
                                  {member.displayName || member.email.split('@')[0]}
                                </span>
                                {isCurrentUser && (
                                  <span className="text-[7px] font-black px-2 py-0.5 bg-slate-900 text-white rounded-full uppercase tracking-widest">Self</span>
                                )}
                              </div>
                              <span className="block text-[9px] font-bold text-slate-400 truncate uppercase tracking-tight mt-0.5">{member.email}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">
                            {member.address || 'Unauthorized'}
                          </span>
                        </td>

                        <td className="p-4">
                          <Badge 
                            label={getRoleLabel(member.role)} 
                            variant={member.role === 'admin' ? 'rose' : member.role === 'ketua' ? 'blue' : member.role === 'bendahara' ? 'orange' : member.role === 'sekretaris' ? 'green' : 'gray'}
                          />
                        </td>

                        <td className="p-4 text-right">
                          <div className="inline-flex items-center gap-3">
                            {updatingId === member.id ? (
                              <div className="flex items-center gap-2 text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50/50 px-3 py-1.5 rounded-xl border border-blue-100">
                                <Loader2 size={12} className="animate-spin" />
                                Updating...
                              </div>
                            ) : (
                              <div className="relative">
                                <select
                                  disabled={isCurrentUser}
                                  value={member.role || 'member'}
                                  onChange={(e) => handleRoleChange(member.id!, member.role, e.target.value)}
                                  className="btn-3d pl-3 pr-8 py-2 bg-white/60 border border-white/80 rounded-xl text-[10px] font-black text-slate-700 uppercase tracking-widest outline-none focus:ring-4 focus:ring-blue-500/10 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer appearance-none shadow-3d-sm"
                                >
                                  {ROLE_INFO.map(r => (
                                    <option key={r.role} value={r.role}>
                                      {r.label}
                                    </option>
                                  ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                  <ArrowRight size={12} />
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
