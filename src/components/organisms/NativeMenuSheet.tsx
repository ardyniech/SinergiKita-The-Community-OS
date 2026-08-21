import React from 'react';
import { 
  X, Wallet, PiggyBank, Sprout, Store, ShoppingBag, 
  Radio, MessageSquare, Megaphone, HeartHandshake, 
  BookOpen, Trophy, Settings, ShieldCheck, ChevronRight
} from 'lucide-react';
import { motion, useDragControls } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { getMemberLabel } from '../../lib/terminology';

interface NativeMenuSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: any) => void;
  isSuperAdmin?: boolean;
}

export const NativeMenuSheet: React.FC<NativeMenuSheetProps> = ({
  isOpen,
  onClose,
  onNavigate,
  isSuperAdmin = false,
}) => {
  const dragControls = useDragControls();
  const { tenant } = useAuth();
  const memberLabel = getMemberLabel(tenant?.type);

  const enabledModules = tenant?.enabledModules || ['emergency', 'finance', 'social', 'directory', 'marketplace', 'announcements', 'chat', 'ptt', 'ai', 'map', 'stats'];

  const categories = [
    {
      title: 'Keuangan & Bisnis Komunitas',
      items: [
        { id: 'finance', label: `Buku Kas ${memberLabel}`, desc: `Arus kas & iuran ${memberLabel.toLowerCase()}`, icon: Wallet, color: 'text-blue-600 bg-blue-50' },
        { id: 'koperasi', label: `Koperasi ${memberLabel}`, desc: 'Pinjaman & simpanan', icon: PiggyBank, color: 'text-emerald-600 bg-emerald-50' },
        { id: 'funding', label: 'Crowdfunding Proyek', desc: `Pendanaan usaha ${memberLabel.toLowerCase()}`, icon: Sprout, color: 'text-teal-600 bg-teal-50' },
        { id: 'marketplace', label: `Pasar Brotherhood`, desc: `Jual beli antar ${memberLabel.toLowerCase()}`, icon: Store, color: 'text-purple-600 bg-purple-50' },
        { id: 'pos', label: `Kasir POS ${memberLabel}`, desc: 'Transaksi warung & toko', icon: ShoppingBag, color: 'text-indigo-600 bg-indigo-50' },
      ],
    },
    {
      title: 'Komunikasi & Informasi',
      items: [
        { id: 'ptt', label: 'Radio HT PTT', desc: 'Radio walkie-talkie suara', icon: Radio, color: 'text-amber-600 bg-amber-50' },
        { id: 'chat', label: `Obrolan ${memberLabel}`, desc: 'Grup chat & diskusi', icon: MessageSquare, color: 'text-cyan-600 bg-cyan-50' },
        { id: 'announcements', label: `Warta ${memberLabel}`, desc: 'Pengumuman resmi komunitas', icon: Megaphone, color: 'text-rose-600 bg-rose-50' },
      ],
    },
    {
      title: 'Sosial & Gamifikasi',
      items: [
        { id: 'social', label: 'Aksi Kepedulian', desc: 'Bantuan & gotong royong', icon: HeartHandshake, color: 'text-pink-600 bg-pink-50' },
        { id: 'leaderboard', label: 'Leaderboard Point', desc: `Poin kontribusi ${memberLabel.toLowerCase()}`, icon: Trophy, color: 'text-yellow-600 bg-yellow-50' },
        { id: 'learning', label: 'Panduan OS', desc: 'Pusat bantuan & tutorial', icon: BookOpen, color: 'text-sky-600 bg-sky-50' },
      ],
    },
    {
      title: 'Pengaturan System',
      items: [
        { id: 'settings', label: 'Pengaturan Komunitas', desc: 'Profil & akses pengguna', icon: Settings, color: 'text-slate-700 bg-slate-100' },
        ...(isSuperAdmin ? [{ id: 'superadmin', label: 'Master Console', desc: 'Admin panel tenant', icon: ShieldCheck, color: 'text-orange-600 bg-orange-50' }] : []),
      ],
    },
  ];

  const categoriesFiltered = categories.map(cat => ({
    ...cat,
    items: cat.items.filter(item => {
      if (item.id === 'settings' || item.id === 'superadmin') return true;
      return enabledModules.includes(item.id as any);
    })
  })).filter(cat => cat.items.length > 0);

  const handleSelect = (viewId: string) => {
    onNavigate(viewId);
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-xs"
    >
      {/* Backdrop Click */}
      <div className="absolute inset-0 cursor-default" onClick={onClose} />

      {/* Bottom Sheet Drawer */}
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 350 }}
        drag="y"
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 1 }}
        onDragEnd={(event, info) => {
          // If pulled down more than 100px or swiped down fast
          if (info.offset.y > 100 || info.velocity.y > 300) {
            onClose();
          }
        }}
        className="relative w-full max-w-md bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col z-10 overflow-hidden pb-[calc(env(safe-area-inset-bottom,16px)+12px)] cursor-default"
      >
        {/* Spacious, Dedicated Drag Handle Area with visual separation */}
        <div 
          onPointerDown={(e) => dragControls.start(e)}
          className="w-full flex flex-col items-center justify-center pt-3 pb-4 bg-slate-50/80 border-b border-slate-100 shrink-0 cursor-grab active:cursor-grabbing select-none touch-none"
        >
          <div className="w-12 h-1.5 bg-slate-300 rounded-full mb-1.5" />
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            Tarik ke bawah untuk menutup
          </div>
        </div>

        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0 select-none">
          <div>
            <h2 className="text-base font-black text-slate-900">Menu Layanan {memberLabel}</h2>
            <p className="text-xs text-slate-500 font-medium">Semua modul & aplikasi SinergiKita</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Categories List - Scroll is standard & isolated from drag */}
        <div className="p-3 space-y-4 overflow-y-auto native-scroll flex-1 select-none">
          {categoriesFiltered.map((cat, idx) => (
            <div key={idx} className="space-y-1.5">
              <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 px-1">
                {cat.title}
              </h3>
              <div className="grid grid-cols-1 gap-1">
                {cat.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className="w-full p-2.5 rounded-2xl border border-slate-100 hover:border-blue-200 bg-slate-50/50 hover:bg-blue-50/40 flex items-center justify-between text-left transition-all active:scale-[0.98] group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                          <Icon size={18} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                            {item.label}
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium">
                            {item.desc}
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};
