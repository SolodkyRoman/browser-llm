// Creates a Chrome AI download monitor callback that reports progress via Status updates.
// Used by Summarizer and Translator when Chrome needs to fetch the model or language pack.

import type { Status } from '../shared';

export const createDownloadMonitor = (
  setStatus: (status: Status) => void,
  label: string,
) => {
  return (m: AIMonitor) => {
    m.addEventListener('downloadprogress', (e) => {
      const pct = Math.round(e.loaded * 100);
      setStatus({
        type: 'loading',
        message: pct < 100 ? `Downloading ${label}... ${pct}%` : `Loading ${label}...`,
      });
    });
  };
};
