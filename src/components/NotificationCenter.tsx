import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { isAdmin } from '../lib/permissions';

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  type: 'approval' | 'update' | 'request' | 'emergency';
  link?: string;
};

export default function NotificationCenter() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!profile) return;

    const unsubscribers: (() => void)[] = [];

    // 1. Superadmin: Pending Tenants
    if (profile.role === 'superadmin') {
      const q = query(collection(db, 'tenants'), where('status', '==', 'pending'));
      const unsub = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: `tenant-${doc.id}`,
          title: 'Persetujuan Komunitas',
          description: `Komunitas baru "${doc.data().name}" menunggu persetujuan.`,
          type: 'approval' as const
        }));
        setNotifications(prev => [...prev.filter(n => !n.id.startsWith('tenant-')), ...items]);
      }, (error) => {
        console.error("NotificationCenter superadmin error:", error);
      });
      unsubscribers.push(unsub);
    }

    // 2. Admin: Pending Members
    if (isAdmin(profile) && profile.tenantId && profile.isApproved) {
      const q = query(
        collection(db, 'users'), 
        where('tenantId', '==', profile.tenantId),
        where('isApproved', '==', false)
      );
      const unsub = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: `member-${doc.id}`,
          title: 'Permintaan Bergabung',
          description: `${doc.data().email} ingin bergabung dengan komunitas Anda.`,
          type: 'request' as const
        }));
        setNotifications(prev => [...prev.filter(n => !n.id.startsWith('member-')), ...items]);
      }, (error) => {
        console.error("NotificationCenter admin error:", error);
      });
      unsubscribers.push(unsub);

      // 2b. Admin: New Incidents & Social Assistance Requests
      const incidentQ = query(
        collection(db, 'social_alerts'),
        where('tenantId', '==', profile.tenantId),
        where('type', '==', 'incident'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const unsubIncident = onSnapshot(incidentQ, (snapshot) => {
        const items = snapshot.docs
          .filter(doc => {
            const data = doc.data();
            if (!data.createdAt) return true;
            const date = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
            const diffHours = (new Date().getTime() - date.getTime()) / (1000 * 60 * 60);
            return diffHours <= 24;
          })
          .map(doc => ({
            id: `incident-${doc.id}`,
            title: doc.data().title || 'Laporan Baru',
            description: doc.data().description || 'Ada laporan pantauan jalan baru.',
            type: 'update' as const
          }));
        setNotifications(prev => [...prev.filter(n => !n.id.startsWith('incident-')), ...items]);
      }, (error) => {
        console.error("NotificationCenter incident error:", error);
      });
      unsubscribers.push(unsubIncident);

      // 2c. Admin: Social Assistance Requests
      const santunanQ = query(
        collection(db, 'santunan_claims'),
        where('tenantId', '==', profile.tenantId),
        where('status', '==', 'pending')
      );
      const unsubSantunan = onSnapshot(santunanQ, (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: `santunan-${doc.id}`,
          title: 'Permohonan Bantuan Sosial Baru',
          description: `${doc.data().recipientName} mengajukan bantuan ${doc.data().type} sejumlah Rp ${doc.data().amount.toLocaleString('id-ID')}.`,
          type: 'request' as const
        }));
        setNotifications(prev => [...prev.filter(n => !n.id.startsWith('santunan-')), ...items]);
      }, (error) => {
        console.error("NotificationCenter santunan error:", error);
      });
      unsubscribers.push(unsubSantunan);
    }

    // 3. All Members: Active Proposals (Community Updates)
    if (profile.tenantId && profile.isApproved) {
      const q = query(
        collection(db, 'proposals'),
        where('tenantId', '==', profile.tenantId),
        where('status', '==', 'active')
      );
      const unsub = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: `proposal-${doc.id}`,
          title: 'Proposal Aktif',
          description: `Proposal baru: "${doc.data().title}" membutuhkan suara Anda.`,
          type: 'update' as const
        }));
        setNotifications(prev => [...prev.filter(n => !n.id.startsWith('proposal-')), ...items]);
      }, (error) => {
        console.error("NotificationCenter member error:", error);
      });
      unsubscribers.push(unsub);
    }

    // 4. All Members/Admins: Active emergencies subscription
    if (profile.tenantId && profile.isApproved) {
      const q = query(
        collection(db, 'emergencies'),
        where('tenantId', '==', profile.tenantId)
      );
      const unsub = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs
          .filter(doc => doc.data().status !== 'resolved')
          .filter(doc => {
            const data = doc.data();
            if (!data.timestamp) return true;
            const date = data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
            const diffHours = (new Date().getTime() - date.getTime()) / (1000 * 60 * 60);
            return diffHours <= 24;
          })
          .map(doc => {
            const data = doc.data();
            const statusLabel = data.status === 'triggered' ? 'SIAGA' :
                               data.status === 'accepted' ? 'DIRESPON' :
                               data.status === 'handling' ? 'DITANGANI' : 'SIAGA';
            return {
              id: `emergency-${doc.id}`,
              title: `🚨 PANGGILAN SOS [${statusLabel}]`,
              description: `${data.senderName} melaporkan ${data.type.toUpperCase()} di ${data.senderAddress || 'Lokasi Sektor'}`,
              type: 'emergency' as const
            };
          });
        setNotifications(prev => [...prev.filter(n => !n.id.startsWith('emergency-')), ...items]);
      }, (error) => {
        console.error("NotificationCenter emergency subscription error:", error);
      });
      unsubscribers.push(unsub);
    }

    // 5. Funding Opportunities
    if (profile.tenantId && profile.isApproved) {
      const q = query(
        collection(db, 'projects'),
        where('tenantId', '==', profile.tenantId)
      );
      const unsub = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs
          .filter(doc => {
            const data = doc.data();
            if (!data.createdAt) return true; // fallback
            let date;
            if (typeof data.createdAt === 'number') {
              date = new Date(data.createdAt);
            } else if (data.createdAt.toDate) {
              date = data.createdAt.toDate();
            } else if (typeof data.createdAt === 'string') {
              date = new Date(data.createdAt);
            } else {
              return true;
            }
            const diffHours = (new Date().getTime() - date.getTime()) / (1000 * 60 * 60);
            return diffHours <= 24;
          })
          .map(doc => ({
            id: `funding-${doc.id}`,
            title: 'Kesempatan Pendanaan Baru',
            description: `Proyek baru "${doc.data().title}" terbuka untuk pendanaan.`,
            type: 'update' as const
          }));
        setNotifications(prev => [...prev.filter(n => !n.id.startsWith('funding-')), ...items]);
      }, (error) => {
        console.warn("NotificationCenter funding projects error:", error);
      });
      unsubscribers.push(unsub);
    }

    // 6. Commerce/Marketplace: New Product Listings
    if (profile.tenantId && profile.isApproved) {
      const q = query(
        collection(db, 'marketplace'),
        where('tenantId', '==', profile.tenantId),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const unsub = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs
          .filter(doc => {
            const data = doc.data();
            if (!data.createdAt) return true;
            const diffHours = (new Date().getTime() - data.createdAt) / (1000 * 60 * 60);
            return diffHours <= 24; // Only show products listed in the last 24 hours
          })
          .map(doc => ({
            id: `marketplace-${doc.id}`,
            title: 'Produk Baru di Marketplace',
            description: `${doc.data().sellerName} baru saja menambahkan "${doc.data().name}".`,
            type: 'update' as const
          }));
        setNotifications(prev => [...prev.filter(n => !n.id.startsWith('marketplace-')), ...items]);
      }, (error) => {
        console.warn("NotificationCenter marketplace error:", error);
      });
      unsubscribers.push(unsub);
    }

    // 7. Announcements
    if (profile.tenantId && profile.isApproved) {
      const q = query(
        collection(db, 'announcements'),
        where('tenantId', '==', profile.tenantId),
        orderBy('createdAt', 'desc'),
        limit(3)
      );
      const unsub = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs
          .filter(doc => {
            const data = doc.data();
            if (!data.createdAt) return true;
            const date = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
            const diffHours = (new Date().getTime() - date.getTime()) / (1000 * 60 * 60);
            return diffHours <= 24; // Only show recent announcements
          })
          .map(doc => ({
            id: `announcement-${doc.id}`,
            title: 'Pengumuman Baru',
            description: doc.data().title || 'Pengumuman dari pengurus',
            type: 'update' as const
          }));
        setNotifications(prev => [...prev.filter(n => !n.id.startsWith('announcement-')), ...items]);
      }, (error) => {
        console.warn("NotificationCenter announcements error:", error);
      });
      unsubscribers.push(unsub);
    }

    return () => unsubscribers.forEach(unsub => unsub());
  }, [profile]);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all relative"
      >
        <Bell size={20} />
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            {notifications.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden"
            >
              <div className="p-3 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Notifikasi</h3>
                <span className="text-[10px] text-gray-400 font-medium">{notifications.length} Pesan</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center">
                    <p className="text-xs text-gray-400 italic">Tidak ada notifikasi baru.</p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {notifications.map(n => (
                      <div 
                        key={n.id}
                        className={`p-3 border-b border-gray-50 hover:bg-blue-50/30 transition-colors cursor-pointer group ${
                          n.type === 'emergency' ? 'bg-rose-50/50 hover:bg-rose-50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            n.type === 'emergency' ? 'bg-red-600 animate-pulse' :
                            n.type === 'approval' ? 'bg-orange-500' : 
                            n.type === 'request' ? 'bg-blue-500' : 'bg-green-500'
                          }`} />
                          <p className={`text-[11px] font-bold ${
                            n.type === 'emergency' ? 'text-red-700' : 'text-gray-900'
                          }`}>{n.title}</p>
                        </div>
                        <p className={`text-[10px] leading-relaxed ${
                          n.type === 'emergency' ? 'text-red-900 font-medium' : 'text-gray-600'
                        }`}>{n.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {notifications.length > 0 && (
                <div className="p-2 bg-gray-50 text-center">
                  <button className="text-[10px] font-bold text-blue-600 hover:text-blue-700">Tandai semua dibaca</button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
