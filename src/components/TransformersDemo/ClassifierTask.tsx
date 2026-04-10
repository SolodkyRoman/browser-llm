import { StatusMessage, ResultBars } from '../shared';
import { useClassifierController } from './useClassifierController';
import './ClassifierTask.css';

export const ClassifierTask = () => {
  const {
    text,
    tags,
    tagInput,
    results,
    status,
    onTextChange,
    onTagInputChange,
    onAddTag,
    onRemoveTag,
    onKeyDown,
  } = useClassifierController();

  return (
    <>
      <div className="tag-input-row">
        <input
          type="text"
          value={tagInput}
          onChange={(e) => onTagInputChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Add a label…"
        />
        <button onClick={onAddTag} disabled={!tagInput.trim()}>
          Add
        </button>
      </div>

      <div className="tag-list">
        {tags.map((label, i) => (
          <span key={label} className="tag-chip">
            {label}
            <button className="tag-remove" onClick={() => onRemoveTag(i)}>
              &times;
            </button>
          </span>
        ))}
      </div>

      <div className="textarea-wrap">
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          rows={3}
          placeholder="Type text to classify…"
        />
      </div>

      <StatusMessage status={status} />

      {results && (
        <ResultBars items={results} labelClassName="classifier-label" />
      )}
    </>
  );
};
