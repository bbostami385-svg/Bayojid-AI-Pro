import { useState, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface UseVoiceOptions {
  language?: string;
  onTranscribed?: (text: string) => void;
  onError?: (error: string) => void;
}

export function useVoice(options: UseVoiceOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  // Initialize speech recognition
  const initializeSpeechRecognition = useCallback(() => {
    if (recognitionRef.current) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("আপনার ব্রাউজার ভয়েস রিকগনিশন সাপোর্ট করে না / Your browser doesn't support speech recognition");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.language = options.language || "bn-BD";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      options.onTranscribed?.(transcript);
    };

    recognition.onerror = (event: any) => {
      const errorMessage = `ভয়েস রিকগনিশন ত্রুটি / Voice recognition error: ${event.error}`;
      toast.error(errorMessage);
      options.onError?.(event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [options]);

  // Start listening
  const startListening = useCallback(() => {
    initializeSpeechRecognition();
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  }, [initializeSpeechRecognition]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  // Text to Speech
  const speak = useCallback((text: string, language: string = "bn-BD") => {
    if (!("speechSynthesis" in window)) {
      toast.error("আপনার ব্রাউজার টেক্সট-টু-স্পিচ সাপোর্ট করে না / Your browser doesn't support text-to-speech");
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (event) => {
      toast.error("টেক্সট-টু-স্পিচ ত্রুটি / Text-to-speech error");
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return {
    isListening,
    isProcessing,
    isSpeaking,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
}
