import { StatusMessage } from '../shared';
import { useSummaryController } from './useSummaryController';

export const SummaryTask = () => {
  const { text, summary, status, onTextChange } =
    useSummaryController();

  return (
    <>
      <div className="textarea-wrap">
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          rows={10}
          placeholder="Paste or type text to summarize…"
        />
      </div>

      <StatusMessage status={status} />

      {summary && status.type !== 'loading' && (
        <div className="qa-result">
          <div className="qa-answer">{summary}</div>
        </div>
      )}
    </>
  );
};
