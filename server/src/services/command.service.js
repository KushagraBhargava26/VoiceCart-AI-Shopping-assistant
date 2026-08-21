import { interpretCommand } from "./ai.service.js";
import { validateCommand } from "../validators/commandValidator.js";
import { addShoppingItem, updateShoppingItem, deleteShoppingItem, findShoppingItemByName } from "./shopping.service.js";

/**
 * Handles ADD_ITEM: adds each item, merging quantity if an item with the same
 * name already exists on the list (per AI_CONTRACT Section 33).
 */
async function executeAddItem(items) {
  const results = [];

  for (const item of items) {
    const existing = await findShoppingItemByName(item.name);

    if (existing && existing.unit === item.unit) {
      const updated = await updateShoppingItem(existing.id, {
        quantity: Number(existing.quantity) + Number(item.quantity),
      });
      results.push(updated);
    } else {
      const created = await addShoppingItem({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        brand: item.brand || null,
      });
      results.push(created);
    }
  }

  return results;
}

async function executeRemoveItem(items) {
  const removed = [];
  const notFound = [];

  for (const item of items) {
    const existing = await findShoppingItemByName(item.name);
    if (existing) {
      await deleteShoppingItem(existing.id);
      removed.push(item.name);
    } else {
      notFound.push(item.name);
    }
  }

  return { removed, notFound };
}

async function executeUpdateItem(items) {
  const updated = [];
  const notFound = [];

  for (const item of items) {
    const existing = await findShoppingItemByName(item.name);
    if (existing) {
      const result = await updateShoppingItem(existing.id, {
        quantity: item.quantity,
        unit: item.unit,
      });
      updated.push(result);
    } else {
      notFound.push(item.name);
    }
  }

  return { updated, notFound };
}

/**
 * Main entry point: takes a raw transcript, interprets it via AI, validates
 * the structured command, and executes the corresponding business logic.
 */
export async function processVoiceCommand(transcript) {
  const aiOutput = await interpretCommand(transcript);

  const { valid, command, reason } = validateCommand(aiOutput);

  if (!valid) {
    const error = new Error(reason || "Invalid AI response.");
    error.code = "INVALID_AI_RESPONSE";
    throw error;
  }

  switch (command.action) {
    case "ADD_ITEM": {
      const items = await executeAddItem(command.items);
      return {
        action: "ADD_ITEM",
        items,
        message: `Added ${command.items.map((i) => i.name).join(", ")}.`,
      };
    }

    case "REMOVE_ITEM": {
      const { removed, notFound } = await executeRemoveItem(command.items);
      const message =
        removed.length > 0
          ? `${removed.join(", ")} removed from your shopping list.`
          : `Could not find ${notFound.join(", ")} on your list.`;
      return { action: "REMOVE_ITEM", items: command.items, message };
    }

    case "UPDATE_ITEM": {
      const { updated, notFound } = await executeUpdateItem(command.items);
      const message =
        updated.length > 0 ? `Updated ${updated.map((i) => i.name).join(", ")}.` : `Could not find ${notFound.join(", ")} on your list.`;
      return { action: "UPDATE_ITEM", items: updated, message };
    }

    case "SEARCH_PRODUCT":
      // Full execution wired up in Phase 7 (Voice-Activated Search).
      return {
        action: "SEARCH_PRODUCT",
        query: command.query,
        filters: command.filters || {},
        results: [],
      };

    case "GET_SUGGESTIONS":
      // Full execution wired up in Phase 6 (Smart Suggestions).
      return { action: "GET_SUGGESTIONS", suggestions: [] };

    case "CLARIFICATION_REQUIRED":
      return { action: "CLARIFICATION_REQUIRED", message: command.message };

    case "UNKNOWN":
    default:
      return {
        action: "UNKNOWN",
        message: "Sorry, I didn't understand that command. Please try again.",
      };
  }
}
