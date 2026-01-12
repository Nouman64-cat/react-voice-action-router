# Examples

This page shows practical examples of using React Voice Action Router in real applications.

## Basic Navigation Example

This example shows how to add voice-controlled navigation to a React Router application.

```tsx
import {
  VoiceControlProvider,
  createOpenAIAdapter,
  useVoiceCommand,
  useVoiceContext,
} from "react-voice-action-router";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

// Create the adapter
const adapter = createOpenAIAdapter({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
});

// Navigation component that registers voice commands
function NavigationWithVoice() {
  const navigate = useNavigate();

  useVoiceCommand({
    id: "go_home",
    description: "Navigate to the home page",
    phrase: "go home",
    action: () => navigate("/"),
  });

  useVoiceCommand({
    id: "go_about",
    description: "Navigate to the about page",
    phrase: "about us",
    action: () => navigate("/about"),
  });

  useVoiceCommand({
    id: "go_contact",
    description: "Navigate to the contact page",
    phrase: "contact",
    action: () => navigate("/contact"),
  });

  return (
    <nav>
      <a href="/">Home</a>
      <a href="/about">About</a>
      <a href="/contact">Contact</a>
    </nav>
  );
}

// Voice input button
function VoiceInputButton() {
  const { processTranscript, isProcessing } = useVoiceContext();

  const handleClick = () => {
    // Using Web Speech API for speech recognition
    const recognition = new webkitSpeechRecognition();
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      processTranscript(transcript);
    };
    recognition.start();
  };

  return (
    <button onClick={handleClick} disabled={isProcessing}>
      {isProcessing ? "Processing..." : "Start Voice"}
    </button>
  );
}

// Main app component
function App() {
  return (
    <BrowserRouter>
      <VoiceControlProvider adapter={adapter}>
        <NavigationWithVoice />
        <VoiceInputButton />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </VoiceControlProvider>
    </BrowserRouter>
  );
}
```

## Theme Toggle Example

This example shows how to control application settings with voice commands.

```tsx
import { useVoiceCommand } from "react-voice-action-router";
import { useState } from "react";

function ThemeController() {
  const [theme, setTheme] = useState("light");

  useVoiceCommand({
    id: "enable_dark_mode",
    description: "Enable dark mode or dark theme",
    phrase: "dark mode",
    action: () => setTheme("dark"),
  });

  useVoiceCommand({
    id: "enable_light_mode",
    description: "Enable light mode or light theme",
    phrase: "light mode",
    action: () => setTheme("light"),
  });

  useVoiceCommand({
    id: "toggle_theme",
    description: "Toggle between light and dark theme",
    phrase: "toggle theme",
    action: () => setTheme((prev) => (prev === "light" ? "dark" : "light")),
  });

  return (
    <div data-theme={theme}>
      <p>Current theme: {theme}</p>
    </div>
  );
}
```

## Dynamic Commands Example

Commands can be registered dynamically based on component state or data.

```tsx
import { useVoiceCommand } from "react-voice-action-router";

function PlaylistPlayer({ playlist }) {
  const [currentSong, setCurrentSong] = useState(0);

  // Register commands for each song in the playlist
  playlist.forEach((song, index) => {
    useVoiceCommand({
      id: `play_song_${index}`,
      description: `Play the song called ${song.title} by ${song.artist}`,
      action: () => setCurrentSong(index),
    });
  });

  // Playback control commands
  useVoiceCommand({
    id: "next_song",
    description: "Play the next song in the playlist",
    phrase: "next song",
    action: () =>
      setCurrentSong((prev) => Math.min(prev + 1, playlist.length - 1)),
  });

  useVoiceCommand({
    id: "previous_song",
    description: "Play the previous song in the playlist",
    phrase: "previous song",
    action: () => setCurrentSong((prev) => Math.max(prev - 1, 0)),
  });

  return (
    <div>
      <h2>Now Playing: {playlist[currentSong].title}</h2>
      <p>Artist: {playlist[currentSong].artist}</p>
    </div>
  );
}
```

## Form Actions Example

Use voice commands to interact with forms.

```tsx
import { useVoiceCommand } from "react-voice-action-router";
import { useRef } from "react";

function ContactForm() {
  const formRef = useRef(null);
  const nameInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const messageInputRef = useRef(null);

  useVoiceCommand({
    id: "focus_name",
    description: "Focus on the name input field",
    phrase: "name field",
    action: () => nameInputRef.current?.focus(),
  });

  useVoiceCommand({
    id: "focus_email",
    description: "Focus on the email input field",
    phrase: "email field",
    action: () => emailInputRef.current?.focus(),
  });

  useVoiceCommand({
    id: "focus_message",
    description: "Focus on the message text area",
    phrase: "message field",
    action: () => messageInputRef.current?.focus(),
  });

  useVoiceCommand({
    id: "submit_form",
    description: "Submit the contact form",
    phrase: "submit form",
    action: () => formRef.current?.submit(),
  });

  useVoiceCommand({
    id: "clear_form",
    description: "Clear all form fields",
    phrase: "clear form",
    action: () => formRef.current?.reset(),
  });

  return (
    <form ref={formRef}>
      <input ref={nameInputRef} type="text" placeholder="Name" />
      <input ref={emailInputRef} type="email" placeholder="Email" />
      <textarea ref={messageInputRef} placeholder="Message" />
      <button type="submit">Send</button>
    </form>
  );
}
```

## Debug Panel Example

Create a debug panel to visualize registered commands.

