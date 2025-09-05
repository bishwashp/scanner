import React, { useState, useEffect } from 'react';
import { ocrService } from '../../services/ocrService';
import { OCREngineType } from '../../services/ocrSelectorService';

/**
 * OCREngineSelector component
 * Allows users to switch between different OCR engines
 */
const OCREngineSelector: React.FC = () => {
  const [selectedEngine, setSelectedEngine] = useState<OCREngineType>(OCREngineType.Tesseract);

  // Initialize the selected engine from the service
  useEffect(() => {
    setSelectedEngine(ocrService.getActiveEngine());
  }, []);

  // Handle engine change
  const handleEngineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newEngine = e.target.value as OCREngineType;
    setSelectedEngine(newEngine);
    ocrService.setOCREngine(newEngine);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">OCR Engine</h3>
        <div className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
          Experimental
        </div>
      </div>
      
      <div className="flex flex-col space-y-2">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Select the OCR engine to use for text recognition:
        </p>
        
        <select
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          value={selectedEngine}
          onChange={handleEngineChange}
        >
          <option value={OCREngineType.Tesseract}>Tesseract (Default)</option>
          <option value={OCREngineType.PaddleOCR}>PaddleOCR (Experimental)</option>
        </select>
        
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {selectedEngine === OCREngineType.Tesseract ? (
            <p>Tesseract is the default OCR engine, stable but may have lower accuracy.</p>
          ) : (
            <p>PaddleOCR is experimental but may provide better accuracy for lottery tickets.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OCREngineSelector;
