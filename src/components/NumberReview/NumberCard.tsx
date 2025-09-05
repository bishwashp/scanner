import React, { useState, useEffect } from 'react';
import type { PowerballNumbers } from '../../types/powerball';
import { Check, X } from 'lucide-react';

interface NumberCardProps {
  numbers: PowerballNumbers;
  onSave: (numbers: PowerballNumbers) => void;
  onCancel: () => void;
  isEditing: boolean;
}

const NumberCard: React.FC<NumberCardProps> = ({ numbers, onSave, onCancel, isEditing }) => {
  const [whiteBalls, setWhiteBalls] = useState<number[]>(numbers.whiteBalls);
  const [powerball, setPowerball] = useState<number>(numbers.powerball);
  const [powerPlay, setPowerPlay] = useState<number | undefined>(numbers.powerPlay);

  useEffect(() => {
    setWhiteBalls(numbers.whiteBalls);
    setPowerball(numbers.powerball);
    setPowerPlay(numbers.powerPlay);
  }, [numbers]);

  const handleWhiteBallChange = (index: number, value: string) => {
    const num = parseInt(value) || 0;
    if (num >= 1 && num <= 69) {
      const newBalls = [...whiteBalls];
      newBalls[index] = num;
      setWhiteBalls(newBalls);
    }
  };

  const handlePowerballChange = (value: string) => {
    const num = parseInt(value) || 0;
    if (num >= 1 && num <= 26) {
      setPowerball(num);
    }
  };

  const handlePowerPlayChange = (value: string) => {
    const num = parseInt(value) || 0;
    if (num >= 1 && num <= 26) {
      setPowerPlay(num);
    }
  };

  const handleSave = () => {
    const updatedNumbers: PowerballNumbers = {
      whiteBalls,
      powerball,
      powerPlay
    };
    onSave(updatedNumbers);
  };

  const isValid = whiteBalls.length === 5 && 
                  whiteBalls.every(ball => ball >= 1 && ball <= 69) &&
                  new Set(whiteBalls).size === 5 &&
                  powerball >= 1 && powerball <= 26;

  if (!isEditing) {
    return (
      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
        <div className="flex items-center space-x-2">
          {/* White Balls */}
          {whiteBalls.map((ball, index) => (
            <div key={index} className="number-ball number-ball-white">
              {ball}
            </div>
          ))}
          
          {/* Plus Sign */}
          <span className="text-slate-400 mx-2">+</span>
          
          {/* Powerball */}
          <div className="number-ball number-ball-red">
            {powerball}
          </div>
          
          {/* Power Play */}
          {powerPlay && (
            <>
              <span className="text-slate-400 mx-2">PP</span>
              <div className="number-ball bg-yellow-500 text-yellow-900 border-yellow-600">
                {powerPlay}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
      <div className="space-y-4">
        {/* White Balls */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            White Balls (1-69)
          </label>
          <div className="flex space-x-2">
            {[0, 1, 2, 3, 4].map((index) => (
              <input
                key={index}
                type="number"
                min="1"
                max="69"
                value={whiteBalls[index] || ''}
                onChange={(e) => handleWhiteBallChange(index, e.target.value)}
                className="input w-16 text-center"
                placeholder="0"
              />
            ))}
          </div>
        </div>

        {/* Powerball */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Powerball (1-26)
          </label>
          <input
            type="number"
            min="1"
            max="26"
            value={powerball || ''}
            onChange={(e) => handlePowerballChange(e.target.value)}
            className="input w-20 text-center"
            placeholder="0"
          />
        </div>

        {/* Power Play */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Power Play (1-26) - Optional
          </label>
          <input
            type="number"
            min="1"
            max="26"
            value={powerPlay || ''}
            onChange={(e) => handlePowerPlayChange(e.target.value)}
            className="input w-20 text-center"
            placeholder="0"
          />
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            onClick={handleSave}
            disabled={!isValid}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4 mr-2" />
            Save
          </button>
          <button onClick={onCancel} className="btn-ghost flex-1">
            <X className="w-4 h-4 mr-2" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default NumberCard;
