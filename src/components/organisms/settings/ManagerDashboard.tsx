// OVER_LIMIT_JUSTIFIED: Modul tunggal kohesif untuk dasbor pengaturan manager.
import { useState, useEffect } from 'react';
import { Save, Loader2, Settings2, Globe, Heart, ShieldAlert, Award, ToggleLeft, ToggleRight, Check, HelpCircle } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { CommunityModule } from '../../../types';
import { TENANT_TEMPLATES } from '../../../tenantTemplates';
import { GLOSSARIES, getGlossary } from '../../../shared/utils/glossary';

export default function ManagerDashboard() {
  const { profile, tenant } = useAuth();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(tenant?.type || 'other');
  const [selectedStyle, setSelectedStyle] = useState(tenant?.languageStyle || 'formal');
  const [enabledMods, setEnabledMods] = useState<CommunityModule[]>([]);

  useEffect(() => {
    if (tenant?.enabledModules) {
      setEnabledMods(tenant.enabledModules);
    } else {
      setEnabledMods(['finance', 'directory', 'announcements', 'chat']);
    }
  }, [tenant]);

  const coreModules: { id: CommunityModule; label: string; desc: string }[] = [
    { id: 'finance', label: 'Buku Kas', desc: 'Pencatatan uang masuk, keluar, dan laporan berkala' },
    { id: 'directory', label: 'Direktori Anggota', desc: 'Daftar data dan profil seluruh anggota pangkalan' },
    { id: 'announcements', label: 'Warta / Berita', desc: 'Papan pengumuman informasi penting pengurus' },
    { id: 'chat', label: 'Ruang Obrolan', desc: 'Diskusi interaktif antar sesama anggota' }
  ];

  const optionalModules: { id: CommunityModule; label: string; desc: string }[] = [
    { id: 'emergency', label: 'Alarm SOS Darurat', desc: 'Pemberitahuan darurat langsung ke semua HP anggota' },
    { id: 'ptt', label: 'Walkie-Talkie (HT)', desc: 'Komunikasi suara langsung satu tombol' },
    { id: 'koperasi', label: 'Koperasi Simpan Pinjam', desc: 'Kas pinjaman mandiri dan kesejahteraan anggota' },
    { id: 'funding', label: 'Patungan / Urunan', desc: 'Crowdfunding dana untuk proyek atau kegiatan sosial' },
    { id: 'marketplace', label: 'Pasar & UMKM', desc: 'Tempat promosi dan jual beli produk antar warga' },
    { id: 'inventory', label: 'Inventaris Logistik', desc: 'Pencatatan aset barang milik pangkalan/komunitas' },
    { id: 'voting', label: 'Pemungutan Suara', desc: 'E-Voting keputusan bersama yang adil' },
    { id: 'letters', label: 'Layanan Administrasi', desc: 'Pembuatan surat pengantar otomatis' },
    { id: 'patrol', label: 'Siskamling / Ronda', desc: 'Jadwal piket ronda malam teratur' },
    { id: 'events', label: 'Agenda Kegiatan', desc: 'Kalender jadwal kumpul dan silaturahmi' },
    { id: 'guests', label: 'Lapor Tamu 1x24 Jam', desc: 'Pelaporan tamu menginap demi keamanan' },
    { id: 'contacts', label: 'Kontak Darurat', desc: 'Daftar nomor telepon darurat daerah terdekat' },
    { id: 'lpj', label: 'Laporan LPJ Bulanan', desc: 'Ekspor laporan pertanggungjawaban dalam satu ketukan' },
    { id: 'ideas', label: 'Kotak Gagasan', desc: 'Wadah usulan dan saran dari anggota' },
    { id: 'watch', label: 'Pantau Perjalanan', desc: 'Fitur pelacakan perjalanan rawan bagi rekan driver' }
  ];

  const handleToggleModule = (modId: CommunityModule) => {
    setEnabledMods(prev => 
      prev.includes(modId) ? prev.filter(id => id !== modId) : [...prev, modId]
    );
  };

  const handleApplyTemplateDefaults = (type: typeof selectedTemplate) => {
    setSelectedTemplate(type);
    const tmpl = TENANT_TEMPLATES[type];
    if (tmpl) {
      setEnabledMods(tmpl.enabledModules);
    }
  };

  const handleSave = async () => {
    if (!profile?.tenantId) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'tenants', profile.tenantId), {
        type: selectedTemplate,
        languageStyle: selectedStyle,
        enabledModules: enabledMods,
        moduleOrder: enabledMods
      });
      showToast('Konfigurasi Pengurus berhasil disimpan!');
    } catch (err) {
      showToast('Gagal menyimpan konfigurasi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 px-1">
      {/* 1. Templat Komunitas */}
      <div className="space-y-2">
        <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
          <Settings2 size={12} className="text-indigo-600" /> 1. Jenis Templat Komunitas
        </h3>
        <p className="text-[9px] text-slate-500 leading-normal">
          Pilih templat utama yang paling menggambarkan komunitas Anda untuk mengoptimalkan menu awal.
        </p>
        <div className="grid grid-cols-1 gap-1.5">
          {Object.values(TENANT_TEMPLATES).map(tmpl => {
            const isSel = selectedTemplate === tmpl.type;
            return (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => handleApplyTemplateDefaults(tmpl.type)}
                className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                  isSel ? 'border-indigo-600 bg-indigo-50/15 ring-1 ring-indigo-500/20' : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                <div className={`mt-0.5 w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${isSel ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                  {isSel && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 leading-none">{tmpl.title}</span>
                  <p className="text-[8px] text-slate-400 mt-0.5 leading-tight">{tmpl.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Kamus Gaya Bahasa */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
          <Globe size={12} className="text-indigo-600" /> 2. Kamus Gaya Bahasa
        </h3>
        <p className="text-[9px] text-slate-500 leading-normal">
          Sesuaikan panggilan, sapaan, dan tulisan tombol aplikasi agar pas dengan kebiasaan anggota Anda.
        </p>
        <div className="grid grid-cols-1 gap-1.5">
          {(['formal', 'family', 'ojol', 'casual'] as const).map(styleKey => {
            const isSel = selectedStyle === styleKey;
            const gloss = GLOSSARIES[styleKey];
            const labels = {
              formal: 'Formal & Sopan (Bapak/Ibu, Warga)',
              family: 'Kekeluargaan (Tetangga, Kas Gotong Royong)',
              ojol: 'Solidaritas Ojol (Ndan, Uang Kas Solidaritas)',
              casual: 'Santai & Gaul (Sobat/Bro, Kas Santai)'
            };
            return (
              <button
                key={styleKey}
                type="button"
                onClick={() => setSelectedStyle(styleKey)}
                className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
                  isSel ? 'border-indigo-600 bg-indigo-50/15' : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${isSel ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                    {isSel && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="text-xs font-bold text-slate-800 leading-none">{labels[styleKey]}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 pl-5 border-l border-slate-100 mt-0.5">
                  <span className="text-[8px] text-slate-400">Sapaan: <strong className="text-slate-600">"{gloss.salam.substring(0, 15)}..."</strong></span>
                  <span className="text-[8px] text-slate-400">Anggota: <strong className="text-slate-600">"{gloss.member}"</strong></span>
                  <span className="text-[8px] text-slate-400">Kas: <strong className="text-slate-600">"{gloss.iuran}"</strong></span>
                  <span className="text-[8px] text-slate-400">Diskusi: <strong className="text-slate-600">"{gloss.obrolan}"</strong></span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Fitur Utama & Tambahan */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
          <Award size={12} className="text-indigo-600" /> 3. Kelola Modul & Fitur Komunitas
        </h3>

        {/* Core Features */}
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1.5">
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Fitur Utama (Core)</span>
          <p className="text-[8px] text-slate-400 leading-tight">Fitur dasar pilar komunitas yang selalu aktif untuk kelancaran organisasi.</p>
          <div className="space-y-1.5 mt-1">
            {coreModules.map(mod => (
              <div key={mod.id} className="p-2 bg-white rounded-lg border border-slate-200/50 flex items-center justify-between">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-800">{mod.label}</h4>
                  <p className="text-[8px] text-slate-400 leading-none mt-0.5">{mod.desc}</p>
                </div>
                <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[7px] font-bold uppercase">Wajib</span>
              </div>
            ))}
          </div>
        </div>

        {/* Optional Features */}
        <div className="space-y-1.5">
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest px-1">Fitur Tambahan (Opsional)</span>
          <p className="text-[8px] text-slate-400 px-1 leading-tight">Aktifkan atau nonaktifkan fitur tambahan sesuai kebutuhan pangkalan Anda.</p>
          <div className="grid grid-cols-1 gap-1.5">
            {optionalModules.map(mod => {
              const isActive = enabledMods.includes(mod.id);
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => handleToggleModule(mod.id)}
                  className={`p-2 rounded-xl border text-left flex items-center justify-between transition-colors ${
                    isActive ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50/40 opacity-70'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-[10px] font-black text-slate-800">{mod.label}</h4>
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                    </div>
                    <p className="text-[8px] text-slate-400 leading-tight mt-0.5">{mod.desc}</p>
                  </div>
                  {isActive ? (
                    <ToggleRight className="text-emerald-500" size={24} />
                  ) : (
                    <ToggleLeft className="text-slate-300" size={24} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Button Simpan */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
      >
        {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
        <span>Simpan Konfigurasi</span>
      </button>
    </div>
  );
}
