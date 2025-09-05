import { createWorker } from 'tesseract.js';
import type { Worker } from 'tesseract.js';
import type { OCRResult, PowerballNumbers } from '../types/powerball';

export class SimpleOCRService {
  private static instance: SimpleOCRService;
  private worker: Worker | null = null;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): SimpleOCRService {
    if (!SimpleOCRService.instance) {
      SimpleOCRService.instance = new SimpleOCRService();
    }
    return SimpleOCRService.instance;
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

      // Simple configuration - just numbers and basic characters
      await this.worker.setParameters({
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ.,+- ',
      });
      
      this.isInitialized = true;
      console.log('Simple OCR Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Simple OCR service:', error);
      throw new Error('Failed to initialize Simple OCR service');
    }
  }

  public async extractNumbers(imageData: string): Promise<OCRResult> {
    if (!this.worker || !this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log('Starting simple OCR extraction...');
      
      // Enhanced preprocessing for lottery tickets
      const processedImageData = await this.enhancedPreprocessing(imageData);
      
      // Use OCR with better settings for structured text
      const { data } = await this.worker!.recognize(processedImageData);
      
      const rawText = data.text;
      console.log('OCR Raw Text:', rawText);
      console.log('OCR Confidence:', data.confidence);
      
      // Extract numbers using simple, robust approach
      const numbers = this.extractPowerballNumbersSimple(rawText);
      
      console.log('Extracted Numbers:', numbers);
      
      return {
        numbers,
        confidence: data.confidence / 100,
        rawText
      };
    } catch (error) {
      console.error('Simple OCR extraction failed:', error);
      throw new Error('Failed to extract numbers from image');
    }
  }

  private async enhancedPreprocessing(imageData: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          resolve(imageData);
          return;
        }

        // Scale up significantly for better OCR
        const scale = 3;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        // Draw image scaled up
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Get image data for processing
        const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageDataObj.data;

        // Advanced preprocessing for lottery tickets
        for (let i = 0; i < data.length; i += 4) {
          // Convert to grayscale
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          
          // Aggressive contrast enhancement for lottery tickets
          let enhanced;
          if (gray > 160) {
            enhanced = 255; // Very light -> white
          } else if (gray < 100) {
            enhanced = 0;   // Very dark -> black
          } else {
            enhanced = gray; // Keep medium tones
          }
          
          data[i] = enhanced;     // Red
          data[i + 1] = enhanced; // Green
          data[i + 2] = enhanced; // Blue
        }

        // Put processed data back
        ctx.putImageData(imageDataObj, 0, 0);

        // Convert back to base64 with high quality
        resolve(canvas.toDataURL('image/jpeg', 0.95));
      };
      
      img.src = imageData;
    });
  }

  private extractPowerballNumbersSimple(text: string): PowerballNumbers[] {
    console.log('Extracting numbers from text:', text);
    
    // Step 1: Extract ALL numbers from the text
    const allNumbers = this.extractAllNumbers(text);
    console.log('All numbers found:', allNumbers);
    
    if (allNumbers.length < 6) {
      console.log('Not enough numbers found');
      return [];
    }
    
    // Step 2: Find valid Powerball sequences
    const validSequences = this.findValidPowerballSequences(allNumbers);
    console.log('Valid sequences found:', validSequences);
    
    return validSequences;
  }

  private extractAllNumbers(text: string): number[] {
    // Find all 1-2 digit numbers in the text
    const matches = text.match(/\d{1,2}/g);
    if (!matches) return [];
    
    return matches.map(n => parseInt(n, 10));
  }

  private findValidPowerballSequences(numbers: number[]): PowerballNumbers[] {
    const results: PowerballNumbers[] = [];
    
    // Try every possible 6-number sequence
    for (let i = 0; i <= numbers.length - 6; i++) {
      const sequence = numbers.slice(i, i + 6);
      const whiteBalls = sequence.slice(0, 5);
      const powerball = sequence[5];
      
      if (this.isValidPowerballSet(whiteBalls, powerball)) {
        results.push({ whiteBalls, powerball });
        console.log(`Valid sequence found at position ${i}:`, { whiteBalls, powerball });
      }
    }
    
    // Remove duplicates
    return this.removeDuplicateSequences(results);
  }

  private isValidPowerballSet(whiteBalls: number[], powerball: number): boolean {
    // Check ranges
    if (whiteBalls.some(ball => ball < 1 || ball > 69)) return false;
    if (powerball < 1 || powerball > 26) return false;
    
    // Check for duplicates in white balls
    if (new Set(whiteBalls).size !== 5) return false;
    
    return true;
  }

  private removeDuplicateSequences(sequences: PowerballNumbers[]): PowerballNumbers[] {
    const unique: PowerballNumbers[] = [];
    
    for (const seq of sequences) {
      const isDuplicate = unique.some(existing => 
        JSON.stringify(existing.whiteBalls.sort()) === JSON.stringify(seq.whiteBalls.sort()) &&
        existing.powerball === seq.powerball
      );
      
      if (!isDuplicate) {
        unique.push(seq);
      }
    }
    
    return unique;
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

export const simpleOcrService = SimpleOCRService.getInstance();
