// OVER_LIMIT_JUSTIFIED: Refactoring tertunda, logika komponen kohesif.
import { useState, useRef, useEffect } from 'react';
import { Save, Loader2, Image as ImageIcon, Upload, Shield, Users, Mail, Phone, Settings2, CheckCircle2 } from 'lucide-react';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { AppUser } from '../../../types';
import { TENANT_TEMPLATES } from '../../../tenantTemplates';

export default function CommunitySettings() {
  const { profile, tenant } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tenantName, setTenantName] = useState(tenant?.name || '');
  const [tenantLogo, setTenantLogo] = useState(tenant?.logoUrl || '');
  const [selectedTemplate, setSelectedTemplate] = useState(tenant?.type || 'other');
  const [applyDefaultModules, setApplyDefaultModules] = useState(true);
  const [savingBrand, setSavingBrand] = useState(false);
  const [admins, setAdmins] = useState<AppUser[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);

  useEffect(() => {
    const fetchAdmins = async () => {
      if (!profile?.tenantId) return;
      try {
        const q = query(
          collection(db, 'users'), 
          where('tenantId', '==', profile.tenantId),
          where('role', '!=', 'member')
        );
        const snap = await getDocs(q);
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as AppUser));
        setAdmins(list);
      } catch (err) {
        console.error("Failed to fetch admins:", err);
      } finally {
        setLoadingAdmins(false);
      }
    };
    fetchAdmins();
  }, [profile?.tenantId]);

  const handleUpdateBrand = async () => {
    if (!profile?.tenantId || !tenantName) return;
    setSavingBrand(true);
    try {
      const updateData: Record<string, any> = {
        name: tenantName,
        logoUrl: tenantLogo,
        type: selectedTemplate
      };

      if (applyDefaultModules && selectedTemplate !== tenant?.type) {
        const templateConfig = TENANT_TEMPLATES[selectedTemplate];
        if (templateConfig) {
          updateData.enabledModules = templateConfig.enabledModules;
          updateData.moduleOrder = templateConfig.defaultModuleOrder;
        }
      }

      await updateDoc(doc(db, 'tenants', profile.tenantId), updateData);
      showToast("Pengaturan komunitas diperbarui.");
    } catch (err) {
      showToast("Gagal memperbarui pengaturan.");
    } finally {
      setSavingBrand(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        showToast("Ukuran file terlalu besar (Maks 1MB).");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setTenantLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 px-1">
          <Shield size={12} className="text-blue-600" /> Profil Komunitas
        </h3>
        
        <div className="card-3d p-3 shadow-3d-lg space-y-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Nama Komunitas</label>
            <input 
              type="text" 
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-400 transition-all shadow-inner"
              value={tenantName}
              onChange={e => setTenantName(e.target.value)}
              placeholder="Masukkan nama komunitas..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1">
              <Settings2 size={10} /> Jenis Templat Komunitas
            </label>
            <div className="grid grid-cols-1 gap-2">
              {Object.values(TENANT_TEMPLATES).map((tmpl) => {
                const isSelected = selectedTemplate === tmpl.type;
                const isCurrent = tenant?.type === tmpl.type;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => setSelectedTemplate(tmpl.type)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                      isSelected 
                        ? 'border-indigo-500 bg-indigo-50/10 shadow-sm' 
                        : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'
                    }`}
                  >
                    <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 leading-tight">{tmpl.title}</span>
                        {isCurrent && (
                          <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[7px] font-black uppercase tracking-widest border border-emerald-100">
                            Aktif
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] text-slate-500 leading-tight mt-0.5">{tmpl.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedTemplate !== tenant?.type && (
              <label className="flex items-center gap-2 p-2 bg-amber-50/30 border border-amber-100 rounded-xl mt-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={applyDefaultModules}
                  onChange={(e) => setApplyDefaultModules(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-bold text-amber-800 leading-tight">Sesuaikan Fitur & Menu Bawaan</p>
                  <p className="text-[8px] text-amber-600/90 leading-tight mt-0.5">
                    Otomatis aktifkan modul & susunan menu default untuk templat "{TENANT_TEMPLATES[selectedTemplate]?.title}".
                  </p>
                </div>
              </label>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Logo Komunitas</label>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-200 rounded-xl shadow-inner">
                <div className="relative group">
                  {tenantLogo ? (
                    <img src={tenantLogo} alt="Logo" className="w-12 h-12 rounded-lg object-cover border border-white shadow-3d-sm" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-slate-300 border border-slate-100 shadow-sm">
                      <ImageIcon size={20} />
                    </div>
                  )}
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform border-2 border-white"
                  >
                    <Upload size={12} />
                  </button>
                </div>
                
                <div className="flex-1 min-w-0">
                  <input 
                    type="text" 
                    className="w-full text-[10px] bg-transparent outline-none focus:ring-0 placeholder:text-slate-300 font-medium"
                    value={tenantLogo}
                    onChange={e => setTenantLogo(e.target.value)}
                    placeholder="URL Logo atau upload via ikon..."
                  />
                </div>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/png,image/jpeg"
                  onChange={handleFileChange}
                />
              </div>
              
              <button 
                onClick={handleUpdateBrand}
                disabled={savingBrand}
                className="btn-3d w-full bg-slate-900 text-white py-3 rounded-xl hover:bg-slate-800 font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-[10px] uppercase tracking-widest shadow-3d-sm"
              >
                {savingBrand ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Simpan Profil
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 px-1">
          <Users size={12} className="text-blue-600" /> Struktur Pengurus
        </h3>
        
        <div className="card-3d shadow-3d-lg overflow-hidden">
          {loadingAdmins ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="animate-spin text-slate-300" size={24} />
            </div>
          ) : admins.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-[10px] font-medium italic">
              Belum ada data pengurus terdaftar.
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {admins.map((admin) => (
                <div key={admin.uid} className="p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 border border-blue-100">
                    <Shield size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-black text-slate-900 truncate uppercase">
                      {admin.displayName || 'No Name'}
                    </h4>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded-md text-[8px] font-black uppercase tracking-widest border border-amber-100">
                        {admin.role}
                      </span>
                      {admin.phoneNumber && (
                        <div className="flex items-center gap-1 text-[9px] text-slate-400">
                          <Phone size={10} />
                          {admin.phoneNumber}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="p-3 bg-slate-50 border-t border-slate-100">
            <p className="text-[8px] text-slate-400 leading-relaxed italic">
              * Pengurus dapat dikelola melalui menu "Daftar Warga" dengan mengubah peran (role) anggota.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
