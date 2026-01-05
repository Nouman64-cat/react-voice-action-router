import { LLMAdapter } from "../types";

interface ClaudeConfig {
  apiKey: string;
  /**
   * @default "claude-3-5-sonnet-20240620"
   */
  model?: string;
  /**
   * Optional custom endpoint if using a proxy (Recommended for CORS)
   * @default "https://api.anthropic.com/v1/messages"
   */
  endpoint?: string;
}

export const createClaudeAdapter = (config: ClaudeConfig): LLMAdapter => {
  return async (transcript, commands) => {
    const endpoint = config.endpoint || "https://api.anthropic.com/v1/messages";
    const model = config.model || "claude-3-5-sonnet-20240620";

    // 1. Prepare Command List
    const commandList = commands
      .map((c) => `- "${c.id}": ${c.description}`)
      .join("\n");

    const systemPrompt = `
      You are a voice command router.
      Available commands:
      ${commandList}

      Rules:
      1. Analyze the user's transcript.
      2. Return a JSON object: { "commandId": "id" } or { "commandId": null }.
      3. No markdown, no conversational text. ONLY JSON.
    `;

    try {
      // 2. Call Anthropic API
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "x-api-key": config.apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
          // 'dangerously-allow-browser': 'true' // Anthropic client SDK uses this, but fetch doesn't need it.
        },
        body: JSON.stringify({
          model: model,
          max_tokens: 100,
          system: systemPrompt,
          messages: [{ role: "user", content: transcript }],
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Claude API Error: ${response.status} - ${err}`);
      }

      const data = await response.json();

      // 3. Parse Response
      // Claude returns: content: [ { type: 'text', text: '...' } ]
      const textResponse = data.content?.[0]?.text;

      if (!textResponse) return { commandId: null };

      // Clean up potential markdown formatting
      const cleanJson = textResponse.replace(/```json|```/g, "").trim();
      return JSON.parse(cleanJson);
    } catch (error) {
      console.error("Error routing with Claude:", error);
      return { commandId: null };
    }
  };
};
