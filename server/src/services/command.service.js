import { interpretCommand } from "./ai.service.js";
import { validateCommand } from "../validators/commandValidator.js";
import { addShoppingItem, updateShoppingItem, deleteShoppingItem, findShoppingItemByName } from "./shopping.service.js";
import { searchProducts } from "./search.service.js";
import { getSuggestions } from "./suggestion.service.js";

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
  const reduced = [];

  for (const item of items) {
    const existing = await findShoppingItemByName(item.name);
    if (!existing) {
      notFound.push(item.name);
      continue;
    }

    const requestedQty = item.quantity ? Number(item.quantity) : null;
    const existingQty = Number(existing.quantity);

    // If a specific quantity was requested AND it's less than the existing quantity,
    // just reduce — don't delete the whole item
    if (requestedQty && requestedQty < existingQty) {
      const newQty = existingQty - requestedQty;
      await updateShoppingItem(existing.id, { quantity: newQty });
      reduced.push({ name: item.name, removed: requestedQty, remaining: newQty, unit: existing.unit });
    } else {
      // No quantity specified, or removing all — delete the item entirely
      await deleteShoppingItem(existing.id);
      removed.push(item.name);
    }
  }

  return { removed, notFound, reduced };
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
      // Before blindly adding, check if catalog has products for this item.
      // If yes → ask user to pick which product they want (better UX).
      // If no catalog match → fall through to generic add as before.
      const catalogResults = await Promise.all(
        command.items.map((item) => searchProducts({ query: item.name }))
      );
      const allResults = catalogResults.flat();

      if (allResults.length > 0) {
        // Return selection prompt — frontend will show a product picker
        return {
          action: "PRODUCT_SELECTION_REQUIRED",
          pendingItems: command.items,   // original voice-parsed items (name, qty, unit)
          results: allResults.slice(0, 8), // cap to 8 options max
        };
      }

      // No catalog match — add generically
      const items = await executeAddItem(command.items);
      return {
        action: "ADD_ITEM",
        items,
        message: `Added ${command.items.map((i) => i.name).join(", ")}.`,
      };
    }

    case "REMOVE_ITEM": {
      const { removed, notFound, reduced } = await executeRemoveItem(command.items);

      let message;
      if (reduced.length > 0 && removed.length === 0) {
        // Only partial reduction happened
        message = reduced
          .map((r) => `Reduced ${r.name} by ${r.removed} ${r.unit}. ${r.remaining} ${r.unit} remaining.`)
          .join(" ");
      } else if (removed.length > 0 && reduced.length > 0) {
        // Mix of full removes and partial reductions
        message = [
          ...removed.map((n) => `${n} removed.`),
          ...reduced.map((r) => `${r.name} reduced to ${r.remaining} ${r.unit}.`),
        ].join(" ");
      } else if (removed.length > 0) {
        message = `${removed.join(", ")} removed from your shopping list.`;
      } else {
        message = `Could not find ${notFound.join(", ")} on your list.`;
      }

      return { action: "REMOVE_ITEM", items: command.items, message };
    }

    case "UPDATE_ITEM": {
      const { updated, notFound } = await executeUpdateItem(command.items);
      const message =
        updated.length > 0 ? `Updated ${updated.map((i) => i.name).join(", ")}.` : `Could not find ${notFound.join(", ")} on your list.`;
      return { action: "UPDATE_ITEM", items: updated, message };
    }

    case "SEARCH_PRODUCT": {
      const results = await searchProducts({
        query: command.query,
        brand: command.filters?.brand,
        minPrice: command.filters?.minPrice,
        maxPrice: command.filters?.maxPrice,
        size: command.filters?.size,
        category: command.filters?.category,
      });
      return {
        action: "SEARCH_PRODUCT",
        query: command.query,
        filters: command.filters || {},
        results,
      };
    }

    case "GET_SUGGESTIONS": {
      const suggestions = await getSuggestions();
      return { action: "GET_SUGGESTIONS", suggestions };
    }

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
