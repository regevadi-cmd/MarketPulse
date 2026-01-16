import { BaseAIProvider, AIProviderConfig } from './base';
import { AnalysisResult } from '@/types/analysis';
import { parseTaggedResponse } from '../parser';

export class PerplexityProvider extends BaseAIProvider {
  readonly name = 'perplexity';
  readonly supportsWebGrounding = true;

  constructor(config: AIProviderConfig) {
    super(config);
  }

  getDefaultModel(): string {
    return 'sonar-pro';
  }

  async analyzeCompany(companyName: string): Promise<AnalysisResult> {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a corporate intelligence analyst. Provide comprehensive, factual analysis with citations.'
          },
          {
            role: 'user',
            content: this.getAnalysisPrompt(companyName)
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Perplexity API error: ${error}`);
    }

    const data = await response.json();
    const text = data.choices[0]?.message?.content || '';
    return parseTaggedResponse(text);
  }
}
