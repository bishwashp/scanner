import type { PowerballDraw, PowerballNumbers, PrizeCategory } from '../types/powerball';

// Real Powerball API endpoints
const BACKUP_API_BASE = 'https://data.ny.gov/resource/d6yy-54nr.json';

// Fallback mock data for development
const MOCK_DRAW: PowerballDraw = {
  drawDate: new Date().toISOString().split('T')[0],
  winningNumbers: {
    whiteBalls: [12, 23, 34, 45, 56],
    powerball: 7,
    powerPlay: 3
  },
  powerPlayMultiplier: 3,
  jackpotAmount: 50000000
};

const PRIZE_CATEGORIES: PrizeCategory[] = [
  {
    name: 'Jackpot',
    description: '5 white balls + Powerball',
    baseAmount: 0, // Variable jackpot
    matchPattern: { whiteBalls: 5, powerball: true }
  },
  {
    name: '$1 Million',
    description: '5 white balls (no Powerball)',
    baseAmount: 1000000,
    matchPattern: { whiteBalls: 5, powerball: false }
  },
  {
    name: '$50,000',
    description: '4 white balls + Powerball',
    baseAmount: 50000,
    matchPattern: { whiteBalls: 4, powerball: true }
  },
  {
    name: '$100',
    description: '4 white balls (no Powerball)',
    baseAmount: 100,
    matchPattern: { whiteBalls: 4, powerball: false }
  },
  {
    name: '$100',
    description: '3 white balls + Powerball',
    baseAmount: 100,
    matchPattern: { whiteBalls: 3, powerball: true }
  },
  {
    name: '$7',
    description: '3 white balls (no Powerball)',
    baseAmount: 7,
    matchPattern: { whiteBalls: 3, powerball: false }
  },
  {
    name: '$7',
    description: '2 white balls + Powerball',
    baseAmount: 7,
    matchPattern: { whiteBalls: 2, powerball: true }
  },
  {
    name: '$4',
    description: '1 white ball + Powerball',
    baseAmount: 4,
    matchPattern: { whiteBalls: 1, powerball: true }
  },
  {
    name: '$4',
    description: 'Powerball only',
    baseAmount: 4,
    matchPattern: { whiteBalls: 0, powerball: true }
  }
];

export async function getLatestPowerballDraw(): Promise<PowerballDraw> {
  try {
    // Try primary API first
    const primaryResult = await fetchFromPrimaryAPI();
    if (primaryResult) {
      return primaryResult;
    }

    // Fallback to secondary API
    const secondaryResult = await fetchFromSecondaryAPI();
    if (secondaryResult) {
      return secondaryResult;
    }

    // If all APIs fail, return mock data with warning
    console.warn('All Powerball APIs failed, using mock data');
    return MOCK_DRAW;
  } catch (error) {
    console.error('Failed to fetch Powerball data:', error);
    return MOCK_DRAW;
  }
}

