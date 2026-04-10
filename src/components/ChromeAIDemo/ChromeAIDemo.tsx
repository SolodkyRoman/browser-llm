import { useState } from 'react';
import SummarizerTask from './SummarizerTask';
import TranslatorTask from './TranslatorTask';

type TaskId = 'summarizer' | 'translator';

const TASKS = [
  { id: 'summarizer', label: 'Summarizer' },
  { id: 'translator', label: 'Translator' },
] as const;

const DESCRIPTIONS: Record<TaskId, string> = {
  summarizer:
    'Condense long text into key points, a TL;DR, a teaser, or a headline. Powered by Gemini Nano running on-device.',
  translator:
    "Translate text between languages using Chrome's built-in translation model. No cloud calls — everything stays on your device.",
};

const ChromeAIDemo = () => {
  const [taskId, setTaskId] = useState<TaskId>('summarizer');

  return (
    <div className="demo-section">
      <div className="demo-header-row">
        <h2>Chrome AI</h2>
        <div className="demo-header-controls">
          <select
            value={taskId}
            onChange={(e) => setTaskId(e.target.value as TaskId)}
          >
            {TASKS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="demo-description">{DESCRIPTIONS[taskId]}</p>

      {taskId === 'summarizer' && <SummarizerTask />}
      {taskId === 'translator' && <TranslatorTask />}
    </div>
  );
};

export default ChromeAIDemo;
