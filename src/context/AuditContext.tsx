import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, addDoc, query, where, onSnapshot, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { AuditEntry } from '../types';
import { isAdmin } from '../lib/permissions';
import { handleFirestoreError, OperationType } from '../lib/firestore-utils';

interface AuditContextType {
  logs: AuditEntry[];
  addAuditEntry: (action: string) => Promise<void>;
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

export const AuditProvider = ({ children }: { children: ReactNode }) => {
  const { profile } = useAuth();
  const [logs, setLogs] = useState<AuditEntry[]>([]);

  useEffect(() => {
    if (!profile?.tenantId || !isAdmin(profile)) {
      setLogs([]);
      return;
    }

    const path = 'audit_logs';
    const q = query(
      collection(db, path),
      where('tenantId', '==', profile.tenantId),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedLogs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AuditEntry[];
      setLogs(fetchedLogs);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });

    return () => unsubscribe();
  }, [profile?.tenantId, profile?.role]);

  const addAuditEntry = async (action: string) => {
    if (!profile) return;

    const path = 'audit_logs';
    try {
      await addDoc(collection(db, path), {
        action,
        user: profile.displayName || profile.email.split('@')[0],
        userEmail: profile.email,
        userRole: profile.role,
        tenantId: profile.tenantId,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  return (
    <AuditContext.Provider value={{ logs, addAuditEntry }}>
      {children}
    </AuditContext.Provider>
  );
};

export const useAudit = () => {
  const context = useContext(AuditContext);
  if (!context) throw new Error('useAudit must be used within an AuditProvider');
  return context;
};
