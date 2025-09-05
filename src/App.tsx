import { useState, useEffect } from 'react';
import type { AppState, PowerballTicket, PowerballNumbers } from './types/powerball';
import LandingPage from './components/LandingPage';
import CameraCapture from './components/Camera/CameraCapture';
import NumberReview from './components/NumberReview/NumberReview';
import ResultsDisplay from './components/Results/ResultsDisplay';
import Header from './components/Common/Header';
import { getLatestPowerballDraw, calculatePrize } from './services/powerballApi';

function App() {
  const [appState, setAppState] = useState<AppState>({
    currentStep: 'landing',
    tickets: [],
    isLoading: false,
  });

  // Load latest Powerball draw on app start
  useEffect(() => {
    const loadLatestDraw = async () => {
      try {
        setAppState(prev => ({ ...prev, isLoading: true }));
        const latestDraw = await getLatestPowerballDraw();
        setAppState(prev => ({ ...prev, latestDraw, isLoading: false }));
      } catch (error) {
        console.error('Failed to load latest draw:', error);
        setAppState(prev => ({ 
          ...prev, 
          error: 'Failed to load latest Powerball results',
          isLoading: false 
        }));
      }
    };

    loadLatestDraw();
  }, []);

  const handleStartScanning = () => {
    setAppState(prev => ({ ...prev, currentStep: 'camera' }));
  };



  const handleNumbersExtracted = (numbers: PowerballNumbers | PowerballNumbers[]) => {
    setAppState(prev => ({ 
      ...prev, 
      currentStep: 'review',
      currentTicket: Array.isArray(numbers) ? numbers[0] : numbers,
      allTickets: Array.isArray(numbers) ? numbers : [numbers]
    }));
  };

  const handleNumbersSubmitted = (tickets: PowerballTicket[]) => {
    // Calculate if each ticket is a winner
    const processedTickets = tickets.map(ticket => {
      if (appState.latestDraw) {
        const prizeCategory = calculatePrize(
          ticket.numbers,
          appState.latestDraw.winningNumbers,
          appState.latestDraw.powerPlayMultiplier
        );
        
        return {
          ...ticket,
          isWinner: prizeCategory !== null,
          prizeCategory: prizeCategory || undefined,
          prizeAmount: prizeCategory?.finalAmount || 0
        };
      } else {
        // Fallback if no latest draw data
        return ticket;
      }
    });
    
    setAppState(prev => ({ 
      ...prev, 
      currentStep: 'results',
      tickets: [...prev.tickets, ...processedTickets]
    }));
  };

  const handleScanAnother = () => {
    setAppState(prev => ({ 
      ...prev, 
      currentStep: 'landing',
      currentTicket: undefined,
      error: undefined
    }));
  };

  const handleBackToLanding = () => {
    setAppState(prev => ({ 
      ...prev, 
      currentStep: 'landing',
      currentTicket: undefined,
      error: undefined
    }));
  };

  const renderCurrentStep = () => {
    switch (appState.currentStep) {
      case 'landing':
        return (
          <LandingPage 
            onStartScanning={handleStartScanning}
            isLoading={appState.isLoading}
            error={appState.error}
          />
        );
      case 'camera':
        return (
          <CameraCapture 
            onNumbersExtracted={handleNumbersExtracted}
            onBack={handleBackToLanding}
          />
        );
      case 'review':
        return (
          <NumberReview 
            numbers={appState.currentTicket}
            allNumbers={appState.allTickets}
            onNumbersSubmitted={handleNumbersSubmitted}
            onBack={handleBackToLanding}
          />
        );
      case 'results':
        return (
          <ResultsDisplay 
            tickets={appState.tickets.slice(-5)} // Show last 5 tickets (A, B, C, D, E)
            latestDraw={appState.latestDraw}
            onScanAnother={handleScanAnother}
            onBack={handleBackToLanding}
          />
        );
      default:
        return <LandingPage onStartScanning={handleStartScanning} />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text">
      <Header 
        currentStep={appState.currentStep}
        onBack={appState.currentStep !== 'landing' ? handleBackToLanding : undefined}
      />
      <main className="container mx-auto px-4 py-8">
        {renderCurrentStep()}
      </main>
    </div>
  );
}

export default App;