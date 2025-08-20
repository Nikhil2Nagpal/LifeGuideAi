import { useVoice } from "@/hooks/use-voice";
import { cn } from "@/lib/utils";
import { VOICE_LANGUAGES } from "@/lib/constants";
import { useState } from "react";

interface VoiceControlProps {
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
  language?: string;
  className?: string;
}

export function VoiceControl({ 
  onResult, 
  onError, 
  language = 'en-US', 
  className 
}: VoiceControlProps) {
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  
  const { 
    isListening, 
    isSupported, 
    toggleListening 
  } = useVoice({
    onResult: (transcript, confidence) => {
      console.log(`Voice input (${confidence}): ${transcript}`);
      onResult?.(transcript);
    },
    onError: (error) => {
      console.error('Voice error:', error);
      onError?.(error);
    },
    language: selectedLanguage,
    continuous: false
  });

  if (!isSupported) {
    return (
      <div className={cn("flex items-center space-x-4", className)}>
        <div className="text-xs text-gray-500">Voice not supported</div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center space-x-4", className)}>
      {/* Voice Control Button */}
      <button
        onClick={toggleListening}
        className={cn(
          "glass-effect w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
          isListening 
            ? "neon-glow-blue voice-pulse" 
            : "hover:neon-glow-blue"
        )}
        data-testid="voice-control-button"
        title={isListening ? "Stop listening" : "Start voice input"}
      >
        <i className={cn(
          "text-medical-blue",
          isListening ? "fas fa-microphone-slash" : "fas fa-microphone"
        )}></i>
      </button>
      
      {/* Language Selector */}
      <select 
        value={selectedLanguage}
        onChange={(e) => setSelectedLanguage(e.target.value)}
        className="glass-effect rounded-lg px-3 py-2 bg-transparent border border-gray-600 text-white text-sm focus:border-medical-blue focus:outline-none"
        data-testid="language-selector"
      >
        {VOICE_LANGUAGES.map((lang) => (
          <option key={lang.code} value={`${lang.code}-US`} className="bg-dark-card text-white">
            {lang.name}
          </option>
        ))}
      </select>
      
      {/* Voice Status */}
      {isListening && (
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-medical-blue rounded-full animate-pulse"></div>
          <span className="text-xs text-medical-blue">Listening...</span>
        </div>
      )}
    </div>
  );
}
