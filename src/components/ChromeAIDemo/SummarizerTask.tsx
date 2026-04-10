import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { StatusMessage } from '../shared';
import {
  useSummarizerController,
  type SummaryType,
  type SummaryLength,
} from './useSummarizerController';

const SummarizerTask = () => {
  const {
    text,
    summary,
    type,
    length,
    status,
    onTextChange,
    onTypeChange,
    onLengthChange,
    onSummarize,
  } = useSummarizerController();

  const busy = status.type === 'loading';

  return (
    <>
      <div className="chrome-ai-config">
        <label>
          Type
          <select
            value={type}
            onChange={(e) => onTypeChange(e.target.value as SummaryType)}
          >
            <option value="key-points">Key Points</option>
            <option value="tldr">TL;DR</option>
            <option value="teaser">Teaser</option>
            <option value="headline">Headline</option>
          </select>
        </label>
        <label>
          Length
          <select
            value={length}
            onChange={(e) => onLengthChange(e.target.value as SummaryLength)}
          >
            <option value="short">Short</option>
            <option value="medium">Medium</option>
            <option value="long">Long</option>
          </select>
        </label>
      </div>

      <div className="textarea-wrap">
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          rows={10}
          placeholder="Paste or type text to summarize..."
        />
      </div>

      <button
        className="chrome-ai-btn"
        onClick={onSummarize}
        disabled={busy || !text.trim()}
      >
        {busy ? 'Summarizing...' : 'Summarize'}
      </button>

      <StatusMessage status={status} />

      {summary && !busy && (
        <div className="qa-result">
          <div className="qa-answer" style={{ padding: '4px 8px' }}>
            <Markdown remarkPlugins={[remarkGfm]}>{summary}</Markdown>
          </div>
        </div>
      )}
    </>
  );
};

const SummarizerTaskGuard = () => {
  if (!('Summarizer' in self)) {
    return (
      <p className="status status-warning">
        Summarizer API is not supported in this browser. Requires Chrome 138+.
      </p>
    );
  }
  return <SummarizerTask />;
};

export default SummarizerTaskGuard;
