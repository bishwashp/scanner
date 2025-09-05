import React, { useState, useRef, useEffect } from 'react';
import { Camera, RotateCcw, Flashlight, FlashlightOff } from 'lucide-react';

interface CameraCaptureProps {
  onImageCaptured: (imageData: string) => void;
  onBack: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onImageCaptured, onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flashEnabled, setFlashEnabled] = useState(false);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      setStream(mediaStream);
      setHasPermission(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera access denied:', err);
      setError('Camera access is required to scan tickets. Please allow camera permission.');
    }
  };

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return;

    setIsCapturing(true);
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) throw new Error('Canvas context not available');

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      context.drawImage(video, 0, 0);
      
      // Convert to base64
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      // Stop camera stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      onImageCaptured(imageData);
    } catch (err) {
      console.error('Failed to capture image:', err);
      setError('Failed to capture image. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const retakePhoto = () => {
    startCamera();
  };

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

  if (!hasPermission) {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="card">
          <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="text-xl font-semibold mb-4">Starting Camera</h2>
          <p className="text-slate-400">Please allow camera access to continue...</p>
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
            Position your Powerball ticket within the frame and tap capture
          </p>
        </div>

        {/* Camera Preview */}
        <div className="relative bg-black rounded-lg overflow-hidden mb-6">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-64 md:h-80 object-cover"
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

          {/* Flash Toggle */}
          <button
            onClick={() => setFlashEnabled(!flashEnabled)}
            className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
          >
            {flashEnabled ? <Flashlight className="w-5 h-5" /> : <FlashlightOff className="w-5 h-5" />}
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={retakePhoto}
            className="p-3 bg-slate-700 hover:bg-slate-600 rounded-full transition-colors"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
          
          <button
            onClick={captureImage}
            disabled={isCapturing}
            className="w-16 h-16 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 rounded-full flex items-center justify-center transition-colors"
          >
            {isCapturing ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Camera className="w-8 h-8 text-white" />
            )}
          </button>
          
          <div className="w-12 h-12" /> {/* Spacer */}
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center text-sm text-slate-400">
          <p>Make sure the ticket is well-lit and all numbers are visible</p>
        </div>
      </div>

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraCapture;
