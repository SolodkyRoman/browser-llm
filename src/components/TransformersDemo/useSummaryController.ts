import { useState, useEffectEvent } from 'react';
import { useWorkerPipeline } from '../../hooks/useWorkerPipeline';
import { useDebouncedEffect } from '../../hooks/useDebouncedEffect';
import { WASM_EXPLAINER_EXTENDED } from '../shared-text';

export const useSummaryController = () => {
  const { run, status } = useWorkerPipeline<{ summary_text: string }[]>(
    'summarization',
    'onnx-community/distilbart-cnn-12-6-ONNX',
    'q8',
  );

  const [text, setText] = useState(WASM_EXPLAINER_EXTENDED);
  const [summary, setSummary] = useState<string | null>(null);

  const runSummary = useEffectEvent(async () => {
    if (!text.trim()) {
      setSummary(null);
      return;
    }
    try {
      const output = await run(text, { max_new_tokens: 128 });
      setSummary(output[0].summary_text);
    } catch {
      setSummary(null);
    }
  });

  useDebouncedEffect(runSummary, [text], 800, true);

  return {
    text,
    summary,
    status,
    onTextChange: setText,
  };
};
