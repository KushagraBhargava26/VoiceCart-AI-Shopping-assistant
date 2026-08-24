import { post } from './api.js';

const NUMBER_WORDS = {
  one: 1, ek: 1, a: 1, an: 1, '1': 1, '१': 1, 'एक': 1,
  two: 2, do: 2, '2': 2, '२': 2, 'दो': 2,
  three: 3, teen: 3, '3': 3, '३': 3, 'तीन': 3,
  four: 4, char: 4, chaar: 4, '4': 4, '४': 4, 'चार': 4,
  five: 5, paanch: 5, panch: 5, '5': 5, '५': 5, 'पाँच': 5, 'पांच': 5,
  six: 6, chhe: 6, che: 6, '6': 6, '६': 6, 'छह': 6, 'छः': 6,
  seven: 7, saat: 7, '7': 7, '७': 7, 'सात': 7,
  eight: 8, aath: 8, '8': 8, '८': 8, 'आठ': 8,
  nine: 9, nau: 9, '9': 9, '९': 9, 'नौ': 9,
  ten: 10, das: 10, '10': 10, '१०': 10, 'दस': 10,
  half: 0.5, aadha: 0.5, adha: 0.5, 'आधा': 0.5,
  dedh: 1.5, 'डेढ़': 1.5,
  dhai: 2.5, 'ढाई': 2.5,
};

const VALID_UNITS = [
  "l", "lt", "ltr", "lit", "liter", "litres", "litre", "liters",
  "kg", "kilo", "kilogram", "kilograms", "kgs",
  "g", "gm", "gms", "gram", "grams",
  "ml", "pack", "packet", "packets", "botal", "bottle", "bottles",
  "pcs", "pc", "piece", "pieces", "box", "boxes", "dozen", "dozens", "dazan", "darjan",
  "लीटर", "लिटर", "ली", "किलो", "किग्रा", "केजी", "ग्राम", "ग्रा", "पैकेट", "पैक", "बोतल", "पीस", "दर्जन", "डिब्बा", "डब्बा"
];

const PREFIXES = [
  "bhai mere dost", "bhai mere", "bhaiya", "bhai", "bro", "yaar", "dost",
  "arre bhai", "arre yaara", "arre yaar", "arre", "are", "arey", "abey", "abe",
  "ek kaam kar", "ek kaam karo", "zara", "zara sa", "kripya", "please",
  "sun na", "suno na", "suno", "sun",
  "i want to add", "i need to add", "please add", "can you add", "could you add",
  "add to cart", "add to list", "add me", "add", "put", "buy", "need", "want", "get",
  "i want", "i need", "chahiye", "daal", "daalo", "karo", "bhejo", "rakho", "laao", "lano", "le aao",
  "mujhe chahiye", "mujhe",
  "भाई मेरे", "भैया", "भाई", "यार", "दोस्त", "अरे", "सुनो", "सुन", "कृपया", "जरा",
  "ऐड करो", "ऐड कर दो", "ऐड कर", "ऐड", "डालो", "डाल दो", "डाल", "चाहिए", "कीजिये", "मुझे चाहिए", "मुझे", "लाओ", "ले आओ"
];

const SUFFIXES = [
  "to my shopping list", "to my cart", "to the cart", "to the list", "to cart", "to list",
  "in my cart", "in cart", "in my list", "in list", "on my list",
  "list mein", "list me", "cart mein", "cart me", "bag mein", "bag me",
  "add kar do", "add kar de", "add karo", "add kr do", "add krde", "add kro", "add kar", "add kr", "add",
  "daal kar do", "daal kar", "daal do", "daal de", "daalo", "dal do", "dalo", "daal dena", "daalna", "daal",
  "kar do", "kar de", "karo", "kr do", "kr de", "kro", "kar", "kr", "de", "do",
  "bhej do", "rakho", "laao", "la de", "la do", "lao", "lana", "le aao", "le aa", "le aana", "chahiye", "kharidna hai", "lena hai",
  "joḍo", "jodo", "jod do",
  "लिस्ट में डालो", "लिस्ट में डाल दो", "लिस्ट में", "कार्ट में डालो", "कार्ट में",
  "ऐड करो", "ऐड कर दो", "ऐड कर दे", "ऐड कर", "ऐड", "कर दो", "कर दे", "करो", "कर", "कीजिये",
  "डाल दो", "डाल दे", "डालो", "डाल देना", "डालना", "डाल", "लाओ", "ले आओ", "ले आ", "ला दे", "लाना",
  "चाहिए", "खरीदना है", "लेना है", "जोड़ो", "जोड़ दो", "रखो"
];

