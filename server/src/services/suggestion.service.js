import prisma from '../config/prisma.js';

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Seasonal product map for the Northern Hemisphere / Indian context.
 * Keyed by month (0-indexed, matching JS Date.getMonth()).
 * This is intentionally simple, static data for the MVP (per CONTRACT.md Section 15:
 * "publicly available data sources may be used ... prefer free-tier or publicly
 * available services"). It can later be replaced with a real external data source.
 */
const SEASONAL_ITEMS_BY_MONTH = {
  0: ['oranges', 'carrots', 'spinach'], // January
  1: ['strawberries', 'peas'], // February
  2: ['mangoes', 'watermelon'], // March
  3: ['mangoes', 'watermelon', 'cucumber'], // April
  4: ['mangoes', 'litchi', 'melon'], // May
  5: ['jamun', 'litchi'], // June
  6: ['corn', 'plums'], // July
  7: ['apples', 'pears', 'corn'], // August
  8: ['pomegranate', 'guava'], // September
  9: ['pomegranate', 'sweet potato'], // October
  10: ['oranges', 'guava'], // November
  11: ['oranges', 'carrots'], // December
};

const SUBSTITUTE_MAP = {
  milk: ['Almond Milk', 'Soy Milk', 'Oat Milk'],
  bread: ['Multigrain Bread', 'Brown Bread'],
  sugar: ['Jaggery', 'Honey'],
  rice: ['Brown Rice', 'Quinoa'],
};

/**
 * FREQUENT_ITEM suggestions: items purchased 2+ times in shopping history
 * that are not currently on the active shopping list.
 */
async function getFrequentItemSuggestions() {
  const history = await prisma.shoppingHistory.groupBy({
    by: ['itemName'],
    where: { userId: DEFAULT_USER_ID },
    _count: { itemName: true },
  });

  const frequentNames = history
    .filter((entry) => entry._count.itemName >= 2)
    .map((entry) => entry.itemName);

  if (frequentNames.length === 0) return [];

  const currentList = await prisma.shoppingItem.findMany({
    where: {
      shoppingList: { userId: DEFAULT_USER_ID },
    },
    select: { name: true },
  });
  const currentNames = new Set(currentList.map((i) => i.name.toLowerCase()));

  return frequentNames
    .filter((name) => !currentNames.has(name.toLowerCase()))
    .map((name) => ({
      type: 'FREQUENT_ITEM',
      item: name,
      message: `You usually buy ${name} around this time.`,
      confidence: 0.75,
    }));
}

/**
 * SEASONAL suggestions based on the current month.
 */
function getSeasonalSuggestions() {
  const month = new Date().getMonth();
  const seasonalItems = SEASONAL_ITEMS_BY_MONTH[month] || [];

  return seasonalItems.map((name) => ({
    type: 'SEASONAL',
    item: name,
    message: `${name.charAt(0).toUpperCase() + name.slice(1)} is in season right now.`,
    confidence: 0.6,
  }));
}

/**
 * SUBSTITUTE suggestions for a specific item, when requested explicitly.
 */
function getSubstituteSuggestions(itemName) {
  if (!itemName) return [];

  const key = itemName.toLowerCase();
  const alternatives = SUBSTITUTE_MAP[key];

  if (!alternatives) return [];

  return [
    {
      type: 'SUBSTITUTE',
      item: itemName,
      alternatives,
      message: `${itemName} is unavailable. You could try: ${alternatives.join(', ')}.`,
      confidence: 0.7,
    },
  ];
}

/**
 * Main entry point for GET /api/v1/suggestions.
 * Combines frequent-item and seasonal suggestions.
 */
export async function getSuggestions() {
  const [frequent, seasonal] = await Promise.all([
    getFrequentItemSuggestions(),
    Promise.resolve(getSeasonalSuggestions()),
  ]);

  return [...frequent, ...seasonal];
}

export async function getSubstitutesFor(itemName) {
  return getSubstituteSuggestions(itemName);
}