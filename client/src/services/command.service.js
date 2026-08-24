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
  "litres", "liters", "litre", "liter", "ltr", "lt", "lit", "l",
  "kilograms", "kilogram", "kilos", "kilo", "kgs", "kg",
  "grams", "gram", "gms", "gm", "g",
  "ml", "packets", "packet", "packs", "pack", "bottles", "bottle", "botal",
  "pieces", "piece", "pcs", "pc", "boxes", "box", "dozens", "dozen", "dazan", "darjan",
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

// Comprehensive Store Catalog Dataset & Keyword Index
const CATALOG_KEYWORDS = [
  // Dairy & Eggs
  { keywords: ["milk", "doodh", "dudh", "दूध", "almond milk", "taaza", "cream", "buttermilk", "chaas", "lassi"], isGeneric: true, genericKey: "milk" },
  { keywords: ["egg", "eggs", "anda", "ande", "अंडे", "अंडा", "farm fresh eggs"], defaultItem: { name: "Farm Fresh Eggs (6 pcs)", category: "Dairy & Eggs", unit: "pack", price: 55 } },
  { keywords: ["bread", "ब्रेड", "पाव", "bun", "brown bread", "wheat bread"], isGeneric: true, genericKey: "bread" },
  { keywords: ["butter", "makkan", "makkhan", "मक्खन", "amul butter"], defaultItem: { name: "Amul Butter 100g", category: "Dairy & Eggs", unit: "pack", price: 58 } },
  { keywords: ["paneer", "पनीर", "malai paneer"], defaultItem: { name: "Amul Fresh Malai Paneer 200g", category: "Dairy & Eggs", unit: "pack", price: 95 } },
  { keywords: ["dahi", "curd", "दही", "yogurt", "epigamia"], defaultItem: { name: "Mother Dairy Classic Dahi 400g", category: "Dairy & Eggs", unit: "pack", price: 40 } },
  { keywords: ["cheese", "चीज", "cheese slices", "cheese cubes"], defaultItem: { name: "Milky Mist Cheese Slices 200g", category: "Dairy & Eggs", unit: "pack", price: 145 } },
  { keywords: ["ghee", "घी", "cow ghee", "desi ghee"], defaultItem: { name: "Amul Pure Cow Ghee 500ml", category: "Cooking & Spices", unit: "botal", price: 325 } },

  // Bakery & Snacks
  { keywords: ["chips", "lays", "potato chips", "चिप्स"], defaultItem: { name: "Lay's Magic Masala Potato Chips 50g", category: "Bakery & Snacks", unit: "pack", price: 20 } },
  { keywords: ["kurkure", "कुरकुरे"], defaultItem: { name: "Kurkure Masala Munch 90g", category: "Bakery & Snacks", unit: "pack", price: 20 } },
  { keywords: ["biscuit", "biscuits", "बिस्किट", "oreo", "parle", "milk bikis", "dark fantasy", "cookie", "cookies"], defaultItem: { name: "Britannia Milk Bikis 150g", category: "Bakery & Snacks", unit: "pack", price: 30 } },
  { keywords: ["bhujia", "sev", "namkeen", "भुजिया", "नमकीन"], defaultItem: { name: "Haldiram Bhujia Sev 200g", category: "Bakery & Snacks", unit: "pack", price: 65 } },
  { keywords: ["popcorn", "पॉपकॉर्न"], defaultItem: { name: "Act II Butter Popcorn 130g", category: "Bakery & Snacks", unit: "pack", price: 45 } },
  { keywords: ["soan papdi", "सोन पापड़ी"], defaultItem: { name: "Haldiram Soan Papdi 500g", category: "Bakery & Snacks", unit: "pack", price: 140 } },

  // Fruits & Vegetables
  { keywords: ["apple", "apples", "seb", "सेब"], defaultItem: { name: "Fresh Shimla Apples 1kg", category: "Fruits & Vegetables", unit: "kg", price: 140 } },
  { keywords: ["banana", "bananas", "kela", "kele", "केला", "केले"], defaultItem: { name: "Fresh Robusta Bananas 1 Dozen", category: "Fruits & Vegetables", unit: "dozen", price: 60 } },
  { keywords: ["tomato", "tomatoes", "tamatar", "टमाटर"], defaultItem: { name: "Hybrid Red Tomatoes 1kg", category: "Fruits & Vegetables", unit: "kg", price: 35 } },
  { keywords: ["potato", "potatoes", "aloo", "आलू"], defaultItem: { name: "Fresh Jyoti Potatoes 1kg", category: "Fruits & Vegetables", unit: "kg", price: 30 } },
  { keywords: ["capsicum", "shimla mirch", "शिमला मिर्च"], defaultItem: { name: "Fresh Green Capsicum 250g", category: "Fruits & Vegetables", unit: "pack", price: 25 } },
  { keywords: ["onion", "onions", "pyaaz", "pyaz", "प्याज"], defaultItem: { name: "Nashik Red Onions 1kg", category: "Fruits & Vegetables", unit: "kg", price: 40 } },
  { keywords: ["chilli", "chillies", "mirch", "hari mirch", "हरी मिर्च"], defaultItem: { name: "Fresh Green Chillies 100g", category: "Fruits & Vegetables", unit: "pack", price: 15 } },
  { keywords: ["ginger", "adrak", "अदरक"], defaultItem: { name: "Fresh Ginger Adrak 250g", category: "Fruits & Vegetables", unit: "pack", price: 35 } },
  { keywords: ["garlic", "lahsun", "लहसुन"], defaultItem: { name: "Fresh Garlic Lahsun 250g", category: "Fruits & Vegetables", unit: "pack", price: 65 } },
  { keywords: ["lemon", "lemons", "nimbu", "नींबू"], defaultItem: { name: "Fresh Indian Lemons (Pack of 4)", category: "Fruits & Vegetables", unit: "pack", price: 20 } },
  { keywords: ["spinach", "palak", "पालक"], defaultItem: { name: "Fresh Spinach Palak 250g", category: "Fruits & Vegetables", unit: "pack", price: 25 } },
  { keywords: ["broccoli", "ब्रोकोली", "gobhi", "phool gobhi"], defaultItem: { name: "Fresh Broccoli 500g", category: "Fruits & Vegetables", unit: "pack", price: 80 } },
  { keywords: ["watermelon", "tarbuz", "tarbooj", "तरबूज"], defaultItem: { name: "Fresh Seedless Watermelon 2kg", category: "Fruits & Vegetables", unit: "piece", price: 90 } },
  { keywords: ["papaya", "papita", "पपीता"], defaultItem: { name: "Fresh Papaya 1kg", category: "Fruits & Vegetables", unit: "kg", price: 55 } },
  { keywords: ["pomegranate", "anaar", "anar", "अनार"], defaultItem: { name: "Fresh Pomegranate Anaar 1kg", category: "Fruits & Vegetables", unit: "kg", price: 180 } },
  { keywords: ["mango", "aam", "आम", "alphonso"], defaultItem: { name: "Fresh Alphonsos / Mangoes 1kg", category: "Fruits & Vegetables", unit: "kg", price: 150 } },

  // Cooking & Spices
  { keywords: ["oil", "tel", "तेल", "mustard oil", "sunflower oil", "cooking oil", "fortune oil", "saffola"], isGeneric: true, genericKey: "oil" },
  { keywords: ["salt", "namak", "नमक", "tata salt"], defaultItem: { name: "Tata Salt Vacuum Evaporated 1kg", category: "Cooking & Spices", unit: "kg", price: 28 } },
  { keywords: ["turmeric", "haldi", "हल्दी"], defaultItem: { name: "Catch Turmeric Haldi Powder 100g", category: "Cooking & Spices", unit: "pack", price: 42 } },
  { keywords: ["chilli powder", "lal mirch", "लाल मिर्च पाउडर"], defaultItem: { name: "Everest Red Chilli Powder 100g", category: "Cooking & Spices", unit: "pack", price: 52 } },
  { keywords: ["dhaniya", "coriander powder", "धनिया पाउडर"], defaultItem: { name: "Everest Coriander Dhaniya Powder 100g", category: "Cooking & Spices", unit: "pack", price: 38 } },
  { keywords: ["garam masala", "masala", "kitchen king", "मसाला", "गरम मसाला"], defaultItem: { name: "MDH Garam Masala 100g", category: "Cooking & Spices", unit: "pack", price: 90 } },
  { keywords: ["jeera", "cumin", "जीरा"], defaultItem: { name: "Catch Cumin Jeera Whole 100g", category: "Cooking & Spices", unit: "pack", price: 75 } },
  { keywords: ["jaggery", "gur", "gud", "गुड़"], defaultItem: { name: "Organic Tattva Jaggery Powder 500g", category: "Cooking & Spices", unit: "pack", price: 65 } },
  { keywords: ["sugar", "cheeni", "shakkar", "चीनी", "शक्कर"], defaultItem: { name: "Pure Refined Sugar 1kg", category: "Cooking & Spices", unit: "kg", price: 48 } },
  { keywords: ["sauce", "ketchup", "soy sauce", "सॉस"], defaultItem: { name: "Ching's Secret Dark Soy Sauce 210g", category: "Cooking & Spices", unit: "botal", price: 55 } },

  // Beverages & Tea
  { keywords: ["tea", "chai", "चाय", "चाय पत्ती", "taj mahal", "tata tea"], isGeneric: true, genericKey: "tea" },
  { keywords: ["coffee", "कॉफी", "कॉफ़ी", "nescafe", "bru"], isGeneric: true, genericKey: "coffee" },
  { keywords: ["water", "pani", "paani", "पानी", "bisleri"], defaultItem: { name: "Bisleri Mineral Water 1L", category: "Beverages & Tea", unit: "L", price: 20 } },
  { keywords: ["coconut water", "nariyal pani", "नारियल पानी"], defaultItem: { name: "Paper Boat Tender Coconut Water 200ml", category: "Beverages & Tea", unit: "botal", price: 50 } },
  { keywords: ["juice", "frooti", "real juice", "orange juice", "mango juice", "जूस"], defaultItem: { name: "Real Fruit Power Orange Juice 1L", category: "Beverages & Tea", unit: "L", price: 115 } },
  { keywords: ["coke", "coca cola", "coca-cola", "pepsi", "sprite", "soda", "cold drink", "red bull"], defaultItem: { name: "Coca-Cola Soft Drink 750ml", category: "Beverages & Tea", unit: "botal", price: 45 } },

  // Personal Care
  { keywords: ["toothpaste", "colgate", "pepsodent", "टूथपेस्ट"], isGeneric: true, genericKey: "toothpaste" },
  { keywords: ["soap", "sabun", "साबुन", "dettol", "pears", "lux"], isGeneric: true, genericKey: "soap" },
  { keywords: ["shampoo", "dove", "head & shoulders", "शैम्पू"], defaultItem: { name: "Dove Intense Repair Shampoo 180ml", category: "Personal Care", unit: "botal", price: 165 } },
  { keywords: ["hair oil", "parachute", "nariyal tel"], defaultItem: { name: "Parachute 100% Pure Coconut Hair Oil 200ml", category: "Personal Care", unit: "botal", price: 90 } },
  { keywords: ["moisturizer", "nivea", "face wash", "body lotion", "vaseline"], defaultItem: { name: "Nivea Soft Light Moisturizer 100ml", category: "Personal Care", unit: "pack", price: 185 } },
  { keywords: ["sanitizer", "savlon", "सैनिटाइजर"], defaultItem: { name: "Savlon Hand Sanitizer 100ml", category: "Personal Care", unit: "botal", price: 50 } },
  { keywords: ["razor", "blade", "gillette"], defaultItem: { name: "Gillette Mach3 Razor Cartridge", category: "Personal Care", unit: "pack", price: 250 } },

  // Grains & Pulses
  { keywords: ["rice", "chawal", "चावल", "basmati", "india gate", "daawat"], defaultItem: { name: "Daawat Rozana Super Basmati Rice 1kg", category: "Grains & Pulses", unit: "kg", price: 95 } },
  { keywords: ["atta", "aashirvaad", "flour", "wheat", "आटा"], defaultItem: { name: "Aashirvaad Whole Wheat Atta 5kg", category: "Grains & Pulses", unit: "kg", price: 235 } },
  { keywords: ["toor dal", "chana dal", "dal", "dhal", "दाल", "arhar dal"], defaultItem: { name: "Tata Sampann Unpolished Toor Dal 1kg", category: "Grains & Pulses", unit: "kg", price: 165 } },
  { keywords: ["poha", "पोहा"], defaultItem: { name: "Fortune Thick Poha 500g", category: "Grains & Pulses", unit: "pack", price: 42 } },
  { keywords: ["rajma", "राजमा"], defaultItem: { name: "Rajma Chitra Red Kidney Beans 500g", category: "Grains & Pulses", unit: "pack", price: 85 } }
];

