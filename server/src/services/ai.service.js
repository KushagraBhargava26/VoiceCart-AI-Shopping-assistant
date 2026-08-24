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
- GET_CART_TOTAL
- CLARIFICATION_REQUIRED
- UNKNOWN

Rules:
1. Always respond with ONLY a valid JSON object. No explanations, no extra text, no markdown formatting.
2. For ADD_ITEM and UPDATE_ITEM: return an "items" array. Each item has "name" (string), "quantity" (number), and "unit" (string). If quantity is not mentioned, default to 1 and unit to "unit".
3. For REMOVE_ITEM: return an "items" array. Each item MUST have "name" (string). If the user specifies a quantity to remove (e.g. "remove 2 bread"), also include "quantity" (number) and "unit" (string). If no quantity is mentioned, omit quantity and unit — this means remove the item entirely.
4. Support multiple items in a single command.
5. For SEARCH_PRODUCT: return "query" (string) and optionally "filters" (object with brand, minPrice, maxPrice, size, category).
6. For GET_SUGGESTIONS: return just the action, nothing else.
7. If the command is ambiguous (e.g. refers to "that thing" without context), return CLARIFICATION_REQUIRED with a "message" field asking for clarification.
8. Never invent information (prices, brands, availability) that the user did not mention.
9. The user may speak in English or Hindi (or Hinglish). Always return the structured output in the same JSON schema regardless of input language.
10. If the command mentions a price constraint (e.g. "under X", "below X rupees") alongside an add/remove/update intent, treat it as a search request instead.

Examples:
Input: "Add 2 bottles of water"
Output: {"action":"ADD_ITEM","items":[{"name":"water","quantity":2,"unit":"bottles"}]}

Input: "Add 2 litres of milk and 5 apples"
Output: {"action":"ADD_ITEM","items":[{"name":"milk","quantity":2,"unit":"litres"},{"name":"apples","quantity":5,"unit":"pieces"}]}

Input: "Remove milk from my list"
Output: {"action":"REMOVE_ITEM","items":[{"name":"milk"}]}

Input: "Remove 2 bread"
Output: {"action":"REMOVE_ITEM","items":[{"name":"bread","quantity":2,"unit":"pieces"}]}

Input: "Remove 1 litre of milk"
Output: {"action":"REMOVE_ITEM","items":[{"name":"milk","quantity":1,"unit":"litres"}]}

Input: "Change apples to 5"
Output: {"action":"UPDATE_ITEM","items":[{"name":"apples","quantity":5,"unit":"pieces"}]}

Input: "Find Colgate toothpaste under 300 rupees"
Output: {"action":"SEARCH_PRODUCT","query":"toothpaste","filters":{"brand":"Colgate","maxPrice":300,"currency":"INR"}}

Input: "Toothpaste dikhao"
Output: {"action":"SEARCH_PRODUCT","query":"toothpaste"}

Input: "Milk dhoondo"
Output: {"action":"SEARCH_PRODUCT","query":"milk"}

Input: "What should I buy?"
Output: {"action":"GET_SUGGESTIONS"}

Input: "What is my total bill?"
Output: {"action":"GET_CART_TOTAL"}

Input: "Mera bill kitna hoga?"
Output: {"action":"GET_CART_TOTAL"}

Input: "Doodh add karo"
Output: {"action":"ADD_ITEM","items":[{"name":"milk","quantity":1,"unit":"unit"}]}

Input: "2 bread hata do"
Output: {"action":"REMOVE_ITEM","items":[{"name":"bread","quantity":2,"unit":"pieces"}]}

