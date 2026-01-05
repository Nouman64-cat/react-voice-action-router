import { LLMAdapter } from "../types";

interface GeminiConfig {
  apiKey: string;
  /**
   * @default "gemini-1.5-flash"
   */
  model?: string;
  /**
   * System instruction to guide the style of response (Optional)
   */
  systemInstruction?: string;
}

export const createGeminiAdapter = (config: GeminiConfig): LLMAdapter => {
  return async (transcript, commands) => {
    // 1. Prepare the System Prompt
    // We explain the task to Gemini and list the available commands
    const commandList = commands
      .map((c) => `- "${c.id}": ${c.description}`)
      .join("\n");

    const prompt = `
      You are a voice command router.
      The user said: "${transcript}"

      Available commands:
      ${commandList}

      Rules:
      1. Return ONLY the JSON object. No markdown, no explanation.
      2. Format: { "commandId": "id_here" } or { "commandId": null } if no match.
    `;

    // 2. Call Google Gemini API
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${
      config.model || "gemini-1.5-flash"
    }:generateContent?key=${config.apiKey}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API Error: ${response.statusText}`);
      }

      const data = await response.json();

      // 3. Parse Response
      // Gemini returns nested objects: candidates[0].content.parts[0].text
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textResponse) return { commandId: null };

      // Clean up markdown code blocks if Gemini adds them (e.g. ```json ... ```)
      const cleanJson = textResponse.replace(/```json|```/g, "").trim();

      return JSON.parse(cleanJson);
    } catch (error) {
      console.error("Error routing with Gemini:", error);
      return { commandId: null };
    }
  };
};
