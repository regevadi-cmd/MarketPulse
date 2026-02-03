import { GoogleGenerativeAI, Tool } from '@google/generative-ai';
import { BaseAIProvider, AIProviderConfig } from './base';
import { AnalysisResult } from '@/types/analysis';
import { parseTaggedResponse } from '../parser';

export class GeminiProvider extends BaseAIProvider {
  readonly name = 'gemini';
  readonly supportsWebGrounding = true;

  private client: GoogleGenerativeAI;

  constructor(config: AIProviderConfig) {
    super(config);
    this.client = new GoogleGenerativeAI(this.apiKey);
  }

  getDefaultModel(): string {
    return 'gemini-2.5-flash';
  }

  async analyzeCompany(companyName: string): Promise<AnalysisResult> {
    // Use type assertion for googleSearch tool which is valid but not in current types
    const googleSearchTool = { googleSearch: {} } as unknown as Tool;

    const model = this.client.getGenerativeModel({
      model: this.model,
      tools: [googleSearchTool]
    });

    const prompt = this.getAnalysisPrompt(companyName);
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return parseTaggedResponse(text);
  }
}
