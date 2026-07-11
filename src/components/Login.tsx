import { useState } from 'react';
import { signOut, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { LogOut, Loader2, Mail } from 'lucide-react';

export default function Login() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
            {profile?.email[0].toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900">{profile?.email}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-tighter">{profile?.role}</p>
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
    <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 mt-20 text-center">
      <div className="mb-8">
        <img 
          src="/src/assets/images/sinergikita_logo_minimalist_1783798322236.jpg" 
          alt="SinergiKita Logo" 
          className="w-24 h-24 rounded-3xl mx-auto mb-6 shadow-2xl border-4 border-white" 
          referrerPolicy="no-referrer"
        />
        <h1 className="text-3xl font-black tracking-tight text-gray-900">SinergiKita</h1>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
          Platform sinergi komunitas akar rumput.<br />
          Satu akun untuk semua kebutuhan warga.
        </p>
      </div>

      <div className="space-y-4">
        <button 
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-white border-2 border-gray-100 text-gray-700 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-gray-50 hover:border-blue-100 active:scale-[0.98] transition-all disabled:opacity-50 shadow-sm"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Mail size={20} className="text-red-500" />}
          Lanjutkan dengan Google
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-100">
            <p className="text-[11px] text-red-600 font-medium">{error}</p>
          </div>
        )}
      </div>

      <div className="mt-12 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
        Powered by Firebase & Google
      </div>
    </div>
  );
}
