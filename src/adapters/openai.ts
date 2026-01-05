import { LLMAdapter } from '../types';
import { createSystemPrompt } from '../core/prompt';

interface OpenAIConfig {
    apiKey: string;
    /** @default "gpt-4o-mini" */
    model?: string;
}

/**
 * A Factory that creates an Adapter for OpenAI.
 * Users call this: createOpenAIAdapter({ apiKey: '...' })
 */
export const createOpenAIAdapter = (config: OpenAIConfig): LLMAdapter => {
    return async (transcript, commands) => {

        // 1. Generate the optimized system instructions
        const systemPrompt = createSystemPrompt(commands);

        // 2. Call the API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify({
                model: config.model || "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: transcript }
                ],
                temperature: 0, // Deterministic results
                response_format: { type: "json_object" } // Force JSON mode
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI Adapter Failed: ${response.statusText}`);
        }

        const data = await response.json();

        // 3. Parse the result
        try {
            const parsed = JSON.parse(data.choices[0].message.content);
            return { commandId: parsed.commandId };
        } catch (e) {
            console.error("Failed to parse LLM response", e);
            return { commandId: null };
        }
    };
};