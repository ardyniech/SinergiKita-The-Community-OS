import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, limit, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { AppProfile } from '../../../types';

export function useMapData(profile: AppProfile | null) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [activeMembers, setActiveMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Real-Time Fetch Incidents
  useEffect(() => {
    if (!profile?.tenantId) return;

    const q = query(
      collection(db, 'social_alerts'),
      where('tenantId', '==', profile.tenantId),
      where('type', '==', 'incident'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...(doc.data() as any) }))
        .filter((item: any) => item.location && typeof item.location.lat === 'number' && typeof item.location.lng === 'number' && !isNaN(item.location.lat) && !isNaN(item.location.lng))
        .filter((item: any) => {
          if (!item.createdAt) return true;
          const date = item.createdAt.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
          const diffHours = (new Date().getTime() - date.getTime()) / (1000 * 60 * 60);
          return diffHours <= 24;
        });
      setAlerts(data);
    }, (error) => {
      console.error("MapData Alerts snapshot error:", error);
    });

    return unsubscribe;
  }, [profile?.tenantId]);

  // 2. Real-Time Fetch SOS Emergencies
  useEffect(() => {
    if (!profile?.tenantId) return;

    const yesterday = Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000));
    const q = query(
      collection(db, 'emergencies'),
      where('tenantId', '==', profile.tenantId),
      where('timestamp', '>=', yesterday)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...(doc.data() as any) }))
        .filter(item => typeof item.latitude === 'number' && typeof item.longitude === 'number' && !isNaN(item.latitude) && !isNaN(item.longitude))
        .filter(item => item.status !== 'resolved');
      setEmergencies(data);
    }, (error) => {
      console.error("MapData SOS snapshot error:", error);
    });

    return unsubscribe;
  }, [profile?.tenantId]);

  // 3. Real-Time Fetch Active Member/Ojol Locations
  useEffect(() => {
    if (!profile?.tenantId) return;

    const q = query(
      collection(db, 'active_locations'),
      where('tenantId', '==', profile.tenantId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...(doc.data() as any) }))
        .filter((item: any) => {
          return typeof item.latitude === 'number' && typeof item.longitude === 'number' && !isNaN(item.latitude) && !isNaN(item.longitude);
        });
      setActiveMembers(data);
      setLoading(false);
    }, (error) => {
      console.error("MapData Active Members snapshot error:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, [profile?.tenantId]);

  return { alerts, emergencies, activeMembers, loading };
}
