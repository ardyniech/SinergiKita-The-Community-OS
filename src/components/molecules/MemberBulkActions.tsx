// OVER_LIMIT_JUSTIFIED: Refactoring tertunda, logika komponen kohesif.
import { useState, useRef } from 'react';
import { collection, query, where, getDocs, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Download, Upload, Loader2, FileSpreadsheet, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';

interface MemberBulkActionsProps {
  members: any[];
}

export function MemberBulkActions({ members }: MemberBulkActionsProps) {
  const { profile, tenant } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportCSV = () => {
    if (!members.length) {
      showToast("Tidak ada data warga untuk diekspor.");
      return;
    }

    const exportData = members.map(m => ({
      'Nama': m.displayName || '-',
      'Email': m.email || '-',
      'Role': m.role || 'member',
      'Status': m.status || 'pending',
      'Terdaftar': m.createdAt ? new Date(m.createdAt.toDate()).toLocaleDateString('id-ID') : '-',
      'Alamat': m.address || '-',
      'Telepon': m.phoneNumber || '-'
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `direktori_warga_${tenant?.name?.toLowerCase().replace(/\s+/g, '_') || 'komunitas'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Data warga berhasil diekspor.");
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const data = results.data as any[];
          if (!data.length) {
            showToast("File CSV kosong.");
            setLoading(false);
            return;
          }

          if (!profile?.tenantId) throw new Error("Tenant ID tidak ditemukan");

          const batch = writeBatch(db);
          let count = 0;
          const existingEmails = new Set(members.map(m => m.email?.toLowerCase()));

          for (const row of data) {
            const email = (row.Email || row.email || row.EMAIL)?.trim().toLowerCase();
            const name = (row.Nama || row.nama || row.Name || row.name || row.displayName)?.trim();
            
            if (!email || !email.includes('@')) continue;
            if (existingEmails.has(email)) continue;

            const newUserRef = doc(collection(db, 'users'));
            batch.set(newUserRef, {
              email,
              displayName: name || email.split('@')[0],
              tenantId: profile.tenantId,
              tenantName: tenant?.name || 'Community',
              role: 'member',
              status: 'pending',
              isApproved: false,
              createdAt: serverTimestamp(),
              registeredBy: profile.uid,
              isInvitation: true,
              address: row.Alamat || row.alamat || '',
              phoneNumber: row.Telepon || row.telepon || row.Phone || row.phone || ''
            });
            count++;

            // Batch limit is 500
            if (count >= 499) break;
          }

          if (count > 0) {
            await batch.commit();
            showToast(`${count} warga baru berhasil diimpor.`);
          } else {
            showToast("Tidak ada warga baru yang valid untuk diimpor.");
          }
        } catch (error: any) {
          console.error("Import error:", error);
          showToast("Gagal mengimpor data: " + error.message);
        } finally {
          setLoading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      },
      error: (error) => {
        showToast("Gagal membaca file CSV: " + error.message);
        setLoading(false);
      }
    });
  };

  const downloadTemplate = () => {
    const template = [
      { 'Nama': 'Contoh Nama', 'Email': 'contoh@email.com', 'Alamat': 'Jl. Contoh No. 1', 'Telepon': '08123456789' }
    ];
    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', 'template_impor_warga.csv');
    link.click();
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <button
        onClick={handleExportCSV}
        disabled={loading || !members.length}
        className="btn-3d flex items-center gap-2 px-3 py-1.5 bg-white/80 text-slate-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white transition-all disabled:opacity-50 shadow-3d-sm active:translate-y-0.5"
      >
        <Download size={14} />
        Export CSV
      </button>

      <div className="relative">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv"
          className="hidden"
        />
        <button
          onClick={handleImportClick}
          disabled={loading}
          className="btn-3d flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest border border-indigo-400 transition-all disabled:opacity-50 shadow-3d-sm active:translate-y-0.5"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          Import CSV
        </button>
      </div>

      <button
        onClick={downloadTemplate}
        className="flex items-center gap-1.5 text-[8px] font-black text-slate-400 hover:text-indigo-600 transition-all uppercase tracking-widest px-2 opacity-70 hover:opacity-100"
      >
        <FileSpreadsheet size={12} />
        Download Template
      </button>
    </div>
  );
}