const CONVERSATIONAL_PHRASES = [
  "mere dost", "dost", "yaar", "bhai", "bhaiya", "bro", "bhai mere", "bhai mere dost",
  "kya haal hai", "kaise ho", "kaise ho bhai", "kya chal raha hai", "kuch bhi",
  "hello", "hi", "hey", "testing", "test", "bol", "bol na", "boliye",
  "kya", "kuch nahi", "kuch nhi", "nahi", "nhi", "haan", "suno", "sun",
  "theek hai", "thik hai", "ok", "okay", "bye", "good morning", "good night", "kya ho raha hai",
  "kaisa hai", "kaisa h", "theek h", "thik h", "accha", "acha",
  "मेरे दोस्त", "दोस्त", "यार", "भाई", "भैया", "कैसे हो", "क्या हाल है", "हेलो", "हाय", "टेस्ट", "ठीक है", "अच्छा"
];

const NOISE_WORDS = [
  "add", "adb", "ad", "app", "adding", "put", "buy", "need", "want", "get",
  "chahiye", "daal", "daalo", "karo", "bhejo", "rakho", "laao", "item", "unit",
  "mere dost", "dost", "bhai", "yaar", "bhaiya",
  "ऐड", "डालो", "करो", "लाओ"
];

const PHONETIC_CORRECTIONS = {
  "ande": { name: "Farm Fresh Eggs (6 pcs)", category: "Dairy & Eggs", unit: "pack", price: 55 },
  "anda": { name: "Farm Fresh Eggs (6 pcs)", category: "Dairy & Eggs", unit: "pack", price: 55 },
  "egg": { name: "Farm Fresh Eggs (6 pcs)", category: "Dairy & Eggs", unit: "pack", price: 55 },
  "eggs": { name: "Farm Fresh Eggs (6 pcs)", category: "Dairy & Eggs", unit: "pack", price: 55 },
  "अंडे": { name: "Farm Fresh Eggs (6 pcs)", category: "Dairy & Eggs", unit: "pack", price: 55 },
  "अंडा": { name: "Farm Fresh Eggs (6 pcs)", category: "Dairy & Eggs", unit: "pack", price: 55 },
  "amul butter": { name: "Amul Butter 100g", category: "Dairy & Eggs", unit: "pack", price: 58 },
  "butter": { name: "Amul Butter 100g", category: "Dairy & Eggs", unit: "pack", price: 58 },
  "makkan": { name: "Amul Butter 100g", category: "Dairy & Eggs", unit: "pack", price: 58 },
  "मक्खन": { name: "Amul Butter 100g", category: "Dairy & Eggs", unit: "pack", price: 58 },
  "pani": { name: "Bisleri Mineral Water 1L", category: "Beverages", unit: "L", price: 20 },
  "paani": { name: "Bisleri Mineral Water 1L", category: "Beverages", unit: "L", price: 20 },
  "water": { name: "Bisleri Mineral Water 1L", category: "Beverages", unit: "L", price: 20 },
  "पानी": { name: "Bisleri Mineral Water 1L", category: "Beverages", unit: "L", price: 20 },
  "dahi": { name: "Mother Dairy Dahi 400g", category: "Dairy & Eggs", unit: "pack", price: 40 },
  "curd": { name: "Mother Dairy Dahi 400g", category: "Dairy & Eggs", unit: "pack", price: 40 },
  "दही": { name: "Mother Dairy Dahi 400g", category: "Dairy & Eggs", unit: "pack", price: 40 },
  "paneer": { name: "Amul Malai Paneer 200g", category: "Dairy & Eggs", unit: "pack", price: 95 },
  "पनीर": { name: "Amul Malai Paneer 200g", category: "Dairy & Eggs", unit: "pack", price: 95 },
  "rice": { name: "Basmati Rice 1kg", category: "Grains & Staples", unit: "kg", price: 65 },
  "chawal": { name: "Basmati Rice 1kg", category: "Grains & Staples", unit: "kg", price: 65 },
  "चावल": { name: "Basmati Rice 1kg", category: "Grains & Staples", unit: "kg", price: 65 },
  "atta": { name: "Aashirvaad Whole Wheat Atta 1kg", category: "Grains & Staples", unit: "kg", price: 55 },
  "आटा": { name: "Aashirvaad Whole Wheat Atta 1kg", category: "Grains & Staples", unit: "kg", price: 55 },
  "namak": { name: "Tata Salt 1kg", category: "Cooking & Spices", unit: "kg", price: 28 },
  "salt": { name: "Tata Salt 1kg", category: "Cooking & Spices", unit: "kg", price: 28 },
  "नमक": { name: "Tata Salt 1kg", category: "Cooking & Spices", unit: "kg", price: 28 }
};

