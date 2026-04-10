import type { ModelOption } from './const';

export const ModelSelect = ({
  value,
  models,
  onChange,
  disabled,
}: {
  value: ModelOption;
  models: readonly ModelOption[];
  onChange: (model: ModelOption) => void;
  disabled?: boolean;
}) => (
  <select
    value={value.id}
    disabled={disabled}
    onChange={(e) => {
      const model = models.find((m) => m.id === e.target.value);
      if (model) onChange(model);
    }}
  >
    {models.map((m) => (
      <option key={m.id} value={m.id}>
        {m.label} ({m.size})
      </option>
    ))}
  </select>
);
