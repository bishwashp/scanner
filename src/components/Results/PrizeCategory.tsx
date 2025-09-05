import React from 'react';
import type { PrizeCategory } from '../../types/powerball';
import { DollarSign, Star } from 'lucide-react';

interface PrizeCategoryProps {
  category: PrizeCategory;
  jackpotAmount?: number;
}

const PrizeCategory: React.FC<PrizeCategoryProps> = ({ category, jackpotAmount }) => {
  const isJackpot = category.name === 'Jackpot';
  const displayAmount = isJackpot ? jackpotAmount : category.finalAmount;

  return (
    <div className="card mb-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
          {isJackpot ? (
            <Star className="w-8 h-8 text-white" />
          ) : (
            <DollarSign className="w-8 h-8 text-white" />
          )}
        </div>
        
        <h3 className="text-2xl font-bold text-gradient mb-2">
          {category.name}
        </h3>
        
        <p className="text-slate-400 mb-4">
          {category.description}
        </p>

        {displayAmount && (
          <div className="bg-success-500/10 border border-success-500/20 rounded-lg p-4 mb-4">
            <div className="text-3xl font-bold text-success-400">
              ${displayAmount.toLocaleString()}
            </div>
            {category.multiplier && category.multiplier > 1 && (
              <div className="text-sm text-slate-400 mt-1">
                Base: ${category.baseAmount.toLocaleString()} × {category.multiplier}x Power Play
              </div>
            )}
          </div>
        )}

        <div className="text-sm text-slate-500">
          <p>
            {isJackpot 
              ? 'Congratulations! You won the jackpot!'
              : 'Great job! You matched some numbers!'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrizeCategory;