const SPECIFIC_BRANDS = [
  "amul", "britannia", "nestle", "nestlé", "bisleri", "colgate", "dettol",
  "tata", "nescafe", "nescafé", "modern", "fortune", "saffola", "pears",
  "taj mahal", "mother dairy", "haldiram", "lays", "lay's", "kurkure", "almond"
];

const MILK_OPTIONS = [
  { id: "p1", name: "Amul Taaza Fresh Milk 1L", brand: "Amul", category: "Dairy & Eggs", price: 68, size: "1L" },
  { id: "p80_alm", name: "Almond Milk 1L", brand: "Raw Pressery", category: "Dairy & Eggs", price: 180, size: "1L" },
  { id: "p4", name: "Mother Dairy Classic Dahi 400g", brand: "Mother Dairy", category: "Dairy & Eggs", price: 40, size: "400g" },
  { id: "p8", name: "Nestlé A+ Fresh Cream 200ml", brand: "Nestlé", category: "Dairy & Eggs", price: 65, size: "200ml" },
  { id: "p9", name: "Amul Masti Spiced Buttermilk 200ml", brand: "Amul", category: "Dairy & Eggs", price: 15, size: "200ml" }
];

const BREAD_OPTIONS = [
  { id: "p13", name: "Britannia Brown Bread 400g", brand: "Britannia", category: "Bakery & Snacks", price: 45, size: "400g" },
  { id: "p22", name: "Modern Whole Wheat Bread 400g", brand: "Modern", category: "Bakery & Snacks", price: 48, size: "400g" }
];

const TEA_OPTIONS = [
  { id: "p57", name: "Tata Tea Premium 500g", brand: "Tata", category: "Beverages & Tea", price: 240, size: "500g" },
  { id: "p62", name: "Taj Mahal Tea 500g", brand: "Brooke Bond", category: "Beverages & Tea", price: 350, size: "350g" }
];

const COFFEE_OPTIONS = [
  { id: "p58", name: "Nescafé Classic Instant Coffee 50g", brand: "Nescafé", category: "Beverages & Tea", price: 175, size: "50g" },
  { id: "p63", name: "Bru Instant Coffee 100g", brand: "Bru", category: "Beverages & Tea", price: 190, size: "100g" }
];

