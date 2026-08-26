import { GoogleGenerativeAI } from '@google/generative-ai';

const CANDIDATE_MODELS = [
  process.env.GEMINI_MODEL,
  'gemini-3.5-flash-lite',
].filter((m): m is string => !!m && m.trim().length > 0);

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private modelName: string = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

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
   * Generates natural language text using Gemini Flash with automatic model fallback.
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

    const defaultInstruction =
      'You are CareIQ, an expert Indian Health Insurance & Clinical Navigation Decision Support AI. Always provide accurate, compassionate, structured, and grounded guidance.';

    // Try candidate models in order of priority
    for (const modelToTry of CANDIDATE_MODELS) {
      try {
        const model = this.genAI.getGenerativeModel({
          model: modelToTry,
          systemInstruction: systemInstruction || defaultInstruction
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        if (text && text.trim().length > 0) {
          this.modelName = modelToTry;
          return {
            text: text.trim(),
            model: modelToTry,
            success: true
          };
        }
      } catch (err: any) {
        console.warn(`Gemini generateText error with model ${modelToTry}:`, err?.message || err);
        // Continue to try next model in fallback list
      }
    }

    return {
      text: '',
      model: 'deterministic-fallback',
      success: false
    };
  }

  /**
   * Generates streaming text using Gemini Flash SSE tokens with model fallback.
   */
  public async streamText(
    prompt: string,
    systemInstruction?: string,
    onChunk?: (chunk: string) => void
  ): Promise<{ text: string; model: string; success: boolean }> {
    if (!this.genAI) {
      this.init();
    }

    if (!this.genAI) {
      return { text: '', model: 'deterministic-fallback', success: false };
    }

    const defaultInstruction =
      'You are CareIQ, an expert Indian Health Insurance & Clinical Navigation Decision Support AI. Always provide accurate, compassionate, structured, and grounded guidance.';

    for (const modelToTry of CANDIDATE_MODELS) {
      try {
        const model = this.genAI.getGenerativeModel({
          model: modelToTry,
          systemInstruction: systemInstruction || defaultInstruction
        });

        const responseStream = await model.generateContentStream(prompt);
        let fullText = '';
        for await (const chunk of responseStream.stream) {
          const chunkText = chunk.text();
          if (chunkText) {
            fullText += chunkText;
            onChunk?.(chunkText);
          }
        }

        if (fullText && fullText.trim().length > 0) {
          this.modelName = modelToTry;
          return {
            text: fullText.trim(),
            model: modelToTry,
            success: true
          };
        }
      } catch (err: any) {
        console.warn(`Gemini streamText error with model ${modelToTry}:`, err?.message || err);
      }
    }

    return {
      text: '',
      model: 'deterministic-fallback',
      success: false
    };
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

    const defaultInstruction =
      'You are CareIQ, an expert Indian Health Insurance Decision Support AI. Always respond in valid JSON.';

    for (const modelToTry of CANDIDATE_MODELS) {
      try {
        const model = this.genAI.getGenerativeModel({
          model: modelToTry,
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2
          },
          systemInstruction: systemInstruction || defaultInstruction
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        if (text) {
          const parsed = JSON.parse(text) as T;
          this.modelName = modelToTry;
          return {
            data: parsed,
            model: modelToTry,
            success: true
          };
        }
      } catch (err: any) {
        console.warn(`Gemini generateJson error with model ${modelToTry}:`, err?.message || err);
      }
    }

    return {
      data: null,
      model: 'deterministic-fallback',
      success: false
    };
  }
}

export const geminiService = new GeminiService();

