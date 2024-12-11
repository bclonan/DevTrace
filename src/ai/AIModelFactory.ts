// src/ai/AIModelFactory.ts

import { AIModelClient } from "./AIModelClient.ts";
import { AnthropicClient } from "./AnthropicClient.ts";
import { GithubCopilotClient } from "./GithubCopilotClient.ts";
import { GoogleAIClient } from "./GoogleAIClient.ts";
import { OpenAIClient } from "./OpenAIClient.ts";

/**
 * The supported AI Providers.
 */
export enum AIProvider {
  OpenAI = "openai",
  Anthropic = "anthropic",
  Google = "google",
  GithubCopilot = "github",
}

/**
 * The AIModelFactory class.
 * Returns the appropriate AIModelClient implementation for the given provider and API key.
 */
export class AIModelFactory {
  static getClient(provider: AIProvider, apiKey: string): AIModelClient {
    switch (provider) {
      case AIProvider.OpenAI:
        return new OpenAIClient(apiKey);
      case AIProvider.Anthropic:
        return new AnthropicClient(apiKey);
      case AIProvider.Google:
        return new GoogleAIClient(apiKey);
      case AIProvider.GithubCopilot:
        return new GithubCopilotClient();
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  }
}
