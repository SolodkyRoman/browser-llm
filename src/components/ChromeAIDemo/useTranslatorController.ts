// Manages the Chrome AI Translator lifecycle: checks language pair availability before
// creating an instance, downloads language packs on demand, and caches per source-target pair.

import { useState } from 'react';
import type { Status } from '../shared';
import { IDLE } from '../shared';
import { useCachedInstance } from './useCachedInstance';
import { createDownloadMonitor } from './utils';

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'it', label: 'Italian' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'uk', label: 'Ukrainian' },
  { code: 'zh', label: 'Chinese' },
] as const;

export const useTranslatorController = () => {
  const [text, setText] = useState('The browser was never designed to be a machine learning runtime, but here we are.');
  const [result, setResult] = useState<string | null>(null);
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [status, setStatus] = useState<Status>(IDLE);
  const cache = useCachedInstance<Translator>();

  const translate = async () => {
    if (!text.trim()) return;

    setStatus({ type: 'loading', message: 'Translating...' });
    setResult(null);

    try {
      let instance = cache.resolve(`${sourceLanguage}-${targetLanguage}`);

      if (!instance) {
        const avail = await Translator.availability({
          sourceLanguage,
          targetLanguage,
        });
        if (avail === 'unavailable') {
          const src = LANGUAGES.find((l) => l.code === sourceLanguage)?.label;
          const tgt = LANGUAGES.find((l) => l.code === targetLanguage)?.label;
          setStatus({
            type: 'error',
            message: `${src} → ${tgt} is not supported. Try translating from English.`,
          });
          return;
        }

        setStatus({ type: 'loading', message: 'Loading language pack...' });
        instance = await Translator.create({
          sourceLanguage,
          targetLanguage,
          monitor: createDownloadMonitor(setStatus, 'language pack'),
        });
        cache.set(instance);
      }

      setStatus({ type: 'loading', message: 'Translating...' });
      const translated = await instance.translate(text);
      setResult(translated);
      setStatus(IDLE);
    } catch (err) {
      setStatus({
        type: 'error',
        message: err instanceof Error ? err.message : String(err),
      });
    }
  };

  return {
    text,
    result,
    sourceLanguage,
    targetLanguage,
    status,
    onTextChange: setText,
    onSourceChange: setSourceLanguage,
    onTargetChange: setTargetLanguage,
    onTranslate: translate,
  };
};
