/**
 * Response Parser for AI Learning Assistant
 * Parses and formats AI responses
 */

import { AssistantResponse, CodeBlock } from './types';

/**
 * Configuration for ResponseParser
 */
interface ResponseParserConfig {
  extractCodeBlocks: boolean;
  extractSuggestions: boolean;
  extractRelatedTopics: boolean;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: ResponseParserConfig = {
  extractCodeBlocks: true,
  extractSuggestions: true,
  extractRelatedTopics: true,
};

/**
 * ResponseParser class
 * Parses AI responses and extracts structured data
 */
export class ResponseParser {
  private config: ResponseParserConfig;

  constructor(config: Partial<ResponseParserConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Parse AI response into structured format
   */
  parseResponse(rawResponse: string): AssistantResponse {
    try {
      // Extract code blocks
      const codeBlocks = this.config.extractCodeBlocks
        ? this.extractCodeBlocks(rawResponse)
        : undefined;

      // Extract suggestions (bullet points or numbered lists)
      const suggestions = this.config.extractSuggestions
        ? this.extractSuggestions(rawResponse)
        : undefined;

      // Extract related topics (mentioned concepts)
      const relatedTopics = this.config.extractRelatedTopics
        ? this.extractRelatedTopics(rawResponse)
        : undefined;

      // Clean message (remove extracted elements if needed)
      const message = this.cleanMessage(rawResponse);

      // If message is empty after cleaning but we have code blocks or other content, that's OK
      // Only use fallback if there's truly no content at all
      if ((!message || message.trim().length === 0) && 
          !codeBlocks && 
          !suggestions && 
          !relatedTopics) {
        return this.createFallbackResponse(rawResponse);
      }

      return {
        message: message || '', // Ensure message is at least empty string, not undefined
        codeExamples: codeBlocks,
        suggestions,
        relatedTopics,
      };
    } catch (error) {
      // Fallback: return raw response if parsing fails
      console.error('Error parsing AI response:', error);
      return this.createFallbackResponse(rawResponse);
    }
  }

  /**
   * Extract code blocks from response
   */
  private extractCodeBlocks(text: string): CodeBlock[] | undefined {
    // Updated regex to handle language identifiers with special characters like c++, c#
    // Matches: ```language\ncode``` or ```\ncode```
    const codeBlockRegex = /```([^\n`]*?)\n([\s\S]*?)```/g;
    const blocks: CodeBlock[] = [];
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      const language = match[1].trim() || 'plaintext';
      const code = match[2].trim();
      
      if (code) {
        blocks.push({
          language: this.normalizeLanguage(language),
          code,
        });
      }
    }

    return blocks.length > 0 ? blocks : undefined;
  }

  /**
   * Extract suggestions from response
   */
  private extractSuggestions(text: string): string[] | undefined {
    const suggestions: string[] = [];

    // Extract bullet points
    const bulletRegex = /^[•\-\*]\s+(.+)$/gm;
    let match;
    while ((match = bulletRegex.exec(text)) !== null) {
      suggestions.push(match[1].trim());
    }

    // Extract numbered lists
    const numberedRegex = /^\d+\.\s+(.+)$/gm;
    while ((match = numberedRegex.exec(text)) !== null) {
      suggestions.push(match[1].trim());
    }

    return suggestions.length > 0 ? suggestions : undefined;
  }

  /**
   * Extract related topics from response
   */
  private extractRelatedTopics(text: string): string[] | undefined {
    const topics: string[] = [];

    // Look for common patterns indicating related topics
    const patterns = [
      /(?:связанные темы|related topics):\s*(.+)/i,
      /(?:см\. также|see also):\s*(.+)/i,
      /(?:дополнительно|additionally):\s*(.+)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        // Split by commas or semicolons
        const extracted = match[1]
          .split(/[,;]/)
          .map((t) => t.trim())
          .filter((t) => t.length > 0);
        topics.push(...extracted);
      }
    }

    return topics.length > 0 ? topics : undefined;
  }

  /**
   * Clean message by removing code blocks and other extracted elements
   */
  private cleanMessage(text: string): string {
    // Remove code blocks
    let cleaned = text.replace(/```[\s\S]*?```/g, '');

    // Trim excessive whitespace
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();

    return cleaned;
  }

  /**
   * Normalize language identifier
   */
  private normalizeLanguage(lang: string): string {
    const normalized: Record<string, string> = {
      js: 'javascript',
      ts: 'typescript',
      py: 'python',
      cpp: 'cpp',
      'c++': 'cpp',
      cs: 'csharp',
      'c#': 'csharp',
    };

    return normalized[lang.toLowerCase()] || lang.toLowerCase();
  }

  /**
   * Create fallback response when parsing fails
   */
  private createFallbackResponse(rawResponse: string): AssistantResponse {
    return {
      message: rawResponse || 'Извините, произошла ошибка при обработке ответа.',
    };
  }

  /**
   * Validate response format
   */
  validateResponse(response: AssistantResponse): boolean {
    // Response must have either a message or code examples or suggestions
    const hasMessage = response.message && response.message.trim().length > 0;
    const hasCodeExamples = response.codeExamples && response.codeExamples.length > 0;
    const hasSuggestions = response.suggestions && response.suggestions.length > 0;
    const hasRelatedTopics = response.relatedTopics && response.relatedTopics.length > 0;

    if (!hasMessage && !hasCodeExamples && !hasSuggestions && !hasRelatedTopics) {
      return false;
    }

    // Check if code blocks are valid
    if (response.codeExamples) {
      for (const block of response.codeExamples) {
        if (!block.language || !block.code) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Format response for display
   */
  formatForDisplay(response: AssistantResponse): string {
    let formatted = response.message;

    // Add code blocks back
    if (response.codeExamples && response.codeExamples.length > 0) {
      formatted += '\n\n';
      for (const block of response.codeExamples) {
        formatted += `\`\`\`${block.language}\n${block.code}\n\`\`\`\n\n`;
      }
    }

    // Add suggestions
    if (response.suggestions && response.suggestions.length > 0) {
      formatted += '\n\n**Рекомендации:**\n';
      for (const suggestion of response.suggestions) {
        formatted += `• ${suggestion}\n`;
      }
    }

    // Add related topics
    if (response.relatedTopics && response.relatedTopics.length > 0) {
      formatted += '\n\n**Связанные темы:** ';
      formatted += response.relatedTopics.join(', ');
    }

    return formatted.trim();
  }
}

/**
 * Create a ResponseParser instance
 */
export function createResponseParser(
  config?: Partial<ResponseParserConfig>
): ResponseParser {
  return new ResponseParser(config);
}

/**
 * Quick parse function for convenience
 */
export function parseAIResponse(rawResponse: string): AssistantResponse {
  const parser = new ResponseParser();
  return parser.parseResponse(rawResponse);
}