```tsx
import { useVoiceContext } from "react-voice-action-router";

function VoiceDebugPanel() {
  const { activeCommands, isProcessing, lastTranscript } = useVoiceContext();

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        padding: 16,
        background: "white",
        border: "1px solid #ccc",
        borderRadius: 8,
        maxWidth: 300,
      }}
    >
      <h3>Voice Debug Panel</h3>

      <p>
        <strong>Status:</strong> {isProcessing ? "Processing..." : "Ready"}
      </p>

      <p>
        <strong>Last Input:</strong> {lastTranscript || "None"}
      </p>

      <div>
        <strong>Registered Commands ({activeCommands.length}):</strong>
        <ul>
          {activeCommands.map((cmd) => (
            <li key={cmd.id}>
              <code>{cmd.id}</code>
              {cmd.phrase && <span> - "{cmd.phrase}"</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

## Transfer Control (Dictation Mode)

This example demonstrates how to use setPaused to temporarily stop the router. This is useful when you have a specific input field (like a search bar or chat input) that needs to consume raw text without triggering voice commands.

```tsx
import { useVoiceContext } from "react-voice-action-router";
import { useState } from "react";

function DictationInput() {
  const { setPaused } = useVoiceContext();
  const [inputText, setInputText] = useState("");
  const [isDictating, setIsDictating] = useState(false);

  const startDictation = () => {
    // 1. Pause the global router so "Clear" or "Submit" commands don't fire
    setPaused(true);
    setIsDictating(true);

    // (Simulated Dictation Logic)
    // In a real app, you would start your SpeechRecognition here
    console.log("Dictation started...");
  };

  const stopDictation = () => {
    // 2. Resume the global router
    setPaused(false);
    setIsDictating(false);
    console.log("Dictation stopped.");
  };

  return (
    <div style={{ padding: 20, border: "1px solid #ccc" }}>
      <h3>Search with Dictation</h3>
      <input
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Hold mic to dictate..."
      />
      <button
        onMouseDown={startDictation}
        onMouseUp={stopDictation}
        style={{
          backgroundColor: isDictating ? "red" : "gray",
          color: "white",
        }}
      >
        🎤 {isDictating ? "Listening (Raw)..." : "Hold to Dictate"}
      </button>
      <p style={{ fontSize: "0.8rem", color: "#666" }}>
        While holding the button, voice commands are disabled.
      </p>
    </div>
  );
}
```

## Using with Web Speech API

A complete example integrating the Web Speech API for speech recognition.

```tsx
import { useVoiceContext } from "react-voice-action-router";
import { useState, useCallback } from "react";

function WebSpeechIntegration() {
  const { processTranscript, isProcessing } = useVoiceContext();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  const startListening = useCallback(() => {
    // Check for browser support
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("");
    };

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const result = event.results[current];
      const text = result[0].transcript;

      setTranscript(text);

      // Process final results
      if (result.isFinal) {
        processTranscript(text);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [processTranscript]);

  return (
    <div>
      <button onClick={startListening} disabled={isListening || isProcessing}>
        {isListening
          ? "Listening..."
          : isProcessing
          ? "Processing..."
          : "Start Voice Input"}
      </button>

      {transcript && <p>You said: "{transcript}"</p>}
    </div>
  );
}
```

## Page-Specific Commands

Commands automatically unregister when their component unmounts, making it easy to have page-specific commands.

```tsx
// HomePage.tsx
function HomePage() {
  useVoiceCommand({
    id: "view_featured",
    description: "View featured products on the home page",
    action: () => scrollToSection("featured"),
  });

  useVoiceCommand({
    id: "view_deals",
    description: "View today deals section",
    action: () => scrollToSection("deals"),
  });

  return (
    <div>
      <section id="featured">Featured Products</section>
      <section id="deals">Today Deals</section>
    </div>
  );
}

// ProductPage.tsx
function ProductPage({ product }) {
  useVoiceCommand({
    id: "add_to_cart",
    description: "Add this product to the shopping cart",
    phrase: "add to cart",
    action: () => addToCart(product.id),
  });

  useVoiceCommand({
    id: "view_reviews",
    description: "Scroll to view product reviews",
    phrase: "show reviews",
    action: () => scrollToSection("reviews"),
  });

  return (
    <div>
      <h1>{product.name}</h1>
      <section id="reviews">Reviews</section>
    </div>
  );
}
```

## Dictation Mode (Typewriter)

Version 2.0 introduces a first-class Dictation Mode. This allows you to capture raw text input (like for a search bar or chat input) without triggering commands.

```tsx
import { useVoiceContext } from "react-voice-action-router";
import { useState } from "react";

function VoiceSearchBar() {
  const { startDictation, stopDictation, isDictating } = useVoiceContext();
  const [query, setQuery] = useState("");

  const handleMicClick = () => {
    if (isDictating) {
      stopDictation();
      return;
    }

    startDictation({
      // Show text as the user speaks
      onInterim: (text) => setQuery(text),

      // Commit text when they finish a sentence
      onFinal: (text) => {
        setQuery(text);
        // Optional: Auto-submit here
      },

      // If the user says "Search", exit dictation and run the 'search' command
      exitCommands: ["search", "cancel"],
    });
  };

  return (
    <div className="search-bar">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type or speak..."
      />
      <button
        onClick={handleMicClick}
        style={{ background: isDictating ? "red" : "blue" }}
      >
        {isDictating ? "🛑 Stop" : "🎤 Dictate"}
      </button>
    </div>
  );
}
```