Now interpret the following user command and respond with ONLY the JSON object.`;

/**
 * Deterministic offline rule-based NLP fallback in case AI services hit rate limits (429).
 */
function fallbackInterpret(transcript) {
  const text = (transcript || "").trim().toLowerCase();

  // Cart total
  if (/bill|total|kitna hoga|how much|cart total|mera total|kharcha|estimate/i.test(text)) {
    return { action: "GET_CART_TOTAL" };
  }

  // Suggestions
  if (/what should i buy|suggestions|kya khareedu|recommend|sujhav/i.test(text)) {
    return { action: "GET_SUGGESTIONS" };
  }

  // Remove item — check BEFORE add so Hindi "X ko remove kar do" never becomes ADD_ITEM
  // Covers: "remove X", "remove 2 X", "X ko remove kar do", "hata do X", "X hata do", "X nikalo", "delete X"
  const removeKeywords = /\b(remove kar do|hata do|hata dena|delete karo|nikalo|nikal do|remove|delete|hatao|hata|nikal)\b/i;
  if (removeKeywords.test(text)) {
    // Strip remove keywords first
    let cleaned = text
      .replace(/\b(remove kar do|hata do|hata dena|delete karo|nikalo|nikal do|remove|delete|hatao|hata|nikal)\b/gi, "")
      .replace(/\b(ko|se|list|meri|my|the|please|karo|kar do|dena|se hata|list se|from)\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    if (cleaned.length > 0) {
      // Try to extract a leading quantity + unit from the cleaned text
      // e.g. "2 bread", "1 litre of milk", "3 kg rice"
      const qtyMatch = cleaned.match(/^(\d+(?:\.\d+)?)\s*(litres?|liters?|kg|kilo|grams?|g|packets?|bottles?|pieces?|dozen|dozens|unit|litre)?\s*(?:of\s+)?(.+)$/i);
      if (qtyMatch) {
        const quantity = parseFloat(qtyMatch[1]);
        const unit = qtyMatch[2] || "pieces";
        const name = qtyMatch[3].trim();
        return { action: "REMOVE_ITEM", items: [{ name, quantity, unit }] };
      }
      // No quantity — remove the whole item
      return { action: "REMOVE_ITEM", items: [{ name: cleaned }] };
    }
  }

  // Search product (e.g. "search toothpaste", "toothpaste dikhao", "milk dhoondo", "find bread")
  const searchKeywords = /\b(search|find|dhoondo|dhundo|khojo|check|show|dikhao|dekho|search karo|dekhiye)\b/i;
  if (searchKeywords.test(text) && !/\b(add|buy|get|lana|daalo|hatao|remove|delete)\b/i.test(text)) {
    const query = text
      .replace(/\b(search|find|dhoondo|dhundo|khojo|check|show|dikhao|dekho|search karo|karo|dekhiye|me|please)\b/gi, "")
      .replace(/under\s+\d+|below\s+\d+/i, "")
      .trim();
    if (query.length > 0) {
      return {
        action: "SEARCH_PRODUCT",
        query,
      };
    }
  }

  // Add item — only reach here if no remove or search keywords matched
  const addMatch = text.match(/(?:add|buy|get|lana|daalo|chahiye|add karo|list mein daalo)?\s*(\d+(?:\.\d+)?)*\s*(litres?|liters?|kg|kilo|grams?|g|packets?|bottles?|pieces?|dozen|dozens|unit)?\s*(?:of\s+)?(.+?)(?:\s+(?:add karo|daalo|to my list|in my list|list mein|chahiye|kharidna hai))*$/i);

  if (addMatch && addMatch[3]) {
    const qty = addMatch[1] ? parseFloat(addMatch[1]) : 1;
    const unit = addMatch[2] || "unit";
    let name = addMatch[3]
      .replace(/\b(add karo|daalo|list mein|to my list|in my list|please|kharidna hai|chahiye)\b/gi, "")
      .trim();
    // Safety guard: reject if extracted name still contains command-like words
    const looksLikeCommand = /\b(karo|kar do|dena|hatao|remove|delete|nikalo|search|find|dikhao|dekho|dhoondo|dhundo)\b/i.test(name);
    if (name.length > 0 && name.length < 60 && !["hello", "hi", "hey", "test"].includes(name) && !looksLikeCommand) {
      return { action: "ADD_ITEM", items: [{ name, quantity: qty, unit }] };
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
