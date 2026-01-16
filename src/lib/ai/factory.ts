import { AIProvider, AIProviderConfig } from './providers/base';
import { GeminiProvider } from './providers/gemini';
import { OpenAIProvider } from './providers/openai';
import { AnthropicProvider } from './providers/anthropic';
import { PerplexityProvider } from './providers/perplexity';
import { ProviderName } from '@/types/analysis';

export function createAIProvider(
  provider: ProviderName,
  apiKey: string,
  options?: Partial<AIProviderConfig>
): AIProvider {
  const config: AIProviderConfig = {
    apiKey,
    ...options
  };

  switch (provider) {
    case 'gemini':
      return new GeminiProvider(config);
    case 'openai':
      return new OpenAIProvider(config);
    case 'anthropic':
      return new AnthropicProvider(config);
    case 'perplexity':
      return new PerplexityProvider(config);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}
