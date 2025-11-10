const DEFAULT_API_BASE_URL = 'https://api.gptlama.ru/v1';
const DEFAULT_MODEL = 'meta-llama-3-70b-instruct';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
  responseFormat?: { type: 'json_object' | 'text' | string };
}

interface CallChatCompletionParams extends ChatCompletionOptions {
  messages: ChatMessage[];
}

export interface ChatCompletionResult {
  data: unknown;
  raw: string;
}

const resolveConfig = () => {
  const apiKey = process.env.GPTLAMA_API_KEY ?? '';
  const baseUrl = (process.env.GPTLAMA_API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(/\/+$/, '');
  const model = process.env.GPTLAMA_MODEL ?? DEFAULT_MODEL;

  return {
    apiKey: apiKey.trim(),
    baseUrl,
    model
  };
};

export const isAiConfigured = () => {
  const { apiKey } = resolveConfig();
  return apiKey.length > 0;
};

export const callChatCompletion = async ({ messages, temperature, maxTokens, model, responseFormat }: CallChatCompletionParams) => {
  const { apiKey, baseUrl, model: defaultModel } = resolveConfig();

  if (!apiKey) {
    throw new Error('GPTLAMA_API_KEY is not defined');
  }

  const body: Record<string, unknown> = {
    model: model ?? defaultModel,
    messages,
    temperature,
    max_tokens: maxTokens
  };

  if (responseFormat) {
    body.response_format = responseFormat;
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  if (!response.ok) {
    const message = typeof data?.error === 'string' ? data.error : response.statusText;
    const error = new Error(`gptlama_request_failed: ${message}`);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  const raw = extractMessageContent(data);

  return {
    data,
    raw
  } satisfies ChatCompletionResult;
};

export const extractMessageContent = (payload: unknown) => {
  const choice = (payload as any)?.choices?.[0];
  const rawContent = choice?.message?.content;

  if (Array.isArray(rawContent)) {
    return rawContent
      .map((part) => {
        if (typeof part === 'string') return part;
        if (part && typeof part === 'object') {
          if ('text' in part && typeof part.text === 'string') {
            return part.text;
          }
          if ('text' in part && part.text && typeof part.text === 'object' && 'value' in part.text && typeof part.text.value === 'string') {
            return part.text.value;
          }
        }
        return '';
      })
      .filter(Boolean)
      .join('\n');
  }

  return typeof rawContent === 'string' ? rawContent : '';
};

