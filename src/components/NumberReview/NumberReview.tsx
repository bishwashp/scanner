import React, { useState } from 'react';
import type { PowerballNumbers } from '../../types/powerball';
import { Edit3, Check, X } from 'lucide-react';
import NumberCard from './NumberCard';

interface NumberReviewProps {
  numbers?: PowerballNumbers;
  allNumbers?: PowerballNumbers[];
  onNumbersSubmitted: (ticket: any) => void;
  onBack: () => void;
}

const NumberReview: React.FC<NumberReviewProps> = ({ numbers, allNumbers, onNumbersSubmitted, onBack }) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [ticketNumbers, setTicketNumbers] = useState<PowerballNumbers[]>(
    allNumbers || (numbers ? [numbers] : [])
  );

  const handleEditNumbers = (index: number) => {
    setEditingIndex(index);
  };

  const handleSaveNumbers = (index: number, newNumbers: PowerballNumbers) => {
    const updatedNumbers = [...ticketNumbers];
    updatedNumbers[index] = newNumbers;
    setTicketNumbers(updatedNumbers);
    setEditingIndex(null);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
  };

  const handleSubmit = () => {
    // TODO: Create ticket object and submit
    const ticket = {
      id: Date.now().toString(),
      numbers: ticketNumbers[0],
      drawDate: new Date().toISOString(),
      isWinner: false // Will be determined by API
    };
    
    onNumbersSubmitted(ticket);
  };

  const addNewTicket = () => {
    setTicketNumbers([...ticketNumbers, { whiteBalls: [], powerball: 0 }]);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold mb-2">Review Your Numbers</h2>
          <p className="text-slate-400">
            Check the extracted numbers and make corrections if needed
          </p>
        </div>

        {/* Ticket Numbers */}
        <div className="space-y-4 mb-6">
          {ticketNumbers.map((ticket, index) => (
            <div key={index} className="relative">
              {editingIndex === index ? (
                <NumberCard
                  numbers={ticket}
                  onSave={(newNumbers) => handleSaveNumbers(index, newNumbers)}
                  onCancel={handleCancelEdit}
                  isEditing={true}
                />
              ) : (
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-slate-300">Ticket #{index + 1}</h3>
                    <button
                      onClick={() => handleEditNumbers(index)}
                      className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* White Balls */}
                    {ticket.whiteBalls.map((ball, ballIndex) => (
                      <div key={ballIndex} className="number-ball number-ball-white">
                        {ball}
                      </div>
                    ))}
                    
                    {/* Plus Sign */}
                    <span className="text-slate-400 mx-2">+</span>
                    
                    {/* Powerball */}
                    <div className="number-ball number-ball-red">
                      {ticket.powerball}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Another Ticket */}
        <button
          onClick={addNewTicket}
          className="w-full p-4 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:border-primary-500 hover:text-primary-400 transition-colors mb-6"
        >
          + Add Another Ticket
        </button>

        {/* Actions */}
        <div className="flex space-x-4">
          <button onClick={onBack} className="btn-ghost flex-1">
            <X className="w-4 h-4 mr-2" />
            Back
          </button>
          <button 
            onClick={handleSubmit}
            className="btn-primary flex-1"
            disabled={ticketNumbers.length === 0}
          >
            <Check className="w-4 h-4 mr-2" />
            Check Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default NumberReview;
