/**
 * Content Filter for AI Learning Assistant
 * Sanitizes input and detects inappropriate content
 */

/**
 * Filter result
 */
export interface FilterResult {
  allowed: boolean;
  sanitized: string;
  reason?: string;
  blocked?: string[];
}

/**
 * Configuration for ContentFilter
 */
interface ContentFilterConfig {
  maxLength: number;
  stripHtml: boolean;
  checkInappropriate: boolean;
  checkPromptInjection: boolean;
  locale: 'ru';
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: ContentFilterConfig = {
  maxLength: 2000,
  stripHtml: true,
  checkInappropriate: true,
  checkPromptInjection: true,
  locale: 'ru',
};

/**
 * Inappropriate content keywords (basic blocklist)
 */
const INAPPROPRIATE_KEYWORDS = {
  ru: [
    // Мат и оскорбления (базовый список)
    'дурак',
    'идиот',
    'тупой',
    // Добавьте другие по необходимости
  ],
  en: [
    // Profanity and insults (basic list)
    'stupid',
    'idiot',
    'dumb',
    // Add more as needed
  ],
};

/**
 * Prompt injection patterns
 */
const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(previous|all|above)\s+(instructions?|prompts?|rules?)/i,
  /forget\s+(everything|all|previous)/i,
  /you\s+are\s+(now|a)\s+/i,
  /system\s*:\s*/i,
  /\[system\]/i,
  /\<system\>/i,
  /act\s+as\s+(if|a)/i,
  /pretend\s+(you|to\s+be)/i,
  /roleplay\s+as/i,
  /new\s+instructions?/i,
  /override\s+(instructions?|rules?)/i,
];

/**
 * ContentFilter class
 * Filters and sanitizes user input
 */
export class ContentFilter {
  private config: ContentFilterConfig;

  constructor(config: Partial<ContentFilterConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Filter content
   */
  filterContent(content: string): FilterResult {
    // Check length
    if (content.length > this.config.maxLength) {
      return {
        allowed: false,
        sanitized: '',
        reason: this.config.locale === 'ru'
          ? `Сообщение слишком длинное (максимум ${this.config.maxLength} символов)`
          : `Message too long (max ${this.config.maxLength} characters)`,
      };
    }

    // Sanitize HTML
    let sanitized = content;
    if (this.config.stripHtml) {
      sanitized = this.stripHtml(sanitized);
    }

    // Check for inappropriate content
    if (this.config.checkInappropriate) {
      const inappropriateCheck = this.checkInappropriateContent(sanitized);
      if (!inappropriateCheck.allowed) {
        return inappropriateCheck;
      }
    }

    // Check for prompt injection
    if (this.config.checkPromptInjection) {
      const injectionCheck = this.checkPromptInjection(sanitized);
      if (!injectionCheck.allowed) {
        return injectionCheck;
      }
    }

    // Trim excessive whitespace
    sanitized = this.trimWhitespace(sanitized);

    return {
      allowed: true,
      sanitized,
    };
  }

  /**
   * Strip HTML tags from content
   */
  private stripHtml(content: string): string {
    // Remove HTML tags
    let stripped = content.replace(/<[^>]*>/g, '');

    // Decode HTML entities
    stripped = this.decodeHtmlEntities(stripped);

    return stripped;
  }

  /**
   * Decode HTML entities
   */
  private decodeHtmlEntities(text: string): string {
    const entities: Record<string, string> = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&nbsp;': ' ',
    };

    return text.replace(/&[a-z]+;|&#\d+;/gi, (match) => {
      return entities[match] || match;
    });
  }

  /**
   * Check for inappropriate content
   */
  private checkInappropriateContent(content: string): FilterResult {
    const keywords = INAPPROPRIATE_KEYWORDS[this.config.locale];
    const lowerContent = content.toLowerCase();
    const blocked: string[] = [];

    for (const keyword of keywords) {
      if (lowerContent.includes(keyword.toLowerCase())) {
        blocked.push(keyword);
      }
    }

    if (blocked.length > 0) {
      return {
        allowed: false,
        sanitized: '',
        reason: this.config.locale === 'ru'
          ? 'Сообщение содержит недопустимый контент'
          : 'Message contains inappropriate content',
        blocked,
      };
    }

    return {
      allowed: true,
      sanitized: content,
    };
  }

  /**
   * Check for prompt injection attempts
   */
  private checkPromptInjection(content: string): FilterResult {
    for (const pattern of PROMPT_INJECTION_PATTERNS) {
      if (pattern.test(content)) {
        return {
          allowed: false,
          sanitized: '',
          reason: this.config.locale === 'ru'
            ? 'Обнаружена попытка манипуляции системой'
            : 'Prompt injection attempt detected',
        };
      }
    }

    return {
      allowed: true,
      sanitized: content,
    };
  }

  /**
   * Trim excessive whitespace
   */
  private trimWhitespace(content: string): string {
    // Replace multiple spaces with single space
    let trimmed = content.replace(/\s+/g, ' ');

    // Replace multiple newlines with double newline
    trimmed = trimmed.replace(/\n{3,}/g, '\n\n');

    // Trim start and end
    trimmed = trimmed.trim();

    return trimmed;
  }

  /**
   * Validate content length
   */
  validateLength(content: string): boolean {
    return content.length > 0 && content.length <= this.config.maxLength;
  }

  /**
   * Check if content is empty or only whitespace
   */
  isEmpty(content: string): boolean {
    return content.trim().length === 0;
  }
}

/**
 * Create a ContentFilter instance
 */
export function createContentFilter(
  config?: Partial<ContentFilterConfig>
): ContentFilter {
  return new ContentFilter(config);
}

/**
 * Quick filter function for convenience
 */
export function filterContent(content: string): FilterResult {
  const filter = new ContentFilter({ locale: 'ru' });
  return filter.filterContent(content);
}

/**
 * Sanitize input (strip HTML and trim)
 */
export function sanitizeInput(content: string): string {
  const filter = new ContentFilter();
  const result = filter.filterContent(content);
  return result.sanitized;
}
