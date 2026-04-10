// Manages the Chrome AI Summarizer lifecycle: creates instances per type+length combo,
// caches them to avoid re-initialization, and tracks download progress via monitor callback.

import { useState } from 'react';
import type { Status } from '../shared';
import { IDLE } from '../shared';
import { WASM_EXPLAINER } from '../shared-text';
import { useCachedInstance } from './useCachedInstance';
import { createDownloadMonitor } from './utils';

export type SummaryType = 'key-points' | 'tldr' | 'teaser' | 'headline';
export type SummaryLength = 'short' | 'medium' | 'long';

export const useSummarizerController = () => {
  const [text, setText] = useState(WASM_EXPLAINER);
  const [summary, setSummary] = useState<string | null>(null);
  const [type, setType] = useState<SummaryType>('headline');
  const [length, setLength] = useState<SummaryLength>('medium');
  const [status, setStatus] = useState<Status>(IDLE);
  const cache = useCachedInstance<Summarizer>();

  const summarize = async () => {
    if (!text.trim()) return;

    setStatus({ type: 'loading', message: 'Summarizing...' });
    setSummary(null);

    try {
      let instance = cache.resolve(`${type}-${length}`);

      if (!instance) {
        setStatus({ type: 'loading', message: 'Initializing summarizer...' });
        instance = await Summarizer.create({
          type,
          format: 'markdown',
          length,
          monitor: createDownloadMonitor(setStatus, 'model'),
        });
        cache.set(instance);
      }

      setStatus({ type: 'loading', message: 'Summarizing...' });
      const result = await instance.summarize(text);
      setSummary(result);
      setStatus(IDLE);
    } catch (err) {
      setStatus({
        type: 'error',
        message: err instanceof Error ? err.message : String(err),
      });
    }
  };

  return {
    text,
    summary,
    type,
    length,
    status,
    onTextChange: setText,
    onTypeChange: setType,
    onLengthChange: setLength,
    onSummarize: summarize,
  };
};
