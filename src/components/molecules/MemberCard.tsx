import React from 'react';
import { AppUser } from '../../types';
import { Star, Award, AlertTriangle, Edit3, MessageCircle, ShieldCheck, CheckCircle2, Clock, UserX, Camera } from 'lucide-react';
import { Badge } from '../atoms/Badge';
import { getRoleLabel, ADMIN_ROLES } from '../../lib/permissions';

interface MemberCardProps {
  member: AppUser;
  isAdmin: boolean;
  currentUserId?: string;
  onEdit: (member: AppUser) => void;
  onMessage: (name: string, phoneNumber?: string) => void;
  onCapturePhoto: (member: AppUser) => void;
  onDelete?: (member: AppUser) => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({ 
  member, 
  isAdmin, 
  currentUserId,
  onEdit, 
  onMessage,
  onCapturePhoto,
  onDelete
}) => {
  const getStatusConfig = () => {
    // If explicit status exists, use it. Otherwise derive from isApproved
    const status = member.status || (member.isApproved ? 'active' : 'pending');
    
    switch (status) {
      case 'active':
        return { label: 'Aktif', variant: 'green' as const, icon: CheckCircle2 };
      case 'pending':
        return { label: 'Tertunda', variant: 'orange' as const, icon: Clock };
      case 'inactive':
        return { label: 'Nonaktif', variant: 'gray' as const, icon: UserX };
      default:
        return { label: 'Aktif', variant: 'green' as const, icon: CheckCircle2 };
    }
  };

  const statusConfig = getStatusConfig();
  
  const isSelf = currentUserId === member.uid || (member.id && currentUserId === member.id);
  const canUpdatePhoto = isSelf || isAdmin;

  const getInitials = (name: string) => {
    if (!name) return 'W';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-all group overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* Main Row with Avatar and Info */}
        <div className="flex items-start gap-3.5 flex-1 min-w-0 w-full">
          {/* Avatar Section */}
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 border border-gray-100 group/avatar">
            {member.photoURL ? (
              <img 
                src={member.photoURL} 
                alt={member.displayName || 'Profil'} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-black text-blue-600 bg-blue-50 uppercase font-sans">
                {getInitials(member.displayName || member.email)}
              </div>
            )}
            
            {/* Hover Camera Overlay */}
            {canUpdatePhoto && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onCapturePhoto(member);
                }}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center text-white transition-opacity cursor-pointer text-[8px] font-bold"
                title="Ambil Foto Profil"
              >
                <Camera size={14} />
                <span className="text-[7px] uppercase mt-0.5">Kamera</span>
              </button>
            )}

            {/* Permanent touch badge for camera if canUpdatePhoto */}
            {canUpdatePhoto && (
              <div className="absolute bottom-0 right-0 p-0.5 bg-blue-600 text-white rounded-full border border-white shadow-xs">
                <Camera size={8} />
              </div>
            )}
          </div>

          {/* Member Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-1.5 mb-2">
              <Badge 
                label={getRoleLabel(member.role)} 
                variant={ADMIN_ROLES.includes(member.role) ? 'orange' : 'blue'} 
                icon={ADMIN_ROLES.includes(member.role) ? ShieldCheck : undefined}
              />
              <Badge 
                label={statusConfig.label} 
                variant={statusConfig.variant} 
                icon={statusConfig.icon}
              />
              {member.isCritical && <Badge label="Penting" icon={AlertTriangle} variant="rose" />}
            </div>
            
            <h4 className="text-sm font-black text-gray-900 mb-0.5 truncate">{member.displayName || member.email.split('@')[0]}</h4>
            <p className="text-[10px] font-bold text-gray-400 mb-3 truncate">{member.email}</p>
            
            {member.observations && (
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-tight mb-2 leading-tight">
                {member.observations}
              </p>
            )}
            
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={10} className={s <= (member.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'} />
                ))}
              </div>
              <div className="flex items-center gap-1 text-[10px] font-black text-blue-600">
                <Award size={10} /> {member.points || 0} Pts
              </div>
            </div>

            {member.skills && member.skills.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {member.skills.map(s => (
                  <span key={s} className="text-[9px] font-bold px-2 py-0.5 bg-white border border-gray-100 rounded-lg text-gray-500">#{s}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex sm:flex-col gap-2 w-full sm:w-auto border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0">
          {isAdmin && (
            <>
              <button 
                onClick={() => onEdit(member)} 
                className="flex-1 sm:flex-none p-3 bg-white text-blue-700 rounded-xl shadow-sm border border-blue-100 hover:bg-blue-50 flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <Edit3 size={16} /> <span className="sm:hidden text-xs font-bold uppercase tracking-wider">Kelola</span>
              </button>
              {onDelete && (member.uid !== currentUserId && member.id !== currentUserId) && (
                <button 
                  onClick={() => onDelete(member)} 
                  className="flex-1 sm:flex-none p-3 bg-red-600 text-white rounded-xl shadow-md border border-red-700 hover:bg-red-700 flex items-center justify-center gap-2 active:scale-95 transition-transform" 
                  title="Hapus Warga"
                >
                  <UserX size={16} /> <span className="sm:hidden text-xs font-bold uppercase tracking-wider">Hapus</span>
                </button>
              )}
            </>
          )}
          <button 
            onClick={() => onMessage(member.displayName || member.email, member.phoneNumber)} 
            className="flex-1 sm:flex-none p-3 bg-green-600 text-white rounded-xl shadow-md border border-green-700 hover:bg-green-700 flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <MessageCircle size={16} /> <span className="sm:hidden text-xs font-bold uppercase tracking-wider">Chat</span>
          </button>
        </div>
      </div>
    </div>
  );
};
