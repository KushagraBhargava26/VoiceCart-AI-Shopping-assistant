import { useState, useEffect } from "react";
import { useVoiceRecognition } from "../../hooks/useVoiceRecognition.js";
import { sendVoiceCommand } from "../../services/command.service.js";
import { getItemIcon } from "../../utils/itemIcons.js";
import { speakResponse } from "../../utils/speech.js";

const LANGUAGES = [
  { code: "en-IN", label: "English (India)" },
  { code: "hi-IN", label: "Hindi (हिंदी)" },
];

const EXAMPLE_COMMANDS = {
  "en-IN": [
    { text: "Add milk to my list", keyword: "milk" },
    { text: "I need 2 bottles of water", keyword: "water" },
    { text: "Remove bread", keyword: "bread" },
    { text: "Find toothpaste under 300", keyword: "toothpaste" },
  ],
  "hi-IN": [
    { text: "2 packet dahi add karo", keyword: "curd" },
    { text: "1 kg chawal list mein daalo", keyword: "rice" },
    { text: "Bread hata do", keyword: "bread" },
    { text: "Chai patti search karo", keyword: "tea" },
  ],
};

function detectNavigation(transcriptText, result) {
  const t = (transcriptText || "").toLowerCase().trim();
  const q = (result?.query || "").toLowerCase().trim();

  if (
    /\b(open|show|view|go to|see|kholo|dikhao)\s+(category|categories|shreni)\b/i.test(t) ||
    q === "categories" ||
    q === "category"
  ) {
    return "categories";
  }
  if (
    /\b(open|show|view|go to|see|kholo|dikhao)\s+(history|purchase history|past orders|purani list)\b/i.test(t) ||
    q === "history"
  ) {
    return "history";
  }
  if (
    /\b(open|show|view|go to|see|kholo|dikhao)\s+(suggestions|smart suggestions|recommendations|sujhav)\b/i.test(t) ||
    q === "suggestions"
  ) {
    return "suggestions";
  }
  if (
    /\b(open|show|view|go to|see|kholo|dikhao)\s+(shopping list|my list|the list|cart|list)\b/i.test(t) ||
    q === "shopping list" ||
    q === "list"
  ) {
    return "shopping-list";
  }
  if (/\b(go|open|show|kholo)\s+(home|dashboard|ghar)\b/i.test(t) || q === "home") {
    return "home";
  }
  return null;
}

