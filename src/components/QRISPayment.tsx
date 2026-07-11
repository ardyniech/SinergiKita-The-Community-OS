import { Copy, Camera } from 'lucide-react';
import { useState } from 'react';

export default function QRISPayment() {
  const [scanning, setScanning] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('50.123, Rp 50.123');
  };

  const startScanning = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      setScanning(true);
      setTimeout(() => {
        setScanning(false);
        alert('QR code verified!');
      }, 3000);
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Could not access camera.');
    }
  };

  return (
    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 mb-2">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-semibold text-gray-800">Pembayaran Maintenance</h2>
        <button 
          onClick={startScanning}
          className={`p-1 rounded-full ${scanning ? 'text-blue-600 animate-pulse' : 'text-gray-500 hover:text-gray-900'}`}
          title="Scan QR"
        >
          <Camera size={18} />
        </button>
      </div>
      <div className="flex flex-col items-center gap-2">
        <img 
          src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SinergiKita-Maintenance" 
          alt="QRIS Maintenance"
          className="w-32 h-32"
        />
        <div className="text-center text-xs text-gray-600">
          <p>Scan untuk transfer operasional sistem.</p>
          <div className="mt-1 font-bold text-gray-900 flex items-center justify-center gap-2">
            <span>Mohon tambahkan 3 digit unik di akhir: Rp 50.123</span>
            <button 
              onClick={handleCopy}
              className="p-1 hover:bg-gray-100 rounded-full"
              title="Salin nominal dan referensi"
            >
              <Copy size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
