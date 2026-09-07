import React, { useState } from 'react';

interface DashboardProps {
  communityName: string;
  balance: number;
  sosActive: boolean;
}

export const CommunityDashboard: React.FC<DashboardProps> = ({ communityName, balance, sosActive }) => {
  const [isSOS, setIsSOS] = useState(sosActive);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard {communityName}</h1>
        <p className="text-gray-600">Kelola administrasi warga dengan transparan.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Finance Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Buku Kas Komunitas</h3>
          <p className="text-3xl font-bold text-emerald-600 mt-2">Rp {balance.toLocaleString('id-ID')}</p>
        </div>

        {/* SOS Trigger */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Status Keamanan</h3>
          <button 
            onClick={() => setIsSOS(!isSOS)}
            className={`mt-4 w-full py-2 px-4 rounded font-bold transition ${isSOS ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
            {isSOS ? 'SOS AKTIF - KIRIM BANTUAN' : 'Sistem Aman'}
          </button>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Modul Tersedia</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Koperasi', 'Funding', 'Pasar', 'Kasir'].map((item) => (
            <div key={item} className="p-4 bg-white rounded shadow text-center border hover:border-blue-500 cursor-pointer">
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};