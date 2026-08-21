import { useState } from 'react';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { UserPlus, Loader2, X, Mail, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface RegisterMemberFormProps {
  onClose: () => void;
}

export function RegisterMemberForm({ onClose }: RegisterMemberFormProps) {
  const { profile, tenant } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'member' | 'admin'>('member');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast("Harap masukkan email yang valid.");
      return;
    }

    setLoading(true);
    try {
      if (!profile?.tenantId) throw new Error("Tenant ID not found");

      // Check if user already exists globally
      const q = query(collection(db, 'users'), where('email', '==', email.toLowerCase()));
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        // If there are multiple documents with same email, we'll merge them into the main profile later
        // For now, check if already in this tenant
        const inThisTenant = snap.docs.find(doc => doc.data().tenantId === profile.tenantId);
        if (inThisTenant) {
          showToast("Warga dengan email ini sudah terdaftar di komunitas Anda.");
          setLoading(false);
          return;
        }

        // Check if already in another tenant
        const inOtherTenant = snap.docs.find(doc => doc.data().tenantId && doc.data().tenantId !== profile.tenantId);
        if (inOtherTenant) {
          showToast(`Warga dengan email ini sudah terdaftar di komunitas lain ("${inOtherTenant.data().tenantName || 'Lain'}").`);
          setLoading(false);
          return;
        }

        // Existing user in system without any community yet: Link/update the first one
        // and AuthContext will clean up others on their next login if any
        const mainDoc = snap.docs.find(d => d.id === email.toLowerCase()) || snap.docs[0];
        const userRef = doc(db, 'users', mainDoc.id);
        
        await setDoc(userRef, {
          tenantId: profile.tenantId,
          tenantName: tenant?.name || 'Community',
          role,
          status: 'active',
          isApproved: true,
          phoneNumber: phoneNumber || mainDoc.data().phoneNumber || '',
          displayName: displayName || mainDoc.data().displayName || email.split('@')[0],
          updatedAt: serverTimestamp()
        }, { merge: true });

        // If there were multiple docs, the others are likely "ghost" registrations
        if (snap.docs.length > 1) {
          for (const d of snap.docs) {
            if (d.id !== mainDoc.id) {
              await deleteDoc(doc(db, 'users', d.id));
            }
          }
        }

        showToast(`Profil warga ditemukan & otomatis digabungkan ke komunitas ${tenant?.name || ''}.`);
        setEmail(''); setDisplayName(''); setPhoneNumber(''); onClose();
        return;
      }

      await addDoc(collection(db, 'users'), {
        email: email.toLowerCase(),
        displayName: displayName || email.split('@')[0],
        tenantId: profile.tenantId,
        tenantName: tenant?.name || 'Community',
        role,
        status: 'pending',
        isApproved: false,
        createdAt: serverTimestamp(),
        registeredBy: profile.uid,
        isInvitation: true,
        phoneNumber: phoneNumber || ''
      });

      showToast(`Warga ${displayName || email} berhasil didaftarkan.`);
      setEmail(''); setDisplayName(''); setPhoneNumber(''); onClose();
    } catch (error: any) {
      showToast("Gagal: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="liquid-glass border-blue-200/50 rounded-3xl p-4 mb-8 shadow-3d-lg relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 pointer-events-none" />
      
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-3d-sm border border-blue-400">
            <UserPlus size={24} />
          </div>
          <div>
            <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-tight leading-tight">Registry Enrollment</h3>
            <p className="text-[9px] font-bold text-blue-600 uppercase tracking-[0.15em] mt-1 opacity-80">Add members to secure database</p>
          </div>
        </div>
        <button onClick={onClose} className="w-9 h-9 bg-white/60 hover:bg-white rounded-xl text-slate-400 hover:text-slate-600 transition-all border border-white flex items-center justify-center shadow-3d-sm active:translate-y-0.5">
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleRegister} className="space-y-4 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16} />
            <input 
              type="email" placeholder="Active Email (Required)"
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200/50 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-200 transition-all text-xs font-black uppercase tracking-tight shadow-inner"
              value={email} onChange={(e) => setEmail(e.target.value)} required
            />
          </div>
          <input 
            type="text" placeholder="Full Name"
            className="w-full px-4 py-3.5 bg-white border border-slate-200/50 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-200 transition-all text-xs font-black uppercase tracking-tight shadow-inner"
            value={displayName} onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input 
            type="tel" placeholder="Phone Number"
            className="w-full px-4 py-3.5 bg-white border border-slate-200/50 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-200 transition-all text-xs font-black uppercase tracking-tight shadow-inner"
            value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <div className="relative">
            <select 
              className="w-full px-4 py-3.5 bg-white border border-slate-200/50 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-200 transition-all text-[10px] font-black text-slate-700 uppercase tracking-widest appearance-none shadow-inner"
              value={role} onChange={(e) => setRole(e.target.value as any)}
            >
              <option value="member">Role: Standard Citizen</option>
              <option value="admin">Role: Executive Admin</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ShieldCheck size={14} />
            </div>
          </div>
        </div>

        <button 
          type="submit" disabled={loading}
          className="btn-3d w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-blue-700 shadow-3d-sm flex items-center justify-center gap-3 disabled:opacity-50 transition-all active:translate-y-0.5 mt-2"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : <UserPlus size={20} />}
          Authorize & Register
        </button>
      </form>
      
      <div className="mt-5 p-3 bg-blue-500/5 rounded-2xl border border-blue-500/10 flex items-start gap-3 relative z-10">
        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
        <p className="text-[10px] text-blue-900/60 font-bold uppercase tracking-tight leading-tight">
          New entries are set to <span className="text-blue-700">'Pending'</span> status. Authorization completes upon their initial secure login via verified email.
        </p>
      </div>
    </motion.div>
  );
}
