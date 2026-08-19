import { useState } from 'react';
import { signOut, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { LogOut, Loader2, Mail, Users, Building2, AlertCircle, ArrowRight, CheckCircle, ShieldCheck, Rocket } from 'lucide-react';
import { motion } from 'motion/react';

const MASTER_EMAILS = ['ardy.syafii@gmail.com', 'ardy.syafii@sinergikita.id'];

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
      setSuccess('Selamat datang! Mengalihkan Anda ke portal SinergiKita...');
    } catch (err: any) {
      setError(err.message || 'Gagal melakukan login. Silakan coba kembali.');
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
      setSuccess('Autentikasi berhasil! Mengarahkan Anda ke formulir pendaftaran komunitas...');
    } catch (err: any) {
      setError(err.message || 'Gagal memulai pendaftaran.');
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
      setSuccess('Autentikasi berhasil! Mengarahkan Anda ke formulir pengisian data diri warga...');
    } catch (err: any) {
      setError(err.message || 'Gagal memulai pendaftaran.');
      await signOut(auth);
    } finally {
      setLoading(false);
      setSelectedFlow(null);
    }
  };

  if (user && profile?.tenantId) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center mb-5 max-w-md mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
            {profile?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900">{profile?.email}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-tighter">{profile?.role || 'User'}</p>
          </div>
        </div>
        <button 
          onClick={() => signOut(auth)}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
        >
          <LogOut size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto tech-card p-3 rounded-2xl bg-white/95 mt-10 relative overflow-hidden border-t-4 border-t-cyan-500">
      {/* Background Decorative Element */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-cyan-500/5 rounded-full blur-3xl" />
      
      {/* Brand & Logo */}
      <div className="text-center mb-6 relative z-10">
        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-200 shadow-xs mb-3 mx-auto relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 opacity-50" />
          <img 
            src="/src/assets/images/sinergikita_logo_minimalist_1783798322236.jpg" 
            alt="Logo" 
            className="w-full h-full object-cover relative z-10" 
            referrerPolicy="no-referrer"
          />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none uppercase">
          COMMUNITY <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">OS</span>
        </h1>
        <div className="flex items-center justify-center gap-1.5 mt-2">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
          <p className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">System Access Terminal // V.2.1</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-50 p-1 rounded-xl mb-6 border border-slate-200 shadow-inner">
        <button
          onClick={() => {
            setActiveTab('signin');
            setError('');
            setSuccess('');
          }}
          className={`flex-1 py-2.5 rounded-lg text-[10px] font-mono font-black transition-all uppercase tracking-wider ${
            activeTab === 'signin'
              ? 'bg-white text-cyan-600 shadow-sm border border-slate-200'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          AUTH_LOGIN
        </button>
        <button
          onClick={() => {
            setActiveTab('signup');
            setError('');
            setSuccess('');
          }}
          className={`flex-1 py-2.5 rounded-lg text-[10px] font-mono font-black transition-all uppercase tracking-wider ${
            activeTab === 'signup'
              ? 'bg-white text-cyan-600 shadow-sm border border-slate-200'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          AUTH_REGISTER
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-5 p-3 bg-rose-50 rounded-lg border border-rose-100 flex items-start gap-2"
        >
          <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={12} />
          <p className="text-[10px] text-rose-600 font-mono font-bold leading-normal uppercase">{error}</p>
        </motion.div>
      )}

      {success && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-5 p-3 bg-emerald-50 rounded-lg border border-emerald-100 flex items-start gap-2"
        >
          <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={12} />
          <p className="text-[10px] text-emerald-600 font-mono font-bold leading-normal uppercase">{success}</p>
        </motion.div>
      )}

      {/* Decoupled Tab Contents */}
      {activeTab === 'signin' ? (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="p-4 border border-slate-200 bg-slate-50/50 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500/20" />
            <h3 className="text-[10px] font-mono font-black text-slate-900 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <ShieldCheck size={10} className="text-cyan-600" />
              CITIZEN_ACCESS_PORTAL
            </h3>
            <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
              Access granted for registered residents, authorized community leaders, and system administrators.
            </p>
          </div>

          <button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] disabled:opacity-50 relative group overflow-hidden shadow-lg shadow-slate-200"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/0 via-cyan-600/10 to-cyan-600/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            {loading && selectedFlow === 'warga_login' ? (
              <Loader2 className="animate-spin" size={14} />
            ) : (
              <Mail size={14} className="text-cyan-400" />
            )}
            ESTABLISH_SESSION
          </button>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Path A: Tenant Admin Creation */}
          <div className="p-4 border border-slate-200 hover:border-cyan-300 hover:bg-cyan-50/10 rounded-xl transition-all text-left relative group">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="p-1.5 bg-slate-50 text-slate-600 rounded-lg border border-slate-200 group-hover:text-cyan-600 group-hover:border-cyan-200 transition-colors">
                <Building2 size={14} />
              </div>
              <h3 className="text-[10px] font-mono font-black text-slate-900 uppercase tracking-widest">01. INITIATE_NEW_NODE</h3>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed font-medium mb-4">
              Register a new RT/RW or community unit. Requires manual validation by Central Master Authority.
            </p>
            
            <button
              onClick={handleTenantSignUp}
              disabled={loading}
              className="w-full bg-slate-50 hover:bg-cyan-50 text-slate-700 hover:text-cyan-700 py-2.5 rounded-lg font-mono font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all border border-slate-200 hover:border-cyan-200"
            >
              {loading && selectedFlow === 'tenant_signup' ? (
                <Loader2 className="animate-spin" size={12} />
              ) : (
                <Rocket size={12} />
              )}
              REGISTER_TENANT <ArrowRight size={10} />
            </button>
          </div>

          {/* Path B: Member Sign Up */}
          <div className="p-4 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/10 rounded-xl transition-all text-left relative group">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="p-1.5 bg-slate-50 text-slate-600 rounded-lg border border-slate-200 group-hover:text-emerald-600 group-hover:border-emerald-200 transition-colors">
                <Users size={14} />
              </div>
              <h3 className="text-[10px] font-mono font-black text-slate-900 uppercase tracking-widest">02. JOIN_EXISTING_NODE</h3>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed font-medium mb-4">
              Connect to an established node via unique Community ID. Data verification by local leadership required.
            </p>

            <button
              onClick={handleWargaSignUp}
              disabled={loading}
              className="w-full bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 py-2.5 rounded-lg font-mono font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all border border-slate-200 hover:border-emerald-200"
            >
              {loading && selectedFlow === 'warga_signup' ? (
                <Loader2 className="animate-spin" size={12} />
              ) : (
                <ShieldCheck size={12} />
              )}
              REGISTER_CITIZEN <ArrowRight size={10} />
            </button>
          </div>
        </div>
      )}

      {/* Fine Print Footer */}
      <div className="mt-8 pt-4 border-t border-slate-100 text-center">
        <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-[0.3em] flex items-center justify-center gap-2">
          <div className="w-1 h-1 rounded-full bg-slate-200" />
          SECURE_ENCRYPTION_ACTIVE
          <div className="w-1 h-1 rounded-full bg-slate-200" />
        </span>
      </div>
    </div>
  );
};
