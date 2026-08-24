/**
 * Returns a context-aware emoji for any shopping item based on multi-priority matching.
 *
 * MATCHING STRATEGY:
 * 1. Product Type Priority: Functional products like Shampoos, Toothpastes, Teas, Coffees,
 *    Chocolates, Breads, Crisps take precedence so "Kesar shampoo" gets 🧴 (not 🌿).
 * 2. Food Item Priority: Exact food names with plural support (Bananas -> 🍌, Oranges -> 🍊, Eggs -> 🥚).
 * 3. Multilingual Support: English, Hindi, French, Spanish, German (supports Open Food Facts data).
 * 4. Category Fallback: Sane defaults when no keyword matches.
 *
 * @param {string} itemName
 * @param {string} [category]
 * @returns {string} emoji
 */

const CATEGORY_DEFAULT_ICONS = {
  Dairy: '🥛',
  Fruits: '🍎',
  Vegetables: '🥦',
  Beverages: '🥤',
  Snacks: '🍿',
  Grains: '🌾',
  'Personal Care': '🧴',
  Bakery: '🍞',
};

const RULES = [
  // ── 1. PERSONAL CARE & HYGIENE (Priority so ingredient names don't override product form) ──
  [/\b(toothpaste|dentifrice|colgate|pepsodent|sensodyne|dabur red)\b/i, '🪥'],
  [/\b(toothbrush|brosse à dents|zahnbürste)\b/i, '🪥'],
  [/\b(mouthwash|dental floss|floss)\b/i, '🦷'],
  [/\b(shampoo|shampoing|conditioner|head & shoulders|pantene|dove|beesline|kodomo|vatika|hair wash)\b/i, '🧴'],
  [/\b(hair oil|face cream|night cream|sunscreen|moisturizer|lotion|serum|toner|sanitizer|hand sanitizer)\b/i, '🧴'],
  [/\b(soap|savon|seife|face wash|hand wash|body wash|dettol|lifebuoy|lux|pears soap|pears body wash|cinthol)\b/i, '🧼'],
  [/\b(deodorant|deo|perfume|parfum|cologne|attar|axe|rexona|nivea|fog|wild stone)\b/i, '🌸'],
  [/\b(razor|shaving|rasoir|rasur|blade|gillette|trimmer)\b/i, '🪒'],
  [/\b(sanitary|pad|pads|tampon|tampons|whisper|stayfree|bandage|band aid|cotton)\b/i, '🩹'],
  [/\b(lipstick|lip balm|kajal|kohl|eyeliner|mascara|foundation|compact|makeup)\b/i, '💄'],

  // ── 2. BEVERAGES & DRINKS ──
  [/\b(tea|chai|thé|the|matcha|green tea|black tea|masala chai|lipton|tata tea)\b/i, '🍵'],
  [/\b(coffee|café|cafe|kaffee|espresso|cappuccino|latte|nescafe|bru|ricor[eé]|chicor[eé]e?)\b/i, '☕'],
  [/\b(orangensaft|orange juice|apple juice|mango juice|zumo|jus|juice|smoothie|squash|fruit squash)\b/i, '🧃'],
  [/\b(water|eau|wasser|aqua|bisleri|aquafina|kinley|mineral water|sparkling water)\b/i, '💧'],
  [/\b(cola|pepsi|coca|sprite|fanta|mirinda|limca|thums up|7up|mountain dew|soda|red bull|monster|energy drink)\b/i, '🥤'],
  [/\b(beer|bière|bier|ale|lager|heineken|corona|kingfisher)\b/i, '🍺'],
  [/\b(wine|vin|wein|whiskey|whisky|vodka|rum|gin|scotch|bourbon|cocktail)\b/i, '🍷'],
  [/\b(coconut water|nariyal pani|shikanji|aam panna|nimbu pani)\b/i, '🥥'],

  // ── 3. DAIRY & EGGS ──
  [/\b(egg|eggs|oeuf|oeufs|anda|ande|eier)\b/i, '🥚'],
  [/\b(omelette|fried egg|scrambled)\b/i, '🍳'],
  [/\b(cheese|fromage|käse|cheddar|mozzarella|parmesan|paneer|gouda|cream cheese)\b/i, '🧀'],
  [/\b(butter|beurre|butter|makkan|ghee)\b/i, '🧈'],
  [/\b(yogurt|yoghurt|yaourt|dahi|curd|lassi|tofu)\b/i, '🍶'],
  [/\b(ice cream|glace|kulfi|gelato|frozen yogurt)\b/i, '🍦'],
  [/\b(milk|lait|milch|dudh|whey|milkshake|amul|mother dairy)\b/i, '🥛'],

  // ── 4. BAKERY & DESSERTS ──
  [/\b(bread|pain|mie|brioche|brot|roti|chapati|chapatti|naan|paratha|pav|bun|buns|bagel|bagels|pita|croissant|croissants)\b/i, '🍞'],
  [/\b(cake|cakes|gateau|gâteau|torte|pastry|pastries|muffin|muffins|cupcake|cupcakes|donut|donuts|doughnut|doughnuts|waffle|waffles|pancake|pancakes)\b/i, '🎂'],
  [/\b(cookie|cookies|biscuit|biscuits|biscotte|oreo|parle|good day|marie|hide and seek|cracker|crackers|wafer|wafers)\b/i, '🍪'],

  // ── 5. SNACKS, SWEETS & NUTS ──
  [/\b(chocolate|chocolat|schokolade|cocoa|cacao|nutella|kitkat|cadbury|dairy milk|5 star|munch|dark 74%)\b/i, '🍫'],
  [/\b(candy|bonbon|toffee|toPlatformffees|caramel|lollipop|mithai|ladoo|laddoo|jalebi|gulab jamun|rasgulla|halwa|barfi|burfi|kheer|payasam)\b/i, '🍬'],
  [/\b(popcorn)\b/i, '🍿'],
  [/\b(chips|crisps|pringles|lays|kurkure|nachos|doritos|paprika chips|salted crisps|banana chips|pomme noisette)\b/i, '🍟'],
  [/\b(namkeen|bhujia|chakli|mathri|murukku|sev|mixture)\b/i, '🍘'],
  [/\b(peanut|peanuts|cacahu[eè]te|cacahuetes|groundnut|moongfali|almond|almonds|badam|cashew|cashews|kaju|walnut|walnuts|akhrot|pista|pistachio|pistachios|hazelnut|hazelnuts|noisette|noisettes|nuts|dry fruit|dry fruits)\b/i, '🥜'],
  [/\b(raisin|raisins|kishmish|kismis|prune|prunes|date|dates|khajoor)\b/i, '🍇'],

  // ── 6. FRUITS (Supports singular & plurals) ──
  [/\b(banana|bananas|banane|bananes|kela|kele)\b/i, '🍌'],
  [/\b(pear|pears|poire|poires|williams|birne|birnen|nashpati|amrood|guava|guavas)\b/i, '🍐'],
  [/\b(apple|apples|pomme|pommes|apfel|äpfel|seb)\b/i, '🍎'],
  [/\b(orange|oranges|naranja|naranjas|santra|santre|mosambi|narangi)\b/i, '🍊'],
  [/\b(mango|mangos|mangoes|mangue|mangues|aam)\b/i, '🥭'],
  [/\b(lemon|lemons|citron|citrons|zitrone|zitronen|nimbu|lime|limes)\b/i, '🍋'],
  [/\b(strawberry|strawberries|fraise|fraises|erdbeere|erdbeeren)\b/i, '🍓'],
  [/\b(grape|grapes|raisin|raisins|traube|trauben|angoor)\b/i, '🍇'],
  [/\b(watermelon|watermelons|pastèque|tarbuz)\b/i, '🍉'],
  [/\b(pineapple|pineapples|ananas)\b/i, '🍍'],
  [/\b(coconut|coconuts|noix de coco|nariyal)\b/i, '🥥'],
  [/\b(peach|peaches|p[eê]che|pêches|plum|plums|apricot|apricots|khubani|aloobukara)\b/i, '🍑'],
  [/\b(cherry|cherries|cerise|cerises|kirsche|kirschen)\b/i, '🍒'],
  [/\b(blueberry|blueberries|myrtille|myrtilles|raspberry|raspberries|framboise|blackberry|blackberries|cranberry|cranberries|berry|berries)\b/i, '🫐'],
  [/\b(kiwi|kiwis)\b/i, '🥝'],
  [/\b(pomegranate|pomegranates|grenade|anaar)\b/i, '🍎'],
  [/\b(papaya|papayas|papaye|papita|chiku|sapota|fig|figs|figue|anjeer)\b/i, '🍈'],
  [/\b(avocado|avocados|avocat|avocats)\b/i, '🥑'],

  // ── 7. VEGETABLES ──
  [/\b(potato|potatoes|pomme de terre|pommes de terre|patate|patates|kartoffel|kartoffeln|aloo)\b/i, '🥔'],
  [/\b(tomato|tomatoes|tomate|tomates|tamatar)\b/i, '🍅'],
  [/\b(onion|onions|oignon|oignons|zwiebel|zwiebeln|pyaaz|pyaz|shallot|shallots)\b/i, '🧅'],
  [/\b(garlic|ail|knoblauch|lahsun|lasun)\b/i, '🧄'],
  [/\b(carrot|carrots|carotte|carottes|karotte|karotten|gajar)\b/i, '🥕'],
  [/\b(broccoli|cauliflower|chou-fleur|gobhi|phool gobhi)\b/i, '🥦'],
  [/\b(spinach|épinard|palak|cabbage|chou|lettuce|salade|salad|kale|patta gobhi|methi)\b/i, '🥬'],
  [/\b(pea|peas|pois|erbsen|matar|mutter)\b/i, '🫛'],
  [/\b(corn|maize|mais|maïs|bhutta|makka|sweet corn)\b/i, '🌽'],
  [/\b(pepper|peppers|poivron|poivrons|capsicum|shimla mirch|chilli|chillies|chili|chilies|piment|mirch|hari mirch|lal mirch)\b/i, '🫑'],
  [/\b(cucumber|cucumbers|concombre|gurke|kheera|kakdi|zucchini|courgette|karela|lauki|turai)\b/i, '🥒'],
  [/\b(eggplant|eggplants|aubergine|aubergines|baingan|brinjal)\b/i, '🍆'],
  [/\b(mushroom|mushrooms|champignon|champignons|pilz|pilze|khumb)\b/i, '🍄'],
  [/\b(ginger|gingembre|ingwer|adrak|arbi)\b/i, '🫚'],
  [/\b(pumpkin|citrouille|kürbis|kaddu|butternut)\b/i, '🎃'],
  [/\b(radish|mooli|beetroot|chukander|turnip|shalgam)\b/i, '🫛'],
  [/\b(bhindi|okra|lady finger)\b/i, '🫛'],

  // ── 8. GRAINS, FLOUR, PULSES & PASTA ──
  [/\b(rice|riz|reis|basmati|poha|chawal)\b/i, '🍚'],
  [/\b(wheat|flour|farine|atta|maida|suji|rava|grain|grains|cereal|cereals|céréales|muesli|granola|oats|avena|bajra|jowar|ragi|quinoa|barley)\b/i, '🌾'],
  [/\b(pasta|pâte|pâtes|spaghetti|macaroni|penne|noodle|noodles|nouille|nouilles|ramen|maggi|vermicelli|sevai)\b/i, '🍝'],
  [/\b(dal|dhal|lentil|lentils|lentille|lentilles|chickpea|chickpeas|pois chiche|chana|rajma|kidney bean|kidney beans|bean|beans|haricot|haricots|soya|soybean|moong|toor|urad|masoor)\b/i, '🫘'],

  // ── 9. MEAT & SEAFOOD ──
  [/\b(chicken|poulet|hähnchen|murgh|turkey)\b/i, '🍗'],
  [/\b(meat|viande|fleisch|beef|boeuf|mutton|lamb|pork|porc|steak|keema|mince)\b/i, '🥩'],
  [/\b(fish|poisson|fisch|salmon|saumon|tuna|thon|rohu|katla|pomfret|sardine|mackerel|surmai)\b/i, '🐟'],
  [/\b(prawn|prawns|crevette|crevettes|shrimp|garnelen|jhinga|crab|lobster|oyster|squid|seafood)\b/i, '🦐'],
  [/\b(sausage|sausages|saucisse|saucisses|wurst|salami|bacon|ham|jambon|hotdog)\b/i, '🌭'],

  // ── 10. OILS, CONDIMENTS, SPICES & HOUSEHOLD ──
  [/\b(oil|huile|[oö]l|tel|olive oil|mustard oil|sunflower oil|refined oil|ghee)\b/i, '🫙'],
  [/\b(salt|sel|salz|namak|black salt|rock salt)\b/i, '🧂'],
  [/\b(sugar|sucre|zucker|cheeni|jaggery|gur|honey|miel|honig|maple syrup)\b/i, '🍯'],
  [/\b(sauce|ketchup|mayonnaise|mayo|mustard|moutarde|senf|vinegar|vinaigre|sirka|pesto|salsa|achaar|pickle)\b/i, '🥫'],
  [/\b(spice|spices|masala|garam masala|curry|curry powder|turmeric|haldi|coriander|dhaniya|cumin|jeera|cardamom|elaichi|cinnamon|dalchini|clove|cloves|laung|black pepper|kali mirch|hing|saffron|kesar)\b/i, '🌿'],
  [/\b(detergent|surf excel|ariel|tide|washing powder|fabric softener|cleaner|dishwash|vim|pril|lizol|harpic|colin)\b/i, '🧺'],
  [/\b(sponge|scrub|scotch brite)\b/i, '🧽'],
  [/\b(broom|jhadu|mop|phenyl|floor cleaner)\b/i, '🧹'],
  [/\b(toilet paper|tissue|paper towel|napkin)\b/i, '🧻'],
  [/\b(trash bag|garbage bag|foil|aluminium foil|wrap|cling wrap)\b/i, '🗑️'],
  [/\b(battery|bulb|led|charger|cable|plug)\b/i, '🔋'],
  [/\b(pen|pencil|notebook|book|glue|fevicol|stapler|scissors|tape)\b/i, '✏️'],
  [/\b(medicine|tablet|capsule|syrup|crocin|dolo|paracetamol|vicks|multivitamin)\b/i, '💊'],
  [/\b(matchbox|candle|lighter)\b/i, '🔥'],
];

export function getItemIcon(itemName, category) {
  let cleanName = "";
  if (typeof itemName === "string") {
    cleanName = itemName.toLowerCase();
  } else if (itemName && typeof itemName === "object") {
    cleanName = (itemName.name || itemName.title || "").toString().toLowerCase();
    if (!category && itemName.category) {
      category = itemName.category;
    }
  } else {
    cleanName = String(itemName || "").toLowerCase();
  }

  for (const [regex, icon] of RULES) {
    if (regex.test(cleanName)) {
      return icon;
    }
  }

  // Fall back to category icon, or generic cart
  return CATEGORY_DEFAULT_ICONS[category] || '🛒';
}
