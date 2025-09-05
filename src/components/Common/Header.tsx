import React from 'react';
import { ArrowLeft, Camera, CheckCircle, Eye, Trophy } from 'lucide-react';

interface HeaderProps {
  currentStep: string;
  onBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentStep, onBack }) => {
  const getStepIcon = (step: string) => {
    switch (step) {
      case 'camera':
        return <Camera className="w-5 h-5" />;
      case 'processing':
        return <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />;
      case 'review':
        return <Eye className="w-5 h-5" />;
      case 'results':
        return <Trophy className="w-5 h-5" />;
      default:
        return <CheckCircle className="w-5 h-5" />;
    }
  };

  const getStepTitle = (step: string) => {
    switch (step) {
      case 'camera':
        return 'Scan Ticket';
      case 'processing':
        return 'Processing';
      case 'review':
        return 'Review Numbers';
      case 'results':
        return 'Results';
      default:
        return 'Powerball Scanner';
    }
  };

  return (
    <header className="bg-dark-surface border-b border-slate-700/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors duration-200"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center space-x-2">
              {getStepIcon(currentStep)}
              <h1 className="text-xl font-semibold text-gradient">
                {getStepTitle(currentStep)}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
            <span className="text-sm text-slate-400">Live</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
