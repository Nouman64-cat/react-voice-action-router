import { useEffect, useRef } from 'react';
import { useVoiceContext } from '../components/VoiceContext';
import { VoiceCommand } from '../types';

/**
 * The Developer Hook
 * Wraps the lifecycle logic so the developer doesn't have to.
 * * Usage:
 * useVoiceCommand({
 * id: 'nav_home',
 * description: 'Go to home',
 * action: () => navigate('/')
 * });
 */
export const useVoiceCommand = (command: VoiceCommand) => {
    const { register, unregister } = useVoiceContext();

    // Use a ref to keep the ID stable across renders
    const idRef = useRef(command.id);

    useEffect(() => {
        // 1. Mount: Register the tool
        register(command);

        // 2. Unmount: Remove the tool
        return () => {
            unregister(idRef.current);
        };
    }, [register, unregister, command]); // Re-register if command definition changes
};