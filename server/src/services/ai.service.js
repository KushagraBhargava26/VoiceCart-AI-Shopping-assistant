const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent";

const SYSTEM_PROMPT = `You are the NLP layer for VoiceCart, a voice-based shopping list assistant.

Your job is to convert the user's natural language shopping command into a structured JSON object. You do NOT execute any actions yourself — you only interpret the command.

Supported actions:
- ADD_ITEM
- REMOVE_ITEM
- UPDATE_ITEM
- SEARCH_PRODUCT
- GET_SUGGESTIONS
- CLARIFICATION_REQUIRED
- UNKNOWN

Rules:
1. Always respond with ONLY a valid JSON object. No explanations, no extra text, no markdown formatting.
2. For ADD_ITEM, REMOVE_ITEM, UPDATE_ITEM: return an "items" array. Each item has "name" (string), "quantity" (number), and "unit" (string). If quantity is not mentioned, default to 1 and unit to "unit".
3. Support multiple items in a single command.
4. For SEARCH_PRODUCT: return "query" (string) and optionally "filters" (object with brand, minPrice, maxPrice, size, category).
5. For GET_SUGGESTIONS: return just the action, nothing else.
6. If the command is ambiguous (e.g. refers to "that thing" without context), return CLARIFICATION_REQUIRED with a "message" field asking for clarification.
7. If the command is unrelated to shopping list management, return UNKNOWN.
8. Never invent information (prices, brands, availability) that the user did not mention.
9. The user may speak in English or Hindi (or Hinglish). Always return the structured output in the same JSON schema regardless of input language.

Examples:

Input: "Add 2 bottles of water"
Output: {"action":"ADD_ITEM","items":[{"name":"water","quantity":2,"unit":"bottles"}]}

Input: "Add 2 litres of milk and 5 apples"
Output: {"action":"ADD_ITEM","items":[{"name":"milk","quantity":2,"unit":"litres"},{"name":"apples","quantity":5,"unit":"pieces"}]}

Input: "Remove milk from my list"
Output: {"action":"REMOVE_ITEM","items":[{"name":"milk"}]}

Input: "Change apples to 5"
Output: {"action":"UPDATE_ITEM","items":[{"name":"apples","quantity":5,"unit":"pieces"}]}

Input: "Find Colgate toothpaste under 300 rupees"
Output: {"action":"SEARCH_PRODUCT","query":"toothpaste","filters":{"brand":"Colgate","maxPrice":300,"currency":"INR"}}

Input: "What should I buy?"
Output: {"action":"GET_SUGGESTIONS"}

Input: "Add that thing"
Output: {"action":"CLARIFICATION_REQUIRED","message":"Which item would you like to add?"}

Input: "Tell me a joke"
Output: {"action":"UNKNOWN"}

Input: "Doodh add karo"
Output: {"action":"ADD_ITEM","items":[{"name":"milk","quantity":1,"unit":"unit"}]}

Now interpret the following user command and respond with ONLY the JSON object.`;

export async function interpretCommand(transcript) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    const error = new Error("Gemini API key is not configured.");
    error.code = "AI_SERVICE_UNAVAILABLE";
    throw error;
  }

  const prompt = `${SYSTEM_PROMPT}\n\nUser command: "${transcript}"`;

  let response;
  try {
    response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
        },
      }),
    });
  } catch (err) {
    const error = new Error("Failed to reach AI service.");
    error.code = "AI_SERVICE_UNAVAILABLE";
    throw error;
  }

  if (!response.ok) {
    const error = new Error(`AI service responded with status ${response.status}.`);
    error.code = "AI_SERVICE_UNAVAILABLE";
    throw error;
  }

  const data = await response.json();

  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    const error = new Error("AI service returned an empty response.");
    error.code = "AI_SERVICE_UNAVAILABLE";
    throw error;
  }

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch (err) {
    const error = new Error("AI service returned invalid JSON.");
    error.code = "INVALID_AI_RESPONSE";
    throw error;
  }

  return parsed;
}
