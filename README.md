# React Voice Action Router

> **Don't just build a chatbot. Build a complete hands-free interface.**

[![npm version](https://img.shields.io/npm/v/react-voice-action-router.svg?style=flat-square)](https://www.npmjs.com/package/react-voice-action-router)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

[**Read the Documentation**](https://nouman64-cat.github.io/react-voice-action-router/)

A full-stack voice control library for React. It combines a robust **Speech Recognition Engine** with an **AI-Powered Intent Router** to give your app voice capabilities in minutes, not days.

## What's New in v2.0?

- **Built-in Speech Engine:** No more manual `SpeechRecognition` setup. It just works.
- **Dictation Mode:** Seamlessly switch between executing commands and typing text.
- **Offline Fallback:** Core commands work even if your AI API goes down.
- **Auto-Healing:** Automatically restarts the microphone if the browser stops it.

---

## Features

- **Headless & Zero UI:** We provide the logic; you build the interface (or keep it invisible).
- **Context-Aware:** The AI only knows about commands on the _current_ screen, reducing costs and hallucinations.
- **Universal Adapter:** Works with OpenAI, Anthropic, Gemini, local LLMs (Ollama), or any custom backend.
- **Latency-First:** Instant execution for exact phrases, falling back to AI for natural language understanding.

---

## Installation

```bash
npm install react-voice-action-router
```
