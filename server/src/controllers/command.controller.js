import { processVoiceCommand } from "../services/command.service.js";

function sendError(res, status, code, message) {
  return res.status(status).json({
    success: false,
    error: { code, message },
  });
}

export async function handleVoiceCommand(req, res) {
  const { transcript, language } = req.body;

  if (!transcript || typeof transcript !== "string" || !transcript.trim()) {
    return sendError(res, 422, "VALIDATION_ERROR", "A transcript is required.");
  }

  try {
    const result = await processVoiceCommand(transcript.trim());

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error("Error processing voice command:", err);

    if (err.code === "AI_SERVICE_UNAVAILABLE") {
      return sendError(res, 503, "AI_SERVICE_UNAVAILABLE", "The assistant is temporarily unavailable. Please try again.");
    }

    if (err.code === "INVALID_AI_RESPONSE") {
      return sendError(res, 422, "INVALID_AI_RESPONSE", "We could not understand that command. Please try again.");
    }

    sendError(res, 500, "DATABASE_ERROR", "We could not process your command. Please try again.");
  }
}
