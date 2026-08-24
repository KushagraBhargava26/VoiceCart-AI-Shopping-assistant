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

const SPECIFIC_BRANDS = [
  "amul", "britannia", "nestle", "nestlé", "bisleri", "colgate", "dettol",
  "tata", "nescafe", "nescafé", "modern", "fortune", "saffola", "pears",
  "taj mahal", "mother dairy", "haldiram", "lays", "lay's", "kurkure"
];

const GENERIC_CHOICES = {
  milk: [
    { id: "p1", name: "Amul Taaza Fresh Milk 1L", brand: "Amul", category: "Dairy & Eggs", price: 68, size: "1L" },
    { id: "p8", name: "Nestlé A+ Fresh Cream 200ml", brand: "Nestlé", category: "Dairy & Eggs", price: 65, size: "200ml" },
    { id: "p9", name: "Amul Masti Spiced Buttermilk 200ml", brand: "Amul", category: "Dairy & Eggs", price: 15, size: "200ml" }
  ],
  doodh: [
    { id: "p1", name: "Amul Taaza Fresh Milk 1L", brand: "Amul", category: "Dairy & Eggs", price: 68, size: "1L" },
    { id: "p8", name: "Nestlé A+ Fresh Cream 200ml", brand: "Nestlé", category: "Dairy & Eggs", price: 65, size: "200ml" },
    { id: "p9", name: "Amul Masti Spiced Buttermilk 200ml", brand: "Amul", category: "Dairy & Eggs", price: 15, size: "200ml" }
  ],
  dudh: [
    { id: "p1", name: "Amul Taaza Fresh Milk 1L", brand: "Amul", category: "Dairy & Eggs", price: 68, size: "1L" },
    { id: "p8", name: "Nestlé A+ Fresh Cream 200ml", brand: "Nestlé", category: "Dairy & Eggs", price: 65, size: "200ml" },
    { id: "p9", name: "Amul Masti Spiced Buttermilk 200ml", brand: "Amul", category: "Dairy & Eggs", price: 15, size: "200ml" }
  ],
  दूध: [
    { id: "p1", name: "Amul Taaza Fresh Milk 1L", brand: "Amul", category: "Dairy & Eggs", price: 68, size: "1L" },
    { id: "p8", name: "Nestlé A+ Fresh Cream 200ml", brand: "Nestlé", category: "Dairy & Eggs", price: 65, size: "200ml" },
    { id: "p9", name: "Amul Masti Spiced Buttermilk 200ml", brand: "Amul", category: "Dairy & Eggs", price: 15, size: "200ml" }
  ],
  bread: [
    { id: "p13", name: "Britannia Brown Bread 400g", brand: "Britannia", category: "Bakery & Snacks", price: 45, size: "400g" },
    { id: "p22", name: "Modern Whole Wheat Bread 400g", brand: "Modern", category: "Bakery & Snacks", price: 48, size: "400g" }
  ],
  ब्रेड: [
    { id: "p13", name: "Britannia Brown Bread 400g", brand: "Britannia", category: "Bakery & Snacks", price: 45, size: "400g" },
    { id: "p22", name: "Modern Whole Wheat Bread 400g", brand: "Modern", category: "Bakery & Snacks", price: 48, size: "400g" }
  ],
  toothpaste: [
    { id: "p69", name: "Colgate Strong Teeth Toothpaste 200g", brand: "Colgate", category: "Personal Care", price: 110, size: "200g" },
    { id: "p74", name: "Pepsodent Germicheck Toothpaste 150g", brand: "Pepsodent", category: "Personal Care", price: 85, size: "150g" }
  ],
  soap: [
    { id: "p70", name: "Dettol Antiseptic Bathing Soap 125g", brand: "Dettol", category: "Personal Care", price: 48, size: "125g" },
    { id: "p75", name: "Pears Transparent Soap 125g", brand: "Pears", category: "Personal Care", price: 62, size: "125g" }
  ],
  sabun: [
    { id: "p70", name: "Dettol Antiseptic Bathing Soap 125g", brand: "Dettol", category: "Personal Care", price: 48, size: "125g" },
    { id: "p75", name: "Pears Transparent Soap 125g", brand: "Pears", category: "Personal Care", price: 62, size: "125g" }
  ],
  tea: [
    { id: "p57", name: "Tata Tea Premium 500g", brand: "Tata", category: "Beverages & Tea", price: 240, size: "500g" },
    { id: "p62", name: "Taj Mahal Tea 500g", brand: "Brooke Bond", category: "Beverages & Tea", price: 350, size: "500g" }
  ],
  chai: [
    { id: "p57", name: "Tata Tea Premium 500g", brand: "Tata", category: "Beverages & Tea", price: 240, size: "500g" },
    { id: "p62", name: "Taj Mahal Tea 500g", brand: "Brooke Bond", category: "Beverages & Tea", price: 350, size: "350g" }
  ],
  coffee: [
    { id: "p58", name: "Nescafé Classic Instant Coffee 50g", brand: "Nescafé", category: "Beverages & Tea", price: 175, size: "50g" },
    { id: "p63", name: "Bru Instant Coffee 100g", brand: "Bru", category: "Beverages & Tea", price: 190, size: "100g" }
  ],
  oil: [
    { id: "p42", name: "Fortune Kachi Ghani Mustard Oil 1L", brand: "Fortune", category: "Cooking & Spices", price: 155, size: "1L" },
    { id: "p48", name: "Fortune Sunlite Sunflower Oil 1L", brand: "Fortune", category: "Cooking & Spices", price: 140, size: "1L" },
    { id: "p49", name: "Saffola Gold Cooking Oil 1L", brand: "Saffola", category: "Cooking & Spices", price: 175, size: "1L" }
  ],
  tel: [
    { id: "p42", name: "Fortune Kachi Ghani Mustard Oil 1L", brand: "Fortune", category: "Cooking & Spices", price: 155, size: "1L" },
    { id: "p48", name: "Fortune Sunlite Sunflower Oil 1L", brand: "Fortune", category: "Cooking & Spices", price: 140, size: "1L" },
    { id: "p49", name: "Saffola Gold Cooking Oil 1L", brand: "Saffola", category: "Cooking & Spices", price: 175, size: "1L" }
  ]
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

  const segments = (cleanBody || transcript).split(/\b(?:and|aur|tatha|evam|plus|,)\b/i).map(s => s.trim()).filter(Boolean);

  const parsedItems = (segments.length ? segments : [cleanBody || transcript]).map((seg) => {
    let quantity = 1;
    let unit = "unit";
    let itemName = seg.trim();

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

    itemName = itemName
      .replace(/^(of|ka|ki|ke)\s+/i, "")
      .replace(SUFFIX_REGEX, "")
      .replace(PREFIX_REGEX, "")
      .trim() || seg;

    return {
      name: itemName,
      quantity: quantity || 1,
      unit: unit || "unit"
    };
  });

  const isHi = language === "hi-IN" || /[^\x00-\x7F]/.test(transcript) || /\b(aur|daalo|karo|chahiye)\b/i.test(lower);

  // CHOICE DISAMBIGUATION: If single item and generic term spoken without specific brand
  if (parsedItems.length === 1) {
    const rawName = parsedItems[0].name.toLowerCase();
    const hasBrand = SPECIFIC_BRANDS.some(b => rawName.includes(b));
    if (!hasBrand) {
      const matchedKey = Object.keys(GENERIC_CHOICES).find(k => rawName.includes(k));
      if (matchedKey) {
        const choices = GENERIC_CHOICES[matchedKey];
        return {
          action: "PRODUCT_SELECTION_REQUIRED",
          pendingItems: parsedItems,
          results: choices,
          spokenResponse: isHi
            ? `Aapke liye ${choices.length} options hain. Kaunsa product add karna chahenge?`
            : `I found ${choices.length} options. Which product would you like to add?`
        };
      }
    }
  }

  // Standard direct add for specific or non-ambiguous items
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
    if (res && res.action && (res.items || res.item || res.results)) {
      return res;
    }
    throw new Error("No backend resolution");
  } catch (err) {
    console.warn("Voice command API unreachable, using resilient client NLP parser:", err.message);
    return parseClientVoiceCommand(transcript, language);
  }
}