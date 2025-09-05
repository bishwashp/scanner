import React from 'react';
import { Camera, Zap, Shield, Smartphone } from 'lucide-react';

interface LandingPageProps {
  onStartScanning: () => void;
  isLoading?: boolean;
  error?: string;
}

const LandingPage: React.FC<LandingPageProps> = ({ 
  onStartScanning, 
  isLoading = false, 
  error 
}) => {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl mb-6">
            <Camera className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-4">
            Powerball Scanner
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Scan your Powerball tickets instantly and check if you're a winner. 
            No more manual checking - just point, scan, and celebrate!
          </p>
        </div>

        {error && (
          <div className="bg-error-500/10 border border-error-500/20 rounded-lg p-4 mb-6 max-w-md mx-auto">
            <p className="text-error-400 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={onStartScanning}
          disabled={isLoading}
          className="btn-primary text-lg px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Loading...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Camera className="w-5 h-5" />
              <span>Start Scanning</span>
            </div>
          )}
        </button>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="card text-center">
          <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Zap className="w-6 h-6 text-primary-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Instant Results</h3>
          <p className="text-slate-400 text-sm">
            Get your results in seconds with our advanced OCR technology
          </p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-secondary-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-secondary-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Secure & Private</h3>
          <p className="text-slate-400 text-sm">
            Your ticket data stays on your device - no servers, no storage
          </p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-accent-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-6 h-6 text-accent-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Mobile Optimized</h3>
          <p className="text-slate-400 text-sm">
            Designed specifically for iPhone with camera integration
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="card">
        <h2 className="text-2xl font-semibold mb-6 text-center">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold">1</span>
            </div>
            <h3 className="font-semibold mb-2">Point Camera</h3>
            <p className="text-slate-400 text-sm">
              Align your Powerball ticket within the camera frame
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-secondary-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold">2</span>
            </div>
            <h3 className="font-semibold mb-2">Scan Numbers</h3>
            <p className="text-slate-400 text-sm">
              Our AI extracts all numbers from your ticket automatically
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-accent-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold">3</span>
            </div>
            <h3 className="font-semibold mb-2">Review & Edit</h3>
            <p className="text-slate-400 text-sm">
              Check the numbers and make corrections if needed
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-success-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold">4</span>
            </div>
            <h3 className="font-semibold mb-2">Get Results</h3>
            <p className="text-slate-400 text-sm">
              See if you won and what prize category you matched
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-12 text-slate-500 text-sm">
        <p>
          This app is for entertainment purposes only. 
          Always verify results with official lottery sources.
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
