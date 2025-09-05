import React from 'react';
import type { PowerballTicket, PowerballDraw } from '../../types/powerball';
import { Trophy, Gift, RotateCcw, Home } from 'lucide-react';
import WinningNumbers from './WinningNumbers';
import PrizeCategoryComponent from './PrizeCategory';

interface ResultsDisplayProps {
  ticket: PowerballTicket;
  latestDraw?: PowerballDraw;
  onScanAnother: () => void;
  onBack: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ 
  ticket, 
  latestDraw, 
  onScanAnother, 
  onBack 
}) => {
  const isWinner = ticket.isWinner;
  const prizeCategory = ticket.prizeCategory;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Results Header */}
      <div className="card text-center mb-6">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
          isWinner ? 'bg-success-500/20' : 'bg-slate-700/50'
        }`}>
          {isWinner ? (
            <Trophy className="w-10 h-10 text-success-400" />
          ) : (
            <Gift className="w-10 h-10 text-slate-400" />
          )}
        </div>
        
        <h2 className={`text-3xl font-bold mb-2 ${
          isWinner ? 'text-success-400' : 'text-slate-300'
        }`}>
          {isWinner ? 'Congratulations!' : 'Better Luck Next Time'}
        </h2>
        
        <p className="text-slate-400">
          {isWinner 
            ? 'You have a winning ticket!' 
            : 'This ticket did not win any prizes.'
          }
        </p>
      </div>

      {/* Your Numbers */}
      <div className="card mb-6">
        <h3 className="text-xl font-semibold mb-4">Your Numbers</h3>
        <div className="flex items-center space-x-2">
          {ticket.numbers.whiteBalls.map((ball, index) => (
            <div key={index} className="number-ball number-ball-white">
              {ball}
            </div>
          ))}
          <span className="text-slate-400 mx-2">+</span>
          <div className="number-ball number-ball-red">
            {ticket.numbers.powerball}
          </div>
          {ticket.numbers.powerPlay && (
            <>
              <span className="text-slate-400 mx-2">PP</span>
              <div className="number-ball bg-yellow-500 text-yellow-900 border-yellow-600">
                {ticket.numbers.powerPlay}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Winning Numbers */}
      {latestDraw && (
        <WinningNumbers 
          winningNumbers={latestDraw.winningNumbers}
          powerPlayMultiplier={latestDraw.powerPlayMultiplier}
        />
      )}

      {/* Prize Information */}
      {isWinner && prizeCategory && (
        <PrizeCategoryComponent 
          category={prizeCategory}
          jackpotAmount={latestDraw?.jackpotAmount}
        />
      )}

      {/* Actions */}
      <div className="flex space-x-4">
        <button onClick={onBack} className="btn-ghost flex-1">
          <Home className="w-4 h-4 mr-2" />
          Home
        </button>
        <button onClick={onScanAnother} className="btn-primary flex-1">
          <RotateCcw className="w-4 h-4 mr-2" />
          Scan Another
        </button>
      </div>

      {/* Disclaimer */}
      <div className="text-center mt-8 text-slate-500 text-sm">
        <p>
          Results are for entertainment purposes only. 
          Always verify with official lottery sources.
        </p>
      </div>
    </div>
  );
};

export default ResultsDisplay;
