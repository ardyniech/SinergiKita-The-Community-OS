import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Loader2, FileText, RefreshCw, AlertTriangle } from 'lucide-react';
import Markdown from 'react-markdown';
import { getAuth } from 'firebase/auth';

interface ReportDashboardProps {
  tenantId?: string;
}

export default function ReportDashboard({ tenantId }: ReportDashboardProps) {
  const { profile, isSuperAdmin } = useAuth() as any;
  const [generating, setGenerating] = useState(false);
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateReport = async () => {
    try {
      setGenerating(true);
      setError(null);
      
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();

      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ period, tenantId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate report');
      }

      const data = await response.json();
      setReport(data.content);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const isAdmin = profile?.role === 'admin' || isSuperAdmin;

  if (!isAdmin) {
    return (
      <div className="p-4 flex flex-col items-center justify-center text-center space-y-3">
        <AlertTriangle className="h-10 w-10 text-yellow-500" />
        <h3 className="text-lg font-semibold">Akses Terbatas</h3>
        <p className="text-sm text-gray-500">Hanya Admin atau Super Admin yang dapat mengakses modul pelaporan ini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto w-full p-2">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
              <FileText className="h-5 w-5 text-indigo-600" />
              Laporan & Analisis AI
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Hasilkan laporan otomatis mengenai keuangan, donasi, dan aktivitas sosial.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <select 
              value={period} 
              onChange={(e: any) => setPeriod(e.target.value)}
              className="text-sm border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 border p-2"
            >
              <option value="weekly">Mingguan</option>
              <option value="monthly">Bulanan</option>
            </select>

            <button 
              onClick={generateReport} 
              disabled={generating}
              className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              {generating ? 'Memuat...' : 'Buat Laporan'}
            </button>
          </div>
        </div>
        
        <div className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm border border-red-100">
              {error}
            </div>
          )}

          {report ? (
            <div className="prose prose-sm max-w-none prose-headings:text-indigo-900 prose-a:text-indigo-600 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="markdown-body">
                <Markdown>{report}</Markdown>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <FileText className="h-12 w-12 text-gray-300 mb-3" />
              <p className="font-medium text-slate-700">Belum ada laporan yang dihasilkan.</p>
              <p className="text-xs text-slate-500 mt-1">Pilih periode dan klik "Buat Laporan" untuk memulai.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
