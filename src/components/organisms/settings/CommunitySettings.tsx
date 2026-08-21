import { useState, useRef, useEffect } from 'react';
import { Save, Loader2, Image as ImageIcon, Upload, Shield, Users, Mail, Phone } from 'lucide-react';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { AppUser } from '../../../types';

export default function CommunitySettings() {
  const { profile, tenant } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tenantName, setTenantName] = useState(tenant?.name || '');
  const [tenantLogo, setTenantLogo] = useState(tenant?.logoUrl || '');
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
      await updateDoc(doc(db, 'tenants', profile.tenantId), {
        name: tenantName,
        logoUrl: tenantLogo
      });
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
