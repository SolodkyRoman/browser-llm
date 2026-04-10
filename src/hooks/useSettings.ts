// Two-state settings hook: `values` (dirty/staged) vs `applied` (last saved).
// Tracks a `dirty` flag via JSON comparison. Supports an optional model-specific
// value that follows the same dirty/apply/revert lifecycle.

import { useState } from 'react';
import { DEFAULT_SYSTEM_PROMPT, macbookData } from '../systemPrompt';

export interface Settings {
  maxTokens: number;
  temperature: number;
  systemPrompt: string;
  contextData: string;
}

/** The subset of useSettings return that SettingsOverlay needs (generic-agnostic). */
export interface SettingsControls {
  values: Settings;
  update: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  dirty: boolean;
  apply: () => void;
  revert: () => void;
}

export const DEFAULTS: Settings = {
  maxTokens: 512,
  temperature: 0,
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  contextData: macbookData,
};

export const useSettings = <M = undefined>(
  onApply?: (settings: Settings) => void,
  modelConfig?: { initial: M },
) => {
  const [values, setValues] = useState<Settings>({ ...DEFAULTS });
  const [applied, setApplied] = useState<Settings>({ ...DEFAULTS });
  const [modelValue, setModelValue] = useState<M | undefined>(modelConfig?.initial);
  const [appliedModel, setAppliedModel] = useState<M | undefined>(modelConfig?.initial);

  const modelDirty = modelConfig !== undefined && !Object.is(modelValue, appliedModel);
  const dirty = JSON.stringify(values) !== JSON.stringify(applied) || modelDirty;

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const apply = () => {
    setApplied({ ...values });
    if (modelConfig) setAppliedModel(modelValue);
    onApply?.(values);
  };

  const revert = () => {
    setValues({ ...applied });
    if (modelConfig) setModelValue(appliedModel);
  };

  const resetModel = (m: M) => {
    setModelValue(m);
    setAppliedModel(m);
  };

  return {
    values,
    update,
    dirty,
    apply,
    revert,
    model: modelValue as M,
    updateModel: setModelValue as (m: M) => void,
    resetModel,
  };
};
