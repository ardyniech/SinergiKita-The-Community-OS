import { ShieldCheck } from 'lucide-react';

export const LandingHeader = () => {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-slate-200 px-3 sm:px-2 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-200 shadow-xs relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 opacity-50" />
            <img 
              src="/src/assets/images/sinergikita_logo_minimalist_1783798322236.jpg" 
              alt="Logo" 
              className="w-full h-full object-cover relative z-10" 
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <span className="font-black text-xs sm:text-sm tracking-tight text-slate-900 leading-none block uppercase">COMMUNITY <span className="text-cyan-600">OS</span></span>
            <span className="text-[7px] font-mono font-bold text-slate-400 uppercase tracking-widest leading-none block mt-0.5">SYNERGY_NET_NODE // 3.2.0</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            OPERATIONAL_STABLE
          </div>
          <a 
            href="#portal" 
            className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 rounded-lg text-[10px] font-mono font-black uppercase tracking-widest transition-all shadow-lg shadow-slate-200 flex items-center gap-2"
          >
            AUTH_TERMINAL
          </a>
        </div>
      </div>
    </nav>
  );
};
