// Web Worker for running Transformers.js pipelines off the main thread.
// Receives load/run commands via postMessage, caches loaded models by name,
// and reports progress, results, or errors back to the host.

import { pipeline, type PipelineType, type ProgressInfo } from '@huggingface/transformers';

type Dtype = 'auto' | 'q8' | 'fp32' | 'fp16' | 'int8' | 'uint8' | 'q4' | 'bnb4' | 'q4f16';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cache = new Map<string, (...args: any[]) => any>();

interface WorkerRequest {
  id: number;
  action: 'load' | 'run';
  task: PipelineType;
  model: string;
  dtype?: Dtype;
  args?: unknown[];
}

type WorkerResponse =
  | { id: number; type: 'progress'; message: string }
  | { id: number; type: 'result'; data: unknown }
  | { id: number; type: 'error'; message: string };

function post(msg: WorkerResponse) {
  self.postMessage(msg);
}

async function loadModel(id: number, task: PipelineType, model: string, dtype?: Dtype) {
  if (cache.has(model)) return cache.get(model)!;

  post({ id, type: 'progress', message: 'Initializing model...' });
  const instance = await pipeline(task, model, {
    ...(dtype ? { dtype } : {}),
    progress_callback: (info: ProgressInfo) => {
      if (info.status === 'progress') {
        post({
          id,
          type: 'progress',
          message:
            info.progress < 100
              ? `Downloading model... ${Math.round(info.progress)}%`
              : 'Initializing model...',
        });
      }
    },
  });
  cache.set(model, instance);
  return instance;
}

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const { id, action, task, model, dtype, args } = e.data;

  try {
    const pipe = await loadModel(id, task, model, dtype);

    if (action === 'load') {
      post({ id, type: 'result', data: null });
      return;
    }

    post({ id, type: 'progress', message: 'Processing...' });
    const result = await pipe(...(args ?? []));
    post({ id, type: 'result', data: result });
  } catch (err) {
    post({
      id,
      type: 'error',
      message: err instanceof Error ? err.message : String(err),
    });
  }
};
