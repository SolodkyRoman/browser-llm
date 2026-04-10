import { useState, useEffectEvent } from 'react';
import type { KeyboardEvent } from 'react';
import type { ResultItem } from '../shared';
import { useClassifier } from './useClassifier';
import { useDebouncedEffect } from '../../hooks/useDebouncedEffect';

const DEFAULT_TAGS = [
  'technology',
  'sports',
  'politics',
  'entertainment',
  'science',
];

export const useClassifierController = () => {
  const { classify, status } = useClassifier();
  const [text, setText] = useState(
    'Large language models can now run directly in the browser using WebGPU and WebAssembly, eliminating the need for server infrastructure and keeping user data entirely on-device.',
  );
  const [tags, setTags] = useState(DEFAULT_TAGS);
  const [tagInput, setTagInput] = useState('');
  const [results, setResults] = useState<ResultItem[] | null>(null);

  const handleClassify = useEffectEvent(async () => {
    if (!text.trim() || tags.length === 0) {
      setResults(null);
      return;
    }
    try {
      setResults(await classify(text, tags));
    } catch {
      setResults(null);
    }
  });

  useDebouncedEffect(handleClassify, [text, tags], 500, true);

  const onAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (!tag) return;

    if (tags.some((l) => l.toLowerCase() === tag)) {
      setTagInput('');
      return;
    }

    setTags((prev) => [...prev, tag]);
    setTagInput('');
  };

  const onRemoveTag = (index: number) => {
    setTags((prev) => prev.filter((_, i) => i !== index));
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAddTag();
    }
  };

  return {
    text,
    tags,
    tagInput,
    results,
    status,
    onTextChange: setText,
    onTagInputChange: setTagInput,
    onAddTag,
    onRemoveTag,
    onKeyDown,
  };
};
