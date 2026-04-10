import type { ResultItem } from '../shared';
import { useWorkerPipeline } from '../../hooks/useWorkerPipeline';

interface SentimentResult {
  label: string;
  score: number;
}

export const useSentimentAnalyzer = () => {
  const { run, status } = useWorkerPipeline<SentimentResult[]>(
    'sentiment-analysis',
    'Xenova/distilbert-base-uncased-finetuned-sst-2-english',
    'q8',
  );

  const analyze = async (text: string): Promise<ResultItem[]> => {
    const output: SentimentResult[] = await run(text, { topk: 2 });
    return (Array.isArray(output) ? output : [output]).map((r) => ({
      label: r.label,
      score: r.score,
      color: r.label === 'POSITIVE' ? '#22c55e' : '#ef4444',
    }));
  };

  return { analyze, status };
};
