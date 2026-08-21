import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { isAdmin } from '../lib/permissions';

export type NotificationItem = {
  id: string;
  title: string;
  description: string;
  type: 'approval' | 'update' | 'request' | 'emergency';
  link?: string;
};

export function useNotifications() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

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
      }, (error) => console.error("NotificationCenter superadmin error:", error));
      unsubscribers.push(unsub);
    }

    // 2. Admin: Pending Members, Incidents, Santunan
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
      }, (error) => console.error("NotificationCenter admin error:", error));
      unsubscribers.push(unsub);

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
            return (new Date().getTime() - date.getTime()) / (1000 * 60 * 60) <= 24;
          })
          .map(doc => ({
            id: `incident-${doc.id}`,
            title: doc.data().title || 'Laporan Baru',
            description: doc.data().description || 'Ada laporan pantauan jalan baru.',
            type: 'update' as const
          }));
        setNotifications(prev => [...prev.filter(n => !n.id.startsWith('incident-')), ...items]);
      }, (error) => console.error("NotificationCenter incident error:", error));
      unsubscribers.push(unsubIncident);

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
      }, (error) => console.error("NotificationCenter santunan error:", error));
      unsubscribers.push(unsubSantunan);
    }

    // 3. Proposals, Emergencies, Funding, Marketplace, Announcements
    if (profile.tenantId && profile.isApproved) {
      const propQ = query(collection(db, 'proposals'), where('tenantId', '==', profile.tenantId), where('status', '==', 'active'));
      const unsubProp = onSnapshot(propQ, (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: `proposal-${doc.id}`,
          title: 'Proposal Aktif',
          description: `Proposal baru: "${doc.data().title}" membutuhkan suara Anda.`,
          type: 'update' as const
        }));
        setNotifications(prev => [...prev.filter(n => !n.id.startsWith('proposal-')), ...items]);
      }, (error) => console.error("NotificationCenter member error:", error));
      unsubscribers.push(unsubProp);

      const emQ = query(collection(db, 'emergencies'), where('tenantId', '==', profile.tenantId));
      const unsubEm = onSnapshot(emQ, (snapshot) => {
        const items = snapshot.docs
          .filter(doc => doc.data().status !== 'resolved')
          .filter(doc => {
            const data = doc.data();
            if (!data.timestamp) return true;
            const date = data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
            return (new Date().getTime() - date.getTime()) / (1000 * 60 * 60) <= 24;
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
      }, (error) => console.error("NotificationCenter emergency subscription error:", error));
      unsubscribers.push(unsubEm);

      const projQ = query(collection(db, 'projects'), where('tenantId', '==', profile.tenantId));
      const unsubProj = onSnapshot(projQ, (snapshot) => {
        const items = snapshot.docs
          .filter(doc => {
            const data = doc.data();
            if (!data.createdAt) return true;
            const date = typeof data.createdAt === 'number' ? new Date(data.createdAt) : data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
            return (new Date().getTime() - date.getTime()) / (1000 * 60 * 60) <= 24;
          })
          .map(doc => ({
            id: `funding-${doc.id}`,
            title: 'Kesempatan Pendanaan Baru',
            description: `Proyek baru "${doc.data().title}" terbuka untuk pendanaan.`,
            type: 'update' as const
          }));
        setNotifications(prev => [...prev.filter(n => !n.id.startsWith('funding-')), ...items]);
      }, (error) => console.warn("NotificationCenter funding projects error:", error));
      unsubscribers.push(unsubProj);

      const mktQ = query(collection(db, 'marketplace'), where('tenantId', '==', profile.tenantId), orderBy('createdAt', 'desc'), limit(5));
      const unsubMkt = onSnapshot(mktQ, (snapshot) => {
        const items = snapshot.docs
          .filter(doc => doc.data().createdAt && (new Date().getTime() - doc.data().createdAt) / (1000 * 60 * 60) <= 24)
          .map(doc => ({
            id: `marketplace-${doc.id}`,
            title: 'Produk Baru di Marketplace',
            description: `${doc.data().sellerName} baru saja menambahkan "${doc.data().name}".`,
            type: 'update' as const
          }));
        setNotifications(prev => [...prev.filter(n => !n.id.startsWith('marketplace-')), ...items]);
      }, (error) => console.warn("NotificationCenter marketplace error:", error));
      unsubscribers.push(unsubMkt);

      const annQ = query(collection(db, 'announcements'), where('tenantId', '==', profile.tenantId), orderBy('createdAt', 'desc'), limit(3));
      const unsubAnn = onSnapshot(annQ, (snapshot) => {
        const items = snapshot.docs
          .filter(doc => {
            const data = doc.data();
            if (!data.createdAt) return true;
            const date = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
            return (new Date().getTime() - date.getTime()) / (1000 * 60 * 60) <= 24;
          })
          .map(doc => ({
            id: `announcement-${doc.id}`,
            title: 'Pengumuman Baru',
            description: doc.data().title || 'Pengumuman dari pengurus',
            type: 'update' as const
          }));
        setNotifications(prev => [...prev.filter(n => !n.id.startsWith('announcement-')), ...items]);
      }, (error) => console.warn("NotificationCenter announcements error:", error));
      unsubscribers.push(unsubAnn);
    }

    return () => unsubscribers.forEach(unsub => unsub());
  }, [profile]);

  return { notifications };
}
