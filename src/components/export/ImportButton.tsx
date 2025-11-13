'use client';

import { useState, useRef } from 'react';
import { readImportFile, validateImport, importData } from '@/lib/export/data-export';

export function ImportButton() {
  const [isImporting, setIsImporting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingData, setPendingData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setValidationErrors([]);
    setValidationWarnings([]);

    try {
      const data = await readImportFile(file);
      const validation = validateImport(data);

      if (!validation.valid) {
        setValidationErrors(validation.errors);
        setValidationWarnings(validation.warnings);
        setIsImporting(false);
        return;
      }

      if (validation.warnings.length > 0) {
        setValidationWarnings(validation.warnings);
      }

      setPendingData(data);
      setShowConfirm(true);
      setIsImporting(false);
    } catch (error) {
      console.error('❌ Import failed:', error);
      setValidationErrors(['Не удалось прочитать файл: ' + (error as Error).message]);
      setIsImporting(false);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmImport = async () => {
    if (!pendingData) return;

    setIsImporting(true);

    try {
      const result = await importData(pendingData);

      if (result.success) {
        alert('✅ Данные успешно импортированы!');
        setShowConfirm(false);
        setPendingData(null);
        setValidationWarnings([]);
      } else {
        setValidationErrors(result.errors);
      }
    } catch (error) {
      console.error('❌ Import failed:', error);
      setValidationErrors(['Не удалось импортировать данные: ' + (error as Error).message]);
    } finally {
      setIsImporting(false);
    }
  };

  const handleCancelImport = () => {
    setShowConfirm(false);
    setPendingData(null);
    setValidationWarnings([]);
    setValidationErrors([]);
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
        id="import-file"
      />
      <label
        htmlFor="import-file"
        className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer transition-colors"
      >
        {isImporting ? 'Импорт...' : 'Импортировать данные'}
      </label>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-800 mb-2">Ошибки валидации:</h3>
          <ul className="list-disc list-inside text-red-700 text-sm">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Подтвердите импорт</h2>
            
            <p className="text-gray-700 mb-4">
              Это действие заменит ваши текущие данные импортированными. Вы уверены?
            </p>

            {validationWarnings.length > 0 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <h3 className="font-semibold text-yellow-800 mb-2">Предупреждения:</h3>
                <ul className="list-disc list-inside text-yellow-700 text-sm">
                  {validationWarnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleConfirmImport}
                disabled={isImporting}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {isImporting ? 'Импорт...' : 'Подтвердить'}
              </button>
              <button
                onClick={handleCancelImport}
                disabled={isImporting}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
