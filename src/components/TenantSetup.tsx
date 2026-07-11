import { useState, FormEvent } from 'react';
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
  const [mode, setMode] = useState<SetupMode>('choice');
  const [name, setName] = useState('');
  const [tenantType, setTenantType] = useState('rt-rw');
  const [tenantId, setTenantId] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile || !name.trim()) return;

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

      // Link user to the pending tenant
      await updateDoc(doc(db, 'users', profile.uid), {
        tenantId: docRef.id,
        role: 'admin',
        isApproved: false
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

    setLoading(true);
    try {
      // Check if tenant exists
      const tenantDoc = await getDoc(doc(db, 'tenants', tenantId.trim()));
      if (!tenantDoc.exists()) {
        showToast("ID Komunitas tidak ditemukan.");
        return;
      }

      await updateDoc(doc(db, 'users', profile.uid), {
        tenantId: tenantId.trim(),
        role: 'member',
        isApproved: false
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
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center max-w-md mx-auto mt-10">
        <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Send size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Permintaan Dikirim!</h2>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
          Pendaftaran komunitas <strong>{name}</strong> sedang dalam peninjauan oleh Master Admin. 
          Anda akan diberikan akses Admin setelah disetujui.
        </p>
      </div>
    );
  }

  if (mode === 'choice') {
    return (
      <div className="max-w-md mx-auto mt-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-gray-900">Selamat Datang!</h2>
          <p className="text-sm text-gray-500 mt-2">Bagaimana Anda ingin menggunakan SinergiKita?</p>
        </div>
        
        <div className="grid gap-4">
          <button 
            onClick={() => setMode('join')}
            className="group bg-white p-6 rounded-2xl border-2 border-gray-100 hover:border-blue-500 hover:shadow-lg transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Users size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Gabung Komunitas</h3>
                <p className="text-xs text-gray-500">Masuk sebagai anggota komunitas yang sudah ada.</p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => setMode('create')}
            className="group bg-white p-6 rounded-2xl border-2 border-gray-100 hover:border-blue-500 hover:shadow-lg transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Building2 size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Buat Komunitas Baru</h3>
                <p className="text-xs text-gray-500">Mulai kelola komunitas baru untuk warga Anda.</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-xl border border-gray-100 mt-10">
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
              placeholder="Masukkan kode ID komunitas"
              className="w-full p-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={tenantId}
              onChange={e => setTenantId(e.target.value)}
            />
          </div>
        )}

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
