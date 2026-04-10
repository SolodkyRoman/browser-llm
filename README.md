# Browser AI Playground

A React demo app for running AI models directly in the browser — no backend required. Companion project for the article *"Running AI Models on Your Frontend"*.

Four approaches, side by side:

- **Transformers.js** — sentiment analysis, zero-shot classification, summarization via Web Workers
- **WebLLM** — full LLM chat (Llama, Mistral, Qwen) in the browser using WebGPU
- **Chrome Built-in AI** — Summarizer and Translator APIs powered by Gemini Nano (Chromium 138+)
- **Ollama** — connect to a local Ollama server with model auto-discovery

## Prerequisites

- Node.js 18+
- [pnpm](https://pnpm.io/)
- A WebGPU-capable browser (Chrome/Edge 113+) for WebLLM

## Getting Started

```bash
pnpm install
pnpm dev
```

The app runs at `http://localhost:5173` by default.

## Ollama Setup

To use the Ollama tab, you need [Ollama](https://ollama.com) running locally.

1. Install Ollama from [ollama.com](https://ollama.com)
2. Pull a model:
   ```bash
   ollama pull llama3.2
   ```
3. Start the server (if not already running):
   ```bash
   ollama serve
   ```

The app connects to `http://localhost:11434` by default. To use a different URL, create a `.env` file:

```
VITE_OLLAMA_URL=http://localhost:11434
```
