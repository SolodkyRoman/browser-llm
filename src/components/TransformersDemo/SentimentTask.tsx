import { StatusMessage, ResultBars } from '../shared';
import { useSentimentController } from './useSentimentController';

export const SentimentTask = () => {
  const { text, status, results, onTextChange } =
    useSentimentController();

  return (
    <>
      <div className="textarea-wrap">
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          rows={3}
          placeholder="Type some text to analyze..."
        />
      </div>

      <StatusMessage status={status} />

      {results && <ResultBars items={results} />}
    </>
  );
};
