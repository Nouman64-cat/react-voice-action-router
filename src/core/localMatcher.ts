import { VoiceCommand } from '../types';

/**
 * A simple fallback matcher that scores commands based on keyword overlap.
 * Used when the AI adapter fails.
 */
export const findBestMatch = (transcript: string, commands: VoiceCommand[]): string | null => {
    const lowerTranscript = transcript.toLowerCase().trim();
    const transcriptWords = lowerTranscript.split(/\s+/).filter(w => w.length > 2); // Ignore short words

    let bestMatchId: string | null = null;
    let maxScore = 0;

    for (const cmd of commands) {
        let score = 0;
        const desc = cmd.description.toLowerCase();
        const id = cmd.id.toLowerCase();

        // 1. Direct ID Match (Strong signal)
        if (lowerTranscript.includes(id)) {
            score += 3;
        }

        // 2. Description Keyword Match
        // If the user says "Navigate settings", and description is "Navigate to settings page"
        for (const word of transcriptWords) {
            if (desc.includes(word)) {
                score += 1;
            }
        }

        // Update best match if score is significant
        if (score > maxScore && score >= 2) { // Threshold of 2 ensures at least some relevance
            maxScore = score;
            bestMatchId = cmd.id;
        }
    }

    return bestMatchId;
};