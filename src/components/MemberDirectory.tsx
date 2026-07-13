import { useState, useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AnimatePresence, motion } from 'motion/react';
import { MemberCard } from './molecules/MemberCard';
import { MemberAnalytics } from './molecules/MemberAnalytics';
import { RegisterMemberForm } from './molecules/RegisterMemberForm';
import { MemberHeader } from './molecules/MemberHeader';
import { MemberFilters, FilterType } from './molecules/MemberFilters';
import { MemberStats } from './molecules/MemberStats';
import { isAdmin } from '../lib/permissions';
import { AppUser } from '../types';
import { X, Save, CheckCircle, Loader2, Camera, Upload, RotateCcw, AlertCircle } from 'lucide-react';

export default function MemberDirectory() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [members, setMembers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  
  const [editingMember, setEditingMember] = useState<AppUser | null>(null);
  const [editForm, setEditForm] = useState({
    displayName: '',
    phoneNumber: '',
    address: '',
    role: 'member' as any,
    status: 'active' as any,
    isApproved: true,
    isCritical: false,
    observations: ''
  });
  const [saveLoading, setSaveLoading] = useState(false);

  // Camera capture states
  const [capturingMember, setCapturingMember] = useState<AppUser | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [photoSaving, setPhotoSaving] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let localStream: MediaStream | null = null;
    if (capturingMember) {
      setCameraError(null);
      setCapturedImage(null);
      navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 320, facingMode: 'user' },
        audio: false
      }).then((s) => {
        localStream = s;
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      }).catch((err) => {
        console.error("Error accessing camera:", err);
        setCameraError("Tidak dapat mengakses kamera. Harap izinkan akses kamera di browser Anda.");
      });
    }
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [capturingMember]);

  const handleCapture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 240;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Mirror style capture for natural look
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);
    }
  };

  const handleSavePhoto = async () => {
    if (!capturingMember?.id || !capturedImage) return;
    setPhotoSaving(true);
    try {
      await updateDoc(doc(db, 'users', capturingMember.id), {
        photoURL: capturedImage
      });
      showToast("Foto profil berhasil diperbarui!");
      setCapturingMember(null);
    } catch (err: any) {
      console.error(err);
      showToast("Gagal menyimpan foto: " + err.message);
    } finally {
      setPhotoSaving(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 240;
        canvas.height = 240;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, 240, 240);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setCapturedImage(dataUrl);
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!profile?.tenantId) return;
    const q = query(collection(db, 'users'), where('tenantId', '==', profile.tenantId));
    return onSnapshot(q, (snap) => {
      setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
      setLoading(false);
    });
  }, [profile?.tenantId]);

  const handleEditClick = (member: AppUser) => {
    setEditingMember(member);
    setEditForm({
      displayName: member.displayName || '',
      phoneNumber: member.phoneNumber || '',
      address: member.address || '',
      role: member.role || 'member',
      status: member.status || (member.isApproved ? 'active' : 'pending'),
      isApproved: member.isApproved !== undefined ? member.isApproved : true,
      isCritical: member.isCritical || false,
      observations: member.observations || ''
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember?.id) return;

    setSaveLoading(true);
    try {
      await updateDoc(doc(db, 'users', editingMember.id), {
        displayName: editForm.displayName.trim(),
        phoneNumber: editForm.phoneNumber.trim(),
        address: editForm.address.trim(),
        role: editForm.role,
        status: editForm.status,
        isApproved: editForm.isApproved,
        isCritical: editForm.isCritical,
        observations: editForm.observations.trim()
      });
      showToast(`Data warga ${editForm.displayName} berhasil diperbarui.`);
      setEditingMember(null);
    } catch (err: any) {
      showToast("Gagal memperbarui data warga: " + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleApproveInstant = async () => {
    if (!editingMember?.id) return;
    setSaveLoading(true);
    try {
      await updateDoc(doc(db, 'users', editingMember.id), {
        isApproved: true,
        status: 'active'
      });
      showToast(`✅ Warga ${editForm.displayName || 'ini'} telah disetujui bergabung!`);
      setEditingMember(null);
    } catch (err: any) {
      showToast("Gagal menyetujui warga: " + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleMessage = (name: string, phone?: string) => {
    if (phone) {
      showToast(`📲 Membuka WhatsApp untuk menghubungi ${name} (${phone})...`);
      const formatted = phone.replace(/[^0-9]/g, '');
      const cleanPhone = formatted.startsWith('0') ? '62' + formatted.slice(1) : formatted;
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
    } else {
      showToast(`💬 Mengirim pesan internal ke ${name}...`);
    }
  };

  const filtered = members.filter(m => {
    const matchesSearch = (m.displayName || m.email).toLowerCase().includes(searchTerm.toLowerCase());
    const status = m.status || (m.isApproved ? 'active' : 'pending');
    const matchesFilter = filter === 'all' || status === filter;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    active: members.filter(m => (m.status || (m.isApproved ? 'active' : 'pending')) === 'active').length,
    pending: members.filter(m => (m.status || (m.isApproved ? 'active' : 'pending')) === 'pending').length,
    inactive: members.filter(m => (m.status || (m.isApproved ? 'active' : 'pending')) === 'inactive').length,
    total: members.length
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest flex flex-col items-center justify-center gap-2">
        <Loader2 size={24} className="animate-spin text-blue-500" />
        <span>Memuat database warga...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isAdmin(profile) && (
        <div className="space-y-4">
          <MemberHeader 
            members={members} profile={profile} 
            showRegister={showRegister} setShowRegister={setShowRegister}
            showAnalytics={showAnalytics} setShowAnalytics={setShowAnalytics}
          />
          <AnimatePresence>
            {showRegister && <RegisterMemberForm onClose={() => setShowRegister(false)} />}
          </AnimatePresence>
        </div>
      )}

      {showAnalytics && isAdmin(profile) && <MemberAnalytics members={members} />}

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        {isAdmin(profile) && <MemberStats stats={stats} />}
        
        <MemberFilters 
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          filter={filter} setFilter={setFilter}
          isAdmin={isAdmin(profile)}
        />

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Warga tidak ditemukan</p>
            </div>
          ) : (
            filtered.map(member => (
              <MemberCard 
                key={member.id} 
                member={member} 
                isAdmin={isAdmin(profile)} 
                currentUserId={profile?.uid}
                onEdit={handleEditClick} 
                onMessage={handleMessage} 
                onCapturePhoto={(m) => setCapturingMember(m)}
              />
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {editingMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Kelola Data Warga</h3>
                <button onClick={() => setEditingMember(null)} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
                {!editForm.isApproved && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-[10px] font-bold text-amber-800 uppercase tracking-wider font-sans">Menunggu Persetujuan</h4>
                      <p className="text-[10px] text-amber-600 font-medium">Warga ini belum disetujui bergabung.</p>
                    </div>
                    <button 
                      type="button"
                      onClick={handleApproveInstant}
                      disabled={saveLoading}
                      className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-amber-700 transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle size={12} /> Setujui Sekarang
                    </button>
                  </div>
                )}

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nama Lengkap</label>
                    <input 
                      type="text" 
                      required
                      className="w-full p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                      value={editForm.displayName}
                      onChange={e => setEditForm({...editForm, displayName: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">No. WhatsApp</label>
                      <input 
                        type="tel" 
                        required
                        className="w-full p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                        value={editForm.phoneNumber}
                        onChange={e => setEditForm({...editForm, phoneNumber: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Blok / No. Rumah</label>
                      <input 
                        type="text" 
                        required
                        className="w-full p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                        value={editForm.address}
                        onChange={e => setEditForm({...editForm, address: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Peran (Role)</label>
                      <select 
                        className="w-full p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-gray-700"
                        value={editForm.role}
                        onChange={e => setEditForm({...editForm, role: e.target.value as any})}
                      >
                        <option value="member">Warga Biasa</option>
                        <option value="admin">Admin / Pengurus</option>
                        <option value="ketua">Ketua Lingkungan</option>
                        <option value="bendahara">Bendahara</option>
                        <option value="sekretaris">Sekretaris</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status Keanggotaan</label>
                      <select 
                        className="w-full p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-gray-700"
                        value={editForm.status}
                        onChange={e => setEditForm({...editForm, status: e.target.value as any, isApproved: e.target.value === 'active'})}
                      >
                        <option value="active">Aktif (Approved)</option>
                        <option value="pending">Tertunda (Pending)</option>
                        <option value="inactive">Nonaktif</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Catatan Pengamatan / Keterangan</label>
                    <textarea 
                      rows={2}
                      className="w-full p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                      placeholder="Catatan khusus, misal: 'Aktif gotong royong' atau kondisi tertentu."
                      value={editForm.observations}
                      onChange={e => setEditForm({...editForm, observations: e.target.value})}
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input 
                      type="checkbox" 
                      id="isCritical"
                      className="w-4 h-4 text-blue-600 border-gray-200 rounded-sm focus:ring-blue-500/20"
                      checked={editForm.isCritical}
                      onChange={e => setEditForm({...editForm, isCritical: e.target.checked})}
                    />
                    <label htmlFor="isCritical" className="text-[10px] font-bold text-red-600 uppercase tracking-wider cursor-pointer select-none font-sans">
                      ⚠️ Butuh Perhatian Khusus (SOS/Bantuan)
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setEditingMember(null)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    disabled={saveLoading}
                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-md shadow-blue-100"
                  >
                    {saveLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {capturingMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-sm w-full overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <Camera size={16} className="text-blue-600" />
                  <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Ambil Foto Profil</h3>
                </div>
                <button 
                  onClick={() => setCapturingMember(null)} 
                  className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div className="relative aspect-square w-full max-w-[240px] mx-auto rounded-full overflow-hidden bg-gray-950 border-4 border-gray-100 shadow-inner flex items-center justify-center">
                  {/* Camera view */}
                  {!capturedImage && !cameraError && (
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      muted 
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                  )}

                  {/* Circular framing target for profile photo alignment */}
                  {!capturedImage && !cameraError && (
                    <div className="absolute inset-0 border-[16px] border-black/40 rounded-full pointer-events-none flex items-center justify-center">
                      <div className="w-full h-full border border-white/50 rounded-full border-dashed" />
                    </div>
                  )}

                  {/* Captured image preview */}
                  {capturedImage && (
                    <img 
                      src={capturedImage} 
                      alt="Captured Profile" 
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Camera access error state */}
                  {cameraError && !capturedImage && (
                    <div className="absolute inset-0 p-4 flex flex-col items-center justify-center text-center text-gray-400 bg-gray-900">
                      <AlertCircle size={24} className="text-amber-500 mb-2" />
                      <p className="text-[10px] font-bold uppercase tracking-wider text-white mb-1">Akses Kamera Terkendala</p>
                      <p className="text-[9px] font-medium text-gray-400 mb-3 leading-normal">{cameraError}</p>
                    </div>
                  )}
                </div>

                {/* Subtext info */}
                <div className="text-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {capturingMember.displayName || capturingMember.email.split('@')[0]}
                  </p>
                  <p className="text-[9px] font-medium text-gray-400 mt-0.5">
                    {capturedImage ? "Pratinjau foto Anda. Klik simpan jika sudah sesuai." : "Posisikan wajah Anda di tengah lingkaran."}
                  </p>
                </div>

                {/* Actions container */}
                <div className="flex flex-col gap-2 pt-2">
                  {/* Capture / Retake buttons */}
                  {!capturedImage && !cameraError && (
                    <button
                      type="button"
                      onClick={handleCapture}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-100"
                    >
                      <Camera size={14} />
                      Jepret Foto
                    </button>
                  )}

                  {capturedImage && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setCapturedImage(null)}
                        className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <RotateCcw size={14} />
                        Ulangi
                      </button>
                      <button
                        type="button"
                        onClick={handleSavePhoto}
                        disabled={photoSaving}
                        className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-green-100 disabled:opacity-50"
                      >
                        {photoSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        Simpan
                      </button>
                    </div>
                  )}

                  {/* Fallback File Upload (especially when permission denied or no camera device) */}
                  <div className="border-t border-gray-100 pt-3">
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-gray-200 border-dashed"
                    >
                      <Upload size={12} />
                      Unggah dari Galeri Device
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