export default function VoiceCard({ onCommandProcessed, onSearchCommand, onNavigate }) {
  const [language, setLanguage] = useState("en-IN");
  const [audioFeedback, setAudioFeedback] = useState(true);
  const { isSupported, isListening, transcript, error: recognitionError, startListening, resetTranscript } = useVoiceRecognition(language);

  const [processing, setProcessing] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const isHindi = language === "hi-IN";

  useEffect(() => {
    if (!transcript) return;

    async function processCommand() {
      setProcessing(true);
      setFeedback(null);
      try {
        const result = await sendVoiceCommand(transcript, language);

        // Check if the command was a navigation request (e.g. "open categories", "show history")
        const navTarget = detectNavigation(transcript, result);
        if (navTarget) {
          onNavigate?.(navTarget);
          const label = navTarget === "shopping-list" ? "Shopping List" : navTarget.charAt(0).toUpperCase() + navTarget.slice(1);
          const msg = isHindi ? `${label} khol diya gaya hai.` : `Opened ${label}.`;
          setFeedback({
            status: "success",
            heading: isHindi ? "Navigation safal raha" : "Navigating",
            lines: [msg],
          });
          if (audioFeedback) {
            speakResponse(msg, language);
          }
          return;
        }

        const { status, heading, lines, spokenText } = buildFeedback(result, language);
        setFeedback({ status, heading, lines });

        // Play audio spoken feedback
        if (audioFeedback && spokenText) {
          speakResponse(spokenText, language);
        }

        if (status === "success") {
          onCommandProcessed?.();
        }

        if (result.action === "SEARCH_PRODUCT") {
          onSearchCommand?.(result.query);
        }
      } catch (err) {
        const errMsg = isHindi ? "Maaf kijiye, command execute nahi ho paya." : err.message;
        setFeedback({
          status: "error",
          heading: isHindi ? "Command fail ho gaya" : "Command failed",
          lines: [errMsg],
        });
        if (audioFeedback) {
          speakResponse(isHindi ? "Maaf kijiye, command execute nahi ho paya." : "Sorry, the command could not be processed.", language);
        }
      } finally {
        setProcessing(false);
        resetTranscript();
      }
    }

    processCommand();
  }, [transcript, language, audioFeedback]);

  function buildFeedback(result, lang) {
    const isHi = lang === "hi-IN";

    switch (result.action) {
      case "ADD_ITEM": {
        const items = result.items || [];
        const lines = items.map((i) =>
          isHi
            ? `${getItemIcon(i.name)} ${i.name} (${i.quantity} ${i.unit}) list mein add ho gaya`
            : `${getItemIcon(i.name)} Added ${i.quantity} ${i.unit} of ${i.name}`
        );

        const spokenText = isHi
          ? items.length === 1
            ? `Aapki shopping list mein ${items[0].quantity} ${items[0].unit} ${items[0].name} add kar diya gaya hai.`
            : `Aapki shopping list mein ${items.map((i) => `${i.quantity} ${i.unit} ${i.name}`).join(" aur ")} add kar diya gaya hai.`
          : items.length === 1
          ? `Added ${items[0].quantity} ${items[0].unit} of ${items[0].name} to your shopping list.`
          : `Added ${items.map((i) => `${i.quantity} ${i.unit} of ${i.name}`).join(" and ")} to your shopping list.`;

        return {
          status: "success",
          heading: isHi ? "Command safal raha" : "Command executed successfully",
          lines,
          spokenText,
        };
      }
      case "REMOVE_ITEM": {
        const lines = [isHi ? "Item shopping list se hata diya gaya hai." : result.message];
        const spokenText = isHi ? "Item aapki shopping list se hata diya gaya hai." : result.message;
        return {
          status: "success",
          heading: isHi ? "Command safal raha" : "Command executed successfully",
          lines,
          spokenText,
        };
      }
      case "UPDATE_ITEM": {
        const lines = [isHi ? "Item ki quantity update ho gayi hai." : result.message];
        const spokenText = isHi ? "Quantity update kar di gayi hai." : result.message;
        return {
          status: "success",
          heading: isHi ? "Command safal raha" : "Command executed successfully",
          lines,
          spokenText,
        };
      }
      case "SEARCH_PRODUCT": {
        const count = result.results?.length || 0;
        const lines = [isHi ? `"${result.query}" ke liye ${count} results mile` : `Found ${count} result(s) for "${result.query}"`];
        const spokenText = isHi ? `${result.query} ke liye ${count} products mile hain.` : `Found ${count} products for ${result.query}.`;
        return {
          status: "success",
          heading: isHi ? "Search pura hua" : "Command executed successfully",
          lines,
          spokenText,
        };
      }
      case "GET_SUGGESTIONS": {
        const count = result.suggestions?.length || 0;
        const lines = [isHi ? `Aapke liye ${count} smart suggestions hain` : `Here are ${count} suggestion(s) for you`];
        const spokenText = isHi ? `Aapke liye ${count} suggestions taiyaar hain.` : `Here are ${count} suggestions for your shopping list.`;
        return {
          status: "success",
          heading: isHi ? "Smart suggestions taiyaar hain" : "Command executed successfully",
          lines,
          spokenText,
        };
      }
      case "CLARIFICATION_REQUIRED":
        return {
          status: "partial",
          heading: isHi ? "Thoda saaf batayein" : "Could you clarify?",
          lines: [result.message],
          spokenText: isHi ? "Kripya thoda saaf batayein, aapko kaunsa item chahiye?" : result.message,
        };
      case "UNKNOWN":
      default:
        return {
          status: "partial",
          heading: isHi ? "Samajh nahi aaya" : "Didn't understand that",
          lines: [isHi ? "Command samajh nahi aayi. Kripya dobara saaf aawaz mein bolein." : result.message || "Sorry, I didn't understand that. Try rephrasing your command."],
          spokenText: isHi ? "Maaf kijiye, samajh nahi aaya. Kripya dobara bolein." : "Sorry, I did not understand that command. Please try again.",
        };
    }
  }

  // Feedback box styling per status
  const feedbackStyles = {
    success: {
      wrapper: "border-teal-dim bg-teal/5",
      heading: "text-teal",
      body: "text-text-dim",
      icon: "✓",
    },
    partial: {
      wrapper: "border-yellow-500/30 bg-yellow-400/5",
      heading: "text-yellow-400",
      body: "text-text-dim",
      icon: "?",
    },
    error: {
      wrapper: "border-red-400/30 bg-red-400/5",
      heading: "text-red-400",
      body: "text-text-dim",
      icon: "✕",
    },
  };

  if (!isSupported) {
    return (
      <div className="bg-panel border border-border-soft rounded-xl p-5 text-center">
        <p className="text-text-dim text-[13px]">
          Voice input isn't supported in this browser. Please use Chrome, Edge, or Safari — or add items manually from the Shopping List.
        </p>
      </div>
    );
  }

  const examples = EXAMPLE_COMMANDS[language] || EXAMPLE_COMMANDS["en-IN"];

  return (
    <div className="bg-panel border border-border-soft rounded-xl p-5 text-center">
      <div className="flex items-center justify-center gap-2 mb-5">
        {/* Language selector */}
        <div className="inline-flex items-center gap-1.5 bg-panel-2 border border-border-soft rounded-full px-3 py-1 text-[11px] text-text-dim">
          <span>🌐</span>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-transparent outline-none text-text-main cursor-pointer">
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code} className="bg-panel-2 text-text-main">
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* Audio response toggle */}
        <button
          onClick={() => setAudioFeedback((prev) => !prev)}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] border transition-colors ${
            audioFeedback
              ? "bg-teal/10 border-teal/30 text-teal"
              : "bg-panel-2 border-border-soft text-text-faint hover:text-text-dim"
          }`}
          title={audioFeedback ? "Voice audio response enabled" : "Voice audio response muted"}>
          <span>{audioFeedback ? "🔊" : "🔇"}</span>
          <span>{audioFeedback ? (isHindi ? "Aawaz On" : "Voice on") : (isHindi ? "Mute" : "Muted")}</span>
        </button>
      </div>

      <button
        onClick={startListening}
        disabled={isListening || processing}
        className={`w-28 h-28 rounded-full mx-auto flex items-center justify-center text-4xl border transition-all ${
          isListening
            ? "border-teal shadow-[0_0_30px_rgba(29,211,168,0.35)] bg-teal/10 scale-105"
            : "border-border-soft bg-panel-2 hover:border-teal-dim hover:scale-102"
        }`}>
        🎤
      </button>

      <div className="mt-4">
        {isListening && <p className="text-[15px] font-medium text-teal animate-pulse">{isHindi ? "Main sun raha hoon..." : "I'm listening..."}</p>}
        {processing && (
          <div className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-purple border-t-transparent animate-spin" />
            <p className="text-[15px] font-medium text-purple">{isHindi ? "Process ho raha hai..." : "Processing command..."}</p>
          </div>
        )}
        {!isListening && !processing && <p className="text-[15px] font-medium">{isHindi ? "Bolne ke liye mic dabayein" : "Tap the mic to speak"}</p>}
        {!isListening && !processing && <p className="text-[11.5px] text-text-faint mt-1">{isHindi ? "Aap aise bol sakte hain" : "Try saying something like"}</p>}
      </div>

      {recognitionError && <p className="text-red-400 text-[12px] mt-3">{recognitionError}</p>}

      {feedback && (() => {
        const style = feedbackStyles[feedback.status] ?? feedbackStyles.error;
        return (
          <div className={`mt-4 text-left rounded-lg p-3 border text-[12px] ${style.wrapper}`}>
            <div className={`font-medium mb-1 ${style.heading}`}>
              {style.icon} {feedback.heading}
            </div>
            {feedback.lines.map((line, idx) => (
              <div key={idx} className={style.body}>
                {line}
              </div>
            ))}
          </div>
        );
      })()}

      {!isListening && !processing && !feedback && (
        <div className="flex flex-wrap gap-2 justify-center mt-4">
          {examples.map((cmd) => (
            <span key={cmd.text} className="text-[11px] bg-panel-2 border border-border-soft text-text-dim px-3 py-1 rounded-full">
              {getItemIcon(cmd.keyword)} {cmd.text}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
