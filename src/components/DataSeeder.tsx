import { useState } from 'react';
import { db } from '../lib/firebase';
import { doc, setDoc, writeBatch, collection } from 'firebase/firestore';
import { Database, Loader2, CheckCircle2 } from 'lucide-react';

const DRG_DATA = [
  { name: "Ike Puspitasari Suripno Adi", nopol: "N 4489 ABZ" },
  { name: "Yanuar Ferdian", nopol: "N 5876 LD" },
  { name: "Wildan Dwi Nurmansyah", nopol: "N 5988 BAM" },
  { name: "Agnes Agustina R", nopol: "N 3069 ADB" },
  { name: "Ardian erfananta", nopol: "N 2869 ADR" },
  { name: "Syahrul Ramadhani Abidin", nopol: "L 6246 ACR" },
  { name: "Andrew Rhesa Cahyono", nopol: "N 2290 EDU" },
  { name: "Rizka Diah Palupi", nopol: "N 5890 EFF" },
  { name: "Ardiansyah", nopol: "N 3528 EGF" },
  { name: "Lilis Indrawati", nopol: "N 5370 ACD" },
  { name: "MUHAMMAD GHIFAR FIRDAUS", nopol: "N 2995 EEW" },
  { name: "Suliana", nopol: "N 3527 ADN" },
  { name: "Royan wahyudi", nopol: "N 5413 ACD" },
  { name: "Nafiansa Hidayatullah", nopol: "N 3201 ACG" },
  { name: "sugeng Rochmat", nopol: "N 6180 ABD" },
  { name: "Saiful A", nopol: "N 6983 VA" },
  { name: "Faris andrik kurniawan", nopol: "N 2333 EGT" },
  { name: "Nur Sri Rahayu", nopol: "N 5928 EDC" },
  { name: "Rita Paulina", nopol: "N 3976 EFM" },
  { name: "Agus Ludiono", nopol: "N 3723 ACD" },
  { name: "Muhammad Junaedi", nopol: "N 6722 DU" },
  { name: "Elvir Balida", nopol: "N 6014 ADL" },
  { name: "Nur Aisyah", nopol: "N 3453 ABO" },
  { name: "Mohammad Imam Anshory", nopol: "N 2975 DE" },
  { name: "Moch.Choirul anam", nopol: "N 5830 ADD" },
  { name: "PRADANA YUDIPUTRA", nopol: "N 2822 MQ" },
  { name: "Tri Sundariati", nopol: "N 6047 LB" },
  { name: "Mega Cahaya Ningsih", nopol: "N 3608 ECR" },
  { name: "setia adi darma", nopol: "N 6151 ADS" },
  { name: "ALVINO RIFALDY PRATAMA", nopol: "AG3265ECQ" },
  { name: "sriwahyuni", nopol: "N4969ADD" },
  { name: "nanik ernawati", nopol: "N 2751 ACO" },
  { name: "Jatmiko puguh s", nopol: "N 3028 EEB" },
  { name: "Trini Puji Lestari", nopol: "N 3299 EES" }
];

export default function DataSeeder() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const seedData = async () => {
    setStatus('loading');
    setError(null);
    try {
      const tenantId = 'drg-testing-123';
      const batch = writeBatch(db);

      // 1. Create Tenant
      const tenantRef = doc(db, 'tenants', tenantId);
      batch.set(tenantRef, {
        id: tenantId,
        name: 'Driver Riang Gembira (DRG)',
        status: 'approved',
        ownerId: 'system',
        createdAt: Date.now(),
        type: 'ojol',
        enabledModules: ['directory', 'social', 'emergency', 'announcements', 'marketplace', 'chat']
      });

      // 2. Create Members
      DRG_DATA.forEach((member, index) => {
        // We use a predictable UID for these testing members
        const uid = `testing-member-${tenantId}-${index}`;
        const userRef = doc(db, 'users', uid);
        batch.set(userRef, {
          uid: uid,
          email: `${member.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
          displayName: member.name,
          observations: `NoPol: ${member.nopol}`,
          role: 'member',
          tenantId: tenantId,
          isApproved: true,
          status: 'active',
          createdAt: Date.now()
        });
      });

      await batch.commit();
      setStatus('success');
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setStatus('error');
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
          <Database size={18} />
        </div>
        <div>
          <h2 className="text-sm font-black text-gray-900 tracking-tight uppercase">Data Seeder</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-0.5">Testing Community Data</p>
        </div>
      </div>

      {status === 'success' ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <CheckCircle2 className="text-green-500 mb-2" size={32} />
          <p className="text-xs font-bold text-gray-600">Berhasil memuat komunitas DRG!</p>
          <p className="text-[10px] text-gray-400 mt-1">Tenant ID: drg-testing-123</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-gray-600 leading-relaxed">
            Klik tombol di bawah untuk membuat komunitas baru <b>"Driver Riang Gembira (DRG)"</b> dan memuat {DRG_DATA.length} anggota testing.
          </p>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-[10px] text-red-600 font-bold uppercase tracking-tight">
              Error: {error}
            </div>
          )}

          <button
            onClick={seedData}
            disabled={status === 'loading'}
            className="w-full py-3 bg-purple-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-purple-100 flex items-center justify-center gap-2 hover:bg-purple-700 transition-all disabled:opacity-50"
          >
            {status === 'loading' ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Proses...
              </>
            ) : (
              'Load Data Komunitas DRG'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
