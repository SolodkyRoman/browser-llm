import type { ResultItem } from '../shared';
import { useWorkerPipeline } from '../../hooks/useWorkerPipeline';

interface ClassificationResult {
  labels: string[];
  scores: number[];
}

export const useClassifier = () => {
  const { run, status } = useWorkerPipeline<ClassificationResult>(
    'zero-shot-classification',
    'Xenova/nli-deberta-v3-xsmall',
    'q8',
  );

  const classify = async (
    text: string,
    labels: string[],
  ): Promise<ResultItem[]> => {
    const output: ClassificationResult = await run(text, labels);
    return output.labels.map((label, i) => ({
      label,
      score: output.scores[i],
    }));
  };

  return { classify, status };
};
