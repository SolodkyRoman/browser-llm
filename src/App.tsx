import { lazy, Suspense } from 'react';
import {
  Routes,
  Route,
  NavLink,
  Navigate,
  useLocation,
} from 'react-router-dom';
import './App.css';

const TransformersDemo = lazy(() => import('./components/TransformersDemo'));
const WebLLMDemo = lazy(() => import('./components/WebLLMDemo'));
const OllamaDemo = lazy(() => import('./components/OllamaDemo'));
const ChromeAIDemo = lazy(() => import('./components/ChromeAIDemo'));

const tabs = [
  { id: 'transformers', label: 'Transformers.js', tag: 'Pipeline · WASM' },
  { id: 'webllm', label: 'WebLLM', tag: 'Chat · WebGPU' },
  { id: 'ollama', label: 'Ollama', tag: 'Chat · Server' },
  { id: 'chromeai', label: 'Chrome AI', tag: 'Native · Built-in' },
] as const;

const App = () => {
  const location = useLocation();
  const activeTab = location.pathname.slice(1) || 'transformers';

  return (
    <div className="app" data-tab={activeTab}>
      <div className="app-glow" />
      <header>
        <p className="eyebrow">Browser AI Playground</p>
        <h1>
          Run AI Models with <span className="highlight">JavaScript</span>
        </h1>
      </header>

      <nav className="tabs">
        {tabs.map((tab) => (
          <NavLink
            key={tab.id}
            to={`/${tab.id}`}
            className={({ isActive }) => `tab ${isActive ? 'tab-active' : ''}`}
          >
            <span className="tab-label">{tab.label}</span>
            <span className="tab-tag">{tab.tag}</span>
          </NavLink>
        ))}
      </nav>

      <main className="demo-card">
        <Suspense fallback={<div className="status">Loading…</div>}>
          <Routes>
            <Route path="/transformers" element={<TransformersDemo />} />
            <Route path="/webllm" element={<WebLLMDemo />} />
            <Route path="/ollama" element={<OllamaDemo />} />
            <Route path="/chromeai" element={<ChromeAIDemo />} />
            <Route path="*" element={<Navigate to="/transformers" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
};

export default App;
