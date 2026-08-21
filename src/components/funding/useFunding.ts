import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  collection, query, where, onSnapshot, orderBy, 
  addDoc, serverTimestamp, updateDoc, doc, increment 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { FundingProject, FundingContribution } from '../../types';

export function useFunding() {
  const { profile } = useAuth();
  const { showToast } = useToast();

  const [projects, setProjects] = useState<FundingProject[]>([]);
  const [myContributions, setMyContributions] = useState<FundingContribution[]>([]);
  const [loading, setLoading] = useState(true);

  const tenantId = profile?.tenantId;

  useEffect(() => {
    if (!tenantId) {
      setLoading(false);
      return;
    }

    const qProjects = query(
      collection(db, 'projects'),
      where('tenantId', '==', tenantId),
      orderBy('createdAt', 'desc')
    );

    const unsubProjects = onSnapshot(qProjects, (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FundingProject)));
      setLoading(false);
    }, (err) => {
      console.warn("Funding projects error:", err);
      setLoading(false);
    });

    const qContributions = query(
      collection(db, 'funding_contributions'),
      where('tenantId', '==', tenantId),
      where('uid', '==', profile?.uid || '')
    );

    const unsubContributions = onSnapshot(qContributions, (snapshot) => {
      setMyContributions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FundingContribution)));
    }, (err) => console.warn("Contributions error:", err));

    return () => {
      unsubProjects();
      unsubContributions();
    };
  }, [tenantId, profile?.uid]);

  const createProject = async (data: { title: string; target: number; category: string; description: string }) => {
    if (!profile?.uid || !tenantId) return;
    await addDoc(collection(db, 'projects'), {
      tenantId,
      uid: profile.uid,
      ownerName: profile.displayName || profile.email?.split('@')[0] || 'Warga',
      title: data.title,
      target: data.target,
      current: 0,
      backers: 0,
      category: data.category,
      description: data.description,
      status: 'active',
      createdAt: serverTimestamp()
    });
    showToast("Proyek pendanaan berhasil dipublikasikan!");
  };

  const contributeToProject = async (project: FundingProject, amount: number) => {
    if (!profile?.uid || !tenantId) return;
    await updateDoc(doc(db, 'projects', project.id), {
      current: increment(amount),
      backers: increment(1)
    });

    await addDoc(collection(db, 'funding_contributions'), {
      tenantId,
      projectId: project.id,
      projectTitle: project.title,
      uid: profile.uid,
      contributorName: profile.displayName || profile.email?.split('@')[0] || 'Warga',
      amount,
      createdAt: serverTimestamp()
    });
    showToast(`Terima kasih! Kontribusi Rp ${amount.toLocaleString('id-ID')} berhasil disimpan.`);
  };

  return {
    projects,
    myContributions,
    loading,
    createProject,
    contributeToProject
  };
}
