import { getSuggestions } from '../services/suggestion.service.js';

export async function handleGetSuggestions(req, res) {
  try {
    const suggestions = await getSuggestions();

    res.status(200).json({
      success: true,
      data: suggestions,
    });
  } catch (err) {
    console.error('Error fetching suggestions:', err);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'We could not fetch suggestions right now. Please try again.',
      },
    });
  }
}
