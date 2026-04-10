import type { ReactNode } from 'react';
import { X, CircleHelp, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
} from '@floating-ui/react';
import type { SettingsControls } from '../hooks/useSettings';

const InfoTooltip = ({ text }: { text: string }) => {
  const [open, setOpen] = useState(false);
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: 'bottom-start',
    middleware: [offset(6), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });
  const hover = useHover(context, { move: false });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ]);

  return (
    <>
      <span
        className="gen-settings-info"
        ref={refs.setReference}
        {...getReferenceProps()}
      >
        <CircleHelp size={12} />
      </span>
      {open && (
        <FloatingPortal>
          <div
            className="gen-settings-info-popup"
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
          >
            {text}
          </div>
        </FloatingPortal>
      )}
    </>
  );
};

export const SettingsOverlay = ({
  settings,
  onClose,
  onApply,
  children,
}: {
  settings: SettingsControls;
  onClose: () => void;
  onApply?: () => void;
  children?: ReactNode;
}) => {
  const handleClose = () => {
    settings.revert();
    onClose();
  };

  const handleApply = () => {
    settings.apply();
    onApply?.();
    onClose();
  };

  return (
    <div className="settings-overlay">
      <div className="settings-overlay-header">
        <h3>Advanced settings</h3>
        <button
          className="settings-overlay-close"
          onClick={handleClose}
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>
      <div className="settings-overlay-body">
        {children}
        <div className="gen-settings-sliders">
          <label className="gen-settings-row">
            <span className="gen-settings-label">
              Max tokens
              <InfoTooltip text="The maximum number of tokens that can be generated in the chat completion. The total length of input tokens and generated tokens is limited by the model's context length." />
              <span className="gen-settings-value">
                {settings.values.maxTokens}
              </span>
            </span>
            <input
              type="range"
              min={128}
              max={4096}
              step={128}
              value={settings.values.maxTokens}
              onChange={(e) =>
                settings.update('maxTokens', Number(e.target.value))
              }
            />
          </label>
          <label className="gen-settings-row">
            <span className="gen-settings-label">
              Temperature
              <InfoTooltip text="What sampling temperature to use, between 0 and 2. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic." />
              <span className="gen-settings-value">
                {settings.values.temperature.toFixed(1)}
              </span>
            </span>
            <input
              type="range"
              min={0}
              max={2}
              step={0.1}
              value={settings.values.temperature}
              onChange={(e) =>
                settings.update('temperature', Number(e.target.value))
              }
            />
          </label>
        </div>
        <label className="gen-settings-row">
          <span className="gen-settings-label">
            System prompt
            <InfoTooltip text="Instructions that define how the model behaves. The context data below is appended automatically." />
          </span>
          <textarea
            className="gen-settings-textarea"
            value={settings.values.systemPrompt}
            onChange={(e) => settings.update('systemPrompt', e.target.value)}
            rows={4}
          />
        </label>
        <details className="gen-settings-data-accordion">
          <summary className="gen-settings-label" style={{ cursor: 'pointer' }}>
            <ChevronRight size={14} className="accordion-chevron" />
            Context data (JSON)
            <InfoTooltip text="The data the model uses to answer questions. Edit this to change what the model knows about." />
          </summary>
          <textarea
            className="gen-settings-textarea gen-settings-textarea-data"
            value={settings.values.contextData}
            onChange={(e) => settings.update('contextData', e.target.value)}
            rows={10}
          />
        </details>
      </div>
      <div className="settings-overlay-footer">
        <button
          className="gen-settings-apply"
          disabled={!settings.dirty}
          onClick={handleApply}
        >
          Apply &amp; reset chat
        </button>
        <button className="gen-settings-cancel" onClick={handleClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};
