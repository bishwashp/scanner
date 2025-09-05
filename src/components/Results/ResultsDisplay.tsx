import React from 'react';
import type { PowerballTicket, PowerballDraw } from '../../types/powerball';
import { Trophy, Gift, RotateCcw, Home } from 'lucide-react';
import WinningNumbers from './WinningNumbers';
import PrizeCategoryComponent from './PrizeCategory';

interface ResultsDisplayProps {
  tickets: PowerballTicket[];
  latestDraw?: PowerballDraw;
  onScanAnother: () => void;
  onBack: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ 
  tickets, 
  latestDraw, 
  onScanAnother, 
  onBack 
}) => {
  // Calculate overall results
  const winningTickets = tickets.filter(ticket => ticket.isWinner);
  const totalWinnings = tickets.reduce((sum, ticket) => sum + (ticket.prizeAmount || 0), 0);
  const hasAnyWinner = winningTickets.length > 0;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Results Header */}
      <div className="card text-center mb-6">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
          hasAnyWinner ? 'bg-success-500/20' : 'bg-slate-700/50'
        }`}>
          {hasAnyWinner ? (
            <Trophy className="w-10 h-10 text-success-400" />
          ) : (
            <Gift className="w-10 h-10 text-slate-400" />
          )}
        </div>
        
        <h2 className={`text-3xl font-bold mb-2 ${
          hasAnyWinner ? 'text-success-400' : 'text-slate-300'
        }`}>
          {hasAnyWinner ? 'Congratulations!' : 'Better Luck Next Time'}
        </h2>
        
        <p className="text-slate-400 mb-2">
          {hasAnyWinner 
            ? `You have ${winningTickets.length} winning ticket${winningTickets.length > 1 ? 's' : ''}!` 
            : 'No tickets won any prizes.'
          }
        </p>
        
        {hasAnyWinner && (
          <p className="text-success-400 font-semibold text-lg">
            Total Winnings: ${totalWinnings.toLocaleString()}
          </p>
        )}
      </div>

      {/* Your Numbers */}
      <div className="card mb-6">
        <h3 className="text-xl font-semibold mb-4">Your Numbers</h3>
        <div className="space-y-4">
          {tickets.map((ticket, index) => (
            <div key={ticket.id} className={`p-4 rounded-lg border ${
              ticket.isWinner 
                ? 'bg-success-500/10 border-success-500/30' 
                : 'bg-slate-800/50 border-slate-700'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-slate-300">
                  Line {String.fromCharCode(65 + index)} {/* A, B, C, D, E */}
                </h4>
                {ticket.isWinner && (
                  <span className="text-success-400 font-semibold">
                    Winner! ${ticket.prizeAmount?.toLocaleString()}
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {ticket.numbers.whiteBalls.map((ball, ballIndex) => (
                  <div key={ballIndex} className="number-ball number-ball-white">
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
          ))}
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
      {winningTickets.length > 0 && (
        <div className="space-y-4">
          {winningTickets.map((ticket) => (
            ticket.prizeCategory && (
              <PrizeCategoryComponent 
                key={ticket.id}
                category={ticket.prizeCategory}
                jackpotAmount={latestDraw?.jackpotAmount}
                ticketLabel={`Line ${String.fromCharCode(65 + tickets.indexOf(ticket))}`}
              />
            )
          ))}
        </div>
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
