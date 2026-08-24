/**
 * Utility for Text-to-Speech (TTS) voice responses using Browser SpeechSynthesis API.
 * Optimized for natural, smooth human audio without repetitive speech or robotic audio stutter.
 */

let lastSpokenText = "";
let lastSpokenTime = 0;

export function speakResponse(text, lang = "en-IN") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  try {
    // Clean text: strip emoji, punctuation marks, or markdown characters for smooth speech
    const cleanText = (text || "")
      .toString()
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
      .replace(/[*_#`~✓✕?•]/g, "")
      .trim();

    if (!cleanText) return;

    // Prevent duplicate speech calls within 3 seconds for identical text
    const now = Date.now();
    if (cleanText === lastSpokenText && now - lastSpokenTime < 3000) {
      return;
    }
    lastSpokenText = cleanText;
    lastSpokenTime = now;

    // Cancel any queued or ongoing speech to prevent audio overlap
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const targetLang = lang === "hi-IN" ? "hi-IN" : "en-IN";
    utterance.lang = targetLang;
    utterance.rate = lang === "hi-IN" ? 0.92 : 0.95; // Soft, natural human speed
    utterance.pitch = 1.02; // Warm, natural vocal pitch

    function assignVoice() {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return;

      let matchVoice = null;

      if (targetLang === "hi-IN") {
        matchVoice =
          voices.find((v) => v?.lang === "hi-IN" || v?.lang === "hi_IN" || (typeof v?.lang === "string" && v.lang.startsWith("hi"))) ||
          voices.find(
            (v) =>
              (typeof v?.name === "string" && v.name.toLowerCase().includes("google hi")) ||
              (typeof v?.name === "string" && v.name.toLowerCase().includes("natural")) ||
              (typeof v?.name === "string" && v.name.toLowerCase().includes("hindi")) ||
              (typeof v?.name === "string" && v.name.toLowerCase().includes("hemant")) ||
              (typeof v?.name === "string" && v.name.toLowerCase().includes("kalpana"))
          ) ||
          voices.find((v) => v?.lang === "en-IN" || (typeof v?.name === "string" && v.name.toLowerCase().includes("india")));
      } else {
        matchVoice =
          voices.find((v) => v?.lang === "en-IN" || v?.lang === "en_IN") ||
          voices.find((v) => typeof v?.name === "string" && (v.name.toLowerCase().includes("natural") || v.name.toLowerCase().includes("google"))) ||
          voices.find((v) => typeof v?.name === "string" && v.name.toLowerCase().includes("india")) ||
          voices.find((v) => typeof v?.lang === "string" && v.lang.startsWith("en"));
      }

      if (matchVoice) {
        utterance.voice = matchVoice;
      }
    }

    assignVoice();

    // Small timeout ensures cancel() fully clears before new speech begins
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 50);

  } catch (err) {
    console.warn("SpeechSynthesis error:", err);
  }
}
