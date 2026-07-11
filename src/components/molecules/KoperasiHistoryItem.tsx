interface KoperasiHistoryItemProps {
  record: any;
}

export function KoperasiHistoryItem({ record: h }: KoperasiHistoryItemProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
      <div className="flex items-center gap-3">
        <div className="text-[10px] font-bold text-gray-400 w-10">
          {h.timestamp ? new Date(h.timestamp.seconds * 1000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '...'}
        </div>
        <div>
          <p className="text-[11px] font-bold text-gray-800 capitalize">{h.type === 'deposit' ? 'Simpanan' : 'Pinjaman'}</p>
          <p className={`text-[9px] font-black uppercase tracking-widest ${
            h.status === 'completed' ? 'text-green-600' : h.status === 'pending' ? 'text-orange-600' : 'text-red-600'
          }`}>{h.status}</p>
        </div>
      </div>
      <div className={`text-xs font-black ${h.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
        {h.type === 'deposit' ? '+' : '-'}Rp {h.amount.toLocaleString()}
      </div>
    </div>
  );
}