async function fetchFromPrimaryAPI(): Promise<PowerballDraw | null> {
  try {
    // Using a free lottery API service
    const response = await fetch('https://api.lotteryresultsfeed.com/api/lottery/results', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Primary API failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Parse the response to extract Powerball data
    const powerballData = data.find((lottery: any) => 
      lottery.name?.toLowerCase().includes('powerball') || 
      lottery.game?.toLowerCase().includes('powerball')
    );

    if (!powerballData) {
      throw new Error('Powerball data not found in API response');
    }

    return parsePowerballResponse(powerballData);
  } catch (error) {
    console.error('Primary API error:', error);
    return null;
  }
}

async function fetchFromSecondaryAPI(): Promise<PowerballDraw | null> {
  try {
    // Using New York State Lottery API as backup
    const response = await fetch(`${BACKUP_API_BASE}?$order=draw_date DESC&$limit=1`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Secondary API failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || data.length === 0) {
      throw new Error('No data available from secondary API');
    }

    return parseNYLotteryResponse(data[0]);
  } catch (error) {
    console.error('Secondary API error:', error);
    return null;
  }
}

function parsePowerballResponse(data: any): PowerballDraw {
  // Parse different API response formats
  const winningNumbers = data.winning_numbers || data.numbers || data.results;
  
  let whiteBalls: number[] = [];
  let powerball = 0;
  // let powerPlayMultiplier: number | undefined;

  if (Array.isArray(winningNumbers)) {
    // Format: [12, 23, 34, 45, 56, 7] (last number is powerball)
    whiteBalls = winningNumbers.slice(0, 5);
    powerball = winningNumbers[5];
  } else if (winningNumbers.white_balls && winningNumbers.powerball) {
    // Format: { white_balls: [12, 23, 34, 45, 56], powerball: 7 }
    whiteBalls = winningNumbers.white_balls;
    powerball = winningNumbers.powerball;
  } else if (winningNumbers.main && winningNumbers.bonus) {
    // Format: { main: [12, 23, 34, 45, 56], bonus: 7 }
    whiteBalls = winningNumbers.main;
    powerball = winningNumbers.bonus;
  }

  return {
    drawDate: data.draw_date || data.date || new Date().toISOString().split('T')[0],
    winningNumbers: {
      whiteBalls,
      powerball,
    },
    powerPlayMultiplier: data.power_play || data.multiplier,
    jackpotAmount: data.jackpot || data.jackpot_amount || 0,
  };
}

function parseNYLotteryResponse(data: any): PowerballDraw {
  // Parse New York State Lottery API format
  const winningNumbers = data.winning_numbers?.split(' ') || [];
  
  const whiteBalls = winningNumbers.slice(0, 5).map((num: string) => parseInt(num));
  const powerball = parseInt(winningNumbers[5]);

  return {
    drawDate: data.draw_date,
    winningNumbers: {
      whiteBalls,
      powerball,
    },
    powerPlayMultiplier: data.power_play_multiplier,
    jackpotAmount: data.jackpot_amount || 0,
  };
}

export function calculatePrize(
  userNumbers: PowerballNumbers,
  winningNumbers: PowerballNumbers,
  powerPlayMultiplier?: number
): PrizeCategory | null {
  const whiteMatches = userNumbers.whiteBalls.filter(ball => 
    winningNumbers.whiteBalls.includes(ball)
  ).length;
  
  const powerballMatch = userNumbers.powerball === winningNumbers.powerball;
  
  // Find matching prize category
  const prizeCategory = PRIZE_CATEGORIES.find(category => {
    const { whiteBalls, powerball } = category.matchPattern;
    return whiteMatches === whiteBalls && powerballMatch === powerball;
  });
  
  if (!prizeCategory) {
    return null;
  }
  
  // Calculate final amount with Power Play multiplier
  let finalAmount = prizeCategory.baseAmount;
  if (powerPlayMultiplier && userNumbers.powerPlay && finalAmount > 0) {
    // Power Play doesn't multiply jackpot or $1M prizes
    if (finalAmount < 1000000) {
      finalAmount = finalAmount * powerPlayMultiplier;
    }
  }
  
  return {
    ...prizeCategory,
    multiplier: powerPlayMultiplier,
    finalAmount: finalAmount || prizeCategory.baseAmount
  };
}

export function validatePowerballNumbers(numbers: PowerballNumbers): boolean {
  // Check white balls
  if (numbers.whiteBalls.length !== 5) return false;
  if (numbers.whiteBalls.some(ball => ball < 1 || ball > 69)) return false;
  if (new Set(numbers.whiteBalls).size !== 5) return false; // No duplicates
  
  // Check Powerball
  if (numbers.powerball < 1 || numbers.powerball > 26) return false;
  
  // Check Power Play (optional)
  if (numbers.powerPlay && (numbers.powerPlay < 1 || numbers.powerPlay > 26)) return false;
  
  return true;
}
