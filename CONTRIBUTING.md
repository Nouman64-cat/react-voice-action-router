# Contributing to react-voice-action-router

First off, thanks for taking the time to contribute!

We are building the standard for **headless voice control** in React. Our goal is speed, minimal bundle size, and total AI flexibility through an adapter pattern.

This document will guide you through setting up your development environment and understanding the project structure.

---

## Project Structure

This project is a monorepo (managed by npm/yarn workspaces or similar) to allow testing the core package against example apps.

The core package source sits in `packages/core/src` (or just `src` depending on final setup):

* `src/components`: Contains the `VoiceActionProvider` (the main Context).
* `src/hooks`: Contains the developer-facing hook `useVoiceCommand`.
* `src/core`: The internal logic engine.
    * `registry.ts`: Manages active commands and subscriptions.
    * `speech.ts`: Wraps the native browser Web Speech API.
    * `router.ts`: The decision logic (Exact Match vs. Adapter routing).
* `src/adapters`: Built-in connectors for popular LLMs (e.g., OpenAI).
* `src/types`: Shared TypeScript interface definitions.

---

## Getting Started

### Prerequisites
* Node.js (LTS version recommended)
* npm or yarn

### Setup Steps

1.  **Fork** the repository on GitHub.
2.  **Clone** your fork locally:
    ```bash
    git clone [https://github.com/your-username/react-voice-action-router.git](https://github.com/your-username/react-voice-action-router.git)
    cd react-voice-action-router
    ```
3.  **Install Dependencies**:
    ```bash
    npm install
    # or if using yarn
    yarn install
    ```
4.  **Start Development Mode** (This usually runs the build watcher and an example app):
    ```bash
    npm run dev
    ```

---

## Development Workflow

### 1. Working on Core Logic
If you are modifying the registry or speech recognition engine, ensure you understand the **Context-Aware** lifecycle. Commands must automatically register on mount and unregister on unmount to prevent memory leaks and LLM context bloating.

### 2. Adding a New Adapter
This is the most common contribution. If you want to add support for a new AI provider (e.g., Gemini, DeepSeek):

1.  Create a new file in `src/adapters/` (e.g., `google-gemini.ts`).
2.  Your adapter **must** adhere to the `LLMAdapter` type signature defined in `src/types/index.ts`.
    ```typescript
    // It must accept a transcript and a list of commands, and return a Promise<commandId | null>
    type LLMAdapter = (transcript: string, commands: CommandMeta[]) => Promise<{ commandId: string | null }>;
    ```
3.  **Important:** Do not hardcode API keys. Your adapter should be a factory function that accepts configuration (like an API key) and returns the executable adapter function.

### 3. Testing & Linting
We prioritize stability. Please ensure all checks pass before submitting.

```bash
# Run unit tests (Jest/Vitest)
npm run test

# Check TypeScript types
npm run typecheck

# Check coding style
npm run lint