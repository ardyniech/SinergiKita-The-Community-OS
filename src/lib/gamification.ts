import { doc, updateDoc, increment, getDoc, arrayUnion } from 'firebase/firestore';
import { db } from './firebase';

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export const BADGES: Record<string, BadgeDefinition> = {
  'Pahlawan Dana': {
    id: 'Pahlawan Dana',
    title: 'Pahlawan Dana',
    description: 'Berpartisipasi mendanai proyek warga.',
    icon: 'Rocket',
    color: 'bg-purple-50 text-purple-600 border-purple-200'
  },
  'Peduli Warga': {
    id: 'Peduli Warga',
    title: 'Peduli Warga',
    description: 'Aktif melaporkan & merespons darurat SOS.',
    icon: 'BellRing',
    color: 'bg-rose-50 text-rose-600 border-rose-200'
  },
  'Pedagang Aktif': {
    id: 'Pedagang Aktif',
    title: 'Pedagang Aktif',
    description: 'Memposting produk di Pasar Brotherhood.',
    icon: 'Store',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200'
  },
  'Kontributor Utama': {
    id: 'Kontributor Utama',
    title: 'Kontributor Utama',
    description: 'Mencapai lebih dari 100 poin kontribusi.',
    icon: 'Award',
    color: 'bg-amber-50 text-amber-600 border-amber-200'
  },
  'Koperasi Star': {
    id: 'Koperasi Star',
    title: 'Koperasi Star',
    description: 'Konsisten menabung di Koperasi Warga.',
    icon: 'Wallet',
    color: 'bg-blue-50 text-blue-600 border-blue-200'
  }
};

export async function awardPoints(userId: string, pointsToAdd: number, badgeName?: string): Promise<void> {
  if (!userId) return;
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;

    const userData = userSnap.data();
    const currentPoints = userData.points || 0;
    const currentAchievements = userData.achievements || [];

    const newPoints = currentPoints + pointsToAdd;
    const updates: any = { points: newPoints };

    const newAchievements = [...currentAchievements];
    if (badgeName && !newAchievements.includes(badgeName)) {
      newAchievements.push(badgeName);
      updates.achievements = newAchievements;
    }

    // Check 100 points milestone for "Kontributor Utama"
    if (newPoints >= 100 && !newAchievements.includes('Kontributor Utama')) {
      newAchievements.push('Kontributor Utama');
      updates.achievements = newAchievements;
    }

    await updateDoc(userRef, updates);
  } catch (err) {
    console.error("Error awarding points:", err);
  }
}
