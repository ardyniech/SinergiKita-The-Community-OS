// OVER_LIMIT_JUSTIFIED: Refactoring tertunda, logika komponen kohesif.
import { Sliders, Sparkles } from 'lucide-react';

export interface CommunityPreset {
  id: string;
  name: string;
  slogan: string;
  color: string;
  modules: {
    emergency: boolean;
    finance: boolean;
    social: boolean;
    marketplace: boolean;
    koperasi: boolean;
  };
  icon: string;
  badge: string;
  desc: string;
}

interface CustomizerSandboxProps {
  demoName: string;
  setDemoName: (v: string) => void;
  demoSlogan: string;
  setDemoSlogan: (v: string) => void;
  demoColor: string;
  setDemoColor: (v: string) => void;
  demoModules: any;
  setDemoModules: (v: any) => void;
  presets: CommunityPreset[];
  colorVariants: any;
  onPreview: () => void;
}

export const CustomizerSandbox = ({
  demoName, setDemoName,
  demoSlogan, setDemoSlogan,
  demoColor, setDemoColor,
  demoModules, setDemoModules,
  presets, colorVariants,
  onPreview
}: CustomizerSandboxProps) => {
  const toggleDemoModule = (key: string) => {
    setDemoModules({ ...demoModules, [key]: !demoModules[key] });
  };

  return (
    <div className="tech-card p-3 rounded-xl space-y-5 bg-white/95 border-l-4 border-l-cyan-500 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-slate-50 text-slate-600 rounded-lg border border-slate-200">
            <Sliders size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">System Node Customizer</h3>
            <p className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Design Your Unique Community Node</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-cyan-50 border border-cyan-200 rounded-full">
          <div className="w-1 h-1 rounded-full bg-cyan-500 animate-pulse" />
          <span className="text-[7px] font-mono font-black text-cyan-600 uppercase tracking-widest">LIVE_EMULATOR</span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-[8px] font-mono font-black text-slate-400 uppercase tracking-widest">SELECT_SYSTEM_PRESET</label>
        <div className="grid grid-cols-2 gap-2">
          {presets.map((preset) => {
            const isSelected = demoName === preset.name && demoColor === preset.color;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setDemoName(preset.name);
                  setDemoSlogan(preset.slogan);
                  setDemoColor(preset.color);
                  setDemoModules(preset.modules);
                }}
                className={`p-2 rounded-lg text-left border transition-all flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-cyan-50 border-cyan-400 ring-4 ring-cyan-500/5 shadow-sm'
                    : 'bg-slate-50/50 hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm shrink-0 group-hover:scale-110 transition-transform">{preset.icon}</span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-slate-900 truncate uppercase tracking-tight">{preset.name}</p>
                    <p className="text-[7px] font-mono font-bold text-slate-400 uppercase tracking-tighter leading-none">{preset.badge}</p>
                  </div>
                </div>
                <p className="text-[7px] text-slate-400 leading-tight mt-1.5 line-clamp-1 font-medium italic">"{preset.desc}"</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="block text-[8px] font-mono font-black text-slate-400 uppercase tracking-widest">NODE_IDENTIFIER_NAME</label>
          <input 
            type="text" 
            value={demoName} 
            onChange={(e) => setDemoName(e.target.value)}
            className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 font-black uppercase tracking-tight transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[8px] font-mono font-black text-slate-400 uppercase tracking-widest">NODE_SLOGAN_METADATA</label>
          <input 
            type="text" 
            value={demoSlogan} 
            onChange={(e) => setDemoSlogan(e.target.value)}
            className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 font-bold text-slate-600 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-[8px] font-mono font-black text-slate-400 uppercase tracking-widest">CORE_COLOR_THEME</label>
          <div className="flex gap-2.5 py-1">
            {Object.keys(colorVariants).map((col) => (
              <button
                key={col}
                onClick={() => setDemoColor(col)}
                className={`w-5 h-5 rounded-lg border-2 transition-all ${
                  col === 'indigo' ? 'bg-indigo-600' :
                  col === 'emerald' ? 'bg-emerald-600' :
                  col === 'rose' ? 'bg-rose-600' :
                  col === 'amber' ? 'bg-amber-600' : 'bg-cyan-500'
                } ${demoColor === col ? 'scale-110 border-slate-900 shadow-lg ring-4 ring-slate-900/5' : 'border-transparent opacity-60 hover:opacity-100'}`}
              />
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[8px] font-mono font-black text-slate-400 uppercase tracking-widest">MODULE_CONFIGURATION</label>
          <div className="grid grid-cols-3 gap-1">
            {Object.entries(demoModules).map(([key, value]) => (
              <button
                key={key}
                onClick={() => toggleDemoModule(key)}
                className={`py-1 px-1.5 rounded border text-[8px] font-mono font-black uppercase tracking-tighter transition-all flex items-center justify-between ${
                  value 
                    ? 'bg-cyan-50 border-cyan-200 text-cyan-700' 
                    : 'bg-white border-slate-100 text-slate-300'
                }`}
              >
                {key}
                <div className={`w-1 h-1 rounded-full ${value ? 'bg-cyan-500 animate-pulse' : 'bg-slate-200'}`} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={onPreview}
        className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white p-3.5 rounded-xl text-[10px] font-mono font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2 group shadow-xl shadow-slate-200"
      >
        <Sparkles size={14} className="text-cyan-400 group-hover:rotate-12 transition-transform" />
        RUN_INTERACTIVE_SIMULATOR
      </button>
    </div>
  );
};
