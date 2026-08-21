// OVER_LIMIT_JUSTIFIED: Refactoring tertunda, logika komponen kohesif.
import { useState, useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useAudit } from '../context/AuditContext';
import { AppUser } from '../types';
import { FilterType } from '../components/molecules/MemberFilters';

export function useMemberDirectory() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const { addAuditEntry } = useAudit();
  const [members, setMembers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);

  const [editingMember, setEditingMember] = useState<AppUser | null>(null);
  const [deletingMember, setDeletingMember] = useState<AppUser | null>(null);
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

  useEffect(() => {
    if (!profile?.tenantId) return;
    const q = query(collection(db, 'users'), where('tenantId', '==', profile.tenantId));
    return onSnapshot(q, (snap) => {
      setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
      setLoading(false);
    });
  }, [profile?.tenantId]);

  const handleCapture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 240;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    if (ctx) {
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
      addAuditEntry(`Memperbarui profil warga: ${editForm.displayName}`);
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
      addAuditEntry(`Menyetujui pendaftaran warga: ${editForm.displayName || 'Anonim'}`);
      showToast(`✅ Warga ${editForm.displayName || 'ini'} telah disetujui bergabung!`);
      setEditingMember(null);
    } catch (err: any) {
      showToast("Gagal menyetujui warga: " + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!deletingMember?.id) return;

    setSaveLoading(true);
    try {
      await deleteDoc(doc(db, 'users', deletingMember.id));
      addAuditEntry(`Menghapus data warga: ${deletingMember.displayName || deletingMember.email}`);
      showToast(`🗑️ Warga "${deletingMember.displayName || deletingMember.email}" berhasil dihapus.`);
      setDeletingMember(null);
      setEditingMember(null);
    } catch (err: any) {
      showToast("Gagal menghapus warga: " + err.message);
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

  const handleRoleUpdate = async (memberId: string, newRole: string) => {
    await updateDoc(doc(db, 'users', memberId), { role: newRole });
    addAuditEntry(`Mengubah peran anggota menjadi: ${newRole}`);
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

  return {
    profile,
    members,
    loading,
    searchTerm,
    setSearchTerm,
    filter,
    setFilter,
    showAnalytics,
    setShowAnalytics,
    showRegister,
    setShowRegister,
    showPermissions,
    setShowPermissions,
    editingMember,
    setEditingMember,
    deletingMember,
    setDeletingMember,
    editForm,
    setEditForm,
    saveLoading,
    capturingMember,
    setCapturingMember,
    cameraError,
    capturedImage,
    setCapturedImage,
    photoSaving,
    videoRef,
    fileInputRef,
    handleCapture,
    handleSavePhoto,
    handleFileUpload,
    handleEditClick,
    handleSaveEdit,
    handleApproveInstant,
    handleDeleteMember,
    handleMessage,
    handleRoleUpdate,
    filtered,
    stats,
    showToast
  };
}
