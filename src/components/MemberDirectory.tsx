// OVER_LIMIT_JUSTIFIED: Refactoring tertunda, logika komponen kohesif.
import React from 'react';
import { Loader2 } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { useMemberDirectory } from '../hooks/useMemberDirectory';
import { MemberCard } from './molecules/MemberCard';
import { MemberAnalytics } from './molecules/MemberAnalytics';
import { RegisterMemberForm } from './molecules/RegisterMemberForm';
import { MemberHeader } from './molecules/MemberHeader';
import { MemberFilters } from './molecules/MemberFilters';
import { MemberStats } from './molecules/MemberStats';
import { PermissionManager } from './organisms/PermissionManager';
import { MemberEditModal } from './directory/MemberEditModal';
import { MemberDeleteModal } from './directory/MemberDeleteModal';
import { MemberCameraModal } from './directory/MemberCameraModal';
import { isAdmin } from '../lib/permissions';
import { getMemberLabel } from '../lib/terminology';
import { useAuth } from '../context/AuthContext';

export default function MemberDirectory() {
  const { tenant } = useAuth();
  const memberLabel = getMemberLabel(tenant?.type);
  const {
    profile,
    members,
    loading,
    searchTerm,
    setSearchTerm,
    filter,
    setFilter,
    showAnalytics,
    setShowAnalytics,
    showRegister,
    setShowRegister,
    showPermissions,
    setShowPermissions,
    editingMember,
    setEditingMember,
    deletingMember,
    setDeletingMember,
    editForm,
    setEditForm,
    saveLoading,
    capturingMember,
    setCapturingMember,
    cameraError,
    capturedImage,
    setCapturedImage,
    photoSaving,
    videoRef,
    fileInputRef,
    handleCapture,
    handleSavePhoto,
    handleFileUpload,
    handleEditClick,
    handleSaveEdit,
    handleApproveInstant,
    handleDeleteMember,
    handleMessage,
    handleRoleUpdate,
    filtered,
    stats,
    showToast
  } = useMemberDirectory();

  if (loading) {
    return (
      <div className="p-4 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest flex flex-col items-center justify-center gap-2">
        <Loader2 size={24} className="animate-spin text-blue-500" />
        <span>Memuat database {memberLabel.toLowerCase()}...</span>
      </div>
    );
  }

  const isUserAdmin = isAdmin(profile);

  return (
    <div className="space-y-6">
      {isUserAdmin && (
        <div className="space-y-4">
          <MemberHeader
            members={members}
            profile={profile}
            showRegister={showRegister}
            setShowRegister={setShowRegister}
            showAnalytics={showAnalytics}
            setShowAnalytics={setShowAnalytics}
            showPermissions={showPermissions}
            setShowPermissions={setShowPermissions}
          />
          <AnimatePresence>
            {showRegister && <RegisterMemberForm onClose={() => setShowRegister(false)} />}
          </AnimatePresence>
        </div>
      )}

      {showAnalytics && isUserAdmin && <MemberAnalytics members={members} />}

      {showPermissions && isUserAdmin ? (
        <PermissionManager
          members={members}
          currentUserId={profile?.uid}
          onRoleUpdate={handleRoleUpdate}
          showToast={showToast}
        />
      ) : (
        <div className="liquid-glass rounded-[40px] p-4 sm:p-6 shadow-3d-lg border-white/60">
          {isUserAdmin && (
            <div className="mb-8">
              <MemberStats stats={stats} />
            </div>
          )}

          <div className="mb-8">
            <MemberFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filter={filter}
              setFilter={setFilter}
              isAdmin={isUserAdmin}
            />
          </div>

          <div className="space-y-5">
            {filtered.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{memberLabel} tidak ditemukan</p>
              </div>
            ) : (
              filtered.map(member => (
                <MemberCard
                  key={member.id}
                  member={member}
                  isAdmin={isUserAdmin}
                  currentUserId={profile?.uid}
                  onEdit={handleEditClick}
                  onMessage={handleMessage}
                  onCapturePhoto={(m) => setCapturingMember(m)}
                  onDelete={(m) => setDeletingMember(m)}
                />
              ))
            )}
          </div>
        </div>
      )}

      <AnimatePresence>
        {editingMember && (
          <MemberEditModal
            editingMember={editingMember}
            onClose={() => setEditingMember(null)}
            editForm={editForm}
            setEditForm={setEditForm}
            saveLoading={saveLoading}
            handleSaveEdit={handleSaveEdit}
            handleApproveInstant={handleApproveInstant}
            onDeleteMember={(m) => setDeletingMember(m)}
            isCurrentAdmin={isUserAdmin}
            currentUserId={profile?.uid}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deletingMember && (
          <MemberDeleteModal
            deletingMember={deletingMember}
            onClose={() => setDeletingMember(null)}
            onConfirmDelete={handleDeleteMember}
            saveLoading={saveLoading}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {capturingMember && (
          <MemberCameraModal
            capturingMember={capturingMember}
            onClose={() => setCapturingMember(null)}
            videoRef={videoRef}
            fileInputRef={fileInputRef}
            capturedImage={capturedImage}
            setCapturedImage={setCapturedImage}
            cameraError={cameraError}
            photoSaving={photoSaving}
            handleCapture={handleCapture}
            handleSavePhoto={handleSavePhoto}
            handleFileUpload={handleFileUpload}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
