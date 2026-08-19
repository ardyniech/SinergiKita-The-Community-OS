import { useState } from 'react';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { UserPlus, Loader2, X, Mail } from 'lucide-react';
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
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-blue-50 border border-blue-100 rounded-2xl p-3 mb-6 shadow-sm"
    >
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
            <UserPlus size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Registrasi Warga Baru</h3>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-none mt-1">Tambah anggota via email</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white rounded-lg text-gray-400 transition-colors">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="email" placeholder="Email Aktif (Wajib)"
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 transition-all text-sm font-medium"
              value={email} onChange={(e) => setEmail(e.target.value)} required
            />
          </div>
          <input 
            type="text" placeholder="Nama Lengkap"
            className="w-full px-2 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 transition-all text-sm font-medium"
            value={displayName} onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input 
            type="tel" placeholder="Nomor Telepon"
            className="w-full px-2 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 transition-all text-sm font-medium"
            value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <select 
            className="w-full px-2 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 transition-all text-sm font-bold text-gray-700 appearance-none"
            value={role} onChange={(e) => setRole(e.target.value as any)}
          >
            <option value="member">Peran: Warga Biasa</option>
            <option value="admin">Peran: Pengurus (Admin)</option>
          </select>
        </div>

        <button 
          type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100 flex items-center justify-center gap-3 disabled:opacity-50 transition-all active:scale-95"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
          Konfirmasi & Daftarkan
        </button>
      </form>
      
      <div className="mt-3 flex items-start gap-2 px-1">
        <div className="w-1 h-1 bg-blue-400 rounded-full mt-1.5" />
        <p className="text-[9px] text-blue-600/70 font-medium leading-tight">
          Warga yang didaftarkan akan berstatus <span className="font-bold text-blue-700">'Pending'</span> hingga mereka login pertama kali menggunakan email tersebut.
        </p>
      </div>
    </motion.div>
  );
}
