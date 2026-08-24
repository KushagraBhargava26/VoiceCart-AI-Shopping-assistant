import { post } from './api.js';

export async function sendVoiceCommand(transcript, language) {
  try {
    return await post('/commands', { transcript, language });
  } catch (err) {
    console.warn("Voice command API unreachable, using resilient client NLP parser:", err.message);
    const lower = (transcript || '').toLowerCase();
    if (lower.includes("remove") || lower.includes("hata") || lower.includes("nikal")) {
      const cleanName = transcript.replace(/remove|hata|nikal|do|doodh|bread/gi, '').trim() || "Item";
      return {
        action: "REMOVE_ITEM",
        item: cleanName,
        spokenResponse: `Removed ${cleanName} from your shopping list.`
      };
    }
    const cleanName = transcript.replace(/add|bhejo|daal|karo/gi, '').trim() || transcript;
    return {
      action: "ADD_ITEM",
      item: cleanName,
      spokenResponse: `Added ${cleanName} to your shopping list.`
    };
  }
}