export interface PowerballNumbers {
  whiteBalls: number[];
  powerball: number;
  powerPlay?: number;
}

export interface PowerballTicket {
  id: string;
  numbers: PowerballNumbers;
  drawDate: string;
  isWinner: boolean;
  prizeCategory?: PrizeCategory;
  prizeAmount?: number;
}

export interface PrizeCategory {
  name: string;
  description: string;
  baseAmount: number;
  multiplier?: number;
  finalAmount?: number;
  matchPattern: {
    whiteBalls: number;
    powerball: boolean;
  };
}

export interface PowerballDraw {
  drawDate: string;
  winningNumbers: PowerballNumbers;
  powerPlayMultiplier?: number;
  jackpotAmount: number;
}

export interface OCRResult {
  numbers: PowerballNumbers[];
  confidence: number;
  rawText: string;
}

export interface CameraState {
  isActive: boolean;
  hasPermission: boolean;
  error?: string;
}

export interface AppState {
  currentStep: 'landing' | 'camera' | 'processing' | 'review' | 'results';
  tickets: PowerballTicket[];
  currentTicket?: PowerballNumbers;
  latestDraw?: PowerballDraw;
  isLoading: boolean;
  error?: string;
}
