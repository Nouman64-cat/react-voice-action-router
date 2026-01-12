// src/hooks/useSpeechRecognition.ts
import { useState, useEffect, useRef, useCallback } from 'react';

// Define the supported error types
export type SpeechError =
    | 'not-allowed'
    | 'no-speech'
    | 'network'
    | 'aborted'
    | 'service-not-allowed'
    | string;

interface UseSpeechRecognitionProps {
    onResult: (transcript: string, isFinal: boolean) => void;
    onError?: (error: SpeechError) => void;
    /**
     * If true, the engine will not initialize (backward compatibility)
     */
    disabled?: boolean;
}

export const useSpeechRecognition = ({
    onResult,
    onError,
    disabled = false
}: UseSpeechRecognitionProps) => {
    // UI State
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState<SpeechError | null>(null);
    const [isSupported, setIsSupported] = useState(true);

    // Internal Refs
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const intendedState = useRef(false); // Tracks if we *want* to be listening

    // 1. Initialize the API
    useEffect(() => {
        if (disabled) return;

        if (typeof window === 'undefined') return; // SSR check

        const SpeechConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechConstructor) {
            console.error("React Voice Action Router: Speech Recognition not supported in this browser.");
            setIsSupported(false);
            return;
        }

        const recognition = new SpeechConstructor();
        recognition.continuous = true;      // We want continuous stream
        recognition.interimResults = true;  // We need real-time feedback
        recognition.lang = 'en-US';         // Default to English (configurable later)

        // --- EVENT HANDLERS ---

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            // "interimResults: true" means we get repeated events as the confidence grows.
            // We only care about the *latest* result that changed.
            // In continuous mode, previous results at lower indices are already settled (final).

            // Iterate from the first changed result index to the end
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                const transcript = result[0].transcript;
                const isFinal = result.isFinal;
                onResult(transcript, isFinal);
            }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            // 'no-speech' is common and usually ignorable (just silence)
            if (event.error === 'no-speech') {
                return;
            }

            console.warn("Speech Recognition Error:", event.error);
            setError(event.error);
            if (onError) onError(event.error);

            // If permission denied, stop trying
            if (event.error === 'not-allowed') {
                intendedState.current = false;
                setIsListening(false);
            }
        };

        recognition.onend = () => {
            // The Critical "Auto-Restart" Logic
            if (intendedState.current) {
                // If we still want to be listening, restart immediately
                try {
                    recognition.start();
                } catch (e) {
                    // Sometimes it needs a tiny delay if the browser is busy
                    setTimeout(() => {
                        if (intendedState.current) recognition.start();
                    }, 100);
                }
            } else {
                setIsListening(false);
            }
        };

        recognitionRef.current = recognition;

        // Cleanup
        return () => {
            intendedState.current = false;
            recognition.stop();
        };
    }, [disabled, onResult, onError]);

    // 2. Control Methods
    const start = useCallback(() => {
        if (!recognitionRef.current || !isSupported) return;

        setError(null);
        intendedState.current = true;
        try {
            recognitionRef.current.start();
            setIsListening(true);
        } catch (e) {
            // Already started, ignore
        }
    }, [isSupported]);

    const stop = useCallback(() => {
        if (!recognitionRef.current) return;

        intendedState.current = false;
        recognitionRef.current.stop();
        setIsListening(false);
    }, []);

    const toggle = useCallback(() => {
        if (isListening) stop();
        else start();
    }, [isListening, start, stop]);

    return {
        isListening,
        isSupported,
        error,
        start,
        stop,
        toggle
    };
};