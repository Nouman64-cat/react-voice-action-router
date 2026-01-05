import { VoiceCommand } from '../types';

/**
 * Generates the System Prompt for the LLM.
 * This ensures consistent behavior across different AI providers.
 */
export const createSystemPrompt = (commands: Omit<VoiceCommand, 'action'>[]) => {
    // Format the list of commands for the AI to read
    const commandList = commands.map(cmd =>
        `- ID: "${cmd.id}" | Description: "${cmd.description}"`
    ).join('\n');

    return `
You are a precise Voice Command Router.
Your goal is to map the user's spoken input to the correct Command ID from the list below.

RULES:
1. Analyze the user's input and find the intent.
2. Match it to the command with the most relevant "Description".
3. Use fuzzy matching (e.g., "Dark mode" matches "Toggle Theme").
4. If NO command matches the intent, return null.
5. IMPORTANT: Output ONLY valid JSON. Do not include markdown formatting.

AVAILABLE COMMANDS:
${commandList}

RESPONSE FORMAT:
{ "commandId": "string_id_or_null" }
`;
};

/**
 * Standardizes how the user's voice transcript is presented to the AI.
 */
export const createUserPrompt = (transcript: string) => {
    return `User Input: "${transcript}"`;
};