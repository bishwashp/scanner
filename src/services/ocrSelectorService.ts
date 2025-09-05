import type { OCRResult } from '../types/powerball';
import { simpleOcrService } from './simpleOcrService';
import { paddleOcrService } from './paddleOcrService';

<<<<<<< Updated upstream
/**
 * OCR Engine Type
 */
export const OCREngineType = {
  Tesseract: 'tesseract',
  PaddleOCR: 'paddleocr'
} as const;

export type OCREngineType = typeof OCREngineType[keyof typeof OCREngineType];
=======
// Simple string literals for engine types
export type OCREngineType = 'tesseract' | 'paddleocr';
>>>>>>> Stashed changes

/**
 * OCR Selector Service for switching between OCR engines
 */
export class OCRSelectorService {
  private static instance: OCRSelectorService;
  private activeEngine: OCREngineType = 'tesseract'; // Default to Tesseract
  
  private constructor() {}
  
  public static getInstance(): OCRSelectorService {
    if (!OCRSelectorService.instance) {
      OCRSelectorService.instance = new OCRSelectorService();
    }
    return OCRSelectorService.instance;
  }
  
  /**
   * Set the active OCR engine
   */
  public setActiveEngine(engine: OCREngineType): void {
    this.activeEngine = engine;
    console.log(`Switched OCR engine to: ${engine}`);
  }
  
  /**
   * Get the active OCR engine type
   */
  public getActiveEngine(): OCREngineType {
    return this.activeEngine;
  }
  
  /**
   * Initialize the active OCR engine
   */
  public async initialize(): Promise<void> {
    if (this.activeEngine === 'paddleocr') {
      await paddleOcrService.initialize();
    } else {
      await simpleOcrService.initialize();
    }
  }
  
  /**
   * Extract numbers using the active OCR engine
   */
  public async extractNumbers(imageData: string): Promise<OCRResult> {
    if (this.activeEngine === 'paddleocr') {
      return await paddleOcrService.extractNumbers(imageData);
    } else {
      return await simpleOcrService.extractNumbers(imageData);
    }
  }
  
  /**
   * Terminate the active OCR engine
   */
  public async terminate(): Promise<void> {
    if (this.activeEngine === 'paddleocr') {
      await paddleOcrService.terminate();
    } else {
      await simpleOcrService.terminate();
    }
  }
  
  /**
   * Check if the active OCR engine is ready
   */
  public isReady(): boolean {
    if (this.activeEngine === 'paddleocr') {
      return paddleOcrService.isReady();
    } else {
      return simpleOcrService.isReady();
    }
  }
}

export const ocrSelectorService = OCRSelectorService.getInstance();