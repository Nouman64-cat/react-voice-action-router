# AI Adapters

React Voice Action Router uses an adapter pattern to support multiple AI providers. An adapter is a function that takes a voice transcript and a list of available commands, then returns the ID of the best matching command.

This design allows you to switch between AI providers without changing your application code.

## Built-in Adapters

The library includes three built-in adapters:

- OpenAI (recommended for most use cases)
- Google Gemini (good balance of speed and cost)
- Anthropic Claude (excellent at understanding context)

## OpenAI Adapter

The OpenAI adapter uses the Chat Completions API with JSON mode for reliable parsing.

### Configuration

```tsx
import { createOpenAIAdapter } from "react-voice-action-router";

const adapter = createOpenAIAdapter({
  apiKey: "your-openai-api-key",
  model: "gpt-4o-mini", // optional, defaults to gpt-4o-mini
});
```

### Configuration Options

| Option | Required | Default     | Description                          |
| ------ | -------- | ----------- | ------------------------------------ |
| apiKey | Yes      | None        | Your OpenAI API key                  |
| model  | No       | gpt-4o-mini | The model to use for intent matching |

### Recommended Models

- **gpt-4o-mini** - Fast, affordable, and accurate for most use cases
- **gpt-4o** - More capable but slower and more expensive
- **gpt-3.5-turbo** - Fastest and cheapest option

## Google Gemini Adapter

The Gemini adapter uses the Google Generative AI API.

### Configuration

```tsx
import { createGeminiAdapter } from "react-voice-action-router";

const adapter = createGeminiAdapter({
  apiKey: "your-gemini-api-key",
  model: "gemini-1.5-flash", // optional, defaults to gemini-1.5-flash
});
```

### Configuration Options

| Option            | Required | Default          | Description                             |
| ----------------- | -------- | ---------------- | --------------------------------------- |
| apiKey            | Yes      | None             | Your Google AI API key                  |
| model             | No       | gemini-1.5-flash | The model to use for intent matching    |
| systemInstruction | No       | None             | Custom system instruction for the model |

### Recommended Models

- **gemini-1.5-flash** - Fast and cost-effective for voice command routing
- **gemini-1.5-pro** - More capable but slower

### Getting a Gemini API Key

1. Visit the Google AI Studio at ai.google.dev
2. Sign in with your Google account
3. Create a new API key in the API keys section

## Anthropic Claude Adapter

The Claude adapter uses the Anthropic Messages API.

### Configuration

```tsx
import { createClaudeAdapter } from "react-voice-action-router";

const adapter = createClaudeAdapter({
  apiKey: "your-anthropic-api-key",
  model: "claude-3-5-sonnet-20240620", // optional
  endpoint: "https://api.anthropic.com/v1/messages", // optional
});
```

### Configuration Options

| Option   | Required | Default                    | Description                       |
| -------- | -------- | -------------------------- | --------------------------------- |
| apiKey   | Yes      | None                       | Your Anthropic API key            |
| model    | No       | claude-3-5-sonnet-20240620 | The model to use                  |
| endpoint | No       | Anthropic API URL          | Custom endpoint for proxy servers |

### CORS Considerations

Calling the Anthropic API directly from a browser may encounter CORS (Cross-Origin Resource Sharing) restrictions. If you experience CORS errors:

1. Use a backend proxy to forward requests to the Anthropic API
2. Set the endpoint option to point to your proxy server

```tsx
const adapter = createClaudeAdapter({
  apiKey: "your-api-key",
  endpoint: "https://your-backend.com/api/claude-proxy",
});
```

### Recommended Models

- **claude-3-5-sonnet-20240620** - Best balance of speed and capability
- **claude-3-haiku-20240307** - Fastest and most affordable

## Creating a Custom Adapter

You can create custom adapters for any AI provider. An adapter must match the LLMAdapter type signature:

```tsx
import type { LLMAdapter } from "react-voice-action-router";

const customAdapter: LLMAdapter = async (transcript, commands) => {
  // commands is an array of objects with id, description, and optional phrase
  // Each command looks like: { id: 'nav_home', description: 'Navigate home', phrase: 'go home' }

  // Your logic to determine the best matching command
  // This could call a local model, a custom API, or use rule-based matching

  // Return the matching command ID or null if no match
  return { commandId: "nav_home" };
};
```

### Adapter Type Definition

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

### Example: Local Rule-Based Adapter

Here is an example of a simple adapter that uses keyword matching instead of AI:

```tsx
const keywordAdapter: LLMAdapter = async (transcript, commands) => {
  const lowerTranscript = transcript.toLowerCase();

  for (const command of commands) {
    // Check if any word from the description appears in the transcript
    const keywords = command.description.toLowerCase().split(" ");
    const hasMatch = keywords.some(
      (word) => word.length > 3 && lowerTranscript.includes(word)
    );

    if (hasMatch) {
      return { commandId: command.id };
    }
  }

  return { commandId: null };
};
```

## Best Practices

### Secure Your API Keys

Never expose API keys in client-side code. Use environment variables or a backend service:

```tsx
// Instead of hardcoding:
const adapter = createOpenAIAdapter({
  apiKey: "sk-abc123...", // Never do this
});

// Use environment variables:
const adapter = createOpenAIAdapter({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
});

// Or better, proxy through your backend:
const adapter = createOpenAIAdapter({
  apiKey: "your-key",
  // Use your backend endpoint
});
```

### Choose the Right Model

For voice command routing, you typically do not need the most powerful model. The task is relatively simple: match a transcript to one of a small set of commands.

Recommended approach:

1. Start with the fastest and cheapest option (gpt-4o-mini, gemini-1.5-flash, or claude-3-haiku)
2. Only upgrade if you experience matching issues

### Handle Errors Gracefully

All adapters can fail due to network issues or API errors. Always handle the case where no command is matched:

```tsx
const { processTranscript } = useVoiceContext();

try {
  await processTranscript(transcript);
} catch (error) {
  console.error("Voice processing failed:", error);
  // Show user-friendly error message
}
```
