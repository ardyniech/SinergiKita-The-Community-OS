// OVER_LIMIT_JUSTIFIED: Menyatukan katalog menu navigasi geser bawah warga (NativeMenuSheet).
import React from 'react';
import { 
  X, Wallet, PiggyBank, Sprout, Store, ShoppingBag, 
  Radio, MessageSquare, Megaphone, HeartHandshake, 
  BookOpen, Trophy, Settings, ShieldCheck, ChevronRight,
  Package, Vote, FileText, ShieldAlert, Calendar, UserPlus, PhoneCall, FileCheck
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

  const categories = [
    {
      title: 'Pelayanan & Administrasi Warga',
      items: [
        { id: 'events', label: 'Agenda & Kerja Bakti', desc: 'Jadwal kegiatan, posyandu & rapat', icon: Calendar, color: 'text-indigo-600 bg-indigo-50' },
        { id: 'guests', label: 'Wajib Lapor Tamu 1x24h', desc: 'Pelaporan tamu menginap warga', icon: UserPlus, color: 'text-teal-600 bg-teal-50' },
        { id: 'contacts', label: 'Kontak Darurat & Fasilitas', desc: 'Puskesmas, Polsek, PLN & RT', icon: PhoneCall, color: 'text-rose-600 bg-rose-50' },
        { id: 'letters', label: 'Layanan Surat RT/RW', desc: 'Pengantar SKCK, domisili, SKU', icon: FileText, color: 'text-blue-600 bg-blue-50' },
        { id: 'lpj', label: 'Ekspor LPJ RT/RW', desc: 'Cetak & unduh LPJ kas bulanan', icon: FileCheck, color: 'text-amber-600 bg-amber-50' },
        { id: 'patrol', label: 'Jadwal Ronda & Siskamling', desc: 'Jadwal & absensi patroli malam', icon: ShieldAlert, color: 'text-emerald-600 bg-emerald-50' },
        { id: 'voting', label: `Suara & E-Voting`, desc: 'Rembuk musyawarah warga', icon: Vote, color: 'text-violet-600 bg-violet-50' },
        { id: 'inventory', label: `Inventaris & Logistik`, desc: 'Peminjaman aset/alat RT', icon: Package, color: 'text-teal-600 bg-teal-50' },
        { id: 'funding', label: 'Gotong Royong & Proyek', desc: `Patungan pembangunan warga`, icon: Sprout, color: 'text-blue-600 bg-blue-50' },
        { id: 'social', label: 'Aksi Peduli & Santunan', desc: 'Bantuan & kepedulian', icon: HeartHandshake, color: 'text-pink-600 bg-pink-50' },
      ],
    },
    {
      title: 'Ekonomi & Keuangan',
      items: [
        { id: 'finance', label: `Buku Kas ${memberLabel}`, desc: `Arus kas & iuran transparan`, icon: Wallet, color: 'text-emerald-600 bg-emerald-50' },
        { id: 'marketplace', label: `Pasar & UMKM Warga`, desc: `Jual beli produk tetangga`, icon: Store, color: 'text-amber-600 bg-amber-50' },
        { id: 'koperasi', label: `Koperasi ${memberLabel}`, desc: 'Simpan pinjam bersama', icon: PiggyBank, color: 'text-cyan-600 bg-cyan-50' },
        { id: 'pos', label: `Kasir POS Warung`, desc: 'Transaksi cepat & nota', icon: ShoppingBag, color: 'text-violet-600 bg-violet-50' },
      ],
    },
    {
      title: 'Komunikasi & Informasi',
      items: [
        { id: 'announcements', label: `Warta Resmi`, desc: 'Pengumuman penting RT/RW', icon: Megaphone, color: 'text-rose-600 bg-rose-50' },
        { id: 'chat', label: `Obrolan Warga`, desc: 'Grup chat & diskusi santai', icon: MessageSquare, color: 'text-sky-600 bg-sky-50' },
        { id: 'ptt', label: 'Radio HT Walkie-Talkie', desc: 'Saluran suara siaga ronda', icon: Radio, color: 'text-amber-600 bg-amber-50' },
      ],
    },
    {
      title: 'Pengaturan & Lainnya',
      items: [
        { id: 'leaderboard', label: 'Leaderboard Warga', desc: 'Poin partisipasi aktif', icon: Trophy, color: 'text-yellow-600 bg-yellow-50' },
        { id: 'learning', label: 'Pusat Belajar & Bantuan', desc: 'Tutorial penggunaan aplikasi', icon: BookOpen, color: 'text-slate-600 bg-slate-100' },
        { id: 'settings', label: 'Pengaturan Akun', desc: 'Profil & data domisili', icon: Settings, color: 'text-slate-700 bg-slate-100' },
        ...(isSuperAdmin ? [{ id: 'superadmin', label: 'Master Console', desc: 'Admin panel tenant', icon: ShieldCheck, color: 'text-orange-600 bg-orange-50' }] : []),
      ],
    },
  ];

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
      <div className="absolute inset-0 cursor-default" onClick={onClose} />
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
        onDragEnd={(e, info) => {
          if (info.offset.y > 100 || info.velocity.y > 300) onClose();
        }}
        className="relative w-full max-w-md bg-white rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col z-10 overflow-hidden pb-4 cursor-default"
      >
        <div 
          onPointerDown={(e) => dragControls.start(e)}
          className="w-full flex flex-col items-center justify-center pt-2.5 pb-2 bg-slate-50 border-b border-slate-100 shrink-0 cursor-grab active:cursor-grabbing select-none"
        >
          <div className="w-10 h-1 bg-slate-300 rounded-full" />
        </div>

        <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xs font-bold text-slate-900">Semua Layanan SinergiKita</h2>
            <p className="text-[10px] text-slate-400">Pilih menu untuk membuka fitur</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
            <X size={16} />
          </button>
        </div>

        <div className="p-2 space-y-3 overflow-y-auto max-h-[70vh]">
          {categories.map((cat, idx) => (
            <div key={idx} className="space-y-1">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">{cat.title}</h3>
              <div className="grid grid-cols-1 gap-1">
                {cat.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className="w-full p-2 rounded-xl border border-slate-100 hover:border-indigo-200 bg-slate-50/60 hover:bg-indigo-50/30 flex items-center justify-between text-left transition-all group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                          <Icon size={15} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 truncate">{item.label}</div>
                          <div className="text-[10px] text-slate-400 truncate">{item.desc}</div>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-500 shrink-0" />
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
