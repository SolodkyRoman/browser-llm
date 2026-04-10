import macbooks from './macbooks.json';
import type { Message } from './components/shared';


export const DEFAULT_SYSTEM_PROMPT = `You are a friendly MacBook buying advisor. Always respond in natural conversational language, not code or JSON. STRICT RULES:
- ONLY use the data provided below. Do NOT add, invent, or infer any information not explicitly present.
- Do NOT mention features, specs, or details that are not in the data (e.g. no Touch Bar, no Face ID, no features you "know" from training).
- If something is not listed in the data, say "not listed" instead of guessing.
- When listing models, describe them in plain English with their key specs and price.
- Be concise and helpful.`;

export const macbookData = JSON.stringify(macbooks, null, 2);
export const buildSystemMessage = (prompt: string, data: string): Message => ({
  role: 'system',
  content: `${prompt}\n\nData:\n${data}`,
});

export const SUGGESTIONS = [
  'Compare MacBook Air and MacBook Pro',
  'Which MacBook is best for students?',
  'Show me all models under $2000',
  "M5 Pro vs M5 Max — what's the difference?",
];
