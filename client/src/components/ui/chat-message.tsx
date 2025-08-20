import { cn } from "@/lib/utils";
import type { Message } from "@shared/schema";

interface ChatMessageProps {
  message: Message;
  className?: string;
}

export function ChatMessage({ message, className }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  return (
    <div className={cn(
      "flex items-start space-x-3",
      isUser && "justify-end",
      className
    )} data-testid={`message-${message.role}-${message.id}`}>
      
      {!isUser && (
        <div className="w-8 h-8 bg-gradient-to-r from-medical-blue to-career-gold rounded-full flex items-center justify-center flex-shrink-0">
          <i className="fas fa-robot text-white text-sm"></i>
        </div>
      )}
      
      <div className={cn(
        "rounded-2xl px-4 py-3 max-w-xs lg:max-w-md",
        isUser 
          ? "chat-bubble-user" 
          : "chat-bubble-bot"
      )}>
        <p className={cn(
          "text-sm whitespace-pre-wrap",
          isUser && "text-white"
        )}>
          {message.content}
        </p>
        
        {message.metadata?.urgency === 'emergency' && !isUser && (
          <div className="mt-2 p-2 bg-red-500/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <i className="fas fa-exclamation-triangle text-red-400"></i>
              <span className="text-xs text-red-300">Emergency: Seek immediate medical attention</span>
            </div>
          </div>
        )}
        
        {message.metadata?.suggestions && message.metadata.suggestions.length > 0 && !isUser && (
          <div className="mt-3 space-y-1">
            <p className="text-xs text-gray-400">Suggestions:</p>
            {message.metadata.suggestions.map((suggestion: string, index: number) => (
              <button
                key={index}
                className="block w-full text-left text-xs p-2 glass-effect rounded-lg hover:bg-white/10 transition-colors"
                data-testid={`suggestion-${index}`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {isUser && (
        <div className="w-8 h-8 bg-gradient-to-r from-career-gold to-medical-blue rounded-full flex items-center justify-center flex-shrink-0">
          <i className="fas fa-user text-white text-sm"></i>
        </div>
      )}
    </div>
  );
}
