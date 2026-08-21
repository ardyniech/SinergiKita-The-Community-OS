import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFunding } from './useFunding';
import { FundingHeader } from './FundingHeader';
import { FundingProjectCard } from './FundingProjectCard';
import { FundingCreateModal } from './FundingCreateModal';
import { FundingContributeModal } from './FundingContributeModal';
import { FundingMyContributions } from './FundingMyContributions';
import { FundingCertificateModal } from './FundingCertificateModal';
import { FundingProject, FundingContribution } from '../../types';

export function FundingModule() {
  const { tenant } = useAuth();
  const { projects, myContributions, loading, createProject, contributeToProject } = useFunding();

  const [activeTab, setActiveTab] = useState<'projects' | 'my_contributions'>('projects');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [contributingProject, setContributingProject] = useState<FundingProject | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<FundingContribution | null>(null);

  const totalTarget = projects.reduce((sum, p) => sum + (p.target || 0), 0);
  const totalCollected = projects.reduce((sum, p) => sum + (p.current || 0), 0);

  if (loading) {
    return <div className="p-4 text-center text-xs font-bold text-slate-400">Memuat inisiatif warga...</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3 px-2 sm:px-3 pb-8">
      <FundingHeader
        totalTarget={totalTarget}
        totalCollected={totalCollected}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCreate={() => setShowCreateModal(true)}
      />

      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {projects.length === 0 ? (
            <div className="col-span-full p-4 text-center text-slate-400 italic text-xs bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              Belum ada inisiatif patungan warga. Silakan buat yang pertama!
            </div>
          ) : (
            projects.map(project => (
              <FundingProjectCard
                key={project.id}
                project={project}
                onContribute={setContributingProject}
              />
            ))
          )}
        </div>
      )}

      {activeTab === 'my_contributions' && (
        <FundingMyContributions
          contributions={myContributions}
          onOpenCertificate={setSelectedCertificate}
        />
      )}

      {showCreateModal && (
        <FundingCreateModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={createProject}
        />
      )}

      {contributingProject && (
        <FundingContributeModal
          project={contributingProject}
          onClose={() => setContributingProject(null)}
          onSubmit={contributeToProject}
        />
      )}

      {selectedCertificate && (
        <FundingCertificateModal
          contribution={selectedCertificate}
          tenantName={tenant?.name}
          onClose={() => setSelectedCertificate(null)}
        />
      )}
    </div>
  );
}
