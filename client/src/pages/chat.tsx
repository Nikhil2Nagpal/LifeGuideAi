import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "wouter";
import { useWebSocket } from "@/hooks/use-websocket";
import { useVoice } from "@/hooks/use-voice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/components/ui/chat-message";
import { TypingIndicator } from "@/components/ui/typing-indicator";
import { VoiceControl } from "@/components/ui/voice-control";
import { useToast } from "@/hooks/use-toast";
import { AI_MODES, type AIMode } from "@/lib/constants";
import type { Message } from "@shared/schema";

interface WebSocketMessage {
  type: string;
  content?: string;
  metadata?: any;
  conversationId?: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [currentMode, setCurrentMode] = useState<AIMode>(AI_MODES.DUAL);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { isConnected, sendMessage } = useWebSocket({
    url: `/ws`,
    onMessage: (message: WebSocketMessage) => {
      if (message.type === 'chat_response') {
        setIsTyping(false);
        
        // Create AI message
        const aiMessage: Message = {
          id: Date.now().toString(),
          conversationId: message.conversationId,
          role: 'assistant',
          content: message.content || '',
          metadata: message.metadata,
          createdAt: new Date()
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setConversationId(message.conversationId);
        
        // Handle emergency alerts
        if (message.metadata?.urgency === 'emergency') {
          toast({
            title: "Emergency Alert",
            description: "Please seek immediate medical attention.",
            variant: "destructive"
          });
        }
      } else if (message.type === 'error') {
        setIsTyping(false);
        toast({
          title: "Error",
          description: "Failed to process your message. Please try again.",
          variant: "destructive"
        });
      }
    },
    onError: () => {
      toast({
        title: "Connection Error",
        description: "Unable to connect to AI assistant.",
        variant: "destructive"
      });
    }
  });

  const { speak } = useVoice();

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages, isTyping]);

  // Send initial greeting message
  useEffect(() => {
    const greeting: Message = {
      id: 'greeting',
      conversationId: undefined,
      role: 'assistant',
      content: "Hello! I'm your AI assistant. I can help you with both career guidance and health advice. What would you like to discuss today?",
      createdAt: new Date()
    };
    setMessages([greeting]);
  }, []);

  const handleSendMessage = useCallback(async (message: string = inputValue) => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || !isConnected) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      conversationId,
      role: 'user',
      content: trimmedMessage,
      createdAt: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Send via WebSocket
    sendMessage({
      type: 'chat',
      message: trimmedMessage,
      mode: currentMode,
      conversationId
    });
  }, [inputValue, isConnected, sendMessage, currentMode, conversationId]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleModeSwitch = useCallback((mode: AIMode) => {
    setCurrentMode(mode);
    
    const modeMessage: Message = {
      id: `mode-${Date.now()}`,
      conversationId,
      role: 'assistant',
      content: `I'm now in ${mode === 'career' ? 'CareerBot' : mode === 'health' ? 'HealthBot' : 'Dual AI'} mode. ${
        mode === 'career' 
          ? 'I can help with skill development, job searching, interview preparation, and salary negotiations.'
          : mode === 'health'
          ? 'I can provide health information and wellness guidance. Please remember to consult healthcare professionals for serious concerns.'
          : 'I can assist with both career and health topics.'
      } How can I help you?`,
      createdAt: new Date()
    };
    
    setMessages(prev => [...prev, modeMessage]);
    
    toast({
      title: `${mode === 'career' ? 'CareerBot' : mode === 'health' ? 'HealthBot' : 'Dual AI'} Activated`,
      description: `Switched to ${mode} assistance mode.`
    });
  }, [conversationId, toast]);

  const handleVoiceResult = useCallback((transcript: string) => {
    setInputValue(transcript);
    // Auto-send after voice input
    setTimeout(() => handleSendMessage(transcript), 500);
  }, [handleSendMessage]);

  const handleSpeakResponse = useCallback((message: Message) => {
    if (message.role === 'assistant') {
      speak(message.content);
    }
  }, [speak]);

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      {/* Header */}
      <header className="glass-effect px-6 py-4 border-b border-gray-600">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="button-back">
                <i className="fas fa-arrow-left mr-2"></i>
                Back to Dashboard
              </Button>
            </Link>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-medical-blue to-career-gold rounded-lg flex items-center justify-center">
                <i className="fas fa-robot text-white"></i>
              </div>
              <div>
                <h1 className="font-semibold">
                  {currentMode === 'career' ? 'CareerBot' : currentMode === 'health' ? 'HealthBot' : 'AI Assistant'}
                </h1>
                <p className="text-xs text-gray-400">
                  {isConnected ? 'Online' : 'Connecting...'}
                </p>
              </div>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center space-x-2">
            <Button
              variant={currentMode === 'career' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleModeSwitch('career')}
              className={currentMode === 'career' ? 'bg-career-gold hover:bg-career-gold-dark' : ''}
              data-testid="button-career-mode"
            >
              <i className="fas fa-briefcase mr-1"></i>
              Career
            </Button>
            <Button
              variant={currentMode === 'health' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleModeSwitch('health')}
              className={currentMode === 'health' ? 'bg-medical-blue hover:bg-medical-blue-dark' : ''}
              data-testid="button-health-mode"
            >
              <i className="fas fa-heartbeat mr-1"></i>
              Health
            </Button>
            <Button
              variant={currentMode === 'dual' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleModeSwitch('dual')}
              className={currentMode === 'dual' ? 'bg-gradient-to-r from-medical-blue to-career-gold' : ''}
              data-testid="button-dual-mode"
            >
              <i className="fas fa-brain mr-1"></i>
              Dual
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-6 h-[calc(100vh-120px)] flex flex-col">
        {/* Chat Messages */}
        <Card className="flex-1 glass-effect mb-4">
          <CardContent className="p-0 h-full">
            <ScrollArea className="h-full p-6" ref={scrollAreaRef}>
              <div className="space-y-4" data-testid="chat-messages">
                {messages.map((message) => (
                  <div key={message.id} className="group relative">
                    <ChatMessage message={message} />
                    {message.role === 'assistant' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute -right-2 top-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleSpeakResponse(message)}
                        data-testid={`speak-button-${message.id}`}
                      >
                        <i className="fas fa-volume-up"></i>
                      </Button>
                    )}
                  </div>
                ))}
                
                <TypingIndicator show={isTyping} />
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Input */}
        <Card className="glass-effect">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <VoiceControl
                onResult={handleVoiceResult}
                onError={(error) => toast({
                  title: "Voice Error",
                  description: error,
                  variant: "destructive"
                })}
              />
              
              <div className="flex-1 relative">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about your career or health..."
                  className="glass-effect bg-transparent border-gray-600 text-white placeholder-gray-400 focus:border-medical-blue pr-12"
                  disabled={!isConnected}
                  data-testid="input-chat"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-medical-blue"
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || !isConnected}
                  data-testid="button-send-inline"
                >
                  <i className="fas fa-paper-plane"></i>
                </Button>
              </div>
              
              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || !isConnected}
                className="bg-gradient-to-r from-medical-blue to-career-gold hover:from-medical-blue-dark hover:to-career-gold-dark text-white"
                data-testid="button-send"
              >
                <i className="fas fa-paper-plane mr-2"></i>
                Send
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
