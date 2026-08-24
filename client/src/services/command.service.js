import { post } from './api.js';

const NUMBER_WORDS = {
  one: 1, ek: 1, a: 1, an: 1,
  two: 2, do: 2,
  three: 3, teen: 3,
  four: 4, char: 4, chaar: 4,
  five: 5, paanch: 5, panch: 5,
  six: 6, chhe: 6, che: 6,
  seven: 7, saat: 7,
  eight: 8, aath: 8,
  nine: 9, nau: 9,
  ten: 10, das: 10
};

const SUFFIX_REGEX = /(?:\s+(?:to|in|on|into)\s+(?:my|the|a)?\s*(?:cart|shopping list|list)|to my cart|to cart|to my list|to list|in my cart|in cart|in my list|in list|on my list|list mein|list me|cart mein|cart me|kar do|daal do|bhej do|karo|daalo|add|ऐड|ऐड करो|ऐड कर दो|कर दो|chahiye))+$/gi;

const PREFIX_REGEX = /^(?:add|put|buy|need|want|get|i want|i need|please|chahiye|daal|daalo|karo|bhejo|rakho|laao|lano|le aao|ऐड|ऐड करो|ऐड कर दो|डालो|डाल दो|चाहिए|कीजिये|करो)\s+/gi;

export function parseClientVoiceCommand(rawTranscript, language) {
  const transcript = (rawTranscript || "").trim();
  const lower = transcript.toLowerCase();

  // 1. Check for REMOVE action (Hindi: hata, nikal, drop, remove)
  if (/\b(remove|delete|hata|nikal|drop|mita|hatao)\b/i.test(lower)) {
    const cleanName = transcript
      .replace(PREFIX_REGEX, "")
      .replace(SUFFIX_REGEX, "")
      .replace(/\b(remove|delete|hata|nikal|drop|mita|hatao|from my list|list se|karo|do|kar do|please)\b/gi, "")
      .trim() || "Item";

    const isHi = language === "hi-IN" || /[^\x00-\x7F]/.test(transcript) || /\b(hata|nikal|karo)\b/i.test(lower);
    return {
      action: "REMOVE_ITEM",
      item: cleanName,
      spokenResponse: isHi ? `${cleanName} shopping list se hata diya gaya hai.` : `Removed ${cleanName} from your shopping list.`
    };
  }

  // 2. Check for SEARCH action (Hindi: search, find, dhundho, dikhao)
  if (/\b(search|find|dhundho|dikhao|look for|kholo)\b/i.test(lower)) {
    const query = transcript
      .replace(PREFIX_REGEX, "")
      .replace(SUFFIX_REGEX, "")
      .replace(/\b(search|find|dhundho|dikhao|look for|kholo|karo|please|under \d+|rupees|rupaye)\b/gi, "")
      .trim() || transcript;

    const isHi = language === "hi-IN" || /[^\x00-\x7F]/.test(transcript) || /\b(dhundho|dikhao|karo)\b/i.test(lower);
    return {
      action: "SEARCH_PRODUCT",
      query,
      spokenResponse: isHi ? `${query} search kiya ja raha hai.` : `Searching for ${query}.`
    };
  }

  // 3. Multi-item ADD action (split by "and", "aur", "tatha", "evam", "plus", ",")
  const cleanBody = transcript
    .replace(PREFIX_REGEX, "")
    .replace(SUFFIX_REGEX, "")
    .trim();

  // Split into segments by conjunctions
  const segments = (cleanBody || transcript).split(/\b(?:and|aur|tatha|evam|plus|,)\b/i).map(s => s.trim()).filter(Boolean);

  const parsedItems = (segments.length ? segments : [cleanBody || transcript]).map((seg) => {
    let quantity = 1;
    let unit = "unit";
    let itemName = seg.trim();

    // Match leading digits e.g. "2 l paani" or "2 litre dudh" or "2 लीटर दूध"
    const digitMatch = seg.match(/^(\d+)\s*([a-zA-Z\u0900-\u097F]+)?\s*(?:of|ka|ki|ke)?\s*(.+)$/i);
    if (digitMatch) {
      quantity = parseInt(digitMatch[1], 10);
      const possibleUnit = (digitMatch[2] || "").toLowerCase();
      if (["l", "liter", "litres", "litre", "kg", "kilo", "kilogram", "packet", "packets", "botal", "bottle", "bottles", "pcs", "piece", "pieces", "box", "dozen", "dazan", "लीटर", "ली", "किलो", "किग्रा", "पैकेट", "बोतल", "पीस"].includes(possibleUnit)) {
        unit = possibleUnit;
        itemName = digitMatch[3].trim();
      } else {
        itemName = `${digitMatch[2] || ""} ${digitMatch[3] || ""}`.trim();
      }
    } else {
      // Match word quantity e.g. "two litres of milk" or "ek kg chawal"
      const words = seg.split(/\s+/);
      const firstWord = (words[0] || "").toLowerCase();
      if (NUMBER_WORDS[firstWord]) {
        quantity = NUMBER_WORDS[firstWord];
        const secondWord = (words[1] || "").toLowerCase();
        if (["l", "liter", "litres", "litre", "kg", "kilo", "kilogram", "packet", "packets", "botal", "bottle", "bottles", "pcs", "piece", "pieces", "box", "dozen", "dazan", "लीटर", "ली", "किलो", "किग्रा", "पैकेट", "बोतल", "पीस"].includes(secondWord)) {
          unit = secondWord;
          itemName = words.slice(2).join(" ");
        } else {
          itemName = words.slice(1).join(" ");
        }
      }
    }

    // Clean up residual verbs, prepositions, and trailing suffixes from itemName
    itemName = itemName
      .replace(/^(of|ka|ki|ke)\s+/i, "")
      .replace(SUFFIX_REGEX, "")
      .replace(PREFIX_REGEX, "")
      .trim() || seg;

    // Standardize food names to standard catalog names
    const cleanLower = itemName.toLowerCase();
    let finalName = itemName;
    if (cleanLower.includes("dudh") || cleanLower.includes("doodh") || cleanLower.includes("दूध") || cleanLower === "milk" || cleanLower.includes("milk")) {
      finalName = "Amul Taaza Fresh Milk 1L";
    } else if (cleanLower.includes("paani") || cleanLower.includes("pani") || cleanLower.includes("पानी") || cleanLower === "water" || cleanLower.includes("water")) {
      finalName = "Bisleri Mineral Water 1L";
    } else if (cleanLower.includes("bread") || cleanLower.includes("ब्रेड")) {
      finalName = "Britannia Brown Bread 400g";
    } else if (cleanLower.includes("dahi") || cleanLower.includes("दही") || cleanLower.includes("curd")) {
      finalName = "Mother Dairy Classic Dahi 400g";
    } else if (cleanLower.includes("chawal") || cleanLower.includes("चावल") || cleanLower.includes("rice")) {
      finalName = "Basmati Rice 1kg";
    } else if (cleanLower.includes("anda") || cleanLower.includes("ande") || cleanLower.includes("अंडा") || cleanLower === "egg" || cleanLower === "eggs") {
      finalName = "Fresh Farm Eggs (Pack of 6)";
    }

    return {
      name: finalName,
      quantity: quantity || 1,
      unit: unit || "unit"
    };
  });

  const isHi = language === "hi-IN" || /[^\x00-\x7F]/.test(transcript) || /\b(aur|daalo|karo|chahiye)\b/i.test(lower);
  const itemNames = parsedItems.map(i => `${i.quantity > 1 ? `${i.quantity} ${i.unit} ` : ""}${i.name}`).join(isHi ? " aur " : " and ");

  return {
    action: "ADD_ITEM",
    items: parsedItems,
    item: parsedItems[0]?.name || cleanBody,
    quantity: parsedItems[0]?.quantity || 1,
    unit: parsedItems[0]?.unit || "unit",
    spokenResponse: isHi ? `${itemNames} aapki list me add kar diya gaya hai.` : `Added ${itemNames} to your shopping list.`
  };
}

export async function sendVoiceCommand(transcript, language) {
  try {
    const res = await post('/commands', { transcript, language });
    if (res && res.action && (res.items || res.item)) {
      return res;
    }
    throw new Error("No backend resolution");
  } catch (err) {
    console.warn("Voice command API unreachable, using resilient client NLP parser:", err.message);
    return parseClientVoiceCommand(transcript, language);
  }
}