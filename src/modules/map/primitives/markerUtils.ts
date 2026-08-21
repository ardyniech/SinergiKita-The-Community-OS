export const getIncidentEmoji = (type: string) => {
  if (type === 'traffic') return '🚧';
  if (type === 'accident') return '🚨';
  if (type === 'roadblock') return '⚠️';
  return '📍';
};

export const createIncidentIcon = (L: any, alert: any) => {
  const emoji = getIncidentEmoji(alert.incidentType);
  return L.divIcon({
    html: `
      <div class="flex flex-col items-center">
        <div class="flex items-center justify-center w-7 h-7 rounded-full bg-rose-500 border border-white shadow-lg animate-pulse">
          <span class="text-[11px]">${emoji}</span>
        </div>
        <div class="bg-slate-900 text-[8px] font-black text-white px-1 py-0.5 rounded shadow mt-0.5 whitespace-nowrap uppercase tracking-wider scale-95 origin-top">
          ${alert.title}
        </div>
      </div>
    `,
    className: 'custom-leaflet-marker',
    iconSize: [40, 44],
    iconAnchor: [20, 44]
  });
};

export const createSosIcon = (L: any, sos: any) => {
  return L.divIcon({
    html: `
      <div class="flex flex-col items-center">
        <div class="flex items-center justify-center w-8 h-8 rounded-full bg-red-600 border-2 border-white shadow-[0_0_15px_rgba(220,38,38,0.8)] animate-bounce">
          <span class="text-[12px]">🆘</span>
        </div>
        <div class="bg-red-600 text-[8px] font-black text-white px-1.5 py-0.5 rounded shadow-lg mt-0.5 whitespace-nowrap uppercase tracking-widest scale-100 origin-top">
          SOS: ${sos.senderName}
        </div>
      </div>
    `,
    className: 'custom-leaflet-marker',
    iconSize: [44, 48],
    iconAnchor: [22, 48]
  });
};

export const createUserIcon = (L: any) => {
  return L.divIcon({
    html: `
      <div class="flex flex-col items-center">
        <div class="relative flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 border-2 border-white text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]">
          <span class="text-[14px]">📍</span>
          <span class="absolute top-0 right-0 w-2 h-2 rounded-full bg-green-400 border border-white animate-ping"></span>
        </div>
        <div class="bg-blue-600 text-[9px] font-black text-white px-2 py-0.5 rounded-md shadow-md mt-1 whitespace-nowrap tracking-wider">
          LOKASI SAYA
        </div>
      </div>
    `,
    className: 'custom-leaflet-marker',
    iconSize: [44, 48],
    iconAnchor: [22, 48]
  });
};

export const createMemberIcon = (L: any, member: any) => {
  const isOjol = member.role === 'Ojol' || (member.displayName || '').toLowerCase().includes('ojol');
  const badgeEmoji = isOjol ? '🛵' : '👤';
  return L.divIcon({
    html: `
      <div class="flex flex-col items-center">
        <div class="relative flex items-center justify-center w-7 h-7 rounded-full ${
          isOjol 
            ? 'bg-emerald-500 border border-white text-white' 
            : 'bg-cyan-500 border border-white text-white'
        } shadow-lg ring-2 ${isOjol ? 'ring-emerald-200' : 'ring-cyan-200'}">
          <span class="text-[11px]">${badgeEmoji}</span>
          <span class="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-green-400 border border-white animate-ping"></span>
        </div>
        <div class="bg-slate-950/95 text-[8px] font-black text-white px-1 py-0.5 rounded shadow-md mt-0.5 whitespace-nowrap scale-90 origin-top tracking-tighter">
          ${member.displayName}
        </div>
      </div>
    `,
    className: 'custom-leaflet-marker',
    iconSize: [40, 44],
    iconAnchor: [20, 44]
  });
};
