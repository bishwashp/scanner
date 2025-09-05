import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, RotateCcw, Flashlight, FlashlightOff, Loader2, CheckCircle, Send } from 'lucide-react';
import { ocrService } from '../../services/ocrService';
import type { PowerballNumbers } from '../../types/powerball';

interface DynamicCameraScannerProps {
  onNumbersExtracted: (numbers: PowerballNumbers[]) => void;
  onBack: () => void;
}


const DynamicCameraScanner: React.FC<DynamicCameraScannerProps> = ({ 
  onNumbersExtracted, 
  onBack 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);
  
  // OCR and scanning state
  const [isOcrReady, setIsOcrReady] = useState(false);
  const [currentNumbers, setCurrentNumbers] = useState<PowerballNumbers[]>([]);
  const [scanComplete, setScanComplete] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const startCamera = useCallback(async () => {
    try {
      console.log('Starting camera initialization...');
      setIsInitializing(true);
      setError(null);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      console.log('Got media stream:', mediaStream);
      setStream(mediaStream);
      setHasPermission(true);
      setCameraStarted(true);
      setIsInitializing(false);
      
    } catch (err) {
      console.error('Camera access denied:', err);
      setError('Camera access is required to scan tickets. Please allow camera permission.');
      setIsInitializing(false);
    }
  }, []);

  const initializeOCR = useCallback(async () => {
    try {
      await ocrService.initialize();
      setIsOcrReady(true);
      console.log('OCR service ready for real-time scanning');
    } catch (error) {
      console.error('Failed to initialize OCR:', error);
      setError('Failed to initialize OCR service');
    }
  }, []);

  const captureFrameForOCR = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return null;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0);
    
    // Convert to base64
    return canvas.toDataURL('image/jpeg', 0.8);
  }, []);

  const processFrame = useCallback(async () => {
    if (!isOcrReady || !isScanning) return;

    const imageData = captureFrameForOCR();
    if (!imageData) return;

    try {
      const result = await ocrService.extractNumbers(imageData);
      
      if (result.numbers && result.numbers.length > 0 && result.confidence > 0.9) {
        // Only process high-confidence results (90%+)
        setCurrentNumbers(prev => {
          const allNumbers = [...prev, ...result.numbers];
          // Remove duplicates based on number combinations
          const unique = allNumbers.filter((numbers, index, arr) => 
            arr.findIndex(n => 
              JSON.stringify(n.whiteBalls.sort()) === JSON.stringify(numbers.whiteBalls.sort()) &&
              n.powerball === numbers.powerball
            ) === index
          );
          return unique;
        });

        // Update scan progress
        setScanProgress(prev => Math.min(prev + 10, 100));
        
        // Auto-complete if we have detected numbers
        if (result.numbers.length > 0) {
          setTimeout(() => {
            setScanComplete(true);
            setIsScanning(false);
            if (scanIntervalRef.current) {
              clearInterval(scanIntervalRef.current);
            }
          }, 1000); // Wait 1 second after detection
        }
      }
    } catch (error) {
      console.error('Frame processing error:', error);
    }
  }, [isOcrReady, isScanning, captureFrameForOCR]);

  const startScanning = useCallback(() => {
    if (!isOcrReady) return;
    
    setIsScanning(true);
    setCurrentNumbers([]);
    setScanProgress(0);
    setScanComplete(false);
    
    // Process frames every 200ms for real-time scanning
    scanIntervalRef.current = setInterval(processFrame, 200);
  }, [isOcrReady, processFrame]);

  const stopScanning = useCallback(() => {
    setIsScanning(false);
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setScanComplete(true);
  }, []);

  const completeScan = useCallback(() => {
    if (currentNumbers.length > 0) {
      onNumbersExtracted(currentNumbers);
    }
  }, [currentNumbers, onNumbersExtracted]);


  useEffect(() => {
    console.log('DynamicCameraScanner useEffect called');
    startCamera();
    initializeOCR();
    
    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, [startCamera, initializeOCR]);

  // Setup video when stream is available and component is rendered
  useEffect(() => {
    if (stream && videoRef.current) {
      const video = videoRef.current;
      video.srcObject = stream;
      
      console.log('Setting video srcObject:', stream);
      console.log('Video element:', video);
      
      // Add event listeners
      const handleVideoReady = () => {
        console.log('Video metadata loaded, camera ready');
        console.log('Video dimensions:', video.videoWidth, 'x', video.videoHeight);
        
        // Auto-start scanning when camera is ready and OCR is ready
        if (isOcrReady) {
          setTimeout(() => {
            startScanning();
          }, 500); // Small delay to ensure everything is ready
        }
      };
      
      const handleVideoError = (e: any) => {
        console.error('Video error:', e);
      };
      
      video.onloadedmetadata = handleVideoReady;
      video.oncanplay = handleVideoReady;
      video.onerror = handleVideoError;
      
      // Force play the video
      video.play().catch((err) => {
        console.error('Video play error:', err);
      });
    }
  }, [stream, isOcrReady, startScanning]);

  // Cleanup stream when component unmounts
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  if (error) {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="card">
          <div className="w-16 h-16 bg-error-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera className="w-8 h-8 text-error-400" />
          </div>
          <h2 className="text-xl font-semibold mb-4">Camera Access Required</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <div className="space-y-3">
            <button onClick={startCamera} className="btn-primary w-full">
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

  if (!cameraStarted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold mb-2">Scan Your Ticket</h2>
            <p className="text-slate-400">
              Position your Powerball ticket within the frame and tap start scanning
            </p>
          </div>

          {/* Camera Preview - Always show the viewport */}
          <div className="relative bg-black rounded-lg overflow-hidden mb-6">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              webkit-playsinline="true"
              className="w-full h-64 md:h-80 object-cover"
              style={{ backgroundColor: '#000' }}
            />
            
            {/* Scanning Guidelines */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-4 border-2 border-primary-500/50 rounded-lg">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary-500 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary-500 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary-500 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary-500 rounded-br-lg"></div>
              </div>
            </div>

            {/* Loading Overlay */}
            {!cameraStarted && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-center text-white">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm">Starting camera...</p>
                </div>
              </div>
            )}

            {/* Refresh Button */}
            <button
              onClick={startCamera}
              className="absolute top-4 left-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Instructions */}
          <div className="text-center text-sm text-slate-400">
            <p>Camera will start automatically. Position your ticket within the frame.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold mb-2">Scan Your Ticket</h2>
          <p className="text-slate-400">
            {!isScanning ? 'Position your Powerball ticket and tap start scanning' :
             scanComplete ? 'Scanning complete! Review your numbers below' :
             'Scanning in progress... Keep the ticket steady'}
          </p>
          {!isOcrReady && (
            <div className="mt-2 p-2 bg-yellow-500/20 border border-yellow-500/30 rounded text-yellow-300 text-sm">
              ⚠️ OCR engine still loading... Camera ready but scanning may be delayed
            </div>
          )}
        </div>

        {/* Camera Preview */}
        <div className="relative bg-black rounded-lg overflow-hidden mb-6">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            webkit-playsinline="true"
            className="w-full h-64 md:h-80 object-cover"
            style={{ backgroundColor: '#000' }}
          />
          
          {/* Debug indicator */}
          {hasPermission && !isInitializing && (
            <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
              Camera Active
            </div>
          )}
          
          {/* Scanning Guidelines */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-4 border-2 border-primary-500/50 rounded-lg">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary-500 rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary-500 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary-500 rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary-500 rounded-br-lg"></div>
            </div>
          </div>

          {/* Scanning Status Overlay */}
          {isScanning && (
            <div className="absolute top-4 left-4 bg-primary-500/90 text-white px-3 py-1 rounded-full text-sm font-medium">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span>Scanning...</span>
              </div>
            </div>
          )}

          {/* Flash Toggle */}
          <button
            onClick={() => setFlashEnabled(!flashEnabled)}
            className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
          >
            {flashEnabled ? <Flashlight className="w-5 h-5" /> : <FlashlightOff className="w-5 h-5" />}
          </button>
        </div>

        {/* Scan Progress */}
        {isScanning && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-slate-400 mb-2">
              <span>Scan Progress</span>
              <span>{scanProgress}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${scanProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Detected Numbers Display with Glide Effect */}
        {currentNumbers.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-center">Detected Numbers</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {currentNumbers.map((numbers, index) => (
                <div 
                  key={index} 
                  className="bg-slate-800 rounded-lg p-4 transform transition-all duration-500 ease-out animate-slide-down"
                  style={{
                    animationDelay: `${index * 200}ms`,
                    animationFillMode: 'both'
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Line {index + 1}</span>
                    <CheckCircle className="w-5 h-5 text-green-400 animate-pulse" />
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    {numbers.whiteBalls.map((ball, ballIndex) => (
                      <div 
                        key={ballIndex} 
                        className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-bold text-sm transform transition-all duration-300 hover:scale-110"
                      >
                        {ball}
                      </div>
                    ))}
                    <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-sm transform transition-all duration-300 hover:scale-110">
                      {numbers.powerball}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={startCamera}
            className="p-3 bg-slate-700 hover:bg-slate-600 rounded-full transition-colors"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
          
          {!isScanning && !scanComplete && (
            <button
              onClick={startScanning}
              className="w-16 h-16 bg-primary-500 hover:bg-primary-600 rounded-full flex items-center justify-center transition-colors"
            >
              <Camera className="w-8 h-8 text-white" />
            </button>
          )}

          {isScanning && (
            <button
              onClick={stopScanning}
              className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
            >
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </button>
          )}

          {scanComplete && (
            <>
              <button
                onClick={() => {
                  setScanComplete(false);
                  setCurrentNumbers([]);
                  setScanProgress(0);
                  startScanning();
                }}
                className="w-16 h-16 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors"
              >
                <RotateCcw className="w-8 h-8 text-white" />
              </button>
              <button
                onClick={completeScan}
                className="w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors"
              >
                <Send className="w-8 h-8 text-white" />
              </button>
            </>
          )}
          
          <div className="w-12 h-12" /> {/* Spacer */}
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center text-sm text-slate-400">
          <p>
            {!isScanning ? 'Make sure the ticket is well-lit and all numbers are visible' :
             'Keep the ticket steady and ensure all numbers are clearly visible'}
          </p>
        </div>
      </div>

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default DynamicCameraScanner;
