# How It Works

This page explains the internal architecture and design decisions behind React Voice Action Router.

## Overview

React Voice Action Router is built on three core concepts:

1. A centralized command registry
2. A two-phase matching algorithm
3. An adapter pattern for AI providers

## The Command Registry

At the heart of the library is a command registry managed by the VoiceControlProvider. This registry is a Map data structure that stores all currently registered voice commands.

### How Registration Works

When you use the useVoiceCommand hook, the following happens:

1. The hook calls the register function from the VoiceContext
2. The command is added to the internal Map using its ID as the key
3. The state is updated to reflect the new list of active commands
4. When the component unmounts, the cleanup function calls unregister to remove the command

This design ensures:

- Commands are automatically cleaned up when components unmount
- There are no duplicate command IDs (later registrations overwrite earlier ones)
- Command lookups are fast with O(1) time complexity

### The Proxy Pattern

The useVoiceCommand hook uses a clever proxy pattern to handle action updates:

```tsx
// The hook keeps a ref to the latest command
const commandRef = useRef(command);

// The registered command calls through the ref
const proxyCommand = {
  id: command.id,
  description: command.description,
  action: () => commandRef.current.action(),
};
```

This means if your action function changes due to state updates, you do not need to re-register the command. The proxy always calls the latest version of the action.

## Two-Phase Matching

When a voice transcript is processed, the router uses a two-phase matching algorithm:

### Phase 1: Exact Match

The first phase looks for an exact match between the transcript and registered phrases:

```
User says: "go home"
Registered phrases: ["go home", "open settings", "toggle theme"]
Result: Exact match found for "go home" -> Command executes immediately
```

This phase has zero latency because it does not require any API calls. If your users know the exact phrases, they get instant response.

### Phase 2: AI Fuzzy Match

If no exact match is found, the transcript is sent to the AI adapter:

```
User says: "take me to the homepage"
No exact match found
AI analyzes: "take me to the homepage" against all command descriptions
AI returns: { commandId: "go_home" }
Command executes
```

This phase handles natural language variations and understands intent even when the exact words differ.

## The Adapter Pattern

The library uses an adapter pattern to support multiple AI providers without changing your application code.

### What is an Adapter

An adapter is a function with this signature:

```tsx
type LLMAdapter = (
  transcript: string,
  commands: Array<{ id: string; description: string; phrase?: string }>
) => Promise<{ commandId: string | null }>;
```

Every adapter receives:

- The user's spoken transcript
- A list of available commands (without the action functions for security)

Every adapter returns:

- An object with the matching command ID or null

### Why This Design

This design has several benefits:

1. **Provider Independence** - Switch from OpenAI to Gemini by changing one line of code
2. **Security** - Action functions are never sent to the AI
3. **Testability** - Create mock adapters for testing without API calls
4. **Extensibility** - Support any AI provider including local models

## Context-Aware Commands

One of the key features is that commands are context-aware. The AI only sees commands that are currently registered, which typically means commands from components currently visible on the screen.

### How This Reduces Costs

Consider an application with 50 total voice commands spread across 10 pages. Without context awareness, every voice input would send all 50 commands to the AI, using more tokens and increasing costs.

With React Voice Action Router:

- Page A has 5 commands registered
- User speaks on Page A
- Only 5 commands are sent to the AI
- Token usage is reduced by 90%

### How This Reduces Hallucinations

AI models can sometimes match a transcript to an unrelated command. With fewer commands in the prompt:

- The AI has less choices to pick from
- The AI is less likely to match to irrelevant commands
- The user experience is more predictable

## The Prompt Engineering

Each adapter uses a carefully crafted prompt to guide the AI. Here is the core prompt structure:

```
You are a precise Voice Command Router.
Your goal is to map the user's spoken input to the correct Command ID.

RULES:
1. Analyze the user's input and find the intent.
2. Match it to the command with the most relevant description.
3. Use fuzzy matching (e.g., "Dark mode" matches "Toggle Theme").
4. If NO command matches the intent, return null.
5. Output ONLY valid JSON.

AVAILABLE COMMANDS:
- ID: "nav_home" | Description: "Navigate to the home page"
- ID: "toggle_theme" | Description: "Toggle between light and dark mode"

RESPONSE FORMAT:
{ "commandId": "string_id_or_null" }
```

This prompt:

- Clearly defines the task
- Sets expectations for fuzzy matching
- Enforces JSON-only output
- Lists available commands with descriptions

## Transfer Control & Pausing

In complex voice applications, there are times when you need to capture raw speech without triggering commands (e.g., dictating an email or searching for a song title).

The library provides a **Gatekeeper Mechanism** via the `setPaused()` control.

1. **Paused State**: When `isPaused` is set to `true`, the `processTranscript` function acts as a dead end. It logs the input but **does not** proceed to matching (neither Exact nor Fuzzy).

2. **Resumed State**: When set back to `false`, normal routing resumes immediately.

This allows you to "borrow" the microphone for other purposes without unmounting the provider.

## Performance Considerations

### Exact Match First

By checking exact matches before calling the AI, the library minimizes latency for known phrases. If users learn the exact phrases, they get sub-millisecond response times.

### Minimal Payload

The library only sends essential data to the AI:

- The transcript
- Command IDs and descriptions
- Action functions are never sent

This reduces payload size and protects your code.

### No Re-Registration on Render

Thanks to the proxy pattern, commands do not re-register on every render. The useVoiceCommand hook only registers once when the component mounts and unregisters once when it unmounts.

## Headless Design Philosophy

React Voice Action Router is intentionally headless, meaning it provides no UI components. This design choice gives you complete control over:

- How voice input is captured (Web Speech API, Deepgram, Whisper, etc.)
- How to display processing states
- Whether to show any UI at all (voice can be completely invisible)
- The look and feel of any voice indicators

The library handles the complex logic of command registration, routing, and AI matching. You handle everything else.
