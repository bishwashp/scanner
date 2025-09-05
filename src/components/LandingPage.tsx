import React from 'react';
import { Camera, Zap, Shield, Smartphone, Sparkles, Trophy, Star, Settings } from 'lucide-react';
import OCREngineSelector from './Common/OCREngineSelector';

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
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="relative text-center mb-16">
        {/* Background Effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute top-40 right-1/4 w-96 h-96 bg-secondary-500/15 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="relative z-10">
          {/* Icon with Glow Effect */}
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-3xl blur-lg opacity-75 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 p-6 rounded-3xl shadow-2xl">
              <Camera className="w-16 h-16 text-white drop-shadow-lg" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
              <Sparkles className="w-4 h-4 text-yellow-800" />
            </div>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 bg-clip-text text-transparent animate-fade-in">
              Powerball
            </span>
            <br />
            <span className="bg-gradient-to-r from-accent-400 via-primary-400 to-secondary-400 bg-clip-text text-transparent animate-fade-in" style={{animationDelay: '0.2s'}}>
              Scanner
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-8 leading-relaxed animate-slide-up" style={{animationDelay: '0.4s'}}>
            🎯 <span className="font-semibold text-white">Instant ticket scanning</span> with AI-powered OCR technology. 
            <br />
            <span className="text-accent-400">Point, scan, and discover if you're a winner!</span>
          </p>

          {/* Error Display */}
          {error && (
            <div className="bg-gradient-to-r from-error-500/20 to-error-600/20 border border-error-400/30 rounded-2xl p-6 mb-8 max-w-lg mx-auto backdrop-blur-sm animate-slide-up">
              <p className="text-error-300 font-medium">{error}</p>
            </div>
          )}

          {/* CTA Button */}
          <div className="animate-slide-up" style={{animationDelay: '0.6s'}}>
            <button
              onClick={onStartScanning}
              disabled={isLoading}
              className="group relative inline-flex items-center justify-center px-12 py-6 text-xl font-bold text-white bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-600 rounded-2xl shadow-2xl hover:shadow-primary-500/25 hover:scale-105 transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-2xl blur opacity-0 group-hover:opacity-75 transition-opacity duration-300"></div>
              {isLoading ? (
                <div className="relative flex items-center space-x-3">
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Loading Magic...</span>
                </div>
              ) : (
                <div className="relative flex items-center space-x-3">
                  <Camera className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
                  <span>Start Scanning</span>
                  <Trophy className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-primary-600/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <div className="relative bg-gradient-to-br from-dark-surface to-dark-surface/80 backdrop-blur-sm border border-primary-500/20 rounded-3xl p-8 text-center hover:border-primary-400/40 transition-all duration-300 hover:scale-105">
            <div className="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-8 h-8 text-white" />
              <div className="absolute inset-0 bg-primary-400 rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
            </div>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary-400 to-primary-300 bg-clip-text text-transparent">
              ⚡ Instant Results
            </h3>
            <p className="text-slate-300 leading-relaxed">
              Get your results in <span className="font-semibold text-primary-400">seconds</span> with our advanced AI-powered OCR technology
            </p>
          </div>
        </div>

        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary-500/20 to-secondary-600/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <div className="relative bg-gradient-to-br from-dark-surface to-dark-surface/80 backdrop-blur-sm border border-secondary-500/20 rounded-3xl p-8 text-center hover:border-secondary-400/40 transition-all duration-300 hover:scale-105">
            <div className="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
              <Shield className="w-8 h-8 text-white" />
              <div className="absolute inset-0 bg-secondary-400 rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
            </div>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-secondary-400 to-secondary-300 bg-clip-text text-transparent">
              🔒 Secure & Private
            </h3>
            <p className="text-slate-300 leading-relaxed">
              Your ticket data stays <span className="font-semibold text-secondary-400">100% on your device</span> - no servers, no storage, no tracking
            </p>
          </div>
        </div>

        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-500/20 to-accent-600/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <div className="relative bg-gradient-to-br from-dark-surface to-dark-surface/80 backdrop-blur-sm border border-accent-500/20 rounded-3xl p-8 text-center hover:border-accent-400/40 transition-all duration-300 hover:scale-105">
            <div className="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
              <Smartphone className="w-8 h-8 text-white" />
              <div className="absolute inset-0 bg-accent-400 rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
            </div>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-accent-400 to-accent-300 bg-clip-text text-transparent">
              📱 Mobile Optimized
            </h3>
            <p className="text-slate-300 leading-relaxed">
              Designed specifically for <span className="font-semibold text-accent-400">iPhone</span> with seamless camera integration
            </p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-secondary-500/10 to-accent-500/10 rounded-3xl blur-2xl"></div>
        <div className="relative bg-gradient-to-br from-dark-surface/90 to-dark-surface/70 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-4">
              <span className="bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 bg-clip-text text-transparent">
                🚀 How It Works
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Four simple steps to discover if you're a winner!
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-primary-600/10 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
              <div className="relative bg-gradient-to-br from-dark-surface/80 to-dark-surface/60 backdrop-blur-sm border border-primary-500/30 rounded-2xl p-6 text-center hover:border-primary-400/50 transition-all duration-300 hover:scale-105">
                <div className="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-black text-xl">1</span>
                  <div className="absolute inset-0 bg-primary-400 rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                </div>
                <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-primary-400 to-primary-300 bg-clip-text text-transparent">
                  📸 Point Camera
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Align your Powerball ticket within the camera frame for perfect scanning
                </p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary-500/20 to-secondary-600/10 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
              <div className="relative bg-gradient-to-br from-dark-surface/80 to-dark-surface/60 backdrop-blur-sm border border-secondary-500/30 rounded-2xl p-6 text-center hover:border-secondary-400/50 transition-all duration-300 hover:scale-105">
                <div className="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-black text-xl">2</span>
                  <div className="absolute inset-0 bg-secondary-400 rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                </div>
                <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-secondary-400 to-secondary-300 bg-clip-text text-transparent">
                  🤖 Scan Numbers
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Our AI extracts all numbers from your ticket automatically with precision
                </p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-500/20 to-accent-600/10 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
              <div className="relative bg-gradient-to-br from-dark-surface/80 to-dark-surface/60 backdrop-blur-sm border border-accent-500/30 rounded-2xl p-6 text-center hover:border-accent-400/50 transition-all duration-300 hover:scale-105">
                <div className="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-black text-xl">3</span>
                  <div className="absolute inset-0 bg-accent-400 rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                </div>
                <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-accent-400 to-accent-300 bg-clip-text text-transparent">
                  ✏️ Review & Edit
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Check the numbers and make corrections if needed for accuracy
                </p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-success-500/20 to-success-600/10 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
              <div className="relative bg-gradient-to-br from-dark-surface/80 to-dark-surface/60 backdrop-blur-sm border border-success-500/30 rounded-2xl p-6 text-center hover:border-success-400/50 transition-all duration-300 hover:scale-105">
                <div className="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-success-500 to-success-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-black text-xl">4</span>
                  <div className="absolute inset-0 bg-success-400 rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                </div>
                <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-success-400 to-success-300 bg-clip-text text-transparent">
                  🏆 Get Results
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  See if you won and what prize category you matched instantly
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="relative mt-16 mb-16">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-800/30 via-primary-500/10 to-slate-800/30 rounded-3xl blur-xl"></div>
        <div className="relative bg-gradient-to-br from-dark-surface/90 to-dark-surface/70 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Settings className="w-5 h-5 text-primary-400" />
            <h3 className="text-xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
              Advanced Settings
            </h3>
          </div>
          <OCREngineSelector />
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-16">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm border border-slate-600/30 rounded-2xl px-6 py-4">
          <Star className="w-5 h-5 text-yellow-400" />
          <p className="text-slate-300 font-medium">
            This app is for <span className="text-accent-400 font-semibold">entertainment purposes only</span>
          </p>
          <Star className="w-5 h-5 text-yellow-400" />
        </div>
        <p className="text-slate-500 text-sm mt-4 max-w-2xl mx-auto">
          Always verify results with official lottery sources. 
          <span className="text-primary-400 font-medium"> Good luck! 🍀</span>
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
