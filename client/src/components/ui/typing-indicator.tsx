import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  className?: string;
  show: boolean;
}

export function TypingIndicator({ className, show }: TypingIndicatorProps) {
  if (!show) return null;

  return (
    <div className={cn("flex items-start space-x-3", className)} data-testid="typing-indicator">
      <div className="w-8 h-8 bg-gradient-to-r from-medical-blue to-career-gold rounded-full flex items-center justify-center flex-shrink-0">
        <i className="fas fa-robot text-white text-sm"></i>
      </div>
      <div className="chat-bubble-bot rounded-2xl px-4 py-3">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.1s]"></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.2s]"></div>
        </div>
      </div>
    </div>
  );
}