const SOAP_OPTIONS = [
  { id: "p70", name: "Dettol Antiseptic Bathing Soap 125g", brand: "Dettol", category: "Personal Care", price: 48, size: "125g" },
  { id: "p75", name: "Pears Transparent Soap 125g", brand: "Pears", category: "Personal Care", price: 62, size: "125g" }
];

const TOOTHPASTE_OPTIONS = [
  { id: "p69", name: "Colgate Strong Teeth Toothpaste 200g", brand: "Colgate", category: "Personal Care", price: 110, size: "200g" },
  { id: "p74", name: "Pepsodent Germicheck Toothpaste 150g", brand: "Pepsodent", category: "Personal Care", price: 85, size: "150g" }
];

const OIL_OPTIONS = [
  { id: "p42", name: "Fortune Kachi Ghani Mustard Oil 1L", brand: "Fortune", category: "Cooking & Spices", price: 155, size: "1L" },
  { id: "p48", name: "Fortune Sunlite Sunflower Oil 1L", brand: "Fortune", category: "Cooking & Spices", price: 140, size: "1L" },
  { id: "p49", name: "Saffola Gold Cooking Oil 1L", brand: "Saffola", category: "Cooking & Spices", price: 175, size: "1L" }
];

const GENERIC_CHOICES = {
  milk: MILK_OPTIONS,
  doodh: MILK_OPTIONS,
  dudh: MILK_OPTIONS,
  "दूध": MILK_OPTIONS,
  bread: BREAD_OPTIONS,
  "ब्रेड": BREAD_OPTIONS,
  "पाव": BREAD_OPTIONS,
  tea: TEA_OPTIONS,
  chai: TEA_OPTIONS,
  "चाय": TEA_OPTIONS,
  "चाय पत्ती": TEA_OPTIONS,
  coffee: COFFEE_OPTIONS,
  "कॉफी": COFFEE_OPTIONS,
  "कॉफ़ी": COFFEE_OPTIONS,
  soap: SOAP_OPTIONS,
  sabun: SOAP_OPTIONS,
  "साबुन": SOAP_OPTIONS,
  toothpaste: TOOTHPASTE_OPTIONS,
  colgate: TOOTHPASTE_OPTIONS,
  "टूथपेस्ट": TOOTHPASTE_OPTIONS,
  "कोलगेट": TOOTHPASTE_OPTIONS,
  oil: OIL_OPTIONS,
  tel: OIL_OPTIONS,
  "तेल": OIL_OPTIONS,
  "सरसों का तेल": OIL_OPTIONS,
  "सरसों तेल": OIL_OPTIONS
};

function stripFillers(text) {
  let str = (text || "").trim();
  let changed = true;
  let iterations = 0;

  while (changed && iterations < 5) {
    changed = false;
    iterations++;

    for (const p of PREFIXES) {
      if (str.toLowerCase().startsWith(p.toLowerCase() + " ")) {
        str = str.slice(p.length).trim();
        changed = true;
        break;
      }
    }

    for (const s of SUFFIXES) {
      if (str.toLowerCase().endsWith(" " + s.toLowerCase()) || str.toLowerCase() === s.toLowerCase()) {
        str = str.slice(0, str.length - s.length).trim();
        changed = true;
        break;
      }
    }
  }

  return str.trim();
}

