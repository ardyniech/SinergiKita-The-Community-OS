import React from 'react';
import { ShieldAlert, Wallet, Users, TrendingUp } from 'lucide-react';

export const Dashboard = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Community OS Dashboard</h1>
        <button className="bg-red-600 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-red-700 transition">
          <ShieldAlert size={20} /> SOS TRIGGER
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-4">
            <Wallet className="text-green-600" />
            <div>
              <p className="text-sm text-gray-500">Total Kas Komunitas</p>
              <h3 className="text-xl font-bold">Rp 45.200.000</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-4">
            <Users className="text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">Anggota Aktif</p>
              <h3 className="text-xl font-bold">128 Warga</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-4">
            <TrendingUp className="text-purple-600" />
            <div>
              <p className="text-sm text-gray-500">Proyek Berjalan</p>
              <h3 className="text-xl font-bold">4 Inisiatif</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="font-semibold mb-4">AI Community Insights (Gemini)</h2>
        <p className="text-gray-600">"Minggu ini kas komunitas meningkat 5% dari iuran warga. Disarankan untuk meninjau progres renovasi balai warga sebelum akhir bulan."</p>
      </div>
    </div>
  );
};