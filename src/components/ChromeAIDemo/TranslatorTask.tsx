import { ArrowLeftRight } from 'lucide-react';
import { StatusMessage } from '../shared';
import { useTranslatorController, LANGUAGES } from './useTranslatorController';

const TranslatorTask = () => {
  const {
    text,
    result,
    sourceLanguage,
    targetLanguage,
    status,
    onTextChange,
    onSourceChange,
    onTargetChange,
    onTranslate,
  } = useTranslatorController();

  const busy = status.type === 'loading';

  return (
    <>
      <div className="chrome-ai-config">
        <label>
          From
          <select
            value={sourceLanguage}
            onChange={(e) => onSourceChange(e.target.value)}
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
        <button
          className="token-usage-reset"
          onClick={() => {
            onSourceChange(targetLanguage);
            onTargetChange(sourceLanguage);
          }}
          aria-label="Swap languages"
        >
          <ArrowLeftRight size={14} />
        </button>
        <label>
          <select
            value={targetLanguage}
            onChange={(e) => onTargetChange(e.target.value)}
          >
            {LANGUAGES.filter((l) => l.code !== sourceLanguage).map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="textarea-wrap">
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          rows={6}
          placeholder="Type or paste text to translate..."
        />
      </div>

      <button
        className="chrome-ai-btn"
        onClick={onTranslate}
        disabled={busy || !text.trim()}
      >
        {busy ? 'Translating...' : 'Translate'}
      </button>

      <StatusMessage status={status} />

      {result && !busy && (
        <div className="qa-result">
          <div className="qa-answer">{result}</div>
        </div>
      )}
    </>
  );
};

const TranslatorTaskGuard = () => {
  if (!('Translator' in self)) {
    return (
      <p className="status status-warning">
        Translator API is not supported in this browser. Requires Chrome 138+.
      </p>
    );
  }
  return <TranslatorTask />;
};

export default TranslatorTaskGuard;
