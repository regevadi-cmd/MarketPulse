import OpenAI from 'openai';
import { BaseAIProvider, AIProviderConfig } from './base';
import { AnalysisResult } from '@/types/analysis';
import { parseTaggedResponse } from '../parser';

export class OpenAIProvider extends BaseAIProvider {
  readonly name = 'openai';
  readonly supportsWebGrounding = false;

  private client: OpenAI;

  constructor(config: AIProviderConfig) {
    super(config);
    this.client = new OpenAI({ apiKey: this.apiKey });
  }

  getDefaultModel(): string {
    return 'gpt-5.2';
  }

  async analyzeCompany(companyName: string): Promise<AnalysisResult> {
    // GPT-5.x models use different parameters than GPT-4o models
    const isGpt5 = this.model.startsWith('gpt-5');

    const completion = await this.client.chat.completions.create({
      model: this.model,
      stream: false,
      messages: [
        {
          role: 'system',
          content: 'You are a corporate intelligence analyst. Provide comprehensive, factual analysis based on your knowledge.'
        },
        {
          role: 'user',
          content: this.getAnalysisPrompt(companyName)
        }
      ],
      ...(isGpt5
        ? { max_completion_tokens: 4000 }
        : { max_tokens: 4000, temperature: 0.3 })
    });
    const text = completion.choices[0]?.message?.content || '';
    return parseTaggedResponse(text);
  }
}
