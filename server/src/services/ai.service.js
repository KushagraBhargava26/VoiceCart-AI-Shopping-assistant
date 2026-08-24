const CANDIDATE_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-3-flash-preview",
];

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
10. If the command mentions a price constraint (e.g. "under X", "below X rupees") alongside an add/remove/update intent, treat it as a search request instead, since price constraints are used to browse/filter products, not to add a specific item. Prefer SEARCH_PRODUCT in these cases.

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

Input: "Doodh add karo"
Output: {"action":"ADD_ITEM","items":[{"name":"milk","quantity":1,"unit":"unit"}]}

Now interpret the following user command and respond with ONLY the JSON object.`;

/**
 * Deterministic offline rule-based NLP fallback in case AI services hit rate limits (429).
 */
function fallbackInterpret(transcript) {
  const text = (transcript || "").trim().toLowerCase();

  // Suggestions
  if (/what should i buy|suggestions|kya khareedu|recommend/i.test(text)) {
    return { action: "GET_SUGGESTIONS" };
  }

  // Remove item
  const removeMatch = text.match(/(?:remove|delete|hatao|nikalo|hata do)\s+(.+?)(?:\s+(?:from|se|list))*$/i);
  if (removeMatch && removeMatch[1]) {
    const rawName = removeMatch[1].replace(/my list|the list|list se/g, "").trim();
    return {
      action: "REMOVE_ITEM",
      items: [{ name: rawName }],
    };
  }

  // Search product
  const searchMatch = text.match(/(?:search|find|dhoondo|khojo|check)\s+(.+)/i);
  if (searchMatch && searchMatch[1]) {
    return {
      action: "SEARCH_PRODUCT",
      query: searchMatch[1].replace(/under\s+\d+|below\s+\d+/i, "").trim(),
    };
  }

  // Add item (e.g. "Add 2 litres of milk", "doodh add karo", "2 kg rice")
  const addMatch = text.match(/(?:add|buy|get|lana|daalo|chahiye)?\s*(\d+(?:\.\d+)?)*\s*(litres?|liters?|kg|kilo|grams?|g|packets?|bottles?|pieces?|dozen|dozens|unit)?\s*(?:of\s+)?(.+?)(?:\s+(?:add karo|daalo|to my list|in my list|chahiye))*$/i);

  if (addMatch && addMatch[3]) {
    const qty = addMatch[1] ? parseFloat(addMatch[1]) : 1;
    const unit = addMatch[2] || "unit";
    let name = addMatch[3].replace(/add karo|daalo|to my list|in my list|please/g, "").trim();
    if (name.length > 0 && !["hello", "hi", "hey", "test"].includes(name)) {
      return {
        action: "ADD_ITEM",
        items: [{ name, quantity: qty, unit }],
      };
    }
  }

  return { action: "UNKNOWN" };
}

export async function interpretCommand(transcript) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("Gemini API key is not configured. Falling back to local NLP parser.");
    return fallbackInterpret(transcript);
  }

  const prompt = `${SYSTEM_PROMPT}\n\nUser command: "${transcript}"`;

  let lastError = null;

  // Try candidate models in order of speed and quota availability
  for (const model of CANDIDATE_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(4500),
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

      if (!response.ok) {
        lastError = new Error(`AI model ${model} responded with status ${response.status}`);
        // If rate limited (429) or not found (404), try next model
        if (response.status === 429 || response.status === 404 || response.status === 503) {
          continue;
        }
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (rawText) {
        try {
          return JSON.parse(rawText);
        } catch {
          // JSON parsing failed, try next model or fallback
        }
      }
    } catch (err) {
      lastError = err;
    }
  }

  console.warn("All Gemini AI models failed/rate-limited. Using local NLP rule fallback for command:", transcript, lastError?.message);
  return fallbackInterpret(transcript);
}
