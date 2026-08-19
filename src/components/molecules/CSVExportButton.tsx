import React from 'react';
import { Download } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import Papa from 'papaparse';

interface CSVExportButtonProps {
  data: any[];
  filename?: string;
  columns?: { key: string; label: string }[];
  className?: string;
}

export function CSVExportButton({ data, filename = 'export', columns, className = '' }: CSVExportButtonProps) {
  const { showToast } = useToast();

  const handleExport = () => {
    try {
      let exportData = data;

      // If columns are provided, pick and rename properties
      if (columns && columns.length > 0) {
        exportData = data.map(item => {
          const row: Record<string, any> = {};
          columns.forEach(col => {
            let val = item[col.key];
            if (val && typeof val === 'object' && val.toDate) {
              val = val.toDate().toLocaleString('id-ID'); // Handle Firestore Timestamps
            }
            row[col.label] = val;
          });
          return row;
        });
      }

      const csv = Papa.unparse(exportData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast(`Data berhasil diekspor sebagai ${filename}.csv`);
    } catch (err: any) {
      console.error("CSV Export error:", err);
      showToast(`Gagal mengekspor data: ${err.message}`);
    }
  };

  return (
    <button
      onClick={handleExport}
      className={`flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-700 border border-gray-200 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-gray-50 transition-colors shadow-sm ${className}`}
    >
      <Download size={14} />
      Export CSV
    </button>
  );
}
