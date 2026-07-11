import { useState, useRef } from 'react';
import { Save, Loader2, Image as ImageIcon, Upload } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

export default function BrandingSettings() {
  const { profile, tenant } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tenantName, setTenantName] = useState(tenant?.name || '');
  const [tenantLogo, setTenantLogo] = useState(tenant?.logoUrl || '');
  const [savingBrand, setSavingBrand] = useState(false);

  const handleUpdateBrand = async () => {
    if (!profile?.tenantId || !tenantName) return;
    setSavingBrand(true);
    try {
      await updateDoc(doc(db, 'tenants', profile.tenantId), {
        name: tenantName,
        logoUrl: tenantLogo
      });
      showToast("Branding komunitas diperbarui.");
    } catch (err) {
      showToast("Gagal memperbarui branding.");
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
    <div className="mb-6 space-y-3">
      <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-3 flex items-center gap-2 px-1">
        Identitas Komunitas
      </h3>
      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
        <div className="space-y-1">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Nama</label>
          <input 
            type="text" 
            className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
            value={tenantName}
            onChange={e => setTenantName(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Logo Komunitas</label>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 p-2.5 bg-white border border-gray-200 rounded-lg">
              {tenantLogo ? (
                <img src={tenantLogo} alt="Logo Preview" className="w-10 h-10 rounded-lg object-cover border border-gray-100" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-300">
                  <ImageIcon size={16} />
                </div>
              )}
              <div className="flex-1">
                <input 
                  type="text" 
                  className="w-full text-[10px] bg-transparent outline-none focus:ring-0 placeholder:text-gray-300"
                  value={tenantLogo}
                  onChange={e => setTenantLogo(e.target.value)}
                  placeholder="Atau tempel URL gambar di sini..."
                />
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/png,image/jpeg"
                onChange={handleFileChange}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 hover:bg-gray-50 rounded-md text-gray-500 transition-all flex items-center gap-1.5"
                title="Upload Gambar"
              >
                <Upload size={14} />
                <span className="text-[9px] font-black uppercase tracking-tight">Upload</span>
              </button>
            </div>
            
            <button 
              onClick={handleUpdateBrand}
              disabled={savingBrand}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100"
            >
              {savingBrand ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Simpan Branding
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
