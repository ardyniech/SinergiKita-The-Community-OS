import { useState, useEffect } from 'react';
import { SocialAlert, Proposal } from '../types';
import Voting from './Voting';
import { useToast } from '../context/ToastContext';
import { useAudit } from '../context/AuditContext';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot, updateDoc, doc, increment, addDoc, serverTimestamp, orderBy, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Heart, Plus, Loader2, FileCheck2, Landmark, HelpCircle, Eye, CheckCircle2, History, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SantunanClaim {
  id: string;
  recipientName: string;
  type: 'Kematian' | 'Sakit' | 'Pendidikan' | 'Bencana';
  amount: number;
  reason: string;
  status: 'pending' | 'verified' | 'rejected' | 'distributed';
  createdBy: string;
  createdByUid: string;
  verifiedBy?: string;
  verifiedAt?: any;
  distributedAt?: any;
  transactionId?: string;
  tenantId: string;
  createdAt?: string;
}

export default function SocialModule() {
  const { showToast } = useToast();
  const { addAuditEntry } = useAudit();
  const { profile } = useAuth();
  
  const [activeSubTab, setActiveSubTab] = useState<'info' | 'claims'>('info');
  const [alerts, setAlerts] = useState<SocialAlert[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [claims, setClaims] = useState<SantunanClaim[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Alert form
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [newAlert, setNewAlert] = useState({ title: '', description: '' });
  const [submittingAlert, setSubmittingAlert] = useState(false);

  // Claim form
  const [showAddClaim, setShowAddClaim] = useState(false);
  const [newClaim, setNewClaim] = useState({
    recipientName: '',
    type: 'Kematian' as 'Kematian' | 'Sakit' | 'Pendidikan' | 'Bencana',
    amount: '',
    reason: ''
  });
  const [submittingClaim, setSubmittingClaim] = useState(false);

  useEffect(() => {
    if (!profile?.tenantId || !profile?.isApproved) return;

    // 1. Listen for Social Alerts (Info Musibah / Santunan)
    const qAlerts = query(
      collection(db, 'social_alerts'), 
      where('tenantId', '==', profile.tenantId),
      orderBy('createdAt', 'desc')
    );
    const unsubAlerts = onSnapshot(qAlerts, (snap) => {
      setAlerts(snap.docs.map(d => ({ id: d.id, ...d.data() } as SocialAlert)));
      setLoading(false);
    });

    // 2. Listen for Proposals (Voting)
    const qProps = query(
      collection(db, 'proposals'), 
      where('tenantId', '==', profile.tenantId)
    );
    const unsubProps = onSnapshot(qProps, (snap) => {
      setProposals(snap.docs.map(d => ({ id: d.id, ...d.data() } as Proposal)));
    });

    // 3. Listen for Santunan Claims
    const qClaims = query(
      collection(db, 'santunan_claims'),
      where('tenantId', '==', profile.tenantId)
    );
    const unsubClaims = onSnapshot(qClaims, (snap) => {
      const claimData: SantunanClaim[] = [];
      snap.forEach(doc => {
        claimData.push({ id: doc.id, ...doc.data() } as SantunanClaim);
      });
      setClaims(claimData);
    });

    return () => {
      unsubAlerts();
      unsubProps();
      unsubClaims();
    };
  }, [profile?.tenantId, profile?.isApproved]);

  const handleHelp = async (alertId: string, title: string) => {
    showToast(`Terima kasih telah menawarkan bantuan untuk "${title}".`);
    addAuditEntry(`Offered help: ${title}`);
    try {
      await updateDoc(doc(db, 'social_alerts', alertId), {
        helpers: increment(1)
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddAlert = async () => {
    if (!newAlert.title || !newAlert.description || !profile?.tenantId) return;
    setSubmittingAlert(true);
    try {
      await addDoc(collection(db, 'social_alerts'), {
        tenantId: profile.tenantId,
        uid: profile.uid,
        userName: profile.displayName || profile.email.split('@')[0],
        title: newAlert.title,
        description: newAlert.description,
        severity: 'medium',
        helpers: 0,
        createdAt: serverTimestamp()
      });
      addAuditEntry(`Published social info: ${newAlert.title}`);
      showToast("Info santunan dipublikasikan.");
      setNewAlert({ title: '', description: '' });
      setShowAddAlert(false);
    } catch (err) {
      showToast("Gagal memublikasikan.");
    } finally {
      setSubmittingAlert(false);
    }
  };

  const handleVote = async (id: string, type: 'yes' | 'no') => {
    try {
      const proposal = proposals.find(p => p.id === id);
      await updateDoc(doc(db, 'proposals', id), {
        [type === 'yes' ? 'yesVotes' : 'noVotes']: increment(1)
      });
      addAuditEntry(`Voted ${type.toUpperCase()} on proposal: ${proposal?.title || id}`);
      showToast("Vote berhasil dicatat.");
    } catch (err) {
      showToast("Gagal mencatat vote.");
    }
  };

  const handleAddClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    const { recipientName, type, amount, reason } = newClaim;
    if (!recipientName || !amount || !reason || !profile?.tenantId) return;

    // Check for potential duplicate claim to prevent fraud / double payout
    const isPotentialDuplicate = claims.some(c => 
      c.recipientName.toLowerCase().trim() === recipientName.toLowerCase().trim() &&
      c.type === type &&
      c.status !== 'rejected'
    );

    if (isPotentialDuplicate) {
      const proceed = window.confirm(`⚠ PERINGATAN ANTI-FRAUD:\nWarga bernama "${recipientName}" sudah memiliki pengajuan klaim aktif untuk kategori "${type}".\nApakah Anda yakin ingin mengajukan duplikasi ini?`);
      if (!proceed) return;
    }

    setSubmittingClaim(true);
    try {
      await addDoc(collection(db, 'santunan_claims'), {
        tenantId: profile.tenantId,
        recipientName: recipientName.trim(),
        type,
        amount: Number(amount),
        reason,
        status: 'pending',
        createdBy: profile.displayName || profile.email,
        createdByUid: profile.uid,
        createdAt: new Date().toISOString()
      });

      addAuditEntry(`Applied for social grant (santunan): ${recipientName} - ${type} - Rp ${Number(amount).toLocaleString()}`);
      showToast("Permohonan bantuan berhasil diajukan & sedang diverifikasi pengurus.");
      setNewClaim({ recipientName: '', type: 'Kematian', amount: '', reason: '' });
      setShowAddClaim(false);
    } catch (err: any) {
      showToast("Gagal mengajukan: " + err.message);
    } finally {
      setSubmittingClaim(false);
    }
  };

  const handleVerifyClaim = async (claimId: string, status: 'verified' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'santunan_claims', claimId), {
        status,
        verifiedBy: profile?.displayName || profile?.email,
        verifiedAt: new Date().toISOString()
      });

      addAuditEntry(`Verified claim id ${claimId} with status: ${status}`);
      showToast(`Permohonan santunan berhasil di-${status === 'verified' ? 'SETUJUI' : 'TOLAK'}.`);
    } catch (err: any) {
      showToast("Gagal memverifikasi: " + err.message);
    }
  };

  const handleDistributeClaim = async (claim: SantunanClaim) => {
    try {
      // 1. Mark claim as distributed in santunan_claims
      await updateDoc(doc(db, 'santunan_claims', claim.id), {
        status: 'distributed',
        distributedAt: new Date().toISOString()
      });

      // 2. Automatically generate a debit (expense) transaction in official community ledger
      const txRef = await addDoc(collection(db, 'transactions'), {
        tenantId: profile?.tenantId,
        description: `[SANTUNAN SOSIAL] Penyaluran Dana: ${claim.recipientName} (${claim.type})`,
        amount: claim.amount,
        type: 'debit',
        date: new Date().toISOString().split('T')[0],
        createdAt: serverTimestamp(),
        recordedBy: `Sistem Sosial otomatis via ${profile?.displayName || profile?.email}`
      });

      // Update claim with ledger reference
      await updateDoc(doc(db, 'santunan_claims', claim.id), {
        transactionId: txRef.id
      });

      addAuditEntry(`Distributed social grant of Rp ${claim.amount.toLocaleString()} to ${claim.recipientName}`);
      showToast(`Dana santunan Rp ${claim.amount.toLocaleString()} berhasil disalurkan & tercatat otomatis di Buku Kas!`);
    } catch (err: any) {
      showToast("Gagal mendistribusikan dana: " + err.message);
    }
  };

  const handleDeleteClaim = async (id: string) => {
    if (!window.confirm("Hapus catatan permohonan ini?")) return;
    try {
      await deleteDoc(doc(db, 'santunan_claims', id));
      showToast("Catatan dihapus.");
    } catch (err: any) {
      showToast("Gagal menghapus: " + err.message);
    }
  };

  const isAdminRole = ['superadmin', 'admin', 'ketua', 'bendahara'].includes(profile?.role || '');

  // Calculate stats for target vs achievement
  const totalDistributed = claims.filter(c => c.status === 'distributed').reduce((sum, c) => sum + c.amount, 0);
  const targetSantunan = 10000000; // 10 Million Rupiah
  const percentAchievement = Math.min(100, Math.round((totalDistributed / targetSantunan) * 100));

  if (loading) return <div className="p-8 text-center text-[10px] text-gray-400">Memuat modul sosial...</div>;

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm mb-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Sinergi Sosial</h2>
          <p className="text-sm font-black text-gray-900 uppercase">Santunan & Kepedulian</p>
        </div>
        <div className="flex bg-gray-50 p-1 rounded-lg gap-1 border border-gray-100">
          <button 
            onClick={() => setActiveSubTab('info')}
            className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-all ${activeSubTab === 'info' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            Info & Voting
          </button>
          <button 
            onClick={() => setActiveSubTab('claims')}
            className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-all ${activeSubTab === 'claims' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            Klaim Santunan
          </button>
        </div>
      </div>

      {/* Target & Achievements Indicator (Based on Real Distributed claims!) */}
      <div className="bg-gradient-to-br from-indigo-50 to-violet-50 p-3.5 rounded-xl border border-indigo-100 mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <h3 className="text-[9px] font-black text-indigo-800 uppercase tracking-widest flex items-center gap-1">
            <Landmark size={12} /> Penyaluran Dana Santunan Warga
          </h3>
          <span className="text-[9px] font-black text-indigo-700 uppercase">Target: Rp 10jt / Semester</span>
        </div>
        <div className="h-2 w-full bg-white rounded-full overflow-hidden mb-2 shadow-inner border border-indigo-100">
          <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${percentAchievement}%` }} />
        </div>
        <div className="flex justify-between items-center">
          <p className="text-[8px] font-bold text-indigo-500 uppercase">Dana Tersalurkan Riil (Auto Audit)</p>
          <p className="text-[10px] font-black text-indigo-900">Rp {totalDistributed.toLocaleString()} ({percentAchievement}%)</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* SUBTAB 1: INFO & VOTING */}
        {activeSubTab === 'info' && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Kabar Musibah & Kebaikan</h3>
              <button 
                onClick={() => setShowAddAlert(!showAddAlert)}
                className="text-[9px] bg-rose-50 text-rose-600 px-2.5 py-1 rounded-lg flex items-center gap-1.5 hover:bg-rose-100 transition-colors font-black uppercase tracking-wider"
              >
                <Plus size={12} /> Buat Info
              </button>
            </div>

            <AnimatePresence>
              {showAddAlert && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-rose-50/50 p-3 rounded-xl space-y-2 border border-rose-100 overflow-hidden"
                >
                  <input 
                    type="text" 
                    placeholder="Judul Berita (misal: Sembako untuk Kebakaran)" 
                    className="w-full text-xs p-2.5 bg-white border border-rose-200 rounded-lg outline-none focus:ring-2 focus:ring-rose-400"
                    value={newAlert.title}
                    onChange={e => setNewAlert({...newAlert, title: e.target.value})}
                  />
                  <textarea 
                    placeholder="Tulis detail bantuan yang diperlukan..." 
                    className="w-full text-xs p-2.5 bg-white border border-rose-200 rounded-lg outline-none focus:ring-2 focus:ring-rose-400 h-16 resize-none"
                    value={newAlert.description}
                    onChange={e => setNewAlert({...newAlert, description: e.target.value})}
                  />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setShowAddAlert(false)} className="text-[9px] font-black uppercase text-gray-500 px-2 py-1">Batal</button>
                    <button 
                      onClick={handleAddAlert}
                      disabled={submittingAlert}
                      className="px-4 py-1.5 bg-rose-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1"
                    >
                      {submittingAlert && <Loader2 size={12} className="animate-spin" />} Kirim
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {alerts.length === 0 && <p className="text-center text-[9px] text-gray-400 py-4 italic col-span-2">Belum ada info sosial.</p>}
              {alerts.map(alert => (
                <div key={alert.id} className="bg-white border border-rose-100/80 p-3 rounded-xl shadow-sm hover:border-rose-200 transition-colors">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest truncate max-w-[200px]">{alert.title}</span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-snug mb-3 line-clamp-3">{alert.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-extrabold text-gray-400 uppercase">{alert.helpers || 0} Menawarkan Bantuan</span>
                    <button 
                      onClick={() => handleHelp(alert.id, alert.title)} 
                      className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-rose-100 transition-colors"
                    >
                      <Heart size={10} /> Bantu
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Voting Kebijakan</h3>
              <Voting proposals={proposals} onVote={handleVote} />
            </div>
          </motion.div>
        )}

        {/* SUBTAB 2: CLAIMS */}
        {activeSubTab === 'claims' && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Daftar Permohonan Santunan</h3>
                <p className="text-[8px] text-gray-400">Ajukan klaim dana santunan resmi untuk pertanggungjawaban warga.</p>
              </div>
              <button 
                onClick={() => setShowAddClaim(!showAddClaim)}
                className="text-[9px] bg-indigo-50 text-indigo-600 px-2.5 py-1.5 rounded-lg flex items-center gap-1 hover:bg-indigo-100 transition-colors font-black uppercase tracking-wider"
              >
                <Plus size={12} /> Ajukan Santunan
              </button>
            </div>

            {/* Apply Santunan Claim Form */}
            <AnimatePresence>
              {showAddClaim && (
                <motion.form 
                  onSubmit={handleAddClaim}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100 space-y-2.5 overflow-hidden"
                >
                  <h4 className="text-[10px] font-black uppercase text-indigo-800 tracking-wider">Formulir Pengajuan Santunan</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[8px] font-bold uppercase text-gray-400">Nama Penerima</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Contoh: Pak Budi (Keluarga Almarhum)" 
                        className="w-full text-xs p-2 border border-gray-200 bg-white rounded-lg outline-none"
                        value={newClaim.recipientName}
                        onChange={e => setNewClaim({...newClaim, recipientName: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold uppercase text-gray-400">Kategori Santunan</label>
                      <select 
                        className="w-full text-xs p-2 border border-gray-200 bg-white rounded-lg outline-none"
                        value={newClaim.type}
                        onChange={e => setNewClaim({...newClaim, type: e.target.value as any})}
                      >
                        <option value="Kematian">Santunan Kematian (Death)</option>
                        <option value="Sakit">Santunan Sakit/Rawat Inap</option>
                        <option value="Pendidikan">Beasiswa Pendidikan Darurat</option>
                        <option value="Bencana">Bantuan Bencana Alam</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[8px] font-bold uppercase text-gray-400">Jumlah Dana Diajukan (Rp)</label>
                      <input 
                        type="number" 
                        required
                        placeholder="Contoh: 1500000" 
                        className="w-full text-xs p-2 border border-gray-200 bg-white rounded-lg outline-none"
                        value={newClaim.amount}
                        onChange={e => setNewClaim({...newClaim, amount: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold uppercase text-gray-400">Alasan & Kronologi Singkat</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Contoh: Biaya ambulans & penguburan alm. Ibu Aminah" 
                        className="w-full text-xs p-2 border border-gray-200 bg-white rounded-lg outline-none"
                        value={newClaim.reason}
                        onChange={e => setNewClaim({...newClaim, reason: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-1">
                    <button type="button" onClick={() => setShowAddClaim(false)} className="text-[9px] font-black uppercase text-gray-500 px-2 py-1">Batal</button>
                    <button 
                      type="submit"
                      disabled={submittingClaim}
                      className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1"
                    >
                      {submittingClaim && <Loader2 size={12} className="animate-spin" />} Kirim Permohonan
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Claims Queue */}
            <div className="space-y-2">
              {claims.length === 0 && <p className="text-center text-[10px] text-gray-400 py-6 italic">Belum ada permohonan santunan.</p>}
              {claims.map(claim => {
                const getStatusStyle = (st: string) => {
                  switch(st) {
                    case 'pending': return 'bg-yellow-50 text-yellow-800 border-yellow-200';
                    case 'verified': return 'bg-blue-50 text-blue-800 border-blue-200';
                    case 'rejected': return 'bg-gray-100 text-gray-600 border-gray-200';
                    case 'distributed': return 'bg-green-50 text-green-800 border-green-200';
                    default: return 'bg-gray-50 text-gray-800 border-gray-100';
                  }
                };

                const getStatusText = (st: string) => {
                  switch(st) {
                    case 'pending': return 'Butuh Verifikasi';
                    case 'verified': return 'Disetujui (Siap Salur)';
                    case 'rejected': return 'Ditolak';
                    case 'distributed': return 'Dana Tersalurkan ✓';
                    default: return st;
                  }
                };

                return (
                  <div key={claim.id} className={`p-3 bg-white border rounded-xl shadow-inner flex flex-col gap-2 ${claim.status === 'distributed' ? 'border-green-100 bg-green-50/10' : 'border-gray-100'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="bg-indigo-50 text-indigo-800 text-[8px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider">
                            {claim.type}
                          </span>
                          <span className={`border text-[8px] font-bold px-1.5 py-0.5 rounded-full ${getStatusStyle(claim.status)}`}>
                            {getStatusText(claim.status)}
                          </span>
                        </div>
                        <h4 className="text-[11px] font-black text-gray-900 mt-1.5">{claim.recipientName}</h4>
                        <p className="text-[10px] font-black text-indigo-600">Rp {claim.amount.toLocaleString()}</p>
                      </div>
                      
                      <div className="text-right text-[8px] text-gray-400 font-bold uppercase">
                        <p>Diajukan: {claim.createdAt?.split('T')[0] || 'Hari ini'}</p>
                        <p className="mt-0.5">Oleh: {claim.createdBy}</p>
                      </div>
                    </div>

                    <p className="text-[10px] text-gray-600 bg-gray-50/50 p-1.5 rounded border border-gray-50 italic">
                      " {claim.reason} "
                    </p>

                    {claim.verifiedBy && (
                      <p className="text-[8px] text-gray-400 font-medium">
                        Diverifikasi oleh: <b className="text-gray-600">{claim.verifiedBy}</b> {claim.verifiedAt && `pada ${claim.verifiedAt?.split('T')[0]}`}
                      </p>
                    )}

                    {claim.status === 'distributed' && claim.transactionId && (
                      <div className="bg-green-50/80 text-green-800 text-[8px] p-1 rounded flex items-center justify-between border border-green-100">
                        <span>Kode Jurnal Kas: <b>{claim.transactionId}</b> (Audit Transparan)</span>
                        <CheckCircle2 size={10} />
                      </div>
                    )}

                    {/* Action buttons based on Role & Status */}
                    <div className="flex justify-end gap-1.5 pt-1 border-t border-gray-50">
                      {isAdminRole && (
                        <>
                          {claim.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleVerifyClaim(claim.id, 'rejected')} 
                                className="text-[8px] border border-gray-200 hover:bg-gray-100 px-2 py-1 rounded font-black uppercase tracking-wider text-gray-500"
                              >
                                Tolak
                              </button>
                              <button 
                                onClick={() => handleVerifyClaim(claim.id, 'verified')} 
                                className="text-[8px] bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded font-black uppercase tracking-wider flex items-center gap-0.5"
                              >
                                <FileCheck2 size={10} /> Setujui Klaim
                              </button>
                            </>
                          )}
                          {claim.status === 'verified' && (
                            <button 
                              onClick={() => handleDistributeClaim(claim)} 
                              className="text-[8px] bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded font-black uppercase tracking-wider flex items-center gap-0.5 shadow-sm"
                            >
                              <Landmark size={10} /> Salurkan Dana & Catat Kas
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteClaim(claim.id)}
                            className="text-[8px] text-gray-400 hover:text-rose-600 hover:bg-rose-50 p-1 rounded"
                            title="Hapus permohonan"
                          >
                            <Trash2 size={10} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
