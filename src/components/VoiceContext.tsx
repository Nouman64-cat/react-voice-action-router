import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { VoiceCommand, VoiceControlState, VoiceProviderProps } from '../types';

interface VoiceContextValue extends VoiceControlState {
  register: (cmd: VoiceCommand) => void;
  unregister: (id: string) => void;
  processTranscript: (text: string) => Promise<void>;
}

const VoiceContext = createContext<VoiceContextValue | null>(null);

export const VoiceControlProvider: React.FC<VoiceProviderProps> = ({ 
  children, 
  adapter 
}) => {
  // THE REGISTRY: A Map ensures O(1) lookups and prevents duplicate IDs
  const commandsRef = useRef<Map<string, VoiceCommand>>(new Map());
  
  // UI STATE
  const [state, setState] = useState<VoiceControlState>({
    isListening: false,
    isProcessing: false,
    lastTranscript: null,
    activeCommands: [],
  });

  // 1. REGISTRATION LOGIC
  const register = useCallback((cmd: VoiceCommand) => {
    commandsRef.current.set(cmd.id, cmd);
    // Update generic state for debugging UI
    setState(prev => ({ ...prev, activeCommands: Array.from(commandsRef.current.values()) }));
  }, []);

  const unregister = useCallback((id: string) => {
    commandsRef.current.delete(id);
    setState(prev => ({ ...prev, activeCommands: Array.from(commandsRef.current.values()) }));
  }, []);

  // 2. THE ROUTER LOGIC
  const processTranscript = useCallback(async (transcript: string) => {
    const cleanText = transcript.trim().toLowerCase();
    setState(prev => ({ ...prev, isProcessing: true, lastTranscript: cleanText }));

    const allCommands = Array.from(commandsRef.current.values());

    // PHASE 1: EXACT MATCH (0ms Latency)
    const exactMatch = allCommands.find(c => c.phrase?.toLowerCase() === cleanText);
    
    if (exactMatch) {
      console.log(`⚡ Instant Match: "${cleanText}" -> ${exactMatch.id}`);
      exactMatch.action();
      setState(prev => ({ ...prev, isProcessing: false }));
      return;
    }

    // PHASE 2: FUZZY MATCH (AI Adapter)
    try {
      console.log(`🤖 AI Routing: "${cleanText}"...`);
      
      // We strip the 'action' function before sending to the AI
      const commandListForAI = allCommands.map(({ id, description, phrase }) => ({ 
        id, 
        description, 
        phrase 
      }));

      const result = await adapter(cleanText, commandListForAI);

      if (result.commandId) {
        const cmd = commandsRef.current.get(result.commandId);
        if (cmd) {
          console.log(`✅ Matched: ${cmd.id}`);
          cmd.action();
        } else {
          console.warn(`⚠️ Adapter returned unknown ID: ${result.commandId}`);
        }
      }
    } catch (error) {
      console.error("Adapter Error:", error);
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [adapter]);

  return (
    <VoiceContext.Provider value={{ ...state, register, unregister, processTranscript }}>
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoiceContext = () => {
  const ctx = useContext(VoiceContext);
  if (!ctx) throw new Error("useVoiceContext must be used within a VoiceControlProvider");
  return ctx;
};