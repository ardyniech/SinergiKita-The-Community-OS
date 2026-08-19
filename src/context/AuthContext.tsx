import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc, serverTimestamp, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { AppUser, Tenant } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firestore-utils';
import { SUPERADMIN_EMAILS } from '../lib/permissions';

interface AuthContextType {
  user: User | null;
  profile: AppUser | null;
  tenant: Tenant | null;
  loading: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  const isSuperAdmin = profile?.role === 'superadmin' || (user?.email && SUPERADMIN_EMAILS.includes(user.email)) || false;

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setProfile(null);
        setTenant(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Profile listener
  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as AppUser;
        setProfile(data);

        // Fix: If this is a superadmin email but role isn't superadmin, force update it
        const isMaster = user.email && SUPERADMIN_EMAILS.includes(user.email);
        if (isMaster && data.role !== 'superadmin') {
          await setDoc(doc(db, 'users', user.uid), { ...data, role: 'superadmin' }, { merge: true });
        }
        
        setLoading(false);
      } else {
        // Document doesn't exist yet, try to create it
        try {
          const isMaster = user.email && SUPERADMIN_EMAILS.includes(user.email);
          let inviteData: any = null;
          let inviteDocsToDelete: string[] = [];

          if (user.email) {
            const q = query(
              collection(db, 'users'),
              where('email', '==', user.email.toLowerCase())
            );
            const inviteSnap = await getDocs(q);
            if (!inviteSnap.empty) {
              // Find the first invitation doc with a valid tenantId
              const mainInvite = inviteSnap.docs.find(doc => doc.data().tenantId);
              if (mainInvite) {
                inviteData = mainInvite.data();
              } else {
                // Otherwise take the first one
                inviteData = inviteSnap.docs[0].data();
              }
              // Mark all of them for deletion
              inviteDocsToDelete = inviteSnap.docs.map(doc => doc.id);
            }
          }

          const newProfile: AppUser = {
            uid: user.uid,
            email: user.email || '',
            role: inviteData?.role || (isMaster ? 'superadmin' : 'member'),
            tenantId: inviteData?.tenantId || null,
            tenantName: inviteData?.tenantName || null,
            isApproved: isMaster ? true : (inviteData ? true : false),
            status: (inviteData || isMaster) ? 'active' : 'pending',
            displayName: inviteData?.displayName || user.displayName || user.email?.split('@')[0] || '',
            phoneNumber: inviteData?.phoneNumber || user.phoneNumber || '',
            address: inviteData?.address || '',
            createdAt: inviteData?.createdAt || serverTimestamp(),
          };

          await setDoc(doc(db, 'users', user.uid), newProfile);

          // Clean up all old/duplicate invitation documents
          for (const docId of inviteDocsToDelete) {
            if (docId !== user.uid) {
              await deleteDoc(doc(db, 'users', docId));
            }
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`);
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Tenant listener
  useEffect(() => {
    if (!profile?.tenantId) {
      setTenant(null);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, 'tenants', profile.tenantId), (tSnap) => {
      if (tSnap.exists()) {
        setTenant({ id: tSnap.id, ...tSnap.data() } as Tenant);
      } else {
        setTenant(null);
      }
    }, (error) => {
      console.error("Tenant listener error:", error);
    });

    return () => unsubscribe();
  }, [profile?.tenantId]);

  return (
    <AuthContext.Provider value={{ user, profile, tenant, loading, isSuperAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
