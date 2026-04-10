export interface ModelOption {
  id: string;
  label: string;
  size: string;
  contextWindow: number;
}

export const MODELS: ModelOption[] = [
  { id: 'Llama-3.2-1B-Instruct-q4f16_1-MLC', label: 'Llama 3.2 1B', size: '~700MB', contextWindow: 4096 },
  { id: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC', label: 'Qwen 2.5 1.5B', size: '~880MB', contextWindow: 4096 },
  { id: 'Gemma-2-2b-it-q4f16_1-MLC', label: 'Gemma 2 2B', size: '~1.3GB', contextWindow: 4096 },
  { id: 'Llama-3.2-3B-Instruct-q4f16_1-MLC', label: 'Llama 3.2 3B', size: '~1.4GB', contextWindow: 4096 },
  { id: 'Qwen2.5-3B-Instruct-q4f16_1-MLC', label: 'Qwen 2.5 3B', size: '~1.6GB', contextWindow: 4096 },
  { id: 'Phi-3.5-mini-instruct-q4f16_1-MLC', label: 'Phi 3.5 Mini 3.8B', size: '~2.2GB', contextWindow: 4096 },
  { id: 'Qwen2.5-7B-Instruct-q4f16_1-MLC', label: 'Qwen 2.5 7B', size: '~4.0GB', contextWindow: 4096 },
  { id: 'Llama-3.1-8B-Instruct-q4f16_1-MLC', label: 'Llama 3.1 8B', size: '~4.3GB', contextWindow: 4096 },
];

export const DEFAULT_MODEL = MODELS.find(m => m.id === 'Qwen2.5-3B-Instruct-q4f16_1-MLC') ?? MODELS[0];
