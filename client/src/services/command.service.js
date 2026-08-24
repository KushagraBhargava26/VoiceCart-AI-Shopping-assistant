import { post } from './api.js';

const NUMBER_WORDS = {
  one: 1, ek: 1, a: 1, an: 1,
  two: 2, do: 2,
  three: 3, teen: 3,
  four: 4, char: 4,
  five: 5, paanch: 5,
  six: 6, chhe: 6,
  seven: 7, saat: 7,
  eight: 8, aath: 8,
  nine: 9, nau: 9,
  ten: 10, das: 10
};

export function parseClientVoiceCommand(rawTranscript, language) {
  const transcript = (rawTranscript || "").trim();
  const lower = transcript.toLowerCase();

  // 1. Check for REMOVE action
  if (/\b(remove|delete|hata|nikal|drop)\b/i.test(lower)) {
    const cleanName = transcript
      .replace(/\b(remove|delete|hata|nikal|drop|from my list|list se|karo|do|please)\b/gi, "")
      .trim() || "Item";

    return {
      action: "REMOVE_ITEM",
      item: cleanName,
      spokenResponse: `Removed ${cleanName} from your shopping list.`
    };
  }

  // 2. Check for SEARCH action
  if (/\b(search|find|dhundho|dikhao|look for)\b/i.test(lower)) {
    const query = transcript
      .replace(/\b(search|find|dhundho|dikhao|look for|karo|please|under \d+|rupees)\b/gi, "")
      .trim() || transcript;

    return {
      action: "SEARCH_PRODUCT",
      query,
      spokenResponse: `Searching for ${query}.`
    };
  }

  // 3. Multi-item ADD action (split by "and", "aur", ",", "tatha", "plus")
  const cleanBody = transcript
    .replace(/\b(add|put|buy|need|want|chahiye|daal|daalo|karo|bhejo|please|to my list|list mein)\b/gi, "")
    .trim();

  // Split into segments
  const segments = cleanBody.split(/\b(?:and|aur|tatha|plus|,)\b/i).map(s => s.trim()).filter(Boolean);

  const parsedItems = (segments.length ? segments : [cleanBody]).map((seg) => {
    let quantity = 1;
    let unit = "unit";
    let itemName = seg;

    // Match digit quantity e.g. "2 l of water" or "5 kg rice" or "2 packet dahi"
    const digitMatch = seg.match(/^(\d+)\s*([a-z]+)?\s*(?:of\s+)?(.+)$/i);
    if (digitMatch) {
      quantity = parseInt(digitMatch[1], 10);
      const possibleUnit = (digitMatch[2] || "").toLowerCase();
      if (["l", "liter", "litres", "litre", "kg", "kilo", "kilogram", "packet", "packets", "bottle", "bottles", "pcs", "piece", "pieces", "box", "dozen"].includes(possibleUnit)) {
        unit = possibleUnit;
      }
      itemName = digitMatch[3].trim();
    } else {
      // Match word quantity e.g. "two litres of milk" or "ek kg chawal"
      const words = seg.split(/\s+/);
      const firstWord = (words[0] || "").toLowerCase();
      if (NUMBER_WORDS[firstWord]) {
        quantity = NUMBER_WORDS[firstWord];
        const secondWord = (words[1] || "").toLowerCase();
        if (["l", "liter", "litres", "litre", "kg", "kilo", "kilogram", "packet", "packets", "bottle", "bottles", "pcs", "piece", "pieces", "box", "dozen"].includes(secondWord)) {
          unit = secondWord;
          itemName = words.slice(2).join(" ");
        } else {
          itemName = words.slice(1).join(" ");
        }
      }
    }

    itemName = itemName.replace(/^of\s+/i, "").trim() || seg;

    return {
      name: itemName,
      quantity: quantity || 1,
      unit: unit || "unit"
    };
  });

  const itemNames = parsedItems.map(i => `${i.quantity > 1 ? `${i.quantity} ${i.unit} ` : ""}${i.name}`).join(" and ");

  return {
    action: "ADD_ITEM",
    items: parsedItems,
    item: parsedItems[0]?.name || cleanBody,
    quantity: parsedItems[0]?.quantity || 1,
    unit: parsedItems[0]?.unit || "unit",
    spokenResponse: `Added ${itemNames} to your shopping list.`
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