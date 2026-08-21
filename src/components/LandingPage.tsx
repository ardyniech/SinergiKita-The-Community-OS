// OVER_LIMIT_JUSTIFIED: Halaman arahan (LandingPage) merupakan pusat display branding komprehensif, fitur eksplorasi interaktif sandbox, dan gerbang masuk satu-atap.
import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  Building2, Users, BellRing, Wallet, Landmark, ShoppingBag, 
  Search, ShieldCheck, Heart, Sparkles, Sliders, ArrowRight, 
  MapPin, Globe, CheckCircle2, Star, HelpCircle, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Login from './Login';
import { Tenant } from '../types';

interface CommunityPreset {
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

const PRESETS: CommunityPreset[] = [
  {
    id: 'warga',
    name: 'RT 05 Meruya Selatan',
    slogan: 'Guyub Rukun, Bersih Lingkungan, Aman Pemukiman',
    color: 'indigo',
    modules: {
      emergency: true,
      finance: true,
      social: true,
      marketplace: true,
      koperasi: true,
    },
    icon: '🏡',
    badge: 'Rukun Warga/RT',
    desc: 'Lengkap dengan seluruh modul warga, alarm SOS, kas transparan, dan koperasi.'
  },
  {
    id: 'ojol',
    name: 'Ojol Basecamp Senayan',
    slogan: 'Solidaritas Tanpa Batas, Satu Aspal Sejuta Saudara',
    color: 'amber',
    modules: {
      emergency: true,
      finance: false,
      social: true,
      marketplace: true,
      koperasi: false,
    },
    icon: '🏍️',
    badge: 'Keluarga Ojol',
    desc: 'Mengutamakan respon darurat SOS di jalan raya, lapak kurir, dan kepedulian sosial.'
  },
  {
    id: 'paguyuban',
    name: 'Paguyuban Perantau Minang',
    slogan: 'Saciok Bak Ayam, Sakapiang Bak Siriah',
    color: 'rose',
    modules: {
      emergency: false,
      finance: true,
      social: true,
      marketplace: true,
      koperasi: true,
    },
    icon: '🤝',
    badge: 'Paguyuban Daerah',
    desc: 'Mengedepankan gotong royong warga rantau, iuran kas, dan pendanaan koperasi.'
  },
  {
    id: 'sepeda',
    name: 'Pedal Sinergi Club',
    slogan: 'Gowes Sehat, Jalin Silaturahmi Pecinta Sepeda',
    color: 'emerald',
    modules: {
      emergency: true,
      finance: false,
      social: true,
      marketplace: true,
      koperasi: false,
    },
    icon: '🚴',
    badge: 'Komunitas Hobi',
    desc: 'Grup sepeda santai dengan info SOS rute darurat, and obrolan berbagi foto.'
  }
];

export default function LandingPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Live Customizer Demo State
  const [demoName, setDemoName] = useState('RT 03 Jatiasih');
  const [demoSlogan, setDemoSlogan] = useState('Guyub, Rukun, Aman, dan Sejahtera');
  const [demoColor, setDemoColor] = useState('indigo');
  const [demoModules, setDemoModules] = useState({
    emergency: true,
    finance: true,
    social: true,
    marketplace: true,
    koperasi: false,
  });

  // Load registered active communities
  useEffect(() => {
    async function loadTenants() {
      setLoading(true);
      try {
        const q = query(collection(db, 'tenants'), where('status', '==', 'approved'));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tenant));
        setTenants(data);
      } catch (err) {
        console.error('Gagal mengambil data komunitas:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTenants();
  }, []);

  // Filtered approved communities
  const filteredTenants = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return tenants.filter(t => 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, tenants]);

