import React from 'react';
import type { PowerballNumbers } from '../../types/powerball';

interface WinningNumbersProps {
  winningNumbers: PowerballNumbers;
  powerPlayMultiplier?: number;
}

const WinningNumbers: React.FC<WinningNumbersProps> = ({ 
  winningNumbers, 
  powerPlayMultiplier 
}) => {
  return (
    <div className="card mb-6">
      <h3 className="text-xl font-semibold mb-4">Winning Numbers</h3>
      
      <div className="flex items-center space-x-2 mb-4">
        {winningNumbers.whiteBalls.map((ball, index) => (
          <div key={index} className="number-ball number-ball-white">
            {ball}
          </div>
        ))}
        <span className="text-slate-400 mx-2">+</span>
        <div className="number-ball number-ball-red">
          {winningNumbers.powerball}
        </div>
      </div>

      {powerPlayMultiplier && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <span className="text-yellow-400 font-medium">Power Play:</span>
            <div className="number-ball bg-yellow-500 text-yellow-900 border-yellow-600">
              {powerPlayMultiplier}x
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 text-sm text-slate-400">
        <p>Draw Date: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default WinningNumbers;
