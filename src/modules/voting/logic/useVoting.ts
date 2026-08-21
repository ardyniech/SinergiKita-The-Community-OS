import { useState, useEffect } from 'react';
import { Poll, PollVote, AppUser } from '../../../shared/models';
import { votingStorage } from '../storage/votingStorage';
import { dispatcher } from '../../../core/dispatcher';

export function useVoting(tenantId: string | null, profile: AppUser | null) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [userVotes, setUserVotes] = useState<PollVote[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!tenantId) {
      setLoading(false);
      return;
    }
    const unsubPolls = votingStorage.subscribeToPolls(tenantId, (data) => {
      setPolls(data);
      setLoading(false);
    });

    let unsubVotes: (() => void) | undefined;
    if (profile?.uid) {
      unsubVotes = votingStorage.subscribeToUserVotes(tenantId, profile.uid, (data) => {
        setUserVotes(data);
      });
    }

    return () => {
      unsubPolls();
      if (unsubVotes) unsubVotes();
    };
  }, [tenantId, profile?.uid]);

  const handleCreatePoll = async (data: Partial<Poll>) => {
    if (!tenantId || !profile) return;
    setSubmitting(true);
    try {
      await votingStorage.createPoll(tenantId, {
        ...data,
        creatorId: profile.uid,
        creatorName: profile.displayName || profile.email.split('@')[0]
      });
      dispatcher.emit('AUDIT_LOG', `Polling Baru Dibuat: ${data.title}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (pollId: string, optionId: string) => {
    if (!tenantId || !profile) return;
    setSubmitting(true);
    try {
      await votingStorage.castVote(tenantId, pollId, optionId, {
        uid: profile.uid,
        name: profile.displayName || profile.email.split('@')[0],
        houseNo: profile.houseNumber || ''
      });
      dispatcher.emit('AUDIT_LOG', `Suara Diberikan pada Polling ID: ${pollId}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClosePoll = async (pollId: string) => {
    setSubmitting(true);
    try {
      await votingStorage.closePoll(pollId);
      dispatcher.emit('AUDIT_LOG', `Polling Ditutup: ${pollId}`);
    } finally {
      setSubmitting(false);
    }
  };

  const votedPollMap = new Map(userVotes.map(v => [v.pollId, v.optionId]));

  return {
    polls,
    userVotes,
    votedPollMap,
    loading,
    submitting,
    handleCreatePoll,
    handleVote,
    handleClosePoll
  };
}
