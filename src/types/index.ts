/**
 * A voice command that can be registered by a component.
 */
export interface VoiceCommand {
    /** Unique identifier for the command (e.g., 'nav_home') */
    id: string;
    /** Natural language description for the LLM (e.g., 'Navigate to the home dashboard') */
    description: string;
    /** Optional: Exact phrase for 0-latency matching (e.g., 'Go Home') */
    phrase?: string;
    /** The function to execute when matched */
    action: () => void;
}

/**
 * The internal state of the voice engine.
 */
export interface VoiceControlState {
    isListening: boolean;
    isProcessing: boolean;
    lastTranscript: string | null;
    /** Exposed primarily for debugging/visualization */
    activeCommands: VoiceCommand[];
    isPaused: boolean;
}

/**
 * The Adapter Protocol ("The Universal Plug").
 * Any AI provider (OpenAI, Anthropic, Local) must match this signature.
 */
export type LLMAdapter = (
    transcript: string,
    // We strip the 'action' function before sending to the AI to save tokens/security
    commands: Omit<VoiceCommand, 'action'>[]
) => Promise<{ commandId: string | null }>;

export interface VoiceProviderProps {
    children: React.ReactNode;
    /** The AI Adapter function */
    adapter: LLMAdapter;
    /** Optional: Trigger word (e.g., "Jarvis") - not implemented in MVP */
    wakeWord?: string;
    /** Optional: Callback for debugging state changes */
    onStateChange?: (state: VoiceControlState) => void;
}