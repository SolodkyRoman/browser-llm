import { useState } from 'react';
import { SentimentTask } from './SentimentTask';
import { ClassifierTask } from './ClassifierTask';
import { SummaryTask } from './SummaryTask';

const TASKS = [
  {
    id: 'sentiment',
    label: 'Sentiment Analysis',
    model: 'distilbert-sst2',
    size: '~25MB',
  },
  {
    id: 'classifier',
    label: 'Zero-Shot Classifier',
    model: 'nli-deberta-v3',
    size: '~30MB',
  },
  {
    id: 'summary',
    label: 'Summarization',
    model: 'distilbart-cnn-12-6',
    size: '~600MB',
  },
] as const;

type TaskId = (typeof TASKS)[number]['id'];

const DESCRIPTIONS: Record<TaskId, string> = {
  sentiment:
    'Analyze the emotional tone of text. Results update live as you type.',
  classifier:
    'Classify text into any categories you define — no training needed.',
  summary:
    'Condense long text into a short summary. Pre-filled with the MacBook lineup data.',
};

const TransformersDemo = () => {
  const [taskId, setTaskId] = useState<TaskId>('sentiment');
  const task = TASKS.find((t) => t.id === taskId)!;

  return (
    <div className="demo-section">
      <div className="demo-header-row">
        <h2>Transformers.js</h2>
        <div className="demo-header-controls">
          <select
            value={taskId}
            onChange={(e) => setTaskId(e.target.value as TaskId)}
          >
            {TASKS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label} ({t.size})
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="demo-description">
        {DESCRIPTIONS[taskId]} Running entirely in your browser via WebAssembly.{' '}
        <br />
        Model: <code>{task.model}</code> ({task.size})
      </p>

      {taskId === 'sentiment' && <SentimentTask />}
      {taskId === 'classifier' && <ClassifierTask />}
      {taskId === 'summary' && <SummaryTask />}
    </div>
  );
};

export default TransformersDemo;