export function findCatalogMatch(itemName) {
  const clean = (itemName || "").toLowerCase().trim();
  for (const entry of CATALOG_KEYWORDS) {
    if (entry.keywords.some(kw => clean === kw || clean.includes(kw) || kw.includes(clean))) {
      return entry;
    }
  }
  return null;
}

function stripFillers(text) {
  let str = (text || "").trim();
  let changed = true;
  let iterations = 0;

  while (changed && iterations < 6) {
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

const NAV_PAGES = [
  {
    target: "categories",
    name: "Categories",
    hindiName: "Categories",
    patterns: [
      /categories|category|shreniyan|shreni|shreniya|कैटेगरी|कैटेगरीज|श्रेणियां|श्रेणी/i
    ]
  },
  {
    target: "shopping-list",
    name: "Shopping List",
    hindiName: "Shopping List",
    patterns: [
      /shopping list|my list|the list|cart|shopping cart|meri list|लिस्ट|कार्ट|शॉपिंग लिस्ट/i
    ]
  },
  {
    target: "suggestions",
    name: "Smart Suggestions",
    hindiName: "Smart Suggestions",
    patterns: [
      /suggestions|suggestion|recommendations|recommend|sujhav|smart suggestions|सुझाव|सजेशन/i
    ]
  },
  {
    target: "history",
    name: "History",
    hindiName: "History",
    patterns: [
      /history|purchase history|order history|past orders|itihas|purani shopping|हिस्ट्री|इतिहास/i
    ]
  },
  {
    target: "search",
    name: "Search",
    hindiName: "Search",
    patterns: [
      /^search$|^search page$|search page|khoj|सर्च पेज/i
    ]
  },
  {
    target: "home",
    name: "Home",
    hindiName: "Home",
    patterns: [
      /home|dashboard|main page|home page|होम|डैशबोर्ड/i
    ]
  }
];

function checkNavigationCommand(rawTranscript, isHi) {
  const text = (rawTranscript || "").toLowerCase().trim();

  const isNavIntent = /(?:open|kholo|dikhao|show|go to|chalo|le chalo|par jao|khol do|kholna|khol|view|navigate|खोलो|दिखाओ|जाओ|खोल दो|खोल)/i.test(text);

  if (!isNavIntent && !/^(categories|category|shopping list|history|suggestions|home|dashboard)$/i.test(text)) {
    return null;
  }

  for (const page of NAV_PAGES) {
    if (page.patterns.some(p => p.test(text))) {
      return {
        action: "NAVIGATE_PAGE",
        target: page.target,
        pageName: page.name,
        spokenResponse: isHi
          ? `${page.hindiName} page khol rahe hain.`
          : `Opening ${page.name}.`
      };
    }
  }

  return null;
}

export function parseClientVoiceCommand(rawTranscript, language) {
  const transcript = (rawTranscript || "").trim();
  const lower = transcript.toLowerCase();
  const isHi = language === "hi-IN" || /[^\x00-\x7F]/.test(transcript) || /\b(aur|daalo|karo|chahiye|do|daal)\b/i.test(lower);

  // 1. PAGE NAVIGATION action (e.g. "open categories", "categories kholo", "open shopping list")
  const navMatch = checkNavigationCommand(transcript, isHi);
  if (navMatch) {
    return navMatch;
  }

  // 2. REMOVE action
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

  let parsedItems = [];

  for (const seg of (segments.length ? segments : [cleanBody])) {
    let quantity = 1;
    let unit = "unit";
    let itemName = seg.trim();

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

    // Check catalog availability
    const catalogMatch = findCatalogMatch(itemName);

    if (!catalogMatch) {
      // Item does NOT exist in catalog/dataset — tell user it is not available!
      return {
        action: "ITEM_NOT_AVAILABLE",
        item: itemName,
        message: isHi ? `"${itemName}" hamare grocery store par uplabdh nahi hai.` : `"${itemName}" is not available in our grocery catalog.`,
        spokenResponse: isHi ? `Maaf kijiye, ${itemName} hamare store par uplabdh nahi hai.` : `Sorry, ${itemName} is not available in our store catalog.`
      };
    }

    // Generic item that needs user product selection
    if (catalogMatch.isGeneric && GENERIC_CHOICES[catalogMatch.genericKey]) {
      const choices = GENERIC_CHOICES[catalogMatch.genericKey];
      return {
        action: "PRODUCT_SELECTION_REQUIRED",
        pendingItems: [{ name: itemName, quantity, unit }],
        results: choices,
        spokenResponse: isHi
          ? `Aapke liye ${choices.length} options hain. Kaunsa product add karna chahenge?`
          : `I found ${choices.length} options. Which product would you like to add?`
      };
    }

    // Catalog matched item
    if (catalogMatch.defaultItem) {
      parsedItems.push({
        name: catalogMatch.defaultItem.name,
        quantity: quantity || 1,
        unit: unit !== "unit" ? unit : catalogMatch.defaultItem.unit,
        category: catalogMatch.defaultItem.category,
        price: catalogMatch.defaultItem.price
      });
    } else {
      parsedItems.push({
        name: itemName,
        quantity: quantity || 1,
        unit: unit || "unit"
      });
    }
  }

  // Fallback if parsing returned empty
  if (parsedItems.length === 0) {
    return {
      action: "CLARIFICATION_REQUIRED",
      message: isHi ? "Kya add karna chahte hain? Kripya grocery item ka naam bolein, jaise 1 litre doodh ya 6 ande." : "What item would you like to add? Please specify a grocery item, like 1 litre milk or 6 eggs.",
      spokenResponse: isHi ? "Kripya grocery item ka naam bolein, jaise 1 litre doodh." : "Please specify what item you would like to add."
    };
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
  if (clientParsed && (clientParsed.action === "PRODUCT_SELECTION_REQUIRED" || clientParsed.action === "CLARIFICATION_REQUIRED" || clientParsed.action === "ITEM_NOT_AVAILABLE")) {
    return clientParsed;
  }

  try {
    const res = await post('/commands', { transcript, language });
    if (res && res.action && (res.action === "PRODUCT_SELECTION_REQUIRED" || res.action === "CLARIFICATION_REQUIRED" || res.action === "ITEM_NOT_AVAILABLE")) {
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