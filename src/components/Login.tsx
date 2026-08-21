// OVER_LIMIT_JUSTIFIED: Berisi gerbang autentikasi multi-peran terintegrasi dengan validasi kredensial, registrasi tenant baru, dan transisi tab modern.
import { useState } from 'react';
import { signOut, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { LogOut, Loader2, Mail, Users, Building2, AlertCircle, ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

type ActiveTab = 'signin' | 'signup';

export default function Login() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFlow, setSelectedFlow] = useState<'warga_login' | 'tenant_signup' | 'warga_signup' | null>(null);

  // Sign In Flow for existing/pre-registered members
  const handleSignIn = async () => {
    setLoading(true);
    setSelectedFlow('warga_login');
    setError('');
    setSuccess('');
    
    try {
      await signInWithPopup(auth, googleProvider);
      setSuccess('Selamat datang kembali! Senang bertemu lagi dengan Anda 😊');
    } catch (err: any) {
      setError(err.message || 'Waduh, gagal masuk nih. Yuk coba klik tombolnya sekali lagi!');
      await signOut(auth);
    } finally {
      setLoading(false);
      setSelectedFlow(null);
    }
  };

  // Sign Up Flow for creating a new community (Tenant Admin)
  const handleTenantSignUp = async () => {
    setLoading(true);
    setSelectedFlow('tenant_signup');
    setError('');
    setSuccess('');
    localStorage.setItem('sinergikita_login_flow', 'tenant');

    try {
      await signInWithPopup(auth, googleProvider);
      setSuccess('Sip! Autentikasi berhasil. Mengarahkan ke formulir pendaftaran komunitas...');
    } catch (err: any) {
      setError(err.message || 'Gagal memulai pendaftaran komunitas.');
      await signOut(auth);
    } finally {
      setLoading(false);
      setSelectedFlow(null);
    }
  };

  // Sign Up Flow for joining an existing community (Resident / Warga)
  const handleWargaSignUp = async () => {
    setLoading(true);
    setSelectedFlow('warga_signup');
    setError('');
    setSuccess('');
    localStorage.setItem('sinergikita_login_flow', 'warga');

    try {
      await signInWithPopup(auth, googleProvider);
      setSuccess('Asik! Autentikasi berhasil. Yuk isi data diri Anda sebagai warga!');
    } catch (err: any) {
      setError(err.message || 'Gagal memulai pendaftaran warga.');
      await signOut(auth);
    } finally {
      setLoading(false);
      setSelectedFlow(null);
    }
  };

  if (user && profile?.tenantId) {
    return (
      <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center mb-5 max-w-md mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shadow-inner">
            {profile?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">{profile?.displayName || profile?.email}</p>
            <p className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider">{profile?.role || 'Anggota Warga'}</p>
          </div>
        </div>
        <button 
          onClick={() => signOut(auth)}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
          title="Keluar dari Akun"
        >
          <LogOut size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-3.5 rounded-xl bg-white shadow-xl border border-slate-100 mt-6 relative overflow-hidden">
      {/* Decorative Ornaments */}
      <div className="absolute -top-10 -right-10 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl" />
      <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-cyan-500/10 rounded-full blur-2xl" />

      {/* Brand Header */}
      <div className="text-center mb-5 relative z-10">
        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100 shadow-sm mb-3 mx-auto relative overflow-hidden group">
          <img 
            src="/src/assets/images/sinergikita_logo_minimalist_1783798322236.jpg" 
            alt="Logo SinergiKita" 
            className="w-full h-full object-cover relative z-10" 
            referrerPolicy="no-referrer"
          />
        </div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-1.5">
          SinergiKita <Sparkles size={16} className="text-amber-500" />
        </h1>
        <p className="text-[11px] font-medium text-slate-500 mt-0.5">
          Portal Komunitas Warga Digital Indonesia
        </p>
      </div>

      {/* Tab Switchers */}
      <div className="flex bg-slate-100/80 p-1 rounded-xl mb-5 border border-slate-200/60 font-medium">
        <button
          onClick={() => {
            setActiveTab('signin');
            setError('');
            setSuccess('');
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'signin'
              ? 'bg-white text-blue-600 shadow-sm border border-slate-200/60'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Masuk Akun
        </button>
        <button
          onClick={() => {
            setActiveTab('signup');
            setError('');
            setSuccess('');
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'signup'
              ? 'bg-white text-blue-600 shadow-sm border border-slate-200/60'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Daftar Baru
        </button>
      </div>

      {/* Error & Success Messages */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-rose-50 rounded-xl border border-rose-100 flex items-start gap-2.5"
        >
          <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={16} />
          <p className="text-xs text-rose-700 font-semibold leading-snug">{error}</p>
        </motion.div>
      )}

      {success && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-2.5"
        >
          <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={16} />
          <p className="text-xs text-emerald-700 font-semibold leading-snug">{success}</p>
        </motion.div>
      )}

      {/* Tab Contents */}
      {activeTab === 'signin' ? (
        <div className="space-y-4">
          <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl relative overflow-hidden">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={16} className="text-blue-600" />
              <h3 className="text-xs font-bold text-slate-900">Masuk Komunitas Anda</h3>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
              Gunakan akun Google Anda yang sudah terdaftar sebagai warga atau pengurus komunitas.
            </p>
          </div>

          <button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] disabled:opacity-50 shadow-md shadow-blue-100 cursor-pointer"
          >
            {loading && selectedFlow === 'warga_login' ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Mail size={16} />
            )}
            Masuk dengan Google
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Option 1: Buat Komunitas Baru */}
          <div className="p-3 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/20 rounded-xl transition-all text-left group">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-1.5 bg-blue-100/70 text-blue-700 rounded-xl">
                <Building2 size={16} />
              </div>
              <h3 className="text-xs font-bold text-slate-900">1. Daftarkan Komunitas Baru</h3>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium mb-3">
              Khusus Pengurus RT/RW, Paguyuban, atau Koperasi yang ingin mendaftarkan wilayahnya.
            </p>
            
            <button
              onClick={handleTenantSignUp}
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              {loading && selectedFlow === 'tenant_signup' ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                <>Daftarkan Komunitas <ArrowRight size={14} /></>
              )}
            </button>
          </div>

          {/* Option 2: Gabung Komunitas Existing */}
          <div className="p-3 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20 rounded-xl transition-all text-left group">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-1.5 bg-emerald-100/70 text-emerald-700 rounded-xl">
                <Users size={16} />
              </div>
              <h3 className="text-xs font-bold text-slate-900">2. Gabung Sebagai Warga</h3>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium mb-3">
              Untuk warga atau anggota yang sudah mendapat Kode ID Komunitas dari pengurus.
            </p>

            <button
              onClick={handleWargaSignUp}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              {loading && selectedFlow === 'warga_signup' ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                <>Gabung Komunitas <ArrowRight size={14} /></>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-5 pt-3 border-t border-slate-100 text-center">
        <p className="text-[10px] text-slate-400 font-medium">
          🔒 Terkoneksi aman dengan Firebase Auth & Enkripsi Standar
        </p>
      </div>
    </div>
  );
}
;