export function parseClientVoiceCommand(rawTranscript, language) {
  const transcript = (rawTranscript || "").trim();
  const lower = transcript.toLowerCase();
  const isHi = language === "hi-IN" || /[^\x00-\x7F]/.test(transcript) || /\b(aur|daalo|karo|chahiye|do|daal)\b/i.test(lower);

  // 1. REMOVE action
  if (/(remove|delete|hata|nikal|drop|mita|hatao|हटाओ|हटा दो|निकालो|हटा)/i.test(transcript)) {
    let cleanName = stripFillers(transcript);
    cleanName = cleanName.replace(/\b(remove|delete|hata|nikal|drop|mita|hatao|from my list|list se|karo|do|kar do|please)\b|(हटाओ|हटा दो|हटा देना|हटा|निकालो|लिस्ट से)/gi, "").trim() || "Item";

    return {
      action: "REMOVE_ITEM",
      item: cleanName,
      spokenResponse: isHi ? `${cleanName} shopping list se hata diya gaya hai.` : `Removed ${cleanName} from your shopping list.`
    };
  }

  // 2. SEARCH action
  if (/(search|find|dhundho|dikhao|look for|kholo|सर्च|ढूंढो|दिखाओ|खोजो)/i.test(transcript)) {
    let query = stripFillers(transcript);
    query = query.replace(/\b(search|find|dhundho|dikhao|look for|kholo|karo|please|under \d+|rupees|rupaye)\b|(सर्च|ढूंढो|दिखाओ|खोजो|करो)/gi, "").trim() || transcript;

    return {
      action: "NAVIGATE_SEARCH",
      query,
      spokenResponse: isHi ? `${query} search kar rahe hain.` : `Searching for ${query}.`
    };
  }

  // 3. Multi-item & Hindi/English NLP extraction for ADD_ITEM
  const cleanBody = stripFillers(transcript) || transcript;

  // NOISE & CONVERSATIONAL GUARD
  const cleanLower = cleanBody.toLowerCase().trim();
  const isConversational = CONVERSATIONAL_PHRASES.some(phrase => {
    return cleanLower === phrase || (cleanLower.includes(phrase) && cleanLower.length <= phrase.length + 4);
  });

  if (isConversational || !cleanBody || cleanBody.length < 2 || NOISE_WORDS.includes(cleanLower)) {
    return {
      action: "CLARIFICATION_REQUIRED",
      message: isHi ? "Kya add karna chahte hain? Kripya grocery item ka naam bolein, jaise 1 litre doodh ya 6 ande." : "What item would you like to add? Please specify a grocery item, like 1 litre milk or 6 eggs.",
      spokenResponse: isHi ? "Kripya grocery item ka naam bolein, jaise 1 litre doodh ya 6 ande." : "Please specify a grocery item, like 1 litre milk or 6 eggs."
    };
  }

  const segments = cleanBody.split(/\b(?:and|aur|tatha|evam|plus|,)\b|(?:और|तथा)/i).map(s => s.trim()).filter(Boolean);

  let parsedItems = (segments.length ? segments : [cleanBody]).map((seg) => {
    let quantity = 1;
    let unit = "unit";
    let itemName = seg.trim();

    // Check direct phonetic dictionary first (for eggs, butter, rice, salt, etc.)
    const directLookup = PHONETIC_CORRECTIONS[itemName.toLowerCase()];
    if (directLookup) {
      return {
        name: directLookup.name,
        quantity: 1,
        unit: directLookup.unit,
        category: directLookup.category,
        price: directLookup.price
      };
    }

    // Check digit prefix with explicit valid unit or without unit
    const unitPattern = VALID_UNITS.join("|");
    const digitWithUnitRegex = new RegExp(`^(\\d+|[०-९]+)\\s*(${unitPattern})\\s*(?:of|ka|ki|ke|का|की|के)?\\s*(.+)$`, 'i');
    const digitWithoutUnitRegex = new RegExp(`^(\\d+|[०-९]+)\\s*(?:of|ka|ki|ke|का|की|के)?\\s*(.+)$`, 'i');

    const mWith = seg.match(digitWithUnitRegex);
    const mWithout = seg.match(digitWithoutUnitRegex);

    if (mWith && mWith[3]) {
      let rawDigit = mWith[1];
      const devanagariMap = { '०': 0, '१': 1, '२': 2, '३': 3, '४': 4, '५': 5, '६': 6, '७': 7, '८': 8, '९': 9 };
      if (/[०-९]/.test(rawDigit)) {
        rawDigit = rawDigit.split('').map(d => devanagariMap[d] !== undefined ? devanagariMap[d] : d).join('');
      }
      quantity = parseFloat(rawDigit) || 1;
      unit = mWith[2].toLowerCase();
      itemName = mWith[3].trim();
    } else if (mWithout && mWithout[2]) {
      let rawDigit = mWithout[1];
      const devanagariMap = { '०': 0, '१': 1, '२': 2, '३': 3, '४': 4, '५': 5, '६': 6, '७': 7, '८': 8, '९': 9 };
      if (/[०-९]/.test(rawDigit)) {
        rawDigit = rawDigit.split('').map(d => devanagariMap[d] !== undefined ? devanagariMap[d] : d).join('');
      }
      quantity = parseFloat(rawDigit) || 1;
      unit = "unit";
      itemName = mWithout[2].trim();
    } else {
      const words = seg.split(/\s+/);
      const firstWord = (words[0] || "").toLowerCase();
      if (NUMBER_WORDS[firstWord] !== undefined) {
        quantity = NUMBER_WORDS[firstWord];
        const secondWord = (words[1] || "").toLowerCase();
        if (VALID_UNITS.includes(secondWord)) {
          unit = secondWord;
          itemName = words.slice(2).join(" ");
        } else {
          unit = "unit";
          itemName = words.slice(1).join(" ");
        }
      }
    }

    itemName = itemName.replace(/^(of|ka|ki|ke|का|की|के)\s+/i, "").trim() || seg;

    // Check phonetic lookup again after unit/quantity extraction
    const postLookup = PHONETIC_CORRECTIONS[itemName.toLowerCase()];
    if (postLookup) {
      return {
        name: postLookup.name,
        quantity: quantity || 1,
        unit: unit !== "unit" ? unit : postLookup.unit,
        category: postLookup.category,
        price: postLookup.price
      };
    }

    return {
      name: itemName,
      quantity: quantity || 1,
      unit: unit || "unit"
    };
  }).filter(item => {
    if (!item.name || item.name.trim().length < 2) return false;
    const clean = item.name.trim().toLowerCase();
    if (NOISE_WORDS.includes(clean)) return false;
    if (CONVERSATIONAL_PHRASES.includes(clean)) return false;
    return true;
  });

  // Fallback if parsing returned empty
  if (parsedItems.length === 0) {
    return {
      action: "CLARIFICATION_REQUIRED",
      message: isHi ? "Kya add karna chahte hain? Kripya grocery item ka naam bolein, jaise 1 litre doodh ya 6 ande." : "What item would you like to add? Please specify a grocery item, like 1 litre milk or 6 eggs.",
      spokenResponse: isHi ? "Kripya grocery item ka naam bolein, jaise 1 litre doodh." : "Please specify what item you would like to add."
    };
  }

  // CHOICE DISAMBIGUATION
  if (parsedItems.length === 1 && !parsedItems[0].category) {
    const rawName = parsedItems[0].name.toLowerCase();
    const hasBrand = SPECIFIC_BRANDS.some(b => rawName.includes(b));
    if (!hasBrand) {
      const matchedKey = Object.keys(GENERIC_CHOICES).find(k => rawName.includes(k) || k.includes(rawName));
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
  const clientParsed = parseClientVoiceCommand(transcript, language);
  if (clientParsed && (clientParsed.action === "PRODUCT_SELECTION_REQUIRED" || clientParsed.action === "CLARIFICATION_REQUIRED")) {
    return clientParsed;
  }

  try {
    const res = await post('/commands', { transcript, language });
    if (res && res.action && (res.action === "PRODUCT_SELECTION_REQUIRED" || res.action === "CLARIFICATION_REQUIRED")) {
      return res;
    }
    if (res && res.action && (res.items || res.item || res.results)) {
      return res;
    }
    return clientParsed;
  } catch (err) {
    console.warn("Voice command API unreachable, using resilient client NLP parser:", err.message);
    return clientParsed;
  }
}