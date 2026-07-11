import React from 'react';
import { AppUser } from '../../types';
import { Star, Award, AlertTriangle, Edit3, MessageCircle, ShieldCheck, CheckCircle2, Clock, UserX } from 'lucide-react';
import { Badge } from '../atoms/Badge';
import { getRoleLabel, ADMIN_ROLES } from '../../lib/permissions';

interface MemberCardProps {
  member: AppUser;
  isAdmin: boolean;
  onEdit: (member: AppUser) => void;
  onMessage: (name: string) => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({ member, isAdmin, onEdit, onMessage }) => {
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

  return (
    <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-all group overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex-1 min-w-0 w-full">
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

        <div className="flex sm:flex-col gap-2 w-full sm:w-auto border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          {isAdmin && (
            <button onClick={() => onEdit(member)} className="flex-1 sm:flex-none p-2 bg-white text-blue-600 rounded-xl shadow-sm border border-gray-100 hover:bg-blue-50 flex items-center justify-center gap-2">
              <Edit3 size={14} /> <span className="sm:hidden text-[10px] font-bold">Edit</span>
            </button>
          )}
          <button onClick={() => onMessage(member.displayName || member.email)} className="flex-1 sm:flex-none p-2 bg-white text-green-600 rounded-xl shadow-sm border border-gray-100 hover:bg-green-50 flex items-center justify-center gap-2">
            <MessageCircle size={14} /> <span className="sm:hidden text-[10px] font-bold">Pesan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
