const SUPPORTED_ACTIONS = [
  "ADD_ITEM",
  "REMOVE_ITEM",
  "UPDATE_ITEM",
  "SEARCH_PRODUCT",
  "GET_SUGGESTIONS",
  "CLARIFICATION_REQUIRED",
  "UNKNOWN",
];

function isValidItem(item, { requireQuantity }) {
  if (!item || typeof item !== "object") return false;
  if (!item.name || typeof item.name !== "string" || !item.name.trim()) return false;

  if (requireQuantity) {
    if (typeof item.quantity !== "number" || Number.isNaN(item.quantity)) return false;
    if (item.quantity <= 0) return false;
    if (item.quantity > 1000) return false; // reasonably bounded, per AI_CONTRACT Section 30
    if (!item.unit || typeof item.unit !== "string") return false;
  }

  return true;
}

/**
 * Validates a structured command returned by the AI service.
 * Returns { valid: true, command } or { valid: false, reason }.
 */
export function validateCommand(command) {
  if (!command || typeof command !== "object") {
    return { valid: false, reason: "Command is not a valid object." };
  }

  const { action } = command;

  if (!SUPPORTED_ACTIONS.includes(action)) {
    return { valid: false, reason: "Unsupported or missing action." };
  }

  switch (action) {
    case "ADD_ITEM":
    case "UPDATE_ITEM": {
      if (!Array.isArray(command.items) || command.items.length === 0) {
        return { valid: false, reason: "Items array is required." };
      }
      const allValid = command.items.every((item) => isValidItem(item, { requireQuantity: true }));
      if (!allValid) {
        return { valid: false, reason: "One or more items are invalid." };
      }
      break;
    }

    case "REMOVE_ITEM": {
      if (!Array.isArray(command.items) || command.items.length === 0) {
        return { valid: false, reason: "Items array is required." };
      }
      const allValid = command.items.every((item) => isValidItem(item, { requireQuantity: false }));
      if (!allValid) {
        return { valid: false, reason: "One or more items are invalid." };
      }
      break;
    }

    case "SEARCH_PRODUCT": {
      if (!command.query || typeof command.query !== "string") {
        return { valid: false, reason: "Search query is required." };
      }
      if (command.filters !== undefined) {
        const { filters } = command;
        if (typeof filters !== "object") {
          return { valid: false, reason: "Filters must be an object." };
        }
        if (filters.minPrice !== undefined && (typeof filters.minPrice !== "number" || filters.minPrice < 0)) {
          return { valid: false, reason: "Invalid minPrice filter." };
        }
        if (filters.maxPrice !== undefined && (typeof filters.maxPrice !== "number" || filters.maxPrice < 0)) {
          return { valid: false, reason: "Invalid maxPrice filter." };
        }
      }
      break;
    }

    case "CLARIFICATION_REQUIRED": {
      if (!command.message || typeof command.message !== "string") {
        return { valid: false, reason: "Clarification message is required." };
      }
      break;
    }

    case "GET_SUGGESTIONS":
    case "UNKNOWN":
      // No additional fields required.
      break;
  }

  return { valid: true, command };
}
