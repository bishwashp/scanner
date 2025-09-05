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
      
      // 1) Try bounding-box driven extraction first
      let numbers: PowerballNumbers[] = [];
      const words: any[] = (data as any).words || [];
      if (words && words.length > 0) {
        numbers = this.extractFromWordBoxes(words);
        console.log('Word-box extraction results:', numbers);
      }
      
      // 2) Fallback to text-based extraction
      if (numbers.length === 0) {
        numbers = this.extractPowerballNumbersSimple(rawText);
      }
      
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
    
    // Step 1: Look for lottery number lines (A. B. C. D. E.)
    const lotteryLines = this.extractLotteryLines(text);
    console.log('Lottery lines found:', lotteryLines);
    
    if (lotteryLines.length === 0) {
      console.log('No lottery lines found, trying fallback method');
      return this.fallbackExtraction(text);
    }
    
    // Step 2: Parse each lottery line
    const results: PowerballNumbers[] = [];
    for (const line of lotteryLines) {
      const numbers = this.parseLotteryLine(line);
      if (numbers) {
        results.push(numbers);
      }
    }
    
    console.log('Parsed lottery numbers:', results);
    return results;
  }

  private extractLotteryLines(text: string): string[] {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const lotteryLines: string[] = [];
    
    for (const line of lines) {
      // Look for lines that start with A. B. C. D. E. (with or without dot, with or without extra characters)
      if (/^[A-E]\.?\s/.test(line) || /^[A-E]\s/.test(line) || /^-\s*[A-E]\.?\s/.test(line)) {
        lotteryLines.push(line);
        console.log('Found lottery line:', line);
      }
    }
    
    return lotteryLines;
  }

  private parseLotteryLine(line: string): PowerballNumbers | null {
    console.log('Parsing lottery line:', line);
    
    // Remove the line prefix (A. B. C. etc.) and any extra characters
    let cleanLine = line
      .replace(/^\+\s*[A-E]\.?\s*/, '')  // "+ B." style
      .replace(/^\-\s*[A-E]\.?\s*/, '')  // "- A." style
      .replace(/^[A-E]\.?\s*/, '');       // "A." or "A " style
    console.log('Cleaned line:', cleanLine);
    
    // Fix merged numbers (like "203037561" -> "20 30 37 55 61")
    cleanLine = this.fixMergedNumbers(cleanLine);
    console.log('Fixed merged numbers:', cleanLine);
    
    // Extract all numbers from the line
    const numbers = this.extractAllNumbers(cleanLine);
    console.log('Numbers in line:', numbers);
    
    if (numbers.length < 6) {
      console.log('Not enough numbers in line, trying digits-only segmentation');
      const segmented = this.segmentFromDigitsOnly(cleanLine);
      if (segmented) {
        console.log('Recovered via digits-only segmentation:', segmented);
        return segmented;
      }
      return null;
    }
    
    // Take first 6 numbers (5 white balls + 1 powerball)
    const whiteBalls = numbers.slice(0, 5);
    const powerball = numbers[5];
    
    if (this.isValidPowerballSet(whiteBalls, powerball)) {
      console.log('Valid lottery line parsed:', { whiteBalls, powerball });
      return { whiteBalls, powerball };
    }
    
    // If the first 6 tokens didn't validate, try digits-only segmentation as fallback
    const segmented = this.segmentFromDigitsOnly(cleanLine);
    if (segmented) {
      console.log('Recovered via digits-only segmentation:', segmented);
      return segmented;
    }
    console.log('Invalid lottery line');
    return null;
  }

  private fixMergedNumbers(text: string): string {
    // Fix common merged number patterns
    let fixed = text;
    
    // Fix patterns like "203037561" -> "20 30 37 55 61"
    fixed = fixed.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{1})/g, '$1 $2 $3 $4 $5');
    
    // Fix patterns like "0519364964" -> "05 19 36 49 64"
    fixed = fixed.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/g, '$1 $2 $3 $4 $5');
    
    // Fix patterns like "1719284" -> "17 19 28 4"
    fixed = fixed.replace(/(\d{2})(\d{2})(\d{2})(\d{1})/g, '$1 $2 $3 $4');
    
    // Fix patterns like "0820" -> "08 20"
    fixed = fixed.replace(/(\d{2})(\d{2})/g, '$1 $2');
    
    return fixed;
  }

  private segmentFromDigitsOnly(text: string): PowerballNumbers | null {
    const digits = text.replace(/\D/g, '');
    if (digits.length < 12) return null; // need at least 12 digits for 5x2 + 2

    for (let i = 0; i <= digits.length - 12; i++) {
      const whiteBalls = [
        parseInt(digits.substring(i, i + 2), 10),
        parseInt(digits.substring(i + 2, i + 4), 10),
        parseInt(digits.substring(i + 4, i + 6), 10),
        parseInt(digits.substring(i + 6, i + 8), 10),
        parseInt(digits.substring(i + 8, i + 10), 10),
      ];
      const powerball = parseInt(digits.substring(i + 10, i + 12), 10);

      if (this.isValidPowerballSet(whiteBalls, powerball)) {
        return { whiteBalls, powerball };
      }
    }
    return null;
  }

  private fallbackExtraction(text: string): PowerballNumbers[] {
    console.log('Using fallback extraction method');
    const allNumbers = this.extractAllNumbers(text);
    console.log('All numbers found:', allNumbers);
    
    if (allNumbers.length < 6) {
      console.log('Not enough numbers found');
      return [];
    }
    
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
    
    // Look for sequences that are likely lottery numbers (higher numbers, better spacing)
    for (let i = 0; i <= numbers.length - 6; i++) {
      const sequence = numbers.slice(i, i + 6);
      const whiteBalls = sequence.slice(0, 5);
      const powerball = sequence[5];
      
      if (this.isValidPowerballSet(whiteBalls, powerball) && this.isLikelyLotterySequence(whiteBalls, powerball)) {
        results.push({ whiteBalls, powerball });
        console.log(`Valid lottery sequence found at position ${i}:`, { whiteBalls, powerball });
      }
    }
    
    // Remove duplicates and limit to top 5 most likely sequences
    const unique = this.removeDuplicateSequences(results);
    return unique.slice(0, 5);
  }

  private isValidPowerballSet(whiteBalls: number[], powerball: number): boolean {
    // Check ranges
    if (whiteBalls.some(ball => ball < 1 || ball > 69)) return false;
    if (powerball < 1 || powerball > 26) return false;
    
    // Check for duplicates in white balls
    if (new Set(whiteBalls).size !== 5) return false;
    
    return true;
  }

  private isLikelyLotterySequence(whiteBalls: number[], _powerball: number): boolean {
    // Prefer sequences with higher numbers (more typical for lottery)
    const avgWhiteBall = whiteBalls.reduce((a, b) => a + b, 0) / 5;
    
    // Skip sequences with very low numbers (likely from text like "1 IN 292")
    if (avgWhiteBall < 10) return false;
    
    // Prefer sequences where white balls are reasonably distributed
    const sorted = [...whiteBalls].sort((a, b) => a - b);
    const hasGoodSpread = sorted[4] - sorted[0] > 10; // At least 10 number spread
    
    return hasGoodSpread;
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

  private extractFromWordBoxes(words: any[]): PowerballNumbers[] {
    try {
      // Group words into rows by their vertical center
      const rows: Record<string, any[]> = {};
      for (const w of words) {
        const b = (w as any).bbox || (w as any).boundingBox || {};
        const y0 = b.y0 ?? b.top ?? 0;
        const y1 = b.y1 ?? b.bottom ?? y0;
        const yc = (y0 + y1) / 2;
        const rowKey = String(Math.round(yc / 20)); // coarse bucket
        if (!rows[rowKey]) rows[rowKey] = [];
        rows[rowKey].push(w);
      }

      const rowKeys = Object.keys(rows).sort((a, b) => Number(a) - Number(b));
      const candidateLines: string[] = [];

      for (const key of rowKeys) {
        const row = rows[key].slice().sort((a, b) => {
          const ax = (a.bbox?.x0 ?? 0);
          const bx = (b.bbox?.x0 ?? 0);
          return ax - bx;
        });
        const text = row.map((w: any) => (w.text || '').toString()).join(' ').trim();
        if (!text) continue;
        // Skip obvious headers
        if (/power\s*play|powerball|education|thanks|draw|cash value|mon\s|printed/i.test(text)) continue;
        candidateLines.push(text);
      }

      // Prefer lines that contain A./B./C./D./E. markers near the start
      const prioritized = candidateLines.filter(t => /(^|\s)[A-E](\.|\s)/.test(t));
      const linesToTry = prioritized.length > 0 ? prioritized : candidateLines;

      const results: PowerballNumbers[] = [];
      for (const line of linesToTry) {
        const parsed = this.parseLotteryLine(line);
        if (parsed) results.push(parsed);
      }

      // De-dup
      return this.removeDuplicateSequences(results);
    } catch (e) {
      console.warn('Word-box extraction failed:', e);
      return [];
    }
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
