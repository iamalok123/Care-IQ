import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private modelName: string = 'gemini-2.5-flash';

  constructor() {
    this.init();
  }

  private init() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'your_gemini_api_key_here' && apiKey.trim().length > 0) {
      try {
        this.genAI = new GoogleGenerativeAI(apiKey.trim());
      } catch (err) {
        console.warn('Failed to initialize GoogleGenerativeAI client:', err);
        this.genAI = null;
      }
    }
  }

  public isAvailable(): boolean {
    const apiKey = process.env.GEMINI_API_KEY;
    return !!(apiKey && apiKey !== 'your_gemini_api_key_here' && apiKey.trim().length > 0);
  }

  public getModelName(): string {
    return this.modelName;
  }

  /**
   * Generates natural language text using Gemini Flash.
   */
  public async generateText(
    prompt: string,
    systemInstruction?: string
  ): Promise<{ text: string; model: string; success: boolean }> {
    if (!this.genAI) {
      this.init();
    }

    if (!this.genAI) {
      return { text: '', model: 'deterministic-fallback', success: false };
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        systemInstruction: systemInstruction || 'You are CareIQ, an expert Indian Health Insurance & Clinical Trajectory Decision Support AI.'
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        text: text || '',
        model: this.modelName,
        success: true
      };
    } catch (err: any) {
      console.warn('Gemini generateText error, falling back to deterministic template:', err?.message || err);
      return {
        text: '',
        model: 'deterministic-fallback',
        success: false
      };
    }
  }

  /**
   * Generates structured JSON object using Gemini Flash.
   */
  public async generateJson<T>(
    prompt: string,
    systemInstruction?: string
  ): Promise<{ data: T | null; model: string; success: boolean }> {
    if (!this.genAI) {
      this.init();
    }

    if (!this.genAI) {
      return { data: null, model: 'deterministic-fallback', success: false };
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2
        },
        systemInstruction: systemInstruction || 'You are CareIQ, an expert Indian Health Insurance Decision Support AI. Always respond in valid JSON.'
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (text) {
        const parsed = JSON.parse(text) as T;
        return {
          data: parsed,
          model: this.modelName,
          success: true
        };
      }

      return { data: null, model: this.modelName, success: false };
    } catch (err: any) {
      console.warn('Gemini generateJson error, falling back to deterministic template:', err?.message || err);
      return {
        data: null,
        model: 'deterministic-fallback',
        success: false
      };
    }
  }
}

export const geminiService = new GeminiService();
