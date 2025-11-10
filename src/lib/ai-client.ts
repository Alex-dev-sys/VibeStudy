const DEFAULT_API_BASE_URL = 'https://router.huggingface.co/v1';
const DEFAULT_MODEL = 'MiniMaxAI/MiniMax-M2:novita';

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
  const apiKey = process.env.HF_TOKEN ?? process.env.HF_API_KEY ?? '';
  const baseUrl = (process.env.HF_API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(/\/+$/, '');
  const rawModel = process.env.HF_MODEL ?? DEFAULT_MODEL;
  const model = rawModel.trim();

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

interface SseParseResult {
  chunks: Array<Record<string, any>>;
  aggregatedContent: string;
  responseLike: Record<string, any>;
}

const parseSsePayload = (payload: string): SseParseResult | null => {
  const dataLines = payload
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice('data:'.length).trim())
    .filter((line) => line && line !== '[DONE]');

  if (dataLines.length === 0) {
    return null;
  }

  const parsedChunks = dataLines
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter((chunk): chunk is Record<string, any> => Boolean(chunk));

  if (parsedChunks.length === 0) {
    return null;
  }

  const aggregatedContent = parsedChunks
    .map((chunk) => {
      const choice = chunk.choices?.[0];
      if (!choice) return '';
      if (typeof choice.delta?.content === 'string') return choice.delta.content;
      if (typeof choice.message?.content === 'string') return choice.message.content;
      return '';
    })
    .join('');

  const lastChunk = parsedChunks[parsedChunks.length - 1];
  const firstChunk = parsedChunks.find((chunk) => typeof chunk.choices?.[0]?.delta?.role === 'string');
  const role = (firstChunk?.choices?.[0]?.delta?.role as string | undefined) ?? 'assistant';

  return {
    chunks: parsedChunks,
    aggregatedContent,
    responseLike: {
      id: lastChunk?.id ?? 'hf-sse',
      object: 'chat.completion',
      created: lastChunk?.created ?? Date.now(),
      model: lastChunk?.model,
      choices: [
        {
          index: 0,
          finish_reason: lastChunk?.choices?.[0]?.finish_reason ?? null,
          message: {
            role,
            content: aggregatedContent
          }
        }
      ],
      usage: lastChunk?.usage ?? null,
      raw_chunks: parsedChunks
    }
  };
};

const parseResponsePayload = (payload: string) => {
  if (!payload) {
    return null;
  }

  try {
    return JSON.parse(payload);
  } catch {
    return parseSsePayload(payload);
  }
};

export const callChatCompletion = async ({ messages, temperature, maxTokens, model, responseFormat }: CallChatCompletionParams) => {
  const { apiKey, baseUrl, model: defaultModel } = resolveConfig();

  if (!apiKey) {
    throw new Error('HF_TOKEN is not defined');
  }

  const body: Record<string, unknown> = {
    model: model ?? defaultModel,
    messages,
    temperature,
    max_tokens: maxTokens,
    stream: false
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

  const rawBody = await response.text();
  const parsedBody = parseResponsePayload(rawBody);

  if (!response.ok) {
    const errorPayload = parsedBody && 'responseLike' in parsedBody ? (parsedBody as SseParseResult).responseLike : parsedBody;
    const message =
      typeof (errorPayload as any)?.error?.message === 'string'
        ? (errorPayload as any).error.message
        : response.statusText;
    const error = new Error(`huggingface_request_failed: ${message}`);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  if (parsedBody && 'responseLike' in parsedBody) {
    const sseResult = parsedBody as SseParseResult;
    const aggregated = sseResult.aggregatedContent.trim();
    return {
      data: sseResult.responseLike,
      raw: aggregated
    } satisfies ChatCompletionResult;
  }

  const raw = extractMessageContent(parsedBody ?? rawBody);

  return {
    data: parsedBody ?? rawBody,
    raw
  } satisfies ChatCompletionResult;
};

export const extractMessageContent = (payload: unknown) => {
  const extractFromChoice = (choice: any) => {
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

  const choice = (payload as any)?.choices?.[0];
  const rawContent = choice?.message?.content;

  if (typeof choice?.delta?.content === 'string') {
    return choice.delta.content;
  }

  if (!choice && typeof payload === 'string') {
    return payload;
  }

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

