export {
  VoiceControlProvider,
  useVoiceContext,
} from "./components/VoiceContext";
export { useVoiceCommand } from "./hooks/useVoiceCommand";
export type { VoiceCommand, VoiceControlState, LLMAdapter } from "./types";
export * from "./adapters/openai";
