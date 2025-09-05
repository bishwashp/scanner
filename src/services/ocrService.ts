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

      // Set OCR parameters for better number recognition
      await this.worker.setParameters({
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ.,+- ',
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
      
      // Preprocess image for better OCR accuracy
      const processedImageData = await this.preprocessImage(imageData);
      
      // Use faster recognition for real-time scanning
      const { data } = await this.worker!.recognize(processedImageData, {
        rectangle: { top: 0, left: 0, width: 1280, height: 720 }
      });
      
      const rawText = data.text;
      
      console.log('OCR Raw Text:', rawText);
      console.log('OCR Confidence:', data.confidence);
      
      // Extract Powerball numbers from OCR text
      const numbers = this.parsePowerballNumbers(rawText);
      
      console.log('Extracted Numbers:', numbers);
      console.log('Number of patterns found:', numbers.length);
      
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

  private async preprocessImage(imageData: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          resolve(imageData);
          return;
        }

        // Scale up for better OCR (2x resolution)
        const scale = 2;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        // Draw image scaled up
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Get image data for processing
        const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageDataObj.data;

        // Apply contrast enhancement and noise reduction
        for (let i = 0; i < data.length; i += 4) {
          // Convert to grayscale
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          
          // Apply more aggressive contrast enhancement
          const enhanced = gray > 140 ? 255 : 0;
          
          data[i] = enhanced;     // Red
          data[i + 1] = enhanced; // Green
          data[i + 2] = enhanced; // Blue
          // Alpha channel remains unchanged
        }

        // Put processed data back
        ctx.putImageData(imageDataObj, 0, 0);

        // Convert back to base64
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      
      img.src = imageData;
    });
  }

  private parsePowerballNumbers(text: string): PowerballNumbers[] {
    const results: PowerballNumbers[] = [];
    
    // Split text into lines for multi-line processing
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Common patterns for Powerball numbers
    const patterns = [
      // Pattern: A. 20 30 37 55 61 21 (your exact format)
      /[A-E]\.\s*(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})/g,
      // Pattern: 12 23 34 45 56 + 7
      /(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s*\+\s*(\d{1,2})/g,
      // Pattern: 12-23-34-45-56 + 7
      /(\d{1,2})-(\d{1,2})-(\d{1,2})-(\d{1,2})-(\d{1,2})\s*\+\s*(\d{1,2})/g,
      // Pattern: 12,23,34,45,56 + 7
      /(\d{1,2}),(\d{1,2}),(\d{1,2}),(\d{1,2}),(\d{1,2})\s*\+\s*(\d{1,2})/g,
      // Pattern: 12 23 34 45 56 7 (without +)
      /(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})/g,
      // Pattern: 12 23 34 45 56 QP 7 QP (Texas Lottery format)
      /(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+QP\s+(\d{1,2})\s+QP/g,
      // Pattern: 12 23 34 45 56 QP 7 (without second QP)
      /(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+QP\s+(\d{1,2})/g,
      // Pattern: A. 12 23 34 45 56 QP 7 QP (with line prefix)
      /[A-E]\.\s*(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+QP\s+(\d{1,2})\s+QP/g,
    ];

    // Process each line separately
    for (const line of lines) {
      for (const pattern of patterns) {
        let match;
        const regex = new RegExp(pattern.source, pattern.flags);
        while ((match = regex.exec(line)) !== null) {
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
    }

    // If no patterns found, try to extract individual numbers from each line
    if (results.length === 0) {
      console.log('No patterns matched, trying individual number extraction...');
      for (const line of lines) {
        console.log('Processing line:', line);
        const numbers = this.extractIndividualNumbers(line);
        if (numbers.length > 0) {
          console.log('Found numbers in line:', numbers);
          results.push(...numbers);
        }
      }
    }
    
    // If still no results, try a more lenient approach
    if (results.length === 0) {
      console.log('Still no results, trying lenient extraction...');
      const allNumbers = this.extractAllNumbersFromText(text);
      if (allNumbers.length > 0) {
        console.log('Found numbers with lenient approach:', allNumbers);
        results.push(...allNumbers);
      }
    }

    // Remove duplicates
    const uniqueResults = results.filter((numbers, index, arr) => 
      arr.findIndex(n => 
        JSON.stringify(n.whiteBalls.sort()) === JSON.stringify(numbers.whiteBalls.sort()) &&
        n.powerball === numbers.powerball
      ) === index
    );

    return uniqueResults;
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

  private extractAllNumbersFromText(text: string): PowerballNumbers[] {
    const results: PowerballNumbers[] = [];
    
    // Find all numbers in the entire text
    const numberMatches = text.match(/\d{1,2}/g);
    if (!numberMatches || numberMatches.length < 6) return results;

    const numbers = numberMatches.map(n => parseInt(n));
    
    // Try different groupings - look for 6 consecutive numbers
    for (let i = 0; i <= numbers.length - 6; i++) {
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
