// Shared UI primitives and types used across all demo tabs.
// Status: discriminated union for idle/loading/error states, rendered by StatusMessage.
// ChatMessages: auto-scrolling message list with markdown rendering and suggestion buttons.
// ChatInput: text input with send/stop controls, auto-focuses after streaming ends.

import { useRef, useEffect, useLayoutEffect } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowUp, Square } from 'lucide-react';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ResultItem {
  label: string;
  score: number;
  color?: string;
}

export type Status =
  | { type: 'idle' }
  | { type: 'loading'; message: string }
  | { type: 'error'; message: string };

export const IDLE: Status = { type: 'idle' };

const ProcessingDots = () => (
  <span className="processing-dots">
    <span className="processing-dot" />
    <span className="processing-dot" />
    <span className="processing-dot" />
  </span>
);

export const StatusMessage = ({ status }: { status: Status }) => {
  if (status.type === 'idle') return null;
  return (
    <p className="status">
      {status.type === 'loading' && (
        <ProcessingDots />
      )}
      {status.message}
    </p>
  );
};

export const ResultBars = ({
  items,
  labelClassName,
}: {
  items: ResultItem[];
  labelClassName?: string;
}) => {
  return (
    <div className="results">
      {items.map((item) => (
        <div key={item.label} className="result-bar">
          <span className={`result-label ${labelClassName ?? ''}`}>
            {item.label}
          </span>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{
                width: `${(item.score * 100).toFixed(1)}%`,
                background: item.color ?? 'var(--accent)',
              }}
            />
          </div>
          <span className="result-score">{(item.score * 100).toFixed(1)}%</span>
        </div>
      ))}
    </div>
  );
};

export const ChatMessages = ({
  messages,
  streaming,
  suggestions,
  onSuggestionClick,
}: {
  messages: Message[];
  streaming: boolean;
  suggestions?: string[];
  onSuggestionClick?: (question: string) => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const visible = messages.filter((m) => m.role !== 'system');

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  return (
    <div className="chat-messages" ref={containerRef}>
      {visible.length === 0 && (
        <p className="chat-empty">
          Ask about the 2026 MacBook lineup — compare models, specs, and
          prices.
        </p>
      )}
      {visible.map((m, i) => (
        <div key={i} className={`chat-msg chat-msg-${m.role}`}>
          <strong>{m.role === 'user' ? 'You' : 'AI'}:</strong>{' '}
          {!m.content && streaming && i === visible.length - 1 ? (
            <ProcessingDots />
          ) : m.role === 'assistant' ? (
            <Markdown remarkPlugins={[remarkGfm]}>{m.content}</Markdown>
          ) : (
            m.content
          )}
        </div>
      ))}
      {suggestions && onSuggestionClick && !streaming && visible.length === 0 && (
        <div className="chat-suggestions">
          {suggestions.map((q) => (
            <button
              key={q}
              className="chat-suggestion"
              onClick={() => onSuggestionClick(q)}
            >
              {q}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const DataAccordion = ({
  label,
  data,
}: {
  label: string;
  data: unknown;
}) => {
  return (
    <details className="data-accordion">
      <summary className="data-accordion-summary">
        <span className="data-accordion-badge">system context</span>
        {label}
      </summary>
      <pre className="data-accordion-content">
        {JSON.stringify(data, null, 2)}
      </pre>
    </details>
  );
};

export const ChatInput = ({
  input,
  streaming,
  onInputChange,
  onSend,
  onStop,
}: {
  input: string;
  streaming: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onStop?: () => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!streaming) inputRef.current?.focus();
  }, [streaming]);

  return (
    <div className="chat-input-row">
      <div className="chat-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSend()}
          placeholder={
            streaming ? 'Waiting for response...' : 'Type a message...'
          }
          disabled={streaming}
        />
        {streaming && onStop ? (
          <button
            className="chat-input-btn chat-stop-btn"
            onClick={onStop}
            aria-label="Stop"
          >
            <Square size={12} fill="currentColor" />
          </button>
        ) : (
          <button
            className="chat-input-btn"
            onClick={() => onSend()}
            disabled={streaming || !input.trim()}
            aria-label="Send"
          >
            <ArrowUp size={14} />
          </button>
        )}
      </div>
    </div>
  );
};
