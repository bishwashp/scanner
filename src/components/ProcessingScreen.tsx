import React, { useEffect, useState } from 'react';
import { Loader2, Eye, CheckCircle, AlertCircle } from 'lucide-react';
import { ocrService } from '../services/ocrService';

interface ProcessingScreenProps {
  imageData?: string;
  onNumbersExtracted: (numbers: any) => void;
  onBack: () => void;
}

const ProcessingScreen: React.FC<ProcessingScreenProps> = ({ 
  imageData, 
  onNumbersExtracted, 
  onBack 
}) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('initializing');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!imageData) {
      setError('No image data provided');
      return;
    }

    processImage();
  }, [imageData]);

  const processImage = async () => {
    try {
      setCurrentStep('initializing');
      setProgress(10);
      
      // Initialize OCR service
      await ocrService.initialize();
      setProgress(30);
      
      setCurrentStep('processing');
      setProgress(50);
      
      // Extract numbers using real OCR
      const result = await ocrService.extractNumbers(imageData!);
      setProgress(80);
      
      setCurrentStep('validating');
      setProgress(90);
      
      // Use the first extracted number set
      if (result.numbers && result.numbers.length > 0) {
        const extractedNumbers = result.numbers[0];
        setProgress(100);
        setCurrentStep('complete');
        
        // Small delay to show completion
        setTimeout(() => {
          onNumbersExtracted(extractedNumbers);
        }, 500);
      } else {
        throw new Error('No numbers could be extracted from the image');
      }
    } catch (error) {
      console.error('OCR processing failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to process image');
    }
  };

  if (error) {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="card">
          <div className="w-20 h-20 bg-error-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-error-400" />
          </div>
          
          <h2 className="text-2xl font-semibold mb-4 text-error-400">Processing Failed</h2>
          <p className="text-slate-400 mb-8">{error}</p>

          <div className="space-y-3">
            <button onClick={onBack} className="btn-primary w-full">
              Try Again
            </button>
            <button onClick={onBack} className="btn-ghost w-full">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto text-center">
      <div className="card">
        <div className="w-20 h-20 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Loader2 className="w-10 h-10 text-primary-400 animate-spin" />
        </div>
        
        <h2 className="text-2xl font-semibold mb-4">Processing Your Ticket</h2>
        <p className="text-slate-400 mb-8">
          Our AI is analyzing your ticket and extracting the numbers...
        </p>

        {/* Progress Steps */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-slate-300">Image captured</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep === 'processing' ? 'bg-primary-500' : 
              currentStep === 'validating' || currentStep === 'complete' ? 'bg-primary-500' : 'bg-slate-700'
            }`}>
              {currentStep === 'processing' ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <CheckCircle className="w-5 h-5 text-white" />
              )}
            </div>
            <span className="text-slate-300">Extracting numbers</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep === 'validating' ? 'bg-primary-500' : 
              currentStep === 'complete' ? 'bg-primary-500' : 'bg-slate-700'
            }`}>
              {currentStep === 'validating' ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : currentStep === 'complete' ? (
                <CheckCircle className="w-5 h-5 text-white" />
              ) : (
                <Eye className="w-5 h-5 text-slate-400" />
              )}
            </div>
            <span className="text-slate-300">Validating numbers</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-700 rounded-full h-2 mb-6">
          <div 
            className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-500" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="text-sm text-slate-400 mb-6">
          {currentStep === 'initializing' && 'Initializing OCR engine...'}
          {currentStep === 'processing' && 'Analyzing ticket image...'}
          {currentStep === 'validating' && 'Validating extracted numbers...'}
          {currentStep === 'complete' && 'Processing complete!'}
        </div>

        <button onClick={onBack} className="btn-ghost w-full">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ProcessingScreen;
