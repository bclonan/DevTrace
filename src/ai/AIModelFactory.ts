import { OpenAIClient } from './OpenAIClient';
import { AnthropicClient } from './AnthropicClient';
import { GoogleAIClient } from './GoogleAIClient';
import { GithubCopilotClient } from './GithubCopilotClient';

export enum AIProvider {
  OpenAI = 'openai',
  Anthropic = 'anthropic',
  Google = 'google',
  GithubCopilot = 'github',
}

export class AIModelFactory {
  static getClient(provider: AIProvider, apiKey: string) {
    switch (provider) {
      case AIProvider.OpenAI:
        return new OpenAIClient(apiKey);
      case AIProvider.Anthropic:
        return new AnthropicClient(apiKey);
      case AIProvider.Google:
        return new GoogleAIClient(apiKey);
      case AIProvider.GithubCopilot:
        return new GithubCopilotClient(apiKey);
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  }
}