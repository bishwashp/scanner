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
      
      // Try direct pattern-based extraction first (most reliable)
      const directExtracted = this.extractWithDirectPatterns(rawText);
      if (directExtracted.length > 0) {
        console.log('Direct pattern extraction succeeded:', directExtracted);
        return {
          numbers: directExtracted,
          confidence: data.confidence / 100,
          rawText
        };
      }
      
      // 1) Try bounding-box driven extraction next
      let numbers: PowerballNumbers[] = [];
      const words: any[] = (data as any).words || [];
      if (words && words.length > 0) {
        numbers = this.extractFromWordBoxes(words);
        console.log('Word-box extraction results:', numbers);
      }
      
      // 2) Fallback to text-based extraction if word-box fails
      if (numbers.length === 0) {
        console.log('Word-box extraction failed or yielded no results, falling back to text-based method.');
        numbers = this.extractPowerballNumbersSimple(rawText);
      }
      
      console.log('Final Extracted Numbers:', numbers);
      
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
  
  private extractWithDirectPatterns(text: string): PowerballNumbers[] {
    console.log('Trying direct pattern extraction...');
    const results: PowerballNumbers[] = [];
    
    // Define the expected patterns for each line
    const linePatterns = [
      // A line pattern - match digits directly
      /A\.?\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2}).*?(\d{1,2})/i,
      // B line pattern
      /B\.?\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2}).*?(\d{1,2})/i,
      // C line pattern
      /C\.?\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2}).*?(\d{1,2})/i,
      // D line pattern
      /D\.?\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2}).*?(\d{1,2})/i,
      // E line pattern
      /E\.?\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2}).*?(\d{1,2})/i,
    ];
    
    // Try to extract merged number patterns too
    const mergedPatterns = [
      // A line with merged numbers
      /A\.?\s+(\d{2})(\d{2})(\d{2})(\d{2})(\d{1,2}).*?(\d{1,2})/i,
      // B line with merged numbers
      /B\.?\s+(\d{2})(\d{2})(\d{2})(\d{2})(\d{1,2}).*?(\d{1,2})/i,
      // C line with merged numbers
      /C\.?\s+(\d{2})(\d{2})(\d{2})(\d{2})(\d{1,2}).*?(\d{1,2})/i,
      // D line with merged numbers
      /D\.?\s+(\d{2})(\d{2})(\d{2})(\d{2})(\d{1,2}).*?(\d{1,2})/i,
      // E line with merged numbers
      /E\.?\s+(\d{2})(\d{2})(\d{2})(\d{2})(\d{1,2}).*?(\d{1,2})/i,
    ];
    
    // Try each pattern on each line
    const lines = text.split('\n');
    
    // First try standard patterns
    for (const pattern of linePatterns) {
      for (const line of lines) {
        const match = line.match(pattern);
        if (match) {
          const whiteBalls = [
            parseInt(match[1], 10),
            parseInt(match[2], 10),
            parseInt(match[3], 10),
            parseInt(match[4], 10),
            parseInt(match[5], 10)
          ];
          const powerball = parseInt(match[6], 10);
          
          if (this.isValidPowerballSet(whiteBalls, powerball)) {
            results.push({ whiteBalls, powerball });
            console.log(`Direct pattern match: ${line} -> ${whiteBalls.join(',')} + ${powerball}`);
          }
        }
      }
    }
    
    // Then try merged patterns
    if (results.length < 5) {
      for (const pattern of mergedPatterns) {
        for (const line of lines) {
          const match = line.match(pattern);
          if (match) {
            const whiteBalls = [
              parseInt(match[1], 10),
              parseInt(match[2], 10),
              parseInt(match[3], 10),
              parseInt(match[4], 10),
              parseInt(match[5], 10)
            ];
            const powerball = parseInt(match[6], 10);
            
            if (this.isValidPowerballSet(whiteBalls, powerball)) {
              const isDuplicate = results.some(existing => 
                JSON.stringify(existing.whiteBalls.sort()) === JSON.stringify(whiteBalls.sort()) &&
                existing.powerball === powerball
              );
              
              if (!isDuplicate) {
                results.push({ whiteBalls, powerball });
                console.log(`Merged pattern match: ${line} -> ${whiteBalls.join(',')} + ${powerball}`);
              }
            }
          }
        }
      }
    }
    
    // Try to find any missing lines using the expected format
    const expectedLetters = ['A', 'B', 'C', 'D', 'E'];
    const foundLetters = results.map((_, i) => expectedLetters[i]);
    const missingLetters = expectedLetters.filter(letter => !foundLetters.includes(letter));
    
    if (missingLetters.length > 0) {
      console.log('Missing letters:', missingLetters);
      
      // Look for lines with these missing letters
      for (const letter of missingLetters) {
        for (const line of lines) {
          if (line.includes(letter) && /\d/.test(line)) {
            console.log(`Trying to parse line with missing letter ${letter}:`, line);
            
            // Extract all numbers from the line
            const numbers = this.extractAllNumbers(line).filter(n => n > 0 && n < 70);
            if (numbers.length >= 6) {
              const whiteBalls = numbers.slice(0, 5);
              const powerball = numbers[5];
              
              if (this.isValidPowerballSet(whiteBalls, powerball)) {
                results.push({ whiteBalls, powerball });
                console.log(`Recovered missing line ${letter}: ${whiteBalls.join(',')} + ${powerball}`);
              }
            }
          }
        }
      }
    }
    
    return results;
  }

  private extractFromWordBoxes(words: any[]): PowerballNumbers[] {
    try {
      // Group words into rows by their vertical center
      const rows: Record<string, any[]> = {};
      for (const w of words) {
        const b = (w as any).bbox || {};
        const yc = (b.y0 + b.y1) / 2;
        const rowKey = String(Math.round(yc / 25)); // Slightly larger bucket size
        if (!rows[rowKey]) rows[rowKey] = [];
        rows[rowKey].push(w);
      }

      const rowKeys = Object.keys(rows).sort((a, b) => Number(a) - Number(b));
      const candidateLines: string[] = [];

      for (const key of rowKeys) {
        const row = rows[key].slice().sort((a, b) => (a.bbox?.x0 ?? 0) - (b.bbox?.x0 ?? 0));
        const text = row.map((w: any) => (w.text || '').toString()).join(' ').trim();
        if (!text) continue;
        
        // Skip obvious headers/footers more aggressively
        if (/power\s*play|powerball|education|thanks|draw|cash value|mon\s|printed|odds|supporting|veterans/i.test(text)) continue;
        candidateLines.push(text);
      }
      console.log('Candidate lines from word boxes:', candidateLines);

      // Prioritize lines that start with A-E markers, even with OCR noise
      const prioritized = candidateLines.filter(t => /^.{0,3}[A-E]/.test(t));
      const linesToTry = prioritized.length > 0 ? prioritized : candidateLines;
      console.log('Prioritized lines to try:', linesToTry);


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
      // Look for lines that likely contain A-E markers near the start
      if (/^.{0,5}[A-E]\.?\s/.test(line) || /^[\d\.\-\+]{0,3}\s*[A-E]\.?\s/.test(line)) {
        lotteryLines.push(line);
        console.log('Found lottery line:', line);
      }
    }
    
    return lotteryLines;
  }

  private parseLotteryLine(line: string): PowerballNumbers | null {
    console.log('Parsing lottery line:', line);
    
    // Remove any prefix before the numbers
    let cleanLine = line.replace(/^[^0-9]+/, '').trim();
    console.log('Cleaned line:', cleanLine);
    
    // Fix merged numbers
    cleanLine = this.fixMergedNumbers(cleanLine);
    console.log('Fixed merged numbers:', cleanLine);
    
    // Extract all numbers from the line
    let numbers = this.extractAllNumbers(cleanLine).filter(n => n > 0 && n < 70); // Filter out 0s and invalid numbers
    console.log('Numbers in line (filtered):', numbers);
    
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
    
    // Fallback to digits-only segmentation
    const segmented = this.segmentFromDigitsOnly(cleanLine);
    if (segmented) {
      console.log('Recovered via digits-only segmentation:', segmented);
      return segmented;
    }
    console.log('Invalid lottery line');
    return null;
  }

  private fixMergedNumbers(text: string): string {
    let fixed = text;
    
    // General purpose replacements for common OCR errors
    fixed = fixed.replace(/l/g, '1').replace(/O/g, '0').replace(/S/g, '5');

    // Fix patterns like "203037561" -> "20 30 37 55 61"
    fixed = fixed.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{1})/g, '$1 $2 $3 $4 $5');
    
    // Fix patterns like "0519364964" -> "05 19 36 49 64"
    fixed = fixed.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/g, '$1 $2 $3 $4 $5');
    
    // Fix patterns like "1719284" -> "17 19 28 4"
    fixed = fixed.replace(/(\d{2})(\d{2})(\d{2})(\d{1})/g, '$1 $2 $3 $4');
    
    // Fix patterns like "0820" -> "08 20"
    fixed = fixed.replace(/(\d{2})(\d{2})/g, '$1 $2');
    
    // Fix patterns like "5561" -> "55 61"
    fixed = fixed.replace(/(\d{2})(\d{2})/g, '$1 $2');
    
    // Fix patterns like "465" -> "46 5"
    fixed = fixed.replace(/(\d{2})(\d{1})/g, '$1 $2');

    // Re-run 2-digit fix in case the above created new pairs
    fixed = fixed.replace(/(\d{2})(\d{2})/g, '$1 $2');
    
    return fixed;
  }

  private segmentFromDigitsOnly(text: string): PowerballNumbers | null {
    let digits = text.replace(/\D/g, '');
    if (digits.length < 12) return null;

    const len = digits.length;
    const pbLen = len % 2 === 1 ? 1 : 2; // If odd length, last is 1-digit powerball
    const wbDigits = len - pbLen;
    if (wbDigits % 2 !== 0) return null; // White balls must have even digits

    const numWhite = wbDigits / 2;
    if (numWhite !== 5) return null; // Exactly 5 white balls

    const whiteBalls = [];
    let index = 0;
    for (let i = 0; i < 5; i++) {
      const ball = parseInt(digits.substring(index, index + 2), 10);
      if (ball === 0) return null; // Zero is not a valid ball number
      whiteBalls.push(ball);
      index += 2;
    }
    const powerball = parseInt(digits.substring(index), 10);
    if (powerball === 0) return null; // Zero is not a valid powerball number

    if (this.isValidPowerballSet(whiteBalls, powerball)) {
      return { whiteBalls, powerball };
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
