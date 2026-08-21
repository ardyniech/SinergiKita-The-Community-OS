import { Sparkles, BellRing, Wallet, Heart, ShoppingBag } from 'lucide-react';

const FEATURES = [
  { icon: BellRing, title: 'Alarm SOS Darurat', desc: 'Real-time penanganan insiden & alarm instan tetangga terdekat.', color: 'text-rose-600', bg: 'bg-rose-50' },
  { icon: Wallet, title: 'Kas & Simpanan', desc: 'Pantau laporan kas masuk/keluar & pinjaman koperasi warga.', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { icon: Heart, title: 'Aksi Gotong Royong', desc: 'Kampanye pendanaan sosial & bantuan sembako kepedulian.', color: 'text-amber-600', bg: 'bg-amber-50' },
  { icon: ShoppingBag, title: 'Pasar Brotherhood', desc: 'Ekosistem UMKM internal rukun tetangga tanpa perantara.', color: 'text-cyan-600', bg: 'bg-cyan-50' }
];

export const HeroSection = () => {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 bg-cyan-50 border border-cyan-200 text-cyan-800 px-3 py-1 rounded-lg text-[9px] font-mono font-black uppercase tracking-[0.2em]">
          <Sparkles size={10} className="text-cyan-600" />
          PROTOCOL_INTEGRATION_LIVE
        </div>
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-slate-900 leading-[0.95] uppercase">
          REDEFINISI <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600">EKOSISTEM LINGKUNGAN.</span>
        </h1>
        
        <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-xl font-medium">
          SinergiKita adalah sistem operasi rukun warga terintegrasi yang memberdayakan keamanan darurat SOS, transparansi keuangan, dan kemandirian ekonomi melalui infrastruktur digital modern.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {FEATURES.map((feature, idx) => (
          <div key={idx} className="tech-card p-4 rounded-xl flex items-start gap-3.5 group hover:border-cyan-300 transition-all bg-white border border-slate-100 shadow-sm">
            <div className={`p-2 ${feature.bg} ${feature.color} rounded-lg border border-slate-100 group-hover:scale-105 transition-transform`}>
              <feature.icon size={16} />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight mb-1">{feature.title}</h4>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
