import { useState, useEffect, FormEvent } from 'react';
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Building2, Send, Loader2, Users, ArrowLeft } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { handleFirestoreError, OperationType } from '../lib/firestore-utils';

type SetupMode = 'choice' | 'create' | 'join';

export default function TenantSetup() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [mode, setMode] = useState<SetupMode>(() => {
    const savedFlow = localStorage.getItem('sinergikita_login_flow');
    if (savedFlow === 'tenant') return 'create';
    if (savedFlow === 'warga') return 'join';
    return 'choice';
  });
  const [name, setName] = useState('');
  const [tenantType, setTenantType] = useState('rt-rw');
  const [tenantId, setTenantId] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (profile) {
      if (profile.displayName && !displayName) setDisplayName(profile.displayName);
      if (profile.phoneNumber && !phoneNumber) setPhoneNumber(profile.phoneNumber);
      if (profile.address && !address) setAddress(profile.address);
    }
  }, [profile]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile || !name.trim()) return;
    if (!displayName.trim() || !phoneNumber.trim() || !address.trim()) {
      showToast("Mohon lengkapi semua Informasi Warga Anda.");
      return;
    }

    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'tenants'), {
        name: name.trim(),
        type: tenantType,
        status: 'pending',
        ownerId: profile.uid,
        createdAt: Date.now(),
        enabledModules: ['emergency', 'finance', 'social', 'directory'] // default modules
      });

      // Link user to the pending tenant and save contact info
      await updateDoc(doc(db, 'users', profile.uid), {
        tenantId: docRef.id,
        role: 'admin',
        isApproved: false,
        displayName: displayName.trim(),
        phoneNumber: phoneNumber.trim(),
        address: address.trim()
      });

      setSubmitted(true);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'tenants');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile || !tenantId.trim()) return;
    if (!displayName.trim() || !phoneNumber.trim() || !address.trim()) {
      showToast("Mohon lengkapi semua Informasi Warga Anda.");
      return;
    }

    setLoading(true);
    try {
      // Check if tenant exists
      const tenantDoc = await getDoc(doc(db, 'tenants', tenantId.trim()));
      if (!tenantDoc.exists()) {
        showToast("ID Komunitas tidak ditemukan.");
        return;
      }

      // Link user to community and save contact info
      await updateDoc(doc(db, 'users', profile.uid), {
        tenantId: tenantId.trim(),
        role: 'member',
        isApproved: false,
        displayName: displayName.trim(),
        phoneNumber: phoneNumber.trim(),
        address: address.trim()
      });
      showToast("Permintaan bergabung dikirim.");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${profile.uid}`);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white p-5 rounded-3xl shadow-xl border border-gray-100 text-center max-w-md mx-auto mt-8">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
          <Send size={32} />
        </div>
        <h2 className="text-xl font-black text-gray-900">Sip, Permintaan Berhasil Dikirim! 🎉</h2>
        <p className="text-xs text-gray-600 mt-2 leading-relaxed font-medium">
          Pendaftaran komunitas <strong>{name}</strong> sedang ditinjau oleh Tim Pengurus. 
          Akses Admin akan otomatis aktif setelah permohonan disetujui. Terima kasih sudah bergabung!
        </p>
      </div>
    );
  }

  if (mode === 'choice') {
    return (
      <div className="max-w-md mx-auto mt-6">
        <div className="text-center mb-5">
          <h2 className="text-xl font-black text-gray-900">Halo Warga SinergiKita! 👋</h2>
          <p className="text-xs text-gray-500 mt-1">Pilih langkah awal Anda untuk mulai menggunakan aplikasi ini:</p>
        </div>
        
        <div className="grid gap-3.5">
          <button 
            onClick={() => setMode('join')}
            className="group bg-white p-4 rounded-2xl border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all text-left cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
                <Users size={22} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900">Gabung Komunitas Warga</h3>
                <p className="text-xs text-gray-500 mt-0.5">Saya warga/anggota yang punya Kode ID Komunitas dari pengurus.</p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => setMode('create')}
            className="group bg-white p-4 rounded-2xl border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all text-left cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                <Building2 size={22} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900">Daftarkan Komunitas Baru</h3>
                <p className="text-xs text-gray-500 mt-0.5">Saya pengurus RT/RW atau Ketua yang ingin daftarkan wilayah baru.</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white p-3 rounded-2xl shadow-xl border border-gray-100 mt-10">
      <button 
        onClick={() => setMode('choice')}
        className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600 mb-4 transition-colors"
      >
        <ArrowLeft size={12} /> Kembali
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
          {mode === 'create' ? <Building2 size={24} /> : <Users size={24} />}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{mode === 'create' ? 'Daftar Komunitas' : 'Gabung Komunitas'}</h2>
          <p className="text-xs text-gray-500">
            {mode === 'create' ? 'Daftarkan komunitas baru ke sistem.' : 'Masukkan ID komunitas untuk bergabung.'}
          </p>
        </div>
      </div>

      <form onSubmit={mode === 'create' ? handleCreate : handleJoin} className="space-y-4">
        {mode === 'create' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Nama Komunitas</label>
              <input 
                type="text" 
                required
                placeholder="Contoh: RT 05 Taman Melati"
                className="w-full p-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Jenis Komunitas</label>
              <select 
                value={tenantType}
                onChange={e => setTenantType(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="rt-rw">Warga (RT/RW)</option>
                <option value="paguyuban">Paguyuban / Alumni</option>
                <option value="umkm">UMKM / Koperasi</option>
                <option value="ojol">Komunitas Ojol / Angkot</option>
                <option value="petani">Kelompok Tani</option>
                <option value="other">Lainnya</option>
              </select>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">ID Komunitas</label>
            <input 
              type="text" 
              required
              placeholder="Contoh: L7X8y9pQ..."
              className="w-full p-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
              value={tenantId}
              onChange={e => setTenantId(e.target.value)}
            />
            <p className="text-[10px] text-gray-400 mt-1.5 leading-normal">
              * Hubungi Pengurus RT/RW atau Komunitas Anda untuk mendapatkan Kode ID resmi (dapat dilihat di menu Pengaturan Pengurus).
            </p>
          </div>
        )}

        {/* 2. Integration: Direct Phone/WA/Address enrollment for new residents */}
        <div className="border-t border-gray-100 pt-4 space-y-3">
          <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-wider mb-2">Data Diri Anda (Wajib Terisi)</h3>
          
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nama Lengkap</label>
            <input 
              type="text" 
              required
              placeholder="Nama lengkap sesuai KTP"
              className="w-full p-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nomor WhatsApp Aktif</label>
            <input 
              type="tel" 
              required
              placeholder="Contoh: 08123456789"
              className="w-full p-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nomor Rumah / Sektor</label>
            <input 
              type="text" 
              required
              placeholder="Contoh: Blok B / No. 12"
              className="w-full p-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={address}
              onChange={e => setAddress(e.target.value)}
            />
          </div>
        </div>

        <button 
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 shadow-md"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
          {mode === 'create' ? 'Ajukan Pendaftaran' : 'Minta Gabung'}
        </button>
      </form>
    </div>
  );
}
