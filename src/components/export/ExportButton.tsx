'use client';

import { useState } from 'react';
import { exportAllData, downloadExport } from '@/lib/export/data-export';
import { getCurrentUser } from '@/lib/supabase/auth';

export function ExportButton() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const user = await getCurrentUser();
      const userId = user?.id || 'local-user';

      const data = await exportAllData(userId);
      downloadExport(data);

      console.log('✅ Data exported successfully');
    } catch (error) {
      console.error('❌ Export failed:', error);
      alert('Не удалось экспортировать данные. Попробуйте снова.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isExporting ? 'Экспорт...' : 'Экспортировать данные'}
    </button>
  );
}
