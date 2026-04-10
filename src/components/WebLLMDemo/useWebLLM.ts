// Manages a global singleton WebLLM engine (one engine per page, shared across remounts).
// Loads the model on idle callback, with detailed error categorization for WebGPU,
// memory, and GPU compatibility issues.

import { useState, useRef, useEffect, useEffectEvent } from 'react';
import {
  type MLCEngine,
  hasModelInCache,
  CreateMLCEngine,
} from '@mlc-ai/web-llm';
import type { ModelOption } from './const';
import { type Status, IDLE } from '../shared';

let currentEngine: MLCEngine | null = null;
let currentModelId: string | null = null;

export const useWebLLM = (model: ModelOption) => {
  const alreadyLoaded = currentEngine !== null && currentModelId === model.id;
  const [modelStatus, setModelStatus] = useState<Status>(
    alreadyLoaded ? IDLE : { type: 'loading', message: 'Initializing...' },
  );
  const [modelLoaded, setModelLoaded] = useState(alreadyLoaded);
  const engineRef = useRef<MLCEngine | null>(
    currentModelId === model.id ? currentEngine : null,
  );

  const loadModel = useEffectEvent(async () => {
    if (currentEngine && currentModelId === model.id) {
      engineRef.current = currentEngine;
      setModelLoaded(true);
      return;
    }

    setModelStatus({ type: 'loading', message: 'Checking WebGPU support...' });

    try {
      const modelCached = await hasModelInCache(model.id).catch(() => false);

      setModelStatus({
        type: 'loading',
        message: modelCached
          ? 'Initializing model from cache...'
          : `Downloading model (${model.size}). This only happens once...`,
      });

      if (currentEngine) {
        await currentEngine.reload(model.id);
      } else {
        currentEngine = await CreateMLCEngine(model.id, {
          initProgressCallback: (progress) => {
            setModelStatus({ type: 'loading', message: progress.text });
          },
        });
      }

      currentModelId = model.id;
      engineRef.current = currentEngine;
      setModelLoaded(true);
      setModelStatus(IDLE);
    } catch (err) {
      const name = err instanceof Error ? err.name : '';
      const msg = err instanceof Error ? err.message : String(err);
      let message: string;
      if (name === 'WebGPUNotAvailableError' || name === 'WebGPUNotFoundError') {
        message = 'WebGPU is not supported in this browser. Try Chrome 113+ or Edge 113+.';
      } else if (msg.includes('Unable to find a compatible GPU')) {
        message = 'No compatible GPU found. Check that your device has a GPU and WebGPU is enabled.';
      } else if (name === 'DeviceLostError' || msg.includes('Cannot initialize runtime')) {
        message = 'Not enough memory for this model. Try selecting a smaller one.';
      } else {
        message = msg;
      }
      setModelStatus({ type: 'error', message });
    }
  });

  useEffect(() => {
    const id = requestIdleCallback(() => loadModel());
    return () => cancelIdleCallback(id);
  }, []);

  const stop = useEffectEvent(() => {
    currentEngine?.interruptGenerate();
  });

  return { engineRef, modelStatus, modelLoaded, stop };
};
