/**
 * Utility for Text-to-Speech (TTS) voice responses using Browser SpeechSynthesis API.
 */

export function speakResponse(text, lang = "en-IN") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  try {
    // Cancel any previous speaking audio
    window.speechSynthesis.cancel();

    // Clean text: strip emoji or markdown characters for natural speech
    const cleanText = text
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
      .replace(/[*_#`~✓✕?•]/g, "")
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang === "hi-IN" ? "hi-IN" : "en-IN";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const matchVoice = voices.find(
        (v) => v.lang === utterance.lang || v.lang.startsWith(utterance.lang.slice(0, 2))
      );
      if (matchVoice) {
        utterance.voice = matchVoice;
      }
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn("SpeechSynthesis error:", err);
  }
}
