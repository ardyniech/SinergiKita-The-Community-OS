import { AppUser } from '../types';
import { doc, updateDoc, arrayUnion, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export type AchievementType = 'Helpful Neighbor' | 'Koperasi Star';

export interface Achievement {
  id: AchievementType;
  title: string;
  description: string;
}

export const ACHIEVEMENTS: Record<AchievementType, Achievement> = {
  'Helpful Neighbor': {
    id: 'Helpful Neighbor',
    title: 'Helpful Neighbor',
    description: 'Reported 3+ incidents in the community.',
  },
  'Koperasi Star': {
    id: 'Koperasi Star',
    title: 'Koperasi Star',
    description: 'Made 3+ consistent savings deposits.',
  },
};

export async function checkAndGrantAchievements(
  user: AppUser,
  tenantId: string
): Promise<void> {
  if (!user.id) return;

  // Count incidents
  const incidentSnap = await getDocs(
    query(collection(db, 'emergencies'), where('senderId', '==', user.uid), where('tenantId', '==', tenantId))
  );
  const incidentCount = incidentSnap.size;

  // Count deposits
  const depositSnap = await getDocs(
    query(collection(db, 'koperasi'), where('uid', '==', user.uid), where('tenantId', '==', tenantId), where('type', '==', 'deposit'), where('status', '==', 'completed'))
  );
  const depositCount = depositSnap.size;

  const newAchievements: string[] = [];
  const currentAchievements = user.achievements || [];

  if (incidentCount >= 3 && !currentAchievements.includes('Helpful Neighbor')) {
    newAchievements.push('Helpful Neighbor');
  }
  
  if (depositCount >= 3 && !currentAchievements.includes('Koperasi Star')) {
    newAchievements.push('Koperasi Star');
  }

  if (newAchievements.length > 0) {
    const userRef = doc(db, 'users', user.id);
    await updateDoc(userRef, {
      achievements: arrayUnion(...newAchievements)
    });
  }
}
