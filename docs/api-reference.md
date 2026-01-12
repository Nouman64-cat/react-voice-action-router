# API Reference

This page documents all the exports from the react-voice-action-router package.

## Components

### VoiceControlProvider

The main context provider that manages voice command registration and routing.

```tsx
import { VoiceControlProvider } from "react-voice-action-router";

<VoiceControlProvider adapter={yourAdapter}>{children}</VoiceControlProvider>;
```

#### Props

| Prop                  | Type       | Default | Description                                                        |
| --------------------- | ---------- | ------- | ------------------------------------------------------------------ | --- |
| children              | ReactNode  | -       | The child components that will have access to voice control        |
| adapter               | LLMAdapter | -       | The AI adapter function for fuzzy matching                         |
| disableSpeechEngine   | boolean    | false   | (v2.0) Set to true to disable the built-in microphone logic        |
| enableOfflineFallback | boolean    | true    | (v2.0) If true, falls back to local keyword matching when AI fails |
| onStateChange         | function   | -       | Callback function called when the internal state changes           |     |

#### Example

```tsx
import {
  VoiceControlProvider,
  createOpenAIAdapter,
} from "react-voice-action-router";

const adapter = createOpenAIAdapter({ apiKey: "your-key" });

function App() {
  return (
    <VoiceControlProvider
      adapter={adapter}
      onStateChange={(state) => console.log("State changed:", state)}
    >
      <MyApp />
    </VoiceControlProvider>
  );
}
```

## Hooks

### useVoiceCommand

A hook that registers a voice command when the component mounts and unregisters it when the component unmounts.

```tsx
import { useVoiceCommand } from "react-voice-action-router";

useVoiceCommand(command);
```

#### Parameters

| Parameter | Type         | Description                      |
| --------- | ------------ | -------------------------------- |
| command   | VoiceCommand | The command configuration object |

#### VoiceCommand Object

| Property    | Type     | Required | Description                             |
| ----------- | -------- | -------- | --------------------------------------- |
| id          | string   | Yes      | Unique identifier for the command       |
| description | string   | Yes      | Natural language description for the AI |
| phrase      | string   | No       | Exact phrase for instant matching       |
| action      | function | Yes      | The function to execute when matched    |

#### Example

```tsx
import { useVoiceCommand } from "react-voice-action-router";

function SettingsButton() {
  const [theme, setTheme] = useState("light");

  useVoiceCommand({
    id: "toggle_theme",
    description: "Toggle between light and dark theme",
    phrase: "toggle theme",
    action: () => setTheme((prev) => (prev === "light" ? "dark" : "light")),
  });

  return <button>Current theme: {theme}</button>;
}
```

### useVoiceContext

A hook that provides access to the voice control context, including state and methods.

```tsx
import { useVoiceContext } from "react-voice-action-router";

const context = useVoiceContext();
```

#### Return Value

| Property       | Type           | Description                                            |
| -------------- | -------------- | ------------------------------------------------------ |
| isListening    | boolean        | Whether the microphone is currently active             |
| isProcessing   | boolean        | Whether a transcript is currently being processed      |
| isDictating    | boolean        | (v2.0) Whether the engine is in Dictation Mode         |
| lastTranscript | string or null | The most recently processed transcript                 |
| error          | string or null | Any error from the speech engine (e.g., "not-allowed") |
| startListening | function       | Manually start the microphone                          |
| stopListening  | function       | Manually stop the microphone                           |
| startDictation | function       | (v2.0) Switch to Dictation Mode (accepts options)      |
| stopDictation  | function       | (v2.0) Exit Dictation Mode                             |
| setPaused      | function       | Pause/Resume routing logic                             |

#### Example

```tsx
import { useVoiceContext } from "react-voice-action-router";

function VoiceStatus() {
  const { isProcessing, isPaused, activeCommands } = useVoiceContext();

  return (
    <div>
      <p>Status: {isProcessing ? "Processing..." : "Ready"}</p>
      <p>Router State: {isPaused ? "Paused" : "Active"}</p>
      <p>Registered commands: {activeCommands.length}</p>
    </div>
  );
}
```

## Types

### VoiceCommand

The interface for defining a voice command.

```tsx
interface VoiceCommand {
  id: string;
  description: string;
  phrase?: string;
  action: () => void;
}
```

### VoiceControlState

The interface for the internal state of the voice engine.

```tsx
interface VoiceControlState {
  isListening: boolean;
  isProcessing: boolean;
  lastTranscript: string | null;
  activeCommands: VoiceCommand[];
  /** Whether the global router is currently paused/ignoring input. */
  isPaused: boolean;
}
```

### LLMAdapter

The type signature that all AI adapters must follow.

```tsx
type LLMAdapter = (
  transcript: string,
  commands: Array<{
    id: string;
    description: string;
    phrase?: string;
  }>
) => Promise<{ commandId: string | null }>;
```

## Adapter Factory Functions

### createOpenAIAdapter

Creates an adapter for the OpenAI Chat Completions API.

```tsx
import { createOpenAIAdapter } from "react-voice-action-router";

const adapter = createOpenAIAdapter(config);
```

#### Config Options

| Option | Type   | Required | Default     | Description         |
| ------ | ------ | -------- | ----------- | ------------------- |
| apiKey | string | Yes      | None        | Your OpenAI API key |
| model  | string | No       | gpt-4o-mini | The model to use    |

### createGeminiAdapter

Creates an adapter for the Google Gemini API.

```tsx
import { createGeminiAdapter } from "react-voice-action-router";

const adapter = createGeminiAdapter(config);
```

#### Config Options

| Option            | Type   | Required | Default          | Description               |
| ----------------- | ------ | -------- | ---------------- | ------------------------- |
| apiKey            | string | Yes      | None             | Your Google AI API key    |
| model             | string | No       | gemini-1.5-flash | The model to use          |
| systemInstruction | string | No       | None             | Custom system instruction |

### createClaudeAdapter

Creates an adapter for the Anthropic Claude API.

```tsx
import { createClaudeAdapter } from "react-voice-action-router";

const adapter = createClaudeAdapter(config);
```

#### Config Options

| Option   | Type   | Required | Default                    | Description            |
| -------- | ------ | -------- | -------------------------- | ---------------------- |
| apiKey   | string | Yes      | None                       | Your Anthropic API key |
| model    | string | No       | claude-3-5-sonnet-20240620 | The model to use       |
| endpoint | string | No       | Anthropic API URL          | Custom endpoint URL    |

## Importing Types

All types can be imported directly from the package:

```tsx
import type {
  VoiceCommand,
  VoiceControlState,
  LLMAdapter,
} from "react-voice-action-router";
```

### DictationOptions (v2.0)

Configuration object passed to `startDictation()`.

```tsx
interface DictationOptions {
  /** Callback fired repeatedly while the user is speaking (interim results) */
  onInterim?: (text: string) => void;
  /** Callback fired when the user pauses or stops speaking (final result) */
  onFinal: (text: string) => void;
  /**
   * Phrases that will immediately exit dictation and trigger a command.
   * Example: ["send", "search", "cancel"]
   */
  exitCommands?: string[];
}
```
