// Chat controller for the WebLLM tab.
// Streams completions from the in-browser engine, accumulates token usage across
// rounds (WebLLM reports per-round KV cache tokens), and resets chat on settings apply.

import { useState, useRef, useEffectEvent } from 'react';
import { type Message, type Status, IDLE } from '../shared';
import { useWebLLM } from './useWebLLM';
import { buildSystemMessage } from '../../systemPrompt';
import type { ModelOption } from './const';
import { useSettings, DEFAULTS, type Settings } from '../../hooks/useSettings';

const initialSystemMessage = buildSystemMessage(DEFAULTS.systemPrompt, DEFAULTS.contextData);

export interface TokenUsage {
  used: number;
  limit: number;
}

export const useController = (model: ModelOption) => {
  const [messages, setMessages] = useState<Message[]>([initialSystemMessage]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [chatError, setChatError] = useState<Status>(IDLE);
  const [tokenUsage, setTokenUsage] = useState<TokenUsage | null>(null);
  // WebLLM reports per-round tokens (KV cache means only new tokens are counted
  // each round), so we accumulate to track total context window usage.
  const cumulativeTokens = useRef(0);
  const isFirstRequest = useRef(true);
  const { engineRef, modelStatus, modelLoaded, stop } = useWebLLM(model);

  const resetChat = useEffectEvent((s: Settings) => {
    setMessages([buildSystemMessage(s.systemPrompt, s.contextData)]);
    setChatError(IDLE);
    setTokenUsage(null);
    cumulativeTokens.current = 0;
    isFirstRequest.current = true;
  });

  const settings = useSettings(resetChat, { initial: model });

  const onReset = useEffectEvent(() => {
    resetChat(settings.values);
  });

  const onSend = useEffectEvent(async (text?: string) => {
    const userText = text ?? input;
    if (!userText.trim() || !engineRef.current || streaming) return;
    const userMsg: Message = { role: 'user', content: userText };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setStreaming(true);

    try {
      if (isFirstRequest.current) {
        isFirstRequest.current = false;
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: '_Loading context data..._' },
        ]);
      }

      const { maxTokens, temperature } = settings.values;
      const stream = await engineRef.current.chat.completions.create({
        messages: [...messages, userMsg].map((m) => ({
          role: m.role,
          content: m.content,
        })),
        max_tokens: maxTokens,
        temperature,
        stream: true,
        stream_options: { include_usage: true },
      });

      let content = '';
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') return prev;
        return [...prev, { role: 'assistant', content: '' }];
      });

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content ?? '';
        if (delta) {
          content += delta;
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: 'assistant', content };
            return updated;
          });
        }
        if (chunk.usage) {
          cumulativeTokens.current += chunk.usage.total_tokens;
          setTokenUsage({
            used: cumulativeTokens.current,
            limit: model.contextWindow,
          });
        }
      }
    } catch (err) {
      setChatError({
        type: 'error',
        message: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setStreaming(false);
    }
  });

  return {
    messages,
    input,
    streaming,
    status: modelLoaded ? chatError : modelStatus,
    modelLoaded,
    tokenUsage,
    onInputChange: setInput,
    onSend,
    onStop: stop,
    onReset,
    settings,
  };
};
