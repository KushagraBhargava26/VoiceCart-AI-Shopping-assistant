import { get } from './api.js';

const FALLBACK_CATALOG = [
  // 🥛 Dairy & Eggs (12 items)
  { id: "p1", name: "Amul Taaza Fresh Milk 1L", brand: "Amul", category: "Dairy & Eggs", price: 68, currency: "₹", size: "1L" },
  { id: "p2", name: "Amul Butter 100g", brand: "Amul", category: "Dairy & Eggs", price: 58, currency: "₹", size: "100g" },
  { id: "p3", name: "Amul Fresh Malai Paneer 200g", brand: "Amul", category: "Dairy & Eggs", price: 95, currency: "₹", size: "200g" },
  { id: "p4", name: "Mother Dairy Classic Dahi 400g", brand: "Mother Dairy", category: "Dairy & Eggs", price: 40, currency: "₹", size: "400g" },
  { id: "p5", name: "Fresh Farm Eggs (Pack of 6)", brand: "Farm Fresh", category: "Dairy & Eggs", price: 55, currency: "₹", size: "6 pcs" },
  { id: "p6", name: "Milky Mist Cheese Slices 200g", brand: "Milky Mist", category: "Dairy & Eggs", price: 145, currency: "₹", size: "200g" },
  { id: "p7", name: "Gowardhan Cow Ghee 500ml", brand: "Gowardhan", category: "Dairy & Eggs", price: 340, currency: "₹", size: "500ml" },
  { id: "p8", name: "Nestlé A+ Fresh Cream 200ml", brand: "Nestlé", category: "Dairy & Eggs", price: 65, currency: "₹", size: "200ml" },
  { id: "p9", name: "Amul Masti Spiced Buttermilk 200ml", brand: "Amul", category: "Dairy & Eggs", price: 15, currency: "₹", size: "200ml" },
  { id: "p10", name: "Epigamia Greek Yogurt Strawberry 85g", brand: "Epigamia", category: "Dairy & Eggs", price: 60, currency: "₹", size: "85g" },
  { id: "p11", name: "Fresh White Eggs (Pack of 12)", brand: "Farm Fresh", category: "Dairy & Eggs", price: 105, currency: "₹", size: "12 pcs" },
  { id: "p12", name: "Britannia Cheese Cubes 200g", brand: "Britannia", category: "Dairy & Eggs", price: 135, currency: "₹", size: "200g" },

  // 🍞 Bakery & Snacks (14 items)
  { id: "p13", name: "Britannia Brown Bread 400g", brand: "Britannia", category: "Bakery & Snacks", price: 45, currency: "₹", size: "400g" },
  { id: "p14", name: "Lay's Magic Masala Potato Chips 50g", brand: "Lay's", category: "Bakery & Snacks", price: 20, currency: "₹", size: "50g" },
  { id: "p15", name: "Kurkure Masala Munch 90g", brand: "Kurkure", category: "Bakery & Snacks", price: 20, currency: "₹", size: "90g" },
  { id: "p16", name: "Oreo Vanilla Cream Biscuits 120g", brand: "Cadbury", category: "Bakery & Snacks", price: 35, currency: "₹", size: "120g" },
  { id: "p17", name: "Haldiram Bhujia Sev 200g", brand: "Haldiram", category: "Bakery & Snacks", price: 65, currency: "₹", size: "200g" },
  { id: "p18", name: "Parle-G Gold Biscuits 1kg", brand: "Parle", category: "Bakery & Snacks", price: 120, currency: "₹", size: "1kg" },
  { id: "p19", name: "Britannia Milk Bikis 150g", brand: "Britannia", category: "Bakery & Snacks", price: 30, currency: "₹", size: "150g" },
  { id: "p20", name: "Doritos Cheese Nachos 82g", brand: "Doritos", category: "Bakery & Snacks", price: 50, currency: "₹", size: "82g" },
  { id: "p21", name: "Pringles Sour Cream & Onion 107g", brand: "Pringles", category: "Bakery & Snacks", price: 115, currency: "₹", size: "107g" },
  { id: "p22", name: "Modern Whole Wheat Bread 400g", brand: "Modern", category: "Bakery & Snacks", price: 48, currency: "₹", size: "400g" },
  { id: "p23", name: "Sunfeast Dark Fantasy Choco Fills 75g", brand: "Sunfeast", category: "Bakery & Snacks", price: 40, currency: "₹", size: "75g" },
  { id: "p24", name: "Bikaji Bikaneri Bhujia 400g", brand: "Bikaji", category: "Bakery & Snacks", price: 130, currency: "₹", size: "400g" },
  { id: "p25", name: "Act II Butter Popcorn 130g", brand: "Act II", category: "Bakery & Snacks", price: 45, currency: "₹", size: "130g" },
  { id: "p26", name: "Haldiram Soan Papdi 500g", brand: "Haldiram", category: "Bakery & Snacks", price: 140, currency: "₹", size: "500g" },

  // 🍎 Fruits & Vegetables (15 items)
  { id: "p27", name: "Fresh Shimla Apples 1kg", brand: "Fresh", category: "Fruits & Vegetables", price: 140, currency: "₹", size: "1kg" },
  { id: "p28", name: "Fresh Robusta Bananas 1 Dozen", brand: "Fresh", category: "Fruits & Vegetables", price: 60, currency: "₹", size: "12 pcs" },
  { id: "p29", name: "Hybrid Red Tomatoes 1kg", brand: "Fresh", category: "Fruits & Vegetables", price: 35, currency: "₹", size: "1kg" },
  { id: "p30", name: "Fresh Jyoti Potatoes 1kg", brand: "Fresh", category: "Fruits & Vegetables", price: 30, currency: "₹", size: "1kg" },
  { id: "p31", name: "Fresh Green Capsicum 250g", brand: "Fresh", category: "Fruits & Vegetables", price: 25, currency: "₹", size: "250g" },
  { id: "p32", name: "Nashik Red Onions 1kg", brand: "Fresh", category: "Fruits & Vegetables", price: 40, currency: "₹", size: "1kg" },
  { id: "p33", name: "Fresh Green Chillies 100g", brand: "Fresh", category: "Fruits & Vegetables", price: 15, currency: "₹", size: "100g" },
  { id: "p34", name: "Fresh Ginger Adrak 250g", brand: "Fresh", category: "Fruits & Vegetables", price: 35, currency: "₹", size: "250g" },
  { id: "p35", name: "Fresh Garlic Lahsun 250g", brand: "Fresh", category: "Fruits & Vegetables", price: 65, currency: "₹", size: "250g" },
  { id: "p36", name: "Fresh Indian Lemons (Pack of 4)", brand: "Fresh", category: "Fruits & Vegetables", price: 20, currency: "₹", size: "4 pcs" },
  { id: "p37", name: "Fresh Spinach Palak 250g", brand: "Fresh", category: "Fruits & Vegetables", price: 25, currency: "₹", size: "250g" },
  { id: "p38", name: "Fresh Broccoli 500g", brand: "Fresh", category: "Fruits & Vegetables", price: 80, currency: "₹", size: "500g" },
  { id: "p39", name: "Fresh Seedless Watermelon 2kg", brand: "Fresh", category: "Fruits & Vegetables", price: 90, currency: "₹", size: "2kg" },
  { id: "p40", name: "Fresh Papaya 1kg", brand: "Fresh", category: "Fruits & Vegetables", price: 55, currency: "₹", size: "1kg" },
  { id: "p41", name: "Fresh Pomegranate Anaar 1kg", brand: "Fresh", category: "Fruits & Vegetables", price: 180, currency: "₹", size: "1kg" },

  // 🧂 Cooking & Spices (15 items)
  { id: "p42", name: "Fortune Kachi Ghani Mustard Oil 1L", brand: "Fortune", category: "Cooking & Spices", price: 155, currency: "₹", size: "1L" },
  { id: "p43", name: "Amul Pure Cow Ghee 500ml", brand: "Amul", category: "Cooking & Spices", price: 325, currency: "₹", size: "500ml" },
  { id: "p44", name: "MDH Garam Masala 100g", brand: "MDH", category: "Cooking & Spices", price: 90, currency: "₹", size: "100g" },
  { id: "p45", name: "Catch Turmeric Haldi Powder 100g", brand: "Catch", category: "Cooking & Spices", price: 42, currency: "₹", size: "100g" },
  { id: "p46", name: "Tata Salt Vacuum Evaporated 1kg", brand: "Tata", category: "Cooking & Spices", price: 28, currency: "₹", size: "1kg" },
  { id: "p47", name: "Everest Red Chilli Powder 100g", brand: "Everest", category: "Cooking & Spices", price: 52, currency: "₹", size: "100g" },
  { id: "p48", name: "Fortune Sunlite Sunflower Oil 1L", brand: "Fortune", category: "Cooking & Spices", price: 140, currency: "₹", size: "1L" },
  { id: "p49", name: "Saffola Gold Cooking Oil 1L", brand: "Saffola", category: "Cooking & Spices", price: 175, currency: "₹", size: "1L" },
  { id: "p50", name: "Everest Coriander Dhaniya Powder 100g", brand: "Everest", category: "Cooking & Spices", price: 38, currency: "₹", size: "100g" },
  { id: "p51", name: "MDH Kitchen King Masala 100g", brand: "MDH", category: "Cooking & Spices", price: 85, currency: "₹", size: "100g" },
  { id: "p52", name: "Catch Cumin Jeera Whole 100g", brand: "Catch", category: "Cooking & Spices", price: 75, currency: "₹", size: "100g" },
  { id: "p53", name: "Dabur Hommade Tomato Puree 200g", brand: "Dabur", category: "Cooking & Spices", price: 30, currency: "₹", size: "200g" },
  { id: "p54", name: "Ching's Secret Dark Soy Sauce 210g", brand: "Ching's Secret", category: "Cooking & Spices", price: 55, currency: "₹", size: "210g" },
  { id: "p55", name: "Knorr Tomato Soup Mix 53g", brand: "Knorr", category: "Cooking & Spices", price: 55, currency: "₹", size: "53g" },
  { id: "p56", name: "Organic Tattva Jaggery Powder 500g", brand: "Organic Tattva", category: "Cooking & Spices", price: 65, currency: "₹", size: "500g" },

  // 🧃 Beverages & Tea (12 items)
  { id: "p57", name: "Tata Tea Premium 500g", brand: "Tata", category: "Beverages & Tea", price: 240, currency: "₹", size: "500g" },
  { id: "p58", name: "Nescafé Classic Instant Coffee 50g", brand: "Nescafé", category: "Beverages & Tea", price: 175, currency: "₹", size: "50g" },
  { id: "p59", name: "Real Fruit Power Orange Juice 1L", brand: "Dabur", category: "Beverages & Tea", price: 115, currency: "₹", size: "1L" },
  { id: "p60", name: "Bisleri Mineral Water 1L", brand: "Bisleri", category: "Beverages & Tea", price: 20, currency: "₹", size: "1L" },
  { id: "p61", name: "Coca-Cola Soft Drink 750ml", brand: "Coca-Cola", category: "Beverages & Tea", price: 45, currency: "₹", size: "750ml" },
  { id: "p62", name: "Taj Mahal Tea 500g", brand: "Brooke Bond", category: "Beverages & Tea", price: 350, currency: "₹", size: "500g" },
  { id: "p63", name: "Bru Instant Coffee 100g", brand: "Bru", category: "Beverages & Tea", price: 190, currency: "₹", size: "100g" },
  { id: "p64", name: "Red Bull Energy Drink 250ml", brand: "Red Bull", category: "Beverages & Tea", price: 125, currency: "₹", size: "250ml" },
  { id: "p65", name: "Sprite Soft Drink 750ml", brand: "Sprite", category: "Beverages & Tea", price: 45, currency: "₹", size: "750ml" },
  { id: "p66", name: "Paper Boat Tender Coconut Water 200ml", brand: "Paper Boat", category: "Beverages & Tea", price: 50, currency: "₹", size: "200ml" },
  { id: "p67", name: "Frooti Mango Drink 1L", brand: "Parle Agro", category: "Beverages & Tea", price: 70, currency: "₹", size: "1L" },
  { id: "p68", name: "Rooh Afza Syrup 750ml", brand: "Hamdard", category: "Beverages & Tea", price: 170, currency: "₹", size: "750ml" },

  // 🧴 Personal Care (12 items)
  { id: "p69", name: "Colgate Strong Teeth Toothpaste 200g", brand: "Colgate", category: "Personal Care", price: 110, currency: "₹", size: "200g" },
  { id: "p70", name: "Dettol Antiseptic Bathing Soap 125g", brand: "Dettol", category: "Personal Care", price: 48, currency: "₹", size: "125g" },
  { id: "p71", name: "Dove Intense Repair Shampoo 180ml", brand: "Dove", category: "Personal Care", price: 165, currency: "₹", size: "180ml" },
  { id: "p72", name: "Nivea Soft Light Moisturizer 100ml", brand: "Nivea", category: "Personal Care", price: 185, currency: "₹", size: "100ml" },
  { id: "p73", name: "Parachute 100% Pure Coconut Hair Oil 200ml", brand: "Marico", category: "Personal Care", price: 90, currency: "₹", size: "200ml" },
  { id: "p74", name: "Pepsodent Germicheck Toothpaste 150g", brand: "Pepsodent", category: "Personal Care", price: 85, currency: "₹", size: "150g" },
  { id: "p75", name: "Pears Transparent Soap 125g", brand: "Pears", category: "Personal Care", price: 62, currency: "₹", size: "125g" },
  { id: "p76", name: "Head & Shoulders Anti-Dandruff Shampoo 180ml", brand: "Head & Shoulders", category: "Personal Care", price: 175, currency: "₹", size: "180ml" },
  { id: "p77", name: "Himalaya Neem Face Wash 100ml", brand: "Himalaya", category: "Personal Care", price: 140, currency: "₹", size: "100ml" },
  { id: "p78", name: "Savlon Hand Sanitizer 100ml", brand: "Savlon", category: "Personal Care", price: 50, currency: "₹", size: "100ml" },
  { id: "p79", name: "Gillette Mach3 Razor Cartridge", brand: "Gillette", category: "Personal Care", price: 250, currency: "₹", size: "1 unit" },
  { id: "p80", name: "Vaseline Healthy Bright Body Lotion 200ml", brand: "Vaseline", category: "Personal Care", price: 210, currency: "₹", size: "200ml" },
];

export async function searchProducts({ query, brand, minPrice, maxPrice, size, category }) {
  try {
    const params = new URLSearchParams();
    if (query) params.set('query', query);
    if (brand) params.set('brand', brand);
    if (minPrice !== undefined) params.set('minPrice', minPrice);
    if (maxPrice !== undefined) params.set('maxPrice', maxPrice);
    if (size) params.set('size', size);
    if (category) params.set('category', category);

    const res = await get(`/search?${params.toString()}`);
    if (res && res.results && res.results.length > 0) {
      return res;
    }
    throw new Error("No server results, using catalog search fallback");
  } catch (err) {
    const q = (query || "").toLowerCase().trim();
    const cat = (category || "").toLowerCase().trim();

    const filtered = FALLBACK_CATALOG.filter((p) => {
      const matchCat = !cat || p.category.toLowerCase().includes(cat) || cat.includes(p.category.toLowerCase().split(' ')[0]);
      const matchQuery = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });

    return { results: filtered.length > 0 ? filtered : FALLBACK_CATALOG.slice(0, 10) };
  }
}