import { useState, useEffect, useRef, useCallback } from 'react';
import { useVoiceCommand, useVoiceContext } from 'react-voice-action-router';
import './App.css';

function App() {
  const [count, setCount] = useState(0);
  const { processTranscript, isProcessing, lastTranscript } = useVoiceContext();

  const [isListening, setIsListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [permissionError, setPermissionError] = useState(false);
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(isListening);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // --- COMMANDS ---
  useVoiceCommand({
    id: 'increment',
    description: 'Add one to the counter',
    phrase: 'Count Up',
    action: () => setCount(c => c + 1)
  });

  useVoiceCommand({
    id: 'decrement',
    description: 'Decrease the counter by one',
    action: () => setCount(c => c - 1)
  });

  // --- STABLE LISTENING ENGINE ---

  // 1. Define the start function outside useEffect to avoid stale closures
  const startRecognition = useCallback(() => {
    const recognition = recognitionRef.current;
    if (recognition) {
      try {
        recognition.start();
      } catch (e) {
        // It's already started, ignore
      }
    }
  }, []);

  useEffect(() => {
    // 2. Initialize once
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true; // CHANGED: Enable interim results
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      // Iterate through results starting from the current index
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        const text = finalTranscript.trim();
        console.log("🎤 Final:", text);
        processTranscript(text);
      }

      setInterim(interimTranscript);
    };

    recognition.onerror = (event: any) => {
      // 'no-speech' is common and harmless in continuous mode
      if (event.error !== 'no-speech') {
        console.warn("Speech recognition error:", event.error);
      }

      // STOP if permission is denied, otherwise it loops infinitely
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setIsListening(false);
        isListeningRef.current = false; // Immediate update for onend check
        setPermissionError(true);
      }
    };

    // 3. Prevent rapid-fire restarts
    recognition.onend = () => {
      // Check the REF, not the state directly, to avoid stale closures
      if (isListeningRef.current) {
        // Wait 300ms before restarting to prevent CPU loops
        setTimeout(() => {
          // Double check ref in case it changed during the timeout
          if (isListeningRef.current) {
            console.log("🔄 Restarting listener...");
            try { recognition.start(); } catch (e) { }
          }
        }, 300);
      }
    };

    recognitionRef.current = recognition;

    // Cleanup
    return () => {
      recognition.onend = null; // Kill the restart loop
      recognition.stop();
    };
  }, [processTranscript]); // Only run on mount (and if processTranscript changes)


  // 4. Control Logic: Start/Stop based on state
  useEffect(() => {
    if (isListening) {
      startRecognition();
    } else {
      if (recognitionRef.current) recognitionRef.current.stop();
    }
  }, [isListening, startRecognition]);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'system-ui' }}>
      <h1>Continuous Voice Control</h1>

      <div style={{ fontSize: '6rem', fontWeight: 'bold', margin: '20px' }}>
        {count}
      </div>

      <div style={{ marginBottom: '30px' }}>
        <button
          onClick={() => setIsListening(prev => !prev)}
          style={{
            padding: '20px 40px',
            fontSize: '1.2rem',
            backgroundColor: isListening ? '#ff4444' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            cursor: 'pointer',
            boxShadow: isListening ? '0 0 20px rgba(255, 68, 68, 0.6)' : 'none',
            animation: isListening ? 'pulse 1.5s infinite' : 'none'
          }}
        >
          {isListening ? '🛑 Stop Listening' : '🎙️ Start Listening'}
        </button>
      </div>

      <div style={{ color: '#666', fontSize: '0.9rem' }}>
        <p><strong>Status:</strong> {isListening ? "Listening..." : "Paused"} {isProcessing && "| 🧠 Processing..."}</p>
        <p><strong>Last Command:</strong> "{lastTranscript || "..."}"</p>
        {interim && (
          <p style={{ color: '#aaa', fontStyle: 'italic' }}>
            Heard so far: "{interim}"
          </p>
        )}
      </div>

      {permissionError && (
        <div style={{
          marginTop: '20px',
          padding: '15px 20px',
          background: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '8px',
          maxWidth: '400px',
          margin: '20px auto',
          color: '#856404'
        }}>
          <strong>Microphone Blocked</strong>
          <p style={{ margin: '10px 0 0 0', fontSize: '0.85rem' }}>
            Please allow microphone access in your browser. Click the lock/info icon in the address bar and set Microphone to "Allow", then reload the page.
          </p>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(255, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 15px rgba(255, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 68, 68, 0); }
        }
      `}</style>
    </div>
  );
}

export default App;