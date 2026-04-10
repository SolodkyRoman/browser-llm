type AIAvailability = 'unavailable' | 'available' | 'downloadable' | 'downloading';

interface AIDownloadProgressEvent extends Event {
  loaded: number;
  total: number;
}

interface AIMonitor extends EventTarget {
  addEventListener(
    type: 'downloadprogress',
    listener: (event: AIDownloadProgressEvent) => void,
  ): void;
}

interface SummarizerCreateOptions {
  type?: 'key-points' | 'tldr' | 'teaser' | 'headline';
  format?: 'markdown' | 'plain-text';
  length?: 'short' | 'medium' | 'long';
  sharedContext?: string;
  monitor?: (monitor: AIMonitor) => void;
}

interface SummarizerSummarizeOptions {
  context?: string;
}

declare class Summarizer {
  static availability(
    options?: Omit<SummarizerCreateOptions, 'monitor'>,
  ): Promise<AIAvailability>;
  static create(options?: SummarizerCreateOptions): Promise<Summarizer>;
  summarize(
    text: string,
    options?: SummarizerSummarizeOptions,
  ): Promise<string>;
  summarizeStreaming(
    text: string,
    options?: SummarizerSummarizeOptions,
  ): ReadableStream<string>;
}

interface TranslatorCreateOptions {
  sourceLanguage: string;
  targetLanguage: string;
  monitor?: (monitor: AIMonitor) => void;
}

declare class Translator {
  static availability(
    options?: Omit<TranslatorCreateOptions, 'monitor'>,
  ): Promise<AIAvailability>;
  static create(options: TranslatorCreateOptions): Promise<Translator>;
  translate(text: string): Promise<string>;
  translateStreaming(text: string): ReadableStream<string>;
}
