import type { OCRResult } from '../types/powerball';
import { ocrSelectorService, OCREngineType } from './ocrSelectorService';

/**
 * Main OCR Service that uses either Tesseract or PaddleOCR via the OCR Selector Service
 */
export class OCRService {
  private static instance: OCRService;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): OCRService {
    if (!OCRService.instance) {
      OCRService.instance = new OCRService();
    }
    return OCRService.instance;
  }

  /**
   * Initialize the OCR service
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      await ocrSelectorService.initialize();
      this.isInitialized = true;
      console.log('OCR Service initialized with engine:', ocrSelectorService.getActiveEngine());
    } catch (error) {
      console.error('OCR Service initialization failed:', error);
      throw new Error('Failed to initialize OCR service');
    }
  }

  /**
   * Extract numbers from an image using the active OCR engine
   */
  public async extractNumbers(imageData: string): Promise<OCRResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    return ocrSelectorService.extractNumbers(imageData);
  }

  /**
   * Set the OCR engine to use (Tesseract or PaddleOCR)
   */
  public setOCREngine(engine: OCREngineType): void {
    ocrSelectorService.setActiveEngine(engine);
    console.log('OCR Engine set to:', engine);
  }

  /**
   * Get the active OCR engine
   */
  public getActiveEngine(): OCREngineType {
    return ocrSelectorService.getActiveEngine();
  }

  /**
   * Terminate the OCR service
   */
  public async terminate(): Promise<void> {
    if (this.isInitialized) {
      await ocrSelectorService.terminate();
      this.isInitialized = false;
    }
  }

  /**
   * Check if the OCR service is ready
   */
  public isReady(): boolean {
    return this.isInitialized && ocrSelectorService.isReady();
  }
}

export const ocrService = OCRService.getInstance();