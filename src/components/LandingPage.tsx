import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function LandingPage() {
  const { signInWithGoogle, loading } = useAuth() as any;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-900"><Loader2 className="animate-spin text-blue-500" size={36} /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white">
      <h1 className="text-3xl font-bold mb-6">SinergiKita</h1>
      <button 
        onClick={signInWithGoogle}
        className="px-6 py-3 bg-blue-600 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
      >
        Sign in with Google
      </button>
    </div>
  );
}
