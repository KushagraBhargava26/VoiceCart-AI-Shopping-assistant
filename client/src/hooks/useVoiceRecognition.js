import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Wraps the browser's built-in SpeechRecognition API.
 * Returns listening state, the latest transcript, any error, and start/stop controls.
 */
export function useVoiceRecognition(language = 'en-IN') {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;
    recognition.lang = language;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          finalTranscript += item[0].transcript;
        } else {
          interimTranscript += item[0].transcript;
        }
      }

      const text = finalTranscript || interimTranscript;
      if (text) {
        setTranscript(text);
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech') {
        setError("Couldn't hear clearly. Please speak near the mic and try again.");
      } else if (event.error === 'not-allowed') {
        setError('Microphone access was denied. Please allow microphone permissions in browser.');
      } else if (event.error !== 'aborted') {
        setError('Voice recognition error. Please try again.');
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch (e) {}
    };
  }, [language]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setTranscript('');
    setError(null);
    try {
      recognitionRef.current.start();
    } catch (err) {
      // start() throws if already started; safe to ignore
    }
  }, []);

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch (e) {}
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}