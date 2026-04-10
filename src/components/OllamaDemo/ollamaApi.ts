// Streams chat responses from a local Ollama server using NDJSON (one JSON object per line).
// Accumulates token content across chunks and reports usage stats on completion.

import type { Message, Status } from '../shared';
import { OLLAMA_URL } from '../../config';

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
}

interface StreamCallbacks {
  onToken: (content: string) => void;
  onError: (status: Status) => void;
  onDone: (usage?: TokenUsage) => void;
}

export const streamChat = async (
  model: string,
  messages: Message[],
  callbacks: StreamCallbacks,
  options?: Record<string, unknown>,
) => {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages, stream: true, options }),
    });

    if (!res.ok) {
      throw new Error(`Ollama returned ${res.status}: ${await res.text()}`);
    }

    if (!res.body) {
      throw new Error('Response body is empty');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let content = '';
    let usage: TokenUsage | undefined;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value, { stream: true });
      for (const line of text.split('\n').filter(Boolean)) {
        let data;
        try {
          data = JSON.parse(line);
        } catch {
          continue; // skip malformed NDJSON lines
        }
        if (data.message?.content) {
          content += data.message.content;
          callbacks.onToken(content);
        }
        if (data.done && data.prompt_eval_count != null) {
          usage = {
            promptTokens: data.prompt_eval_count,
            completionTokens: data.eval_count ?? 0,
          };
        }
      }
    }

    callbacks.onDone(usage);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
      callbacks.onError({
        type: 'error',
        message:
          "Cannot connect to Ollama. Make sure it's running: ollama serve",
      });
    } else {
      callbacks.onError({ type: 'error', message: msg });
    }
  }
};
