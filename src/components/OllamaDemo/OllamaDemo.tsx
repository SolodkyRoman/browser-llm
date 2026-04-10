import { useState } from 'react';
import { Settings, RotateCcw } from 'lucide-react';
import {
  ChatMessages,
  ChatInput,
  StatusMessage,
} from '../shared';
import { SettingsOverlay } from '../SettingsOverlay';
import { useController } from './useController';
import { SUGGESTIONS } from '../../systemPrompt';

const OllamaDemo = () => {
  const {
    messages,
    input,
    streaming,
    status,
    model,
    availableModels,
    tokenUsage,
    settings,
    onInputChange,
    onModelChange,
    onModelApply,
    onSend,
    onReset,
  } = useController();

  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="demo-section demo-section-chat">
      <div className="demo-header-row">
        <h2>Ollama</h2>
        <div className="demo-header-controls">
          <select
            value={model}
            onChange={(e) => onModelChange(e.target.value)}
            disabled={streaming || availableModels.length === 0}
          >
            {availableModels.length === 0 && (
              <option value="">No models found</option>
            )}
            {availableModels.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <button
            className="gear-btn"
            onClick={() => setSettingsOpen((v) => !v)}
            aria-label="Settings"
            disabled={streaming}
          >
            Advanced
            <Settings size={14} />
          </button>
        </div>
      </div>
      <p className="demo-description">
        Chat powered by a local Ollama server. Requires{' '}
        <a href="https://ollama.com" target="_blank" rel="noreferrer">
          Ollama
        </a>{' '}
        running on your machine with a model pulled (e.g.{' '}
        <code>ollama pull llama3.2</code>). The model has context about the 2026
        MacBook lineup — try asking it to compare models or recommend one.
      </p>

      {settingsOpen && (
        <SettingsOverlay
          settings={settings}
          onClose={() => setSettingsOpen(false)}
          onApply={() => onModelApply(settings.model)}
        >
          <label className="gen-settings-row">
            <span className="gen-settings-label">Model</span>
            <select
              value={settings.model}
              onChange={(e) => settings.updateModel(e.target.value)}
              disabled={availableModels.length === 0}
            >
              {availableModels.length === 0 && (
                <option value="">No models found</option>
              )}
              {availableModels.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </label>
        </SettingsOverlay>
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
      />
      <StatusMessage status={status} />
      {tokenUsage && (
        <div className="token-usage-row">
          <div className="token-usage">
            <span className="token-usage-label">
              {tokenUsage.used.toLocaleString()} tokens
            </span>
          </div>
          <button
            className="token-usage-reset"
            onClick={onReset}
            disabled={streaming}
            aria-label="Reset chat"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      )}
    </div>
  );
};

export default OllamaDemo;
