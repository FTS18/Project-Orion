import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Send, Mic, Loader2, User, Bot } from "lucide-react";
import type { AgentMessage } from "@shared/schema";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ChatInterfaceProps {
  messages: AgentMessage[];
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function ChatInterface({
  messages,
  onSendMessage,
  isLoading = false,
  disabled = false,
  placeholder = "Type your message...",
  className,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled && !isLoading) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  return (
    <Card className={cn("flex flex-col h-full", className)}>
      <ScrollArea 
        className="flex-1 p-4" 
        ref={scrollRef}
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
      >
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Bot className="h-8 w-8 text-primary" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Welcome to Loan Assistant</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                I'm your AI-powered loan assistant. I'll help you through the loan application process. 
                Let's start by getting some basic information about your loan requirements.
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <ChatMessage 
              key={message.id} 
              message={message} 
              isLast={index === messages.length - 1}
            />
          ))}

          {isLoading && (
            <div className="flex items-start gap-3 animate-fade-in">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary">
                  <Bot className="h-4 w-4" aria-hidden="true" />
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl rounded-tl-sm bg-muted max-w-md">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden="true" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={placeholder}
              disabled={disabled || isLoading}
              className="pr-10 h-12 text-base"
              aria-label="Message input"
              data-testid="input-chat-message"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground"
              aria-label="Voice input (not available)"
              disabled
            >
              <Mic className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
          <Button
            type="submit"
            size="icon"
            className="h-12 w-12"
            disabled={!input.trim() || disabled || isLoading}
            aria-label="Send message"
            data-testid="button-send-message"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="h-5 w-5" aria-hidden="true" />
            )}
          </Button>
        </form>
      </div>
    </Card>
  );
}

interface ChatMessageProps {
  message: AgentMessage;
  isLast?: boolean;
}

function ChatMessage({ message, isLast }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  if (isSystem) {
    return (
      <div 
        className={cn(
          "flex justify-center animate-fade-in",
          isLast && "animate-slide-in-right"
        )}
        data-testid={`message-system-${message.id}`}
      >
        <div className="px-4 py-2 rounded-full bg-primary/5 text-primary text-sm font-medium">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "flex items-start gap-3",
        isUser && "flex-row-reverse",
        isLast && "animate-fade-in"
      )}
      data-testid={`message-${isUser ? "user" : "agent"}-${message.id}`}
    >
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback className={cn(
          isUser ? "bg-secondary text-secondary-foreground" : "bg-primary/10 text-primary"
        )}>
          {isUser ? (
            <User className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Bot className="h-4 w-4" aria-hidden="true" />
          )}
        </AvatarFallback>
      </Avatar>

      <div className={cn(
        "flex flex-col gap-1 max-w-md",
        isUser && "items-end"
      )}>
        <div className={cn(
          "px-4 py-3 rounded-2xl text-sm",
          isUser 
            ? "bg-primary text-primary-foreground rounded-tr-sm" 
            : "bg-muted rounded-tl-sm"
        )}>
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
        <span className="text-[10px] text-muted-foreground px-1">
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </span>
      </div>
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      {[...Array(3)].map((_, i) => (
        <div 
          key={i} 
          className={cn(
            "flex items-start gap-3",
            i % 2 === 0 ? "" : "flex-row-reverse"
          )}
        >
          <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          <div className={cn(
            "h-16 rounded-2xl bg-muted animate-pulse",
            i % 2 === 0 ? "w-2/3 rounded-tl-sm" : "w-1/2 rounded-tr-sm"
          )} />
        </div>
      ))}
    </div>
  );
}
