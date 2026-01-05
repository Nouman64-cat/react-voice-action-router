export {
  VoiceControlProvider,
  useVoiceContext,
} from "./components/VoiceContext";
export { useVoiceCommand } from "./hooks/useVoiceCommand";
export type { VoiceCommand, VoiceControlState, LLMAdapter } from "./types";

// Adapters exports
export * from "./adapters/openai";
export * from "./adapters/gemini";
export * from "./adapters/claude";
