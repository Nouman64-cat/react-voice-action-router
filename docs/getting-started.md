# Getting Started

This guide will help you install and set up React Voice Action Router in your React application.

## Installation

Install the package using npm or yarn:

```bash
npm install react-voice-action-router
```

or

```bash
yarn add react-voice-action-router
```

## Requirements

Before you begin, make sure you have:

- React version 18 or higher
- An API key from one of the supported AI providers (OpenAI, Google Gemini, or Anthropic Claude)

## Basic Setup

Setting up React Voice Action Router involves three simple steps:

1. Create an AI adapter with your API key
2. Wrap your application with the VoiceControlProvider
3. Register voice commands in your components

### Step 1: Create an AI Adapter

First, import and configure an adapter for your preferred AI provider. Here is an example using OpenAI:

```tsx
import { createOpenAIAdapter } from "react-voice-action-router";

const voiceAdapter = createOpenAIAdapter({
  apiKey: "your-openai-api-key",
  model: "gpt-4o-mini", // Optional - defaults to gpt-4o-mini
});
```

The model option lets you choose which OpenAI model to use for intent matching. The default is gpt-4o-mini which provides a good balance of speed and accuracy. You can also use gpt-4o for more complex matching or gpt-3.5-turbo for faster responses.

You can also use Google Gemini or Anthropic Claude. See the [Adapters](/adapters) page for details on each provider.

### Step 2: Add the VoiceControlProvider

Wrap your application or a section of your application with the VoiceControlProvider. Pass your adapter as a prop:

```tsx
import { VoiceControlProvider } from "react-voice-action-router";

function App() {
  return (
    <VoiceControlProvider adapter={voiceAdapter}>
      <YourAppContent />
    </VoiceControlProvider>
  );
}
```

The provider creates a context that manages all registered voice commands. Any component inside this provider can register and respond to voice commands.

### Step 3: Register Voice Commands

Use the useVoiceCommand hook to register voice commands in your components:

```tsx
import { useVoiceCommand } from "react-voice-action-router";
import { useNavigate } from "react-router-dom";

function NavigationComponent() {
  const navigate = useNavigate();

  useVoiceCommand({
    id: "navigate_home",
    description: "Navigate to the home page",
    phrase: "go home",
    action: () => navigate("/"),
  });

  useVoiceCommand({
    id: "navigate_settings",
    description: "Navigate to the settings page",
    phrase: "open settings",
    action: () => navigate("/settings"),
  });

  return <nav>Your navigation content here</nav>;
}
```

## Understanding Voice Commands

Each voice command has four properties:

| Property    | Required | Description                                                                                        |
| ----------- | -------- | -------------------------------------------------------------------------------------------------- |
| id          | Yes      | A unique identifier for the command. Use descriptive names like "navigate_home" or "toggle_theme". |
| description | Yes      | A natural language description that helps the AI understand what this command does.                |
| phrase      | No       | An exact phrase for instant matching without AI processing.                                        |
| action      | Yes      | The function to execute when the command is matched.                                               |

## How Commands Are Matched

React Voice Action Router uses a two-phase matching system:

**Phase 1 - Exact Match (Zero Latency)**

When a user speaks, the system first checks if the transcript exactly matches any registered phrase. If there is an exact match, the action executes immediately without calling the AI.

**Phase 2 - AI Fuzzy Match**

If there is no exact match, the transcript is sent to your AI adapter along with all registered commands. The AI analyzes the user intent and returns the best matching command ID.

## Processing Voice Input (v2.0)

In version 2.0, you no longer need to implement the Web Speech API manually. The `VoiceControlProvider` automatically initializes a continuous speech recognition engine.

You can control the microphone using the `useVoiceContext` hook:

```tsx
import { useVoiceContext } from "react-voice-action-router";

function VoiceControls() {
  const { isListening, startListening, stopListening, error } = useVoiceContext();

  if (error) return <p>Error: {error}</p>;

  return (
    <button onClick={isListening ? stopListening : startListening}>
      {isListening ? "🛑 Stop Listening" : "🎤 Start Listening"}
    </button>
  );
}

The library is headless and does not include speech recognition. You can use any speech-to-text solution like the Web Speech API, Deepgram, or AssemblyAI to capture voice input.

## Next Steps

Now that you have the basics set up, explore these topics:

- [Adapters](/adapters) - Learn about different AI providers and how to configure them
- [API Reference](/api-reference) - Complete documentation of all exports
- [Examples](/examples) - See real-world usage patterns
```
