import {
  collection, query, where, onSnapshot, orderBy,
  addDoc, updateDoc, doc, serverTimestamp, increment, runTransaction
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../../shared/utils/firebase';
import { Poll, PollVote } from '../../../shared/models';

export const votingStorage = {
  subscribeToPolls(tenantId: string, callback: (polls: Poll[]) => void) {
    const q = query(
      collection(db, 'polls'),
      where('tenantId', '==', tenantId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Poll)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'polls');
    });
  },

  subscribeToUserVotes(tenantId: string, userId: string, callback: (votes: PollVote[]) => void) {
    const q = query(
      collection(db, 'poll_votes'),
      where('tenantId', '==', tenantId),
      where('voterId', '==', userId)
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as PollVote)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'poll_votes');
    });
  },

  async createPoll(tenantId: string, data: Partial<Poll>) {
    try {
      await addDoc(collection(db, 'polls'), {
        ...data,
        tenantId,
        totalVotes: 0,
        status: 'active',
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'polls');
    }
  },

  async castVote(tenantId: string, pollId: string, optionId: string, voter: { uid: string; name: string; houseNo: string }) {
    try {
      await runTransaction(db, async (transaction) => {
        const pollRef = doc(db, 'polls', pollId);
        const pollSnap = await transaction.get(pollRef);
        if (!pollSnap.exists()) throw new Error('Polling tidak ditemukan');

        const pollData = pollSnap.data() as Poll;
        const updatedOptions = pollData.options.map(opt => {
          if (opt.id === optionId) {
            return { ...opt, voteCount: (opt.voteCount || 0) + 1 };
          }
          return opt;
        });

        transaction.update(pollRef, {
          options: updatedOptions,
          totalVotes: (pollData.totalVotes || 0) + 1
        });

        const voteDocRef = doc(collection(db, 'poll_votes'));
        transaction.set(voteDocRef, {
          tenantId,
          pollId,
          optionId,
          voterId: voter.uid,
          voterName: voter.name,
          voterHouseNo: voter.houseNo,
          timestamp: serverTimestamp()
        });
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'poll_votes');
    }
  },

  async closePoll(pollId: string) {
    try {
      await updateDoc(doc(db, 'polls', pollId), { status: 'closed' });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'polls');
    }
  }
};
