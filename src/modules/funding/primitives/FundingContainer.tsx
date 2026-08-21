import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useFunding } from '../logic/useFunding';
import { FundingHeader } from './FundingHeader';
import { ProjectCard } from './ProjectCard';
import { CreateProjectModal } from './CreateProjectModal';
import { ContributeModal } from './ContributeModal';
import { DonorCertificateModal } from './DonorCertificateModal';
import { MyContributionsList } from './MyContributionsList';
import { Loader2, Rocket } from 'lucide-react';
import { FundingProject } from '../../../shared/models';

export const FundingContainer: React.FC = () => {
  const { profile } = useAuth();
  const { projects, contributions, loading, submitting, handleCreateProject, handleContribute } = useFunding(profile?.tenantId || null, profile);
  const [activeTab, setActiveTab] = useState<'active' | 'my-contributions'>('active');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<FundingProject | null>(null);
  const [certData, setCertData] = useState<{ contributorName: string; projectTitle: string; amount: number } | null>(null);

  const isAdmin = ['admin', 'ketua', 'bendahara', 'sekretaris', 'superadmin'].includes(profile?.role || '');
  const tenantName = profile?.tenantName || 'Komunitas Warga';

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <FundingHeader 
        onAddProject={() => setShowCreateModal(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
      />

      <div className="animate-in fade-in duration-300">
        {activeTab === 'active' && (
          projects.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-1">
              <Rocket size={24} className="mx-auto text-slate-300" />
              <p className="text-xs font-semibold text-slate-500">Belum ada inisiatif patungan aktif.</p>
              <p className="text-[10px] text-slate-400">Pengurus dapat membuat proyek sosial untuk warga.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {projects.map(project => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  tenantName={tenantName}
                  onContribute={setSelectedProject} 
                />
              ))}
            </div>
          )
        )}

        {activeTab === 'my-contributions' && (
          <MyContributionsList
            contributions={contributions}
            projects={projects}
            onViewCert={(c, pTitle) => setCertData({ contributorName: c.contributorName, projectTitle: pTitle, amount: c.amount })}
          />
        )}
      </div>

      {showCreateModal && (
        <CreateProjectModal
          submitting={submitting}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateProject}
        />
      )}

      {selectedProject && (
        <ContributeModal
          project={selectedProject}
          submitting={submitting}
          onClose={() => setSelectedProject(null)}
          onContribute={handleContribute}
          onSuccess={(amount) => {
            const pTitle = selectedProject.title;
            setSelectedProject(null);
            setCertData({
              contributorName: profile?.displayName || profile?.email?.split('@')[0] || 'Warga',
              projectTitle: pTitle,
              amount
            });
          }}
        />
      )}

      {certData && (
        <DonorCertificateModal
          contributorName={certData.contributorName}
          projectTitle={certData.projectTitle}
          amount={certData.amount}
          tenantName={tenantName}
          onClose={() => setCertData(null)}
        />
      )}
    </div>
  );
};
