import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import {
  VoiceCommand,
  VoiceControlState,
  VoiceProviderProps,
  DictationOptions,
} from "../types";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { findBestMatch } from "../core/localMatcher";
interface VoiceContextValue extends VoiceControlState {
  register: (cmd: VoiceCommand) => void;
  unregister: (id: string) => void;
  processTranscript: (text: string) => Promise<void>;
  setPaused: (paused: boolean) => void;
  startListening: () => void;
  stopListening: () => void;
  startDictation: (options: DictationOptions) => void;
  stopDictation: () => void;
}

const VoiceContext = createContext<VoiceContextValue | null>(null);

export const VoiceControlProvider: React.FC<VoiceProviderProps> = ({
  children,
  adapter,
  disableSpeechEngine = false,
  enableOfflineFallback = true, // <--- Default to true
}) => {
  const commandsRef = useRef<Map<string, VoiceCommand>>(new Map());
  const isPausedRef = useRef(false);
  const isDictatingRef = useRef(false);
  const dictationOptionsRef = useRef<DictationOptions | null>(null);

  const [state, setState] = useState<VoiceControlState>({
    isListening: false,
    isProcessing: false,
    lastTranscript: null,
    activeCommands: [],
    isPaused: false,
    error: null,
    isDictating: false,
  });

  const setPaused = useCallback((paused: boolean) => {
    isPausedRef.current = paused;
    setState((prev) => ({ ...prev, isPaused: paused }));
  }, []);

  const startDictation = useCallback((options: DictationOptions) => {
    isDictatingRef.current = true;
    dictationOptionsRef.current = options;
    setState((prev) => ({ ...prev, isDictating: true }));
  }, []);

  const stopDictation = useCallback(() => {
    isDictatingRef.current = false;
    dictationOptionsRef.current = null;
    setState((prev) => ({ ...prev, isDictating: false }));
  }, []);

  const processTranscript = useCallback(
    async (transcript: string) => {
      if (isPausedRef.current) return;

      const cleanText = transcript.trim().toLowerCase();
      if (!cleanText) return;

      setState((prev) => ({
        ...prev,
        isProcessing: true,
        lastTranscript: cleanText,
      }));
      const allCommands = Array.from(commandsRef.current.values());

      // 1. Exact Match (Fastest)
      const exactMatch = allCommands.find(
        (c) => c.phrase?.toLowerCase() === cleanText
      );
      if (exactMatch) {
        console.log(`⚡ Match: "${cleanText}"`);
        exactMatch.action();
        setState((prev) => ({ ...prev, isProcessing: false }));
        return;
      }

      // 2. AI Fuzzy Match (Smartest)
      try {
        const commandListForAI = allCommands.map(
          ({ id, description, phrase }) => ({ id, description, phrase })
        );

        const result = await adapter(cleanText, commandListForAI);

        if (result.commandId) {
          const cmd = commandsRef.current.get(result.commandId);
          if (cmd) {
            cmd.action();
          }
        }
      } catch (error) {
        console.error("AI Adapter Failed:", error);

        // 3. Offline Fallback (Safety Net)
        if (enableOfflineFallback) {
          console.warn("🌐 Attempting Offline Fallback...");
          const fallbackId = findBestMatch(cleanText, allCommands);

          if (fallbackId) {
            const cmd = commandsRef.current.get(fallbackId);
            if (cmd) {
              console.log(`✅ Offline Match: ${cmd.id}`);
              cmd.action();
            }
          } else {
            console.log("❌ No offline match found.");
          }
        }
      } finally {
        setState((prev) => ({ ...prev, isProcessing: false }));
      }
    },
    [adapter, enableOfflineFallback]
  );

  // 3. INTERNAL SPEECH ENGINE
  const handleResult = useCallback(
    (transcript: string, isFinal: boolean) => {
      if (isDictatingRef.current && dictationOptionsRef.current) {
        const options = dictationOptionsRef.current;

        // Check for exit commands
        if (
          isFinal &&
          options.exitCommands?.some((cmd) =>
            transcript.toLowerCase().includes(cmd)
          )
        ) {
          stopDictation();
          processTranscript(transcript);
          return;
        }

        // Handle dictation input
        if (isFinal) {
          options.onFinal(transcript);
        } else {
          options.onInterim?.(transcript);
        }
        return;
      }

      // Normal Command Mode
      if (isFinal) {
        processTranscript(transcript);
      }
    },
    [processTranscript, stopDictation]
  );

  const handleError = useCallback((err: string) => {
    setState((prev) => ({
      ...prev,
      error: typeof err === "string" ? err : "Speech Error",
    }));
  }, []);

  const {
    isListening: engineListening,
    start: engineStart,
    stop: engineStop,
  } = useSpeechRecognition({
    disabled: disableSpeechEngine,
    onResult: handleResult,
    onError: handleError,
  });

  useEffect(() => {
    setState((prev) => ({ ...prev, isListening: engineListening }));
  }, [engineListening]);

  const register = useCallback((cmd: VoiceCommand) => {
    commandsRef.current.set(cmd.id, cmd);
    setState((prev) => ({
      ...prev,
      activeCommands: Array.from(commandsRef.current.values()),
    }));
  }, []);

  const unregister = useCallback((id: string) => {
    commandsRef.current.delete(id);
    setState((prev) => ({
      ...prev,
      activeCommands: Array.from(commandsRef.current.values()),
    }));
  }, []);

  return (
    <VoiceContext.Provider
      value={{
        ...state,
        register,
        unregister,
        processTranscript,
        setPaused,
        startListening: engineStart,
        stopListening: engineStop,
        startDictation,
        stopDictation,
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoiceContext = () => {
  const ctx = useContext(VoiceContext);
  if (!ctx)
    throw new Error(
      "useVoiceContext must be used within a VoiceControlProvider"
    );
  return ctx;
};
