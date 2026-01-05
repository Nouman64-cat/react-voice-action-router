import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// Import the Factory you exported in Option B
import { VoiceControlProvider, createOpenAIAdapter } from 'react-voice-action-router'

// --- 2. The Real Adapter ---
const aiAdapter = createOpenAIAdapter({
  apiKey: import.meta.env.VITE_OPENAI_KEY, // Reads from .env file
  model: "gpt-4o-mini"
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <VoiceControlProvider adapter={aiAdapter}>
      <App />
    </VoiceControlProvider>
  </StrictMode>,
)