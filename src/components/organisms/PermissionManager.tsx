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
    <div className="space-y-4">
      {/* Informational Panel on Granular Roles */}
      <div className="bg-gradient-to-r from-amber-50/80 to-blue-50/50 rounded-2xl p-4 border border-amber-100/60 shadow-xs">
        <div className="flex items-start gap-2.5 mb-3">
          <div className="p-1 bg-amber-100 text-amber-700 rounded-lg shrink-0 mt-0.5">
            <Info size={14} />
          </div>
          <div>
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider font-sans">
              Panduan Hak Akses & Peran Granular
            </h3>
            <p className="text-[10px] text-gray-500 font-medium leading-relaxed mt-0.5">
              Sebagai Admin, Anda dapat mendelegasikan tanggung jawab kepengurusan lingkungan kepada warga tertentu secara aman dan langsung.
            </p>
          </div>
        </div>

        {/* Roles Details Bento-Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
          {ROLE_INFO.map(info => {
            const IconComp = info.icon;
            return (
              <div 
                key={info.role} 
                className={`p-3 rounded-xl border ${info.color} flex flex-col justify-between h-full transition-all hover:scale-[1.01]`}
              >
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <IconComp size={14} className="shrink-0" />
                    <span className="text-[10px] font-black uppercase tracking-wider">{info.label}</span>
                  </div>
                  <p className="text-[9px] font-medium leading-relaxed opacity-90">{info.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Control Panel: Search and Quick Filter */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
              type="text"
              placeholder="Cari warga berdasarkan nama / alamat..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50/50 border border-gray-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 font-medium transition-all"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Filter Peran:</span>
            <button
              onClick={() => setSelectedRoleFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                selectedRoleFilter === 'all' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100'
              }`}
            >
              Semua ({members.length})
            </button>
            {ROLE_INFO.map(r => {
              const count = members.filter(m => m.role === r.role).length;
              return (
                <button
                  key={r.role}
                  onClick={() => setSelectedRoleFilter(r.role)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                    selectedRoleFilter === r.role 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100'
                  }`}
                >
                  {r.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* High Density Table / List */}
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="p-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Nama & Kontak</th>
                  <th className="p-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Alamat / No. Rumah</th>
                  <th className="p-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Peran Saat Ini</th>
                  <th className="p-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Delegasi Peran Baru</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-xs text-gray-400 font-bold uppercase tracking-wider">
                      Tidak ada warga yang cocok dengan pencarian / filter peran.
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
                      <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                              {member.photoURL ? (
                                <img 
                                  src={member.photoURL} 
                                  alt={member.displayName} 
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-blue-600 bg-blue-50 uppercase">
                                  {initials}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-black text-gray-900 truncate">
                                  {member.displayName || member.email.split('@')[0]}
                                </span>
                                {isCurrentUser && (
                                  <span className="text-[7px] font-black px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full uppercase">Anda</span>
                                )}
                              </div>
                              <span className="block text-[9px] font-bold text-gray-400 truncate">{member.email}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3 text-xs font-bold text-gray-500">
                          {member.address || 'Belum diisi'}
                        </td>

                        <td className="p-3">
                          <Badge 
                            label={getRoleLabel(member.role)} 
                            variant={member.role === 'admin' ? 'rose' : member.role === 'ketua' ? 'blue' : member.role === 'bendahara' ? 'orange' : member.role === 'sekretaris' ? 'green' : 'gray'}
                          />
                        </td>

                        <td className="p-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {updatingId === member.id ? (
                              <div className="flex items-center gap-1 text-[9px] font-bold text-blue-600 uppercase tracking-wider px-2">
                                <Loader2 size={12} className="animate-spin" />
                                Memperbarui...
                              </div>
                            ) : (
                              <select
                                disabled={isCurrentUser}
                                value={member.role || 'member'}
                                onChange={(e) => handleRoleChange(member.id!, member.role, e.target.value)}
                                className="px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[10px] font-black text-gray-700 uppercase tracking-wider outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:bg-gray-100 cursor-pointer"
                              >
                                {ROLE_INFO.map(r => (
                                  <option key={r.role} value={r.role}>
                                    {r.label}
                                  </option>
                                ))}
                              </select>
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
