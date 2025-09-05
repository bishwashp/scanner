import { createWorker } from 'tesseract.js';
import type { Worker } from 'tesseract.js';
import type { OCRResult, PowerballNumbers } from '../types/powerball';

export class OCRService {
  private static instance: OCRService;
  private worker: Worker | null = null;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): OCRService {
    if (!OCRService.instance) {
      OCRService.instance = new OCRService();
    }
    return OCRService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized && this.worker) {
      return;
    }

    try {
      this.worker = await createWorker('eng', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      });
      
      this.isInitialized = true;
      console.log('OCR Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize OCR service:', error);
      throw new Error('Failed to initialize OCR service');
    }
  }

  public async extractNumbers(imageData: string): Promise<OCRResult> {
    if (!this.worker || !this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log('Starting OCR extraction...');
      const { data } = await this.worker!.recognize(imageData);
      const rawText = data.text;
      
      console.log('OCR Raw Text:', rawText);
      
      // Extract Powerball numbers from OCR text
      const numbers = this.parsePowerballNumbers(rawText);
      
      console.log('Extracted Numbers:', numbers);
      
      return {
        numbers,
        confidence: data.confidence / 100, // Convert to 0-1 scale
        rawText
      };
    } catch (error) {
      console.error('OCR extraction failed:', error);
      throw new Error('Failed to extract numbers from image');
    }
  }

  private parsePowerballNumbers(text: string): PowerballNumbers[] {
    const results: PowerballNumbers[] = [];
    
    // Common patterns for Powerball numbers
    const patterns = [
      // Pattern: 12 23 34 45 56 + 7
      /(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s*\+\s*(\d{1,2})/g,
      // Pattern: 12-23-34-45-56 + 7
      /(\d{1,2})-(\d{1,2})-(\d{1,2})-(\d{1,2})-(\d{1,2})\s*\+\s*(\d{1,2})/g,
      // Pattern: 12,23,34,45,56 + 7
      /(\d{1,2}),(\d{1,2}),(\d{1,2}),(\d{1,2}),(\d{1,2})\s*\+\s*(\d{1,2})/g,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const whiteBalls = [
          parseInt(match[1]),
          parseInt(match[2]),
          parseInt(match[3]),
          parseInt(match[4]),
          parseInt(match[5])
        ];
        
        const powerball = parseInt(match[6]);
        
        // Validate numbers
        if (this.isValidPowerballNumbers(whiteBalls, powerball)) {
          results.push({
            whiteBalls,
            powerball
          });
        }
      }
    }

    // If no patterns found, try to extract individual numbers
    if (results.length === 0) {
      const numbers = this.extractIndividualNumbers(text);
      if (numbers.length > 0) {
        results.push(...numbers);
      }
    }

    return results;
  }

  private extractIndividualNumbers(text: string): PowerballNumbers[] {
    const results: PowerballNumbers[] = [];
    
    // Find all numbers in the text
    const numberMatches = text.match(/\d{1,2}/g);
    if (!numberMatches) return results;

    const numbers = numberMatches.map(n => parseInt(n));
    
    // Group numbers into sets of 6 (5 white + 1 powerball)
    for (let i = 0; i < numbers.length - 5; i += 6) {
      const whiteBalls = numbers.slice(i, i + 5);
      const powerball = numbers[i + 5];
      
      if (this.isValidPowerballNumbers(whiteBalls, powerball)) {
        results.push({ whiteBalls, powerball });
      }
    }

    return results;
  }

  private isValidPowerballNumbers(whiteBalls: number[], powerball: number): boolean {
    // Check if all white balls are in valid range (1-69)
    if (whiteBalls.some(ball => ball < 1 || ball > 69)) return false;
    
    // Check if powerball is in valid range (1-26)
    if (powerball < 1 || powerball > 26) return false;
    
    // Check for duplicates in white balls
    if (new Set(whiteBalls).size !== 5) return false;
    
    return true;
  }

  public async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
    }
  }

  public isReady(): boolean {
    return this.isInitialized && this.worker !== null;
  }
}

export const ocrService = OCRService.getInstance();
