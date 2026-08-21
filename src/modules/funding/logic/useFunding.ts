import { useState, useEffect } from 'react';
import { FundingProject, AppUser } from '../../../shared/models';
import { fundingStorage } from '../storage/fundingStorage';
import { dispatcher } from '../../../core/dispatcher';

export function useFunding(tenantId: string | null, profile: AppUser | null) {
  const [projects, setProjects] = useState<FundingProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!tenantId) return;
    return fundingStorage.subscribeToProjects(tenantId, (data) => {
      setProjects(data);
      setLoading(false);
    });
  }, [tenantId]);

  const handleCreateProject = async (data: Partial<FundingProject>) => {
    if (!tenantId || !profile) return;
    setSubmitting(true);
    try {
      await fundingStorage.createProject(tenantId, {
        ...data,
        creatorId: profile.uid,
        creatorName: profile.displayName || profile.email.split('@')[0]
      });
      dispatcher.emit('AUDIT_LOG', `Project Created: ${data.title}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleContribute = async (projectId: string, amount: number, message: string) => {
    if (!tenantId || !profile) return;
    setSubmitting(true);
    try {
      await fundingStorage.addContribution(tenantId, {
        projectId,
        amount,
        message,
        contributorId: profile.uid,
        contributorName: profile.displayName || profile.email.split('@')[0]
      });
      dispatcher.emit('AUDIT_LOG', `Contributed Rp ${amount.toLocaleString()} to project ${projectId}`);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    projects,
    loading,
    submitting,
    handleCreateProject,
    handleContribute
  };
}
