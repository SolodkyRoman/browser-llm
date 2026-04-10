import { useState, useEffectEvent } from 'react';
import type { ResultItem } from '../shared';
import { useSentimentAnalyzer } from './useSentimentAnalyzer';
import { useDebouncedEffect } from '../../hooks/useDebouncedEffect';

export const useSentimentController = () => {
  const [text, setText] = useState(
    'I love how easy it is to run ML models directly in the browser!',
  );
  const [results, setResults] = useState<ResultItem[] | null>(null);
  const { analyze, status } = useSentimentAnalyzer();

  const runAnalysis = useEffectEvent(async () => {
    if (!text.trim()) {
      setResults(null);
      return;
    }
    try {
      setResults(await analyze(text));
    } catch {
      setResults(null);
    }
  });

  useDebouncedEffect(runAnalysis, [text], 500, true);

  return { text, status, results, onTextChange: setText };
};
