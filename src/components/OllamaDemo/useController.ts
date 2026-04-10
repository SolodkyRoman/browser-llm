// Chat controller for the Ollama tab.
// Auto-discovers installed models on mount. Supports two model-change paths:
// header dropdown (immediate reset) and settings overlay (deferred, resets on Apply).

import { useState, useEffect, useEffectEvent } from 'react';
import { type Message, type Status, IDLE } from '../shared';
import { streamChat } from './ollamaApi';
import { OLLAMA_URL } from '../../config';
import { buildSystemMessage } from '../../systemPrompt';
import { useSettings, DEFAULTS, type Settings } from '../../hooks/useSettings';

export const useController = () => {
  const [messages, setMessages] = useState<Message[]>([
    buildSystemMessage(DEFAULTS.systemPrompt, DEFAULTS.contextData),
  ]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [status, setStatus] = useState<Status>(IDLE);
  const [tokenUsage, setTokenUsage] = useState<{ used: number } | null>(null);
  const [model, setModel] = useState('');
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  const resetChat = useEffectEvent((s: Settings) => {
    setMessages([buildSystemMessage(s.systemPrompt, s.contextData)]);
    setStatus(IDLE);
    setTokenUsage(null);
  });

  const settings = useSettings(resetChat, { initial: model });

  const onReset = useEffectEvent(() => {
    resetChat(settings.values);
  });

  useEffect(() => {
    fetch(`${OLLAMA_URL}/api/tags`)
      .then((res) => res.json())
      .then((data) => {
        const models: string[] = data.models?.map((m: any) => m.name) ?? [];
        setAvailableModels(models);
        if (models.length > 0 && !model) {
          setModel(models[0]);
          settings.resetModel(models[0]);
        }
      })
      .catch(() => {
        setStatus({
          type: 'error',
          message:
            "Cannot connect to Ollama. Make sure it's running: ollama serve",
        });
      });
  }, []);

  // Header model change: immediate reset
  const onModelChange = useEffectEvent((newModel: string) => {
    setModel(newModel);
    settings.resetModel(newModel);
    resetChat(settings.values);
  });

  // Settings overlay apply: just set model (chat already reset by settings.apply)
  const onModelApply = useEffectEvent((newModel: string) => {
    setModel(newModel);
  });

  const onSend = useEffectEvent(async (text?: string) => {
    const userText = text ?? input;
    if (!userText.trim() || streaming) return;

    const userMsg: Message = { role: 'user', content: userText };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setStreaming(true);
    setStatus(IDLE);

    const assistantMsg: Message = { role: 'assistant', content: '' };
    setMessages((prev) => [...prev, assistantMsg]);

    const { maxTokens, temperature } = settings.values;
    await streamChat(model, newMessages, {
      onToken: (content) => {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content };
          return updated;
        });
      },
      onError: (error) => setStatus(error),
      onDone: (usage) => {
        setStreaming(false);
        if (usage) {
          setTokenUsage({ used: usage.promptTokens + usage.completionTokens });
        }
      },
    }, { temperature, num_predict: maxTokens });
  });

  return {
    messages,
    input,
    streaming,
    status,
    model,
    availableModels,
    tokenUsage,
    settings,
    onInputChange: setInput,
    onModelChange,
    onModelApply,
    onSend,
    onReset,
  };
};