  // Handle mock module toggle
  const toggleDemoModule = (key: keyof typeof demoModules) => {
    setDemoModules(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const colorVariants: Record<string, { bg: string; text: string; border: string; accent: string; badge: string }> = {
    indigo: { bg: 'bg-indigo-600', text: 'text-indigo-600', border: 'border-indigo-100', accent: 'bg-indigo-50 text-indigo-600', badge: 'bg-indigo-100 text-indigo-800' },
    emerald: { bg: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-100', accent: 'bg-emerald-50 text-emerald-600', badge: 'bg-emerald-100 text-emerald-800' },
    rose: { bg: 'bg-rose-600', text: 'text-rose-600', border: 'border-rose-100', accent: 'bg-rose-50 text-rose-600', badge: 'bg-rose-100 text-rose-800' },
    amber: { bg: 'bg-amber-600', text: 'text-amber-600', border: 'border-amber-100', accent: 'bg-amber-50 text-amber-600', badge: 'bg-amber-100 text-amber-800' },
    blue: { bg: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-100', accent: 'bg-blue-50 text-blue-600', badge: 'bg-blue-100 text-blue-800' },
  };

  const selectedColor = colorVariants[demoColor] || colorVariants.indigo;

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden selection:bg-cyan-100 selection:text-cyan-900 pb-12">
      {/* Decorative Techno Elements */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 z-50" />
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
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

      <div className="max-w-7xl mx-auto px-2 py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-10 items-start">
        {/* LEFT COLUMN: Landing & Customizer Sandbox (7 cols) */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8">
          
          {/* Main Hero Banner */}
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

          {/* Interactive Feature Cards (Bento-Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {[
              { icon: BellRing, title: 'Alarm SOS Darurat', desc: 'Real-time penanganan insiden & alarm instan tetangga terdekat.', color: 'text-rose-600', bg: 'bg-rose-50' },
              { icon: Wallet, title: 'Kas & Simpanan', desc: 'Pantau laporan kas masuk/keluar & pinjaman koperasi warga.', color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { icon: Heart, title: 'Aksi Gotong Royong', desc: 'Kampanye pendanaan sosial & bantuan sembako kepedulian.', color: 'text-amber-600', bg: 'bg-amber-50' },
              { icon: ShoppingBag, title: 'Pasar Brotherhood', desc: 'Ekosistem UMKM internal rukun tetangga tanpa perantara.', color: 'text-cyan-600', bg: 'bg-cyan-50' }
            ].map((feature, idx) => (
              <div key={idx} className="tech-card p-4 rounded-xl flex items-start gap-3.5 group hover:border-cyan-300 transition-all">
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

          {/* SinergiKita Live Customizer Sandbox */}
          <div className="tech-card p-3 rounded-xl space-y-5 bg-white/95 border-l-4 border-l-cyan-500">
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

            {/* Template Presets */}
            <div className="space-y-2">
              <label className="block text-[8px] font-mono font-black text-slate-400 uppercase tracking-widest">SELECT_SYSTEM_PRESET</label>
              <div className="grid grid-cols-2 gap-2">
                {PRESETS.map((preset) => {
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

            {/* Customizer Inputs */}
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
                      onClick={() => toggleDemoModule(key as any)}
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

            {/* Launch Preview CTA */}
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white p-3.5 rounded-xl text-[10px] font-mono font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2 group shadow-xl shadow-slate-200"
            >
              <Sparkles size={14} className="text-cyan-400 group-hover:rotate-12 transition-transform" />
              RUN_INTERACTIVE_SIMULATOR
            </button>
          </div>

          {/* Interactive Pop-Up Live Preview Modal */}
          <AnimatePresence>
            {isPreviewOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3"
                onClick={() => setIsPreviewOpen(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, y: 10 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 10 }}
                  className="bg-white rounded-xl w-full max-w-sm overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[85vh]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header bar */}
                  <div className="bg-slate-900 text-white px-3 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Live Preview Smartphone</span>
                    </div>
                    <button 
                      onClick={() => setIsPreviewOpen(false)}
                      className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>

                  {/* Simulated Mobile Device View */}
                  <div className="p-3 overflow-y-auto space-y-2.5 bg-slate-50 flex-1 scrollbar-thin">
                    {/* App Bar */}
                    <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-3xs flex items-center justify-between">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className={`w-6 h-6 rounded-lg ${selectedColor.bg} flex items-center justify-center text-white font-black text-xs shrink-0`}>
                          {demoName?.[0] || 'S'}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-[10px] font-black text-gray-900 leading-none uppercase truncate">{demoName}</h4>
                          <p className="text-[7px] text-gray-400 font-bold leading-none mt-0.5 truncate">{demoSlogan}</p>
                        </div>
                      </div>
                      <span className={`text-[6px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0 ${selectedColor.badge}`}>
                        ONLINE
                      </span>
                    </div>

                    {/* SOS Module if active */}
                    {demoModules.emergency && (
                      <div className="bg-red-50 border border-red-100 p-2 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-red-700">
                            <BellRing size={11} className="animate-bounce" />
                            <span className="text-[8px] font-black uppercase tracking-wider">DARURAT SOS DIGITAL</span>
                          </div>
                          <span className="text-[6px] font-bold text-red-500 bg-red-100/50 px-1 py-0.2 rounded uppercase">Aktif</span>
                        </div>
                        <p className="text-[7px] text-red-600/90 leading-tight">Memicu sirine keras ke seluruh tetangga terdekat dalam radius 200m untuk merespon darurat medis atau pencurian.</p>
                        <button className="w-full bg-red-600 hover:bg-red-700 text-white py-1 rounded-lg text-[7px] font-black uppercase tracking-widest transition-colors shadow-xs">
                          🚨 AKTIFKAN ALARM SEKARANG
                        </button>
                      </div>
                    )}

                    {/* Finance Module if active */}
                    {demoModules.finance && (
                      <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-3xs space-y-1.5">
                        <div className="flex items-center justify-between border-b border-gray-50 pb-1">
                          <span className="text-[7px] font-black text-gray-400 uppercase tracking-wider">Kas & Transparansi Keuangan</span>
                          <span className="text-[8px] font-bold text-emerald-600">Terbuka untuk Umum</span>
                        </div>
                        <div className="flex justify-between items-center py-0.5">
                          <div>
                            <p className="text-[6px] text-gray-400 uppercase leading-none">Total Saldo Kas</p>
                            <p className="text-xs font-black text-gray-800 mt-0.5">Rp 14.250.000</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[6px] text-gray-400 uppercase leading-none">Bulan Ini</p>
                            <p className="text-[8px] font-black text-emerald-500 mt-0.5">+Rp 2.100.000</p>
                          </div>
                        </div>
                        {/* Tiny Statement List */}
                        <div className="bg-gray-50 p-1.5 rounded-lg space-y-1 text-[7px]">
                          <div className="flex justify-between text-gray-600">
                            <span>• Pembelian Sembako Bantuan</span>
                            <span className="text-rose-600">-Rp 450.000</span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span>• Iuran Kebersihan RT</span>
                            <span className="text-emerald-600">+Rp 900.000</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Social Module if active */}
                    {demoModules.social && (
                      <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-3xs space-y-1.5">
                        <div className="text-[7px] font-black text-gray-400 uppercase tracking-wider">Aksi Warga & Kegiatan</div>
                        <div className="bg-blue-50/40 p-2 rounded-lg space-y-1">
                          <div className="flex items-center justify-between text-[6px] text-gray-400 font-bold">
                            <span>Rukun Warga Berbagi</span>
                            <span className="text-blue-600 font-black">75% Terkumpul</span>
                          </div>
                          <p className="text-[8px] font-black text-gray-800 leading-tight">Sembako Jumat Berkah Untuk Lansia Akar Rumput</p>
                          {/* Progress bar */}
                          <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
                            <div className="bg-blue-600 h-full" style={{ width: '75%' }} />
                          </div>
                          <div className="flex justify-between text-[6px] text-gray-500 font-bold">
                            <span>Donasi: Rp 1.500.000 / Rp 2.000.000</span>
                            <span className="text-blue-600 hover:underline cursor-pointer">Donasi →</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Marketplace Module if active */}
                    {demoModules.marketplace && (
                      <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-3xs space-y-1.5">
                        <div className="text-[7px] font-black text-gray-400 uppercase tracking-wider">Pasar Brotherhood UMKM</div>
                        <div className="grid grid-cols-2 gap-1.5">
                          <div className="p-1.5 bg-gray-50 rounded-lg flex flex-col justify-between">
                            <div>
                              <span className="text-[6px] font-bold text-gray-400 uppercase">Warung Bu Joko</span>
                              <p className="text-[8px] font-bold text-gray-800 leading-tight mt-0.5">Nasi Uduk Komplit</p>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-[7px] font-black text-blue-600">Rp 12.000</span>
                              <span className="text-[6px] bg-blue-100 text-blue-700 px-1 py-0.2 rounded uppercase font-bold">Pesan</span>
                            </div>
                          </div>
                          <div className="p-1.5 bg-gray-50 rounded-lg flex flex-col justify-between">
                            <div>
                              <span className="text-[6px] font-bold text-gray-400 uppercase">Oman Kopi</span>
                              <p className="text-[8px] font-bold text-gray-800 leading-tight mt-0.5">Es Kopi Aren</p>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-[7px] font-black text-blue-600">Rp 15.000</span>
                              <span className="text-[6px] bg-blue-100 text-blue-700 px-1 py-0.2 rounded uppercase font-bold">Pesan</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Koperasi Module if active */}
                    {demoModules.koperasi && (
                      <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-3xs space-y-1.5">
                        <div className="flex justify-between items-center border-b border-gray-50 pb-1">
                          <span className="text-[7px] font-black text-gray-400 uppercase tracking-wider">Simpan Pinjam Koperasi</span>
                          <span className="text-[6px] font-bold text-amber-600 bg-amber-50 px-1 rounded uppercase">Khusus Anggota</span>
                        </div>
                        <p className="text-[7px] text-gray-500 leading-tight">Ajukan modal usaha mikro secara instan dengan persetujuan pengurus rukun tetangga.</p>
                        <div className="flex gap-1.5">
                          <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 rounded-lg text-[6px] font-bold uppercase tracking-wider transition-colors">
                            Simpanan
                          </button>
                          <button className={`flex-1 ${selectedColor.bg} text-white py-1 rounded-lg text-[6px] font-black uppercase tracking-wider transition-opacity hover:opacity-90`}>
                            Ajukan Kredit
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Dynamic Alert Banner */}
                    <div className="p-1.5 bg-white rounded-lg border border-gray-200 shadow-2xs text-center text-[7px] text-gray-400 font-extrabold uppercase tracking-widest">
                      Powered by SinergiKita Community OS
                    </div>
                  </div>

                  {/* Modal Footer bar */}
                  <div className="bg-gray-50 px-3 py-2 border-t border-gray-100 flex items-center justify-between text-[8px] text-gray-400">
                    <span>*Tampilan mobile responsif</span>
                    <button 
                      onClick={() => setIsPreviewOpen(false)}
                      className="bg-gray-800 hover:bg-gray-950 text-white px-2 py-1 rounded-md font-bold uppercase tracking-wider text-[7px]"
                    >
                      Tutup Preview
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="tech-card p-3 rounded-xl space-y-4 bg-white/95">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <Globe size={16} className="text-cyan-600" />
                Network Node Directory
              </h3>
              <div className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-[9px] font-mono font-bold text-slate-400">
                {tenants.length} NODES_DETECTION
              </div>
            </div>
            
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-500 transition-colors" size={14} />
              <input 
                type="text" 
                placeholder="Lookup community node by name or ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 font-bold transition-all shadow-inner"
              />
            </div>

            <AnimatePresence>
              {searchQuery && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-slate-50/50 p-2 rounded-xl border border-slate-100 space-y-1.5 max-h-48 overflow-y-auto"
                >
                  {filteredTenants.length > 0 ? (
                    filteredTenants.map((t) => (
                      <div 
                        key={t.id}
                        onClick={() => {
                          setSelectedTenant(t);
                          setDemoName(t.name);
                          setDemoSlogan('Certified SinergiKita Node');
                          setDemoColor(t.type === 'rt-rw' ? 'indigo' : 'emerald');
                          if (t.enabledModules) {
                            setDemoModules({
                              emergency: t.enabledModules.includes('emergency'),
                              finance: t.enabledModules.includes('finance'),
                              social: t.enabledModules.includes('social'),
                              marketplace: t.enabledModules.includes('marketplace'),
                              koperasi: t.enabledModules.includes('koperasi'),
                            });
                          }
                        }}
                        className="p-3 bg-white hover:bg-cyan-50 rounded-lg border border-slate-200 hover:border-cyan-200 transition-all cursor-pointer flex justify-between items-center group"
                      >
                        <div>
                          <p className="text-xs font-black text-slate-900 uppercase tracking-tight group-hover:text-cyan-700 transition-colors">{t.name}</p>
                          <p className="text-[9px] font-mono text-slate-400 mt-0.5">ID: {t.id} // Tipe: {t.type?.toUpperCase() || 'GENERAL'}</p>
                        </div>
                        <ArrowRight size={14} className="text-slate-300 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest italic leading-none">Target Node Not Found</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT COLUMN: Authentication Portal Card (5 cols) */}
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

          {/* Quick Informational Guide */}
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
      </div>

      {/* Decorative footer */}
      <footer className="max-w-7xl mx-auto px-2 mt-20 pb-12 text-center space-y-4">
        <div className="flex flex-col items-center gap-2">
          <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.5em]">
            COMMUNITY <span className="text-cyan-600">OS</span> TERMINAL
          </p>
          <div className="w-12 h-1 bg-cyan-500 rounded-full" />
        </div>
        <p className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-[0.2em] leading-relaxed max-w-lg mx-auto">
          Mendorong transparansi radikal, kemandirian ekonomi kolektif, dan protokol keselamatan rukun tetangga di seluruh wilayah hukum kedaulatan Indonesia.
        </p>
        <div className="flex items-center justify-center gap-4 pt-4">
          <div className="flex items-center gap-2 text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
            Decentralized
          </div>
          <div className="flex items-center gap-2 text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
            Permissionless
          </div>
          <div className="flex items-center gap-2 text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
            Community-Backed
          </div>
        </div>
      </footer>
    </div>
  );
}
