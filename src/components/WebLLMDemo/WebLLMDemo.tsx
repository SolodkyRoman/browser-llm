import { useState, useEffect, useEffectEvent } from 'react';
import { hasModelInCache } from '@mlc-ai/web-llm';
import { RotateCcw, Settings } from 'lucide-react';
import { ChatMessages, ChatInput, StatusMessage } from '../shared';
import { useController, type TokenUsage } from './useController';
import { SettingsOverlay } from './SettingsOverlay';
import { ModelSelect } from './ModelSelect';
import { MODELS, DEFAULT_MODEL, type ModelOption } from './const';
import { SUGGESTIONS } from '../../systemPrompt';

const TokenUsageBar = ({
  usage,
  onReset,
  disabled,
}: {
  usage: TokenUsage;
  onReset: () => void;
  disabled: boolean;
}) => {
  const pct = Math.min(100, (usage.used / usage.limit) * 100);
  return (
    <div className="token-usage-row">
      <div className="token-usage">
        <div
          className={`token-usage-bar${pct >= 80 ? ' token-usage-high' : ''}`}
          style={{ width: `${pct}%` }}
        />
        <span className="token-usage-label">
          {usage.used.toLocaleString()} / {usage.limit.toLocaleString()} tokens
        </span>
      </div>
      <button
        className="token-usage-reset"
        onClick={onReset}
        disabled={disabled}
        aria-label="Reset chat"
      >
        <RotateCcw size={13} />
      </button>
    </div>
  );
};

const WebLLMChat = ({
  model,
  models,
  onModelChange,
  settingsOpen,
  onCloseSettings,
  onStreamingChange,
}: {
  model: ModelOption;
  models: readonly ModelOption[];
  onModelChange: (model: ModelOption) => void;
  settingsOpen: boolean;
  onCloseSettings: () => void;
  onStreamingChange: (streaming: boolean) => void;
}) => {
  const {
    messages,
    input,
    streaming,
    status,
    modelLoaded,
    onInputChange,
    onSend,
    onStop,
    onReset,
    settings,
    tokenUsage,
  } = useController(model);

  const notifyStreamingChange = useEffectEvent(onStreamingChange);
  useEffect(() => {
    notifyStreamingChange(streaming);
  }, [streaming]);

  return (
    <>
      {!modelLoaded ? (
        <StatusMessage status={status} />
      ) : (
        <>
          {settingsOpen && (
            <SettingsOverlay
              settings={settings}
              models={models}
              onModelChange={onModelChange}
              onClose={onCloseSettings}
            />
          )}
          <ChatMessages
            messages={messages}
            streaming={streaming}
            suggestions={SUGGESTIONS}
            onSuggestionClick={onSend}
          />
          <ChatInput
            input={input}
            streaming={streaming}
            onInputChange={onInputChange}
            onSend={onSend}
            onStop={onStop}
          />
          <StatusMessage status={status} />
          {tokenUsage && (
            <TokenUsageBar
              usage={tokenUsage}
              onReset={onReset}
              disabled={streaming}
            />
          )}
        </>
      )}
    </>
  );
};

const WebLLMDemo = () => {
  const [selectedModel, setSelectedModel] =
    useState<ModelOption>(DEFAULT_MODEL);
  const [gate, setGate] = useState<'checking' | 'disclaimer' | 'accepted'>(
    'checking',
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [streaming, setStreaming] = useState(false);

  useEffect(() => {
    setGate('checking');
    hasModelInCache(selectedModel.id)
      .then((cached) => setGate(cached ? 'accepted' : 'disclaimer'))
      .catch(() => setGate('disclaimer'));
  }, [selectedModel]);

  return (
    <div className="demo-section demo-section-chat">
      <div className="demo-header-row">
        <h2>WebLLM</h2>
        <div className="demo-header-controls">
          <ModelSelect
            value={selectedModel}
            models={MODELS}
            onChange={setSelectedModel}
            disabled={streaming}
          />
          {gate === 'accepted' && (
            <button
              className="gear-btn"
              onClick={() => setSettingsOpen((v) => !v)}
              aria-label="Settings"
              disabled={streaming}
            >
              Advanced
              <Settings size={14} />
            </button>
          )}
        </div>
      </div>
      <p className="demo-description">
        Chat powered by <code>{selectedModel.label}</code> running in your
        browser via WebGPU. Requires Chrome 113+ or Edge 113+. The model has
        context about the 2026 MacBook lineup — try asking it to compare models
        or recommend one.
      </p>

      {gate === 'disclaimer' && (
        <div className="status">
          This model requires a one-time download of {selectedModel.size}. It
          will be cached in your browser for future visits.
          <button onClick={() => setGate('accepted')}>Load Model</button>
        </div>
      )}

      {gate === 'accepted' && (
        <WebLLMChat
          key={selectedModel.id}
          model={selectedModel}
          models={MODELS}
          onModelChange={setSelectedModel}
          settingsOpen={settingsOpen}
          onCloseSettings={() => setSettingsOpen(false)}
          onStreamingChange={setStreaming}
        />
      )}
    </div>
  );
};

export default WebLLMDemo;
