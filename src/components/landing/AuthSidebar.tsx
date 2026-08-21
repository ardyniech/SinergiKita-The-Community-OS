import Login from '../Login';
import { HelpCircle } from 'lucide-react';

export const AuthSidebar = () => {
  return (
    <div id="portal" className="lg:col-span-5 lg:sticky lg:top-20 space-y-6">
      <div className="tech-card p-1 rounded-xl shadow-2xl border border-slate-200 bg-white/95 group">
        <div className="p-4 bg-slate-900 text-white rounded-t-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="flex items-center gap-2 mb-1.5 relative z-10">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            <h2 className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-cyan-400">Security Gateway</h2>
          </div>
          <p className="text-lg font-black uppercase tracking-tight relative z-10">Access Terminal</p>
        </div>
        
        <div className="p-1 bg-slate-50/50">
          <Login />
        </div>
      </div>

      <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
          <HelpCircle size={14} className="text-cyan-600" />
          Integration Manual
        </h4>
        <div className="space-y-4">
          {[
            { title: 'New Citizen Admission', desc: 'Connect to an existing community node using your specific ID. Verification by local pengurus required.', step: '01' },
            { title: 'Node Infrastructure Setup', desc: 'Establish a new community unit. Central Master Authority validation required for activation.', step: '02' },
            { title: 'Authorized Personnel', desc: 'Registered accounts use biometric-verified Google auth for instant dashboard connectivity.', step: '03' }
          ].map((item) => (
            <div key={item.step} className="flex gap-4 items-start group">
              <div className="text-[10px] font-mono font-black text-cyan-600 bg-cyan-50 w-7 h-7 rounded border border-cyan-200 flex items-center justify-center shrink-0 group-hover:bg-cyan-600 group-hover:text-white transition-all duration-300">
                {item.step}
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-tight mb-1">{item.title}</p>
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
