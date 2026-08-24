/**
 * Utility for Text-to-Speech (TTS) voice responses using Browser SpeechSynthesis API.
 */

export function speakResponse(text, lang = "en-IN") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  try {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Clean text: strip emoji or markdown characters for natural speech
    const cleanText = text
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
      .replace(/[*_#`~✓✕?•]/g, "")
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const targetLang = lang === "hi-IN" ? "hi-IN" : "en-IN";
    utterance.lang = targetLang;
    utterance.rate = lang === "hi-IN" ? 0.95 : 1.0;
    utterance.pitch = 1.0;

    function assignVoice() {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return;

      let matchVoice = null;

      if (targetLang === "hi-IN") {
        // Look for dedicated Hindi voices
        matchVoice =
          voices.find((v) => v.lang === "hi-IN" || v.lang === "hi_IN" || v.lang.startsWith("hi")) ||
          voices.find(
            (v) =>
              v.name.toLowerCase().includes("hindi") ||
              v.name.toLowerCase().includes("hemant") ||
              v.name.toLowerCase().includes("kalpana") ||
              v.name.toLowerCase().includes("lekha")
          ) ||
          voices.find((v) => v.lang === "en-IN" || v.name.toLowerCase().includes("india"));
      } else {
        // Look for Indian English or standard English voices
        matchVoice =
          voices.find((v) => v.lang === "en-IN" || v.lang === "en_IN") ||
          voices.find((v) => v.name.toLowerCase().includes("india")) ||
          voices.find((v) => v.lang.startsWith("en"));
      }

      if (matchVoice) {
        utterance.voice = matchVoice;
      }
    }

    assignVoice();

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn("SpeechSynthesis error:", err);
  }
}
