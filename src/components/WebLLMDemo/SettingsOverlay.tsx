import { SettingsOverlay as BaseSettingsOverlay } from '../SettingsOverlay';
import { ModelSelect } from './ModelSelect';
import type { useSettings } from '../../hooks/useSettings';
import type { ModelOption } from './const';

export const SettingsOverlay = ({
  settings,
  models,
  onModelChange,
  onClose,
}: {
  settings: ReturnType<typeof useSettings<ModelOption>>;
  models: readonly ModelOption[];
  onModelChange: (model: ModelOption) => void;
  onClose: () => void;
}) => (
  <BaseSettingsOverlay
    settings={settings}
    onClose={onClose}
    onApply={() => onModelChange(settings.model)}
  >
    <label className="gen-settings-row">
      <span className="gen-settings-label">Model</span>
      <ModelSelect value={settings.model} models={models} onChange={settings.updateModel} />
    </label>
  </BaseSettingsOverlay>
);
