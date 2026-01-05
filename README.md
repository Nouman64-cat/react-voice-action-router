# react-voice-action-router 🎙️

> **Don't build a chatbot. Build a hands-free interface.**

[![npm version](https://img.shields.io/npm/v/react-voice-action-router.svg?style=flat-square)](https://www.npmjs.com/package/react-voice-action-router)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

A headless, latency-first voice intent router for React applications. It bridges natural language speech to your existing React functions using an **LLM-Agnostic Adapter Pattern**.

* **Headless & Zero UI:** We provide the logic hooks; you build the interface (or keep it invisible).
* **Context-Aware:** The AI only knows about commands on the *current* screen, reducing costs and hallucinations.
* **Universal Adapter:** Works with OpenAI, Anthropic, local Llama models (Ollama), or your own secure backend.
* **Latency-First:** Supports instant execution for exact phrases, falling back to AI for fuzzy intents.

---

## Installation

```bash
npm install react-voice-action-router
# Note: React 16.8+ is required for Hooks support.