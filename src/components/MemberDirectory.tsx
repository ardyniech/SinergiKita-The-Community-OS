import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AnimatePresence, motion } from 'motion/react';
import { MemberCard } from './molecules/MemberCard';
import { MemberAnalytics } from './molecules/MemberAnalytics';
import { RegisterMemberForm } from './molecules/RegisterMemberForm';
import { MemberHeader } from './molecules/MemberHeader';
import { MemberFilters, FilterType } from './molecules/MemberFilters';
import { MemberStats } from './molecules/MemberStats';
import { isAdmin } from '../lib/permissions';
import { AppUser } from '../types';
import { X, Save, CheckCircle, Loader2 } from 'lucide-react';

export default function MemberDirectory() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [members, setMembers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  
  const [editingMember, setEditingMember] = useState<AppUser | null>(null);
  const [editForm, setEditForm] = useState({
    displayName: '',
    phoneNumber: '',
    address: '',
    role: 'member' as any,
    status: 'active' as any,
    isApproved: true,
    isCritical: false,
    observations: ''
  });
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    if (!profile?.tenantId) return;
    const q = query(collection(db, 'users'), where('tenantId', '==', profile.tenantId));
    return onSnapshot(q, (snap) => {
      setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
      setLoading(false);
    });
  }, [profile?.tenantId]);

  const handleEditClick = (member: AppUser) => {
    setEditingMember(member);
    setEditForm({
      displayName: member.displayName || '',
      phoneNumber: member.phoneNumber || '',
      address: member.address || '',
      role: member.role || 'member',
      status: member.status || (member.isApproved ? 'active' : 'pending'),
      isApproved: member.isApproved !== undefined ? member.isApproved : true,
      isCritical: member.isCritical || false,
      observations: member.observations || ''
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember?.id) return;

    setSaveLoading(true);
    try {
      await updateDoc(doc(db, 'users', editingMember.id), {
        displayName: editForm.displayName.trim(),
        phoneNumber: editForm.phoneNumber.trim(),
        address: editForm.address.trim(),
        role: editForm.role,
        status: editForm.status,
        isApproved: editForm.isApproved,
        isCritical: editForm.isCritical,
        observations: editForm.observations.trim()
      });
      showToast(`Data warga ${editForm.displayName} berhasil diperbarui.`);
      setEditingMember(null);
    } catch (err: any) {
      showToast("Gagal memperbarui data warga: " + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleApproveInstant = async () => {
    if (!editingMember?.id) return;
    setSaveLoading(true);
    try {
      await updateDoc(doc(db, 'users', editingMember.id), {
        isApproved: true,
        status: 'active'
      });
      showToast(`✅ Warga ${editForm.displayName || 'ini'} telah disetujui bergabung!`);
      setEditingMember(null);
    } catch (err: any) {
      showToast("Gagal menyetujui warga: " + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleMessage = (name: string, phone?: string) => {
    if (phone) {
      showToast(`📲 Membuka WhatsApp untuk menghubungi ${name} (${phone})...`);
      const formatted = phone.replace(/[^0-9]/g, '');
      const cleanPhone = formatted.startsWith('0') ? '62' + formatted.slice(1) : formatted;
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
    } else {
      showToast(`💬 Mengirim pesan internal ke ${name}...`);
    }
  };

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
              <MemberCard 
                key={member.id} 
                member={member} 
                isAdmin={isAdmin(profile)} 
                onEdit={handleEditClick} 
                onMessage={handleMessage} 
              />
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {editingMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Kelola Data Warga</h3>
                <button onClick={() => setEditingMember(null)} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
                {!editForm.isApproved && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-[10px] font-bold text-amber-800 uppercase tracking-wider font-sans">Menunggu Persetujuan</h4>
                      <p className="text-[10px] text-amber-600 font-medium">Warga ini belum disetujui bergabung.</p>
                    </div>
                    <button 
                      type="button"
                      onClick={handleApproveInstant}
                      disabled={saveLoading}
                      className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-amber-700 transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle size={12} /> Setujui Sekarang
                    </button>
                  </div>
                )}

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nama Lengkap</label>
                    <input 
                      type="text" 
                      required
                      className="w-full p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                      value={editForm.displayName}
                      onChange={e => setEditForm({...editForm, displayName: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">No. WhatsApp</label>
                      <input 
                        type="tel" 
                        required
                        className="w-full p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                        value={editForm.phoneNumber}
                        onChange={e => setEditForm({...editForm, phoneNumber: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Blok / No. Rumah</label>
                      <input 
                        type="text" 
                        required
                        className="w-full p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                        value={editForm.address}
                        onChange={e => setEditForm({...editForm, address: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Peran (Role)</label>
                      <select 
                        className="w-full p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-gray-700"
                        value={editForm.role}
                        onChange={e => setEditForm({...editForm, role: e.target.value as any})}
                      >
                        <option value="member">Warga Biasa</option>
                        <option value="admin">Admin / Pengurus</option>
                        <option value="ketua">Ketua Lingkungan</option>
                        <option value="bendahara">Bendahara</option>
                        <option value="sekretaris">Sekretaris</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status Keanggotaan</label>
                      <select 
                        className="w-full p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-gray-700"
                        value={editForm.status}
                        onChange={e => setEditForm({...editForm, status: e.target.value as any, isApproved: e.target.value === 'active'})}
                      >
                        <option value="active">Aktif (Approved)</option>
                        <option value="pending">Tertunda (Pending)</option>
                        <option value="inactive">Nonaktif</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Catatan Pengamatan / Keterangan</label>
                    <textarea 
                      rows={2}
                      className="w-full p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                      placeholder="Catatan khusus, misal: 'Aktif gotong royong' atau kondisi tertentu."
                      value={editForm.observations}
                      onChange={e => setEditForm({...editForm, observations: e.target.value})}
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input 
                      type="checkbox" 
                      id="isCritical"
                      className="w-4 h-4 text-blue-600 border-gray-200 rounded-sm focus:ring-blue-500/20"
                      checked={editForm.isCritical}
                      onChange={e => setEditForm({...editForm, isCritical: e.target.checked})}
                    />
                    <label htmlFor="isCritical" className="text-[10px] font-bold text-red-600 uppercase tracking-wider cursor-pointer select-none font-sans">
                      ⚠️ Butuh Perhatian Khusus (SOS/Bantuan)
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setEditingMember(null)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    disabled={saveLoading}
                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-md shadow-blue-100"
                  >
                    {saveLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
