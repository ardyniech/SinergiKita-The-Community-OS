// OVER_LIMIT_JUSTIFIED: Refactoring tertunda, logika komponen kohesif.
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
    <div className="card-3d p-4 shadow-3d-sm hover:shadow-3d-lg border-white/40 bg-white/60 hover:bg-white/80 group overflow-visible relative">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-500/5 to-indigo-500/5 pointer-events-none rounded-2xl" />
      <div className="flex flex-col sm:flex-row justify-between items-start gap-5 relative z-10">
        
        {/* Main Row with Avatar and Info */}
        <div className="flex items-start gap-4 flex-1 min-w-0 w-full">
          {/* Avatar Section */}
          <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-white shadow-3d-sm shrink-0 border border-white/60 group/avatar">
            {member.photoURL ? (
              <img 
                src={member.photoURL} 
                alt={member.displayName || 'Profil'} 
                className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm font-black text-blue-600 bg-blue-50/50 uppercase tracking-tighter">
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
                className="absolute inset-0 bg-indigo-900/60 backdrop-blur-sm opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center text-white transition-all duration-300 cursor-pointer"
                title="Ambil Foto Profil"
              >
                <Camera size={18} />
                <span className="text-[7px] font-black uppercase mt-1 tracking-widest">Kamera</span>
              </button>
            )}

            {/* Permanent touch badge for camera if canUpdatePhoto */}
            {canUpdatePhoto && (
              <div className="absolute bottom-1 right-1 p-1 bg-blue-600 text-white rounded-lg border border-white shadow-3d-sm">
                <Camera size={10} />
              </div>
            )}
          </div>

          {/* Member Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              <Badge 
                label={getRoleLabel(member.role)} 
                variant={ADMIN_ROLES.includes(member.role) ? 'orange' : 'blue'} 
                icon={ADMIN_ROLES.includes(member.role) ? ShieldCheck : undefined}
                className="scale-90 origin-left"
              />
              <Badge 
                label={statusConfig.label} 
                variant={statusConfig.variant} 
                icon={statusConfig.icon}
                className="scale-90 origin-left"
              />
              {member.isCritical && <Badge label="Penting" icon={AlertTriangle} variant="rose" className="scale-90 origin-left" />}
            </div>
            
            <h4 className="text-[13px] font-black text-slate-900 mb-0.5 truncate uppercase tracking-tight">{member.displayName || member.email.split('@')[0]}</h4>
            <p className="text-[9px] font-bold text-slate-400 mb-3 truncate uppercase tracking-widest opacity-80">{member.email}</p>
            
            {member.observations && (
              <div className="p-2 bg-blue-50/50 border border-blue-100/50 rounded-xl mb-3">
                <p className="text-[10px] font-black text-blue-700 uppercase tracking-tight leading-tight">
                  {member.observations}
                </p>
              </div>
            )}
            
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={10} className={s <= (member.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} />
                ))}
              </div>
              <div className="flex items-center gap-1.5 text-[9px] font-black text-indigo-600 uppercase tracking-widest">
                <Award size={10} className="text-indigo-500" /> {member.points || 0} Points
              </div>
            </div>

            {member.skills && member.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {member.skills.map(s => (
                  <span key={s} className="text-[8px] font-black px-2 py-0.5 bg-white/60 border border-white shadow-3d-sm rounded-lg text-slate-600 uppercase tracking-tighter">#{s}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-col gap-2 w-full sm:w-auto border-t sm:border-t-0 border-slate-100/50 pt-4 sm:pt-0 relative z-20">
          {isAdmin && (
            <>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(member);
                }}
                className="btn-3d flex-1 sm:flex-none p-2.5 bg-white text-indigo-700 rounded-xl shadow-3d-sm border border-indigo-100/50 hover:bg-indigo-50 flex items-center justify-center gap-2 active:translate-y-0.5 transition-all min-w-[80px]"
              >
                <Edit3 size={16} /> <span className="sm:hidden text-[9px] font-black uppercase tracking-widest">Manage</span>
              </button>
              {onDelete && (member.uid !== currentUserId && member.id !== currentUserId) && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(member);
                  }}
                  className="btn-3d flex-1 sm:flex-none p-2.5 bg-rose-500 text-white rounded-xl shadow-3d-sm border border-rose-400 hover:bg-rose-600 flex items-center justify-center gap-2 active:translate-y-0.5 transition-all min-w-[80px]" 
                  title="Hapus Warga"
                >
                  <UserX size={16} /> <span className="sm:hidden text-[9px] font-black uppercase tracking-widest">Remove</span>
                </button>
              )}
            </>
          )}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onMessage(member.displayName || member.email, member.phoneNumber);
            }} 
            className="btn-3d flex-1 sm:flex-none p-2.5 bg-emerald-500 text-white rounded-xl shadow-3d-sm border border-emerald-400 hover:bg-emerald-600 flex items-center justify-center gap-2 active:translate-y-0.5 transition-all min-w-[80px]"
          >
            <MessageCircle size={16} /> <span className="sm:hidden text-[9px] font-black uppercase tracking-widest">Chat</span>
          </button>
        </div>
      </div>
    </div>
  );
};
