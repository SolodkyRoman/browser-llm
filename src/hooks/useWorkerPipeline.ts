// Manages a singleton Web Worker for Transformers.js inference.
// Uses ID-based message tracking to resolve promises across the postMessage boundary.
// Models are cached in the worker after first load; `loadedModels` tracks this on the main thread.

import { useState, useEffect } from 'react';
import type { PipelineType } from '@huggingface/transformers';
import { type Status, IDLE } from '../components/shared';

type WorkerResponse =
  | { id: number; type: 'progress'; message: string }
  | { id: number; type: 'result'; data: unknown }
  | { id: number; type: 'error'; message: string };

let worker: Worker | null = null;
let nextId = 0;

const getWorker = () => {
  if (!worker) {
    worker = new Worker(
      new URL('../workers/transformers.worker.ts', import.meta.url),
      { type: 'module' },
    );
  }
  return worker;
};

type Pending = {
  resolve: (data: unknown) => void;
  reject: (err: Error) => void;
  onProgress: (message: string) => void;
};

const pending = new Map<number, Pending>();

let listenerInitialized = false;

const ensureListener = () => {
  if (listenerInitialized) return;
  listenerInitialized = true;
  const w = getWorker();
  w.onmessage = (e: MessageEvent<WorkerResponse>) => {
    const { id, type } = e.data;
    const entry = pending.get(id);
    if (!entry) return;

    if (type === 'progress') {
      entry.onProgress(e.data.message);
    } else if (type === 'result') {
      pending.delete(id);
      entry.resolve(e.data.data);
    } else if (type === 'error') {
      pending.delete(id);
      entry.reject(new Error(e.data.message));
    }
  };
};

// Track which models have been loaded in this session
const loadedModels = new Set<string>();

export const useWorkerPipeline = <T = unknown>(task: PipelineType, model: string, dtype?: string) => {
  const [status, setStatus] = useState<Status>(IDLE);
  const [modelReady, setModelReady] = useState(loadedModels.has(model));

  useEffect(() => {
    ensureListener();
  }, []);

  const run = (...args: unknown[]): Promise<T> => {
    return new Promise((resolve, reject) => {
      const id = nextId++;
      const w = getWorker();

      pending.set(id, {
        resolve: (data) => {
          if (!loadedModels.has(model)) {
            loadedModels.add(model);
            setModelReady(true);
          }
          setStatus(IDLE);
          resolve(data as T);
        },
        reject: (err) => {
          setStatus({ type: 'error', message: err.message });
          reject(err);
        },
        onProgress: (message) => {
          setStatus({ type: 'loading', message });
        },
      });

      w.postMessage({ id, action: 'run', task, model, dtype, args });
    });
  };

  return { run, status, modelReady };
};
