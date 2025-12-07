import { useState, useRef, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Loader2, User, Bot, Sparkles } from "lucide-react";
import type { AgentMessage } from "@shared/schema";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";

// Simple markdown parser for chat messages
function parseMarkdown(text: string): React.ReactNode {
  if (!text) return null;
  
  // Split by lines first to handle bullets
  const lines = text.split('\n');
  
  return lines.map((line, lineIndex) => {
    // Parse inline markdown (bold, italic)
    const parseInline = (str: string): React.ReactNode[] => {
      const parts: React.ReactNode[] = [];
      let remaining = str;
      let key = 0;
      
      // Match **bold** or *italic*
      const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
      let lastIndex = 0;
      let match;
      
      while ((match = regex.exec(remaining)) !== null) {
        // Add text before match
        if (match.index > lastIndex) {
          parts.push(remaining.slice(lastIndex, match.index));
        }
        
        // Check if it's bold or italic
        if (match[2]) {
          // **bold**
          parts.push(<strong key={key++} className="font-semibold">{match[2]}</strong>);
        } else if (match[3]) {
          // *italic*
          parts.push(<em key={key++}>{match[3]}</em>);
        }
        
        lastIndex = match.index + match[0].length;
      }
      
      // Add remaining text
      if (lastIndex < remaining.length) {
        parts.push(remaining.slice(lastIndex));
      }
      
      return parts.length > 0 ? parts : [remaining];
    };
    
    // Check if line is a bullet point
    const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
    const trimmedLine = isBullet ? line.trim().slice(1).trim() : line;
    
    const content = parseInline(isBullet ? trimmedLine : line);
    
    return (
      <span key={lineIndex}>
        {isBullet && <span className="text-primary mr-2">•</span>}
        {content}
        {lineIndex < lines.length - 1 && <br />}
      </span>
    );
  });
}


interface ChatInterfaceProps {
  messages: AgentMessage[];
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  suggestedActions?: string[];
}

export function ChatInterface({
  messages,
  onSendMessage,
  isLoading = false,
  disabled = false,
  placeholder = "Type your message...",
  className,
  suggestedActions,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 0);
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled && !isLoading) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  return (
    <Card className={cn("flex flex-col h-full w-full min-h-0 overflow-hidden bg-gradient-to-b from-background to-background/95", className)}>
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4 min-h-0"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
      >
        {messages.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <motion.div 
              className="relative h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex items-center justify-center mb-4"
              animate={{ 
                boxShadow: [
                  "0 0 20px hsl(var(--primary) / 0.2)",
                  "0 0 30px hsl(var(--primary) / 0.3)",
                  "0 0 20px hsl(var(--primary) / 0.2)",
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-primary/30"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
              <Bot className="h-8 w-8 text-primary" aria-hidden="true" />
            </motion.div>
            <h3 className="text-lg font-semibold mb-1 text-foreground">
              Loan Assistant
            </h3>
            <p className="text-xs text-muted-foreground max-w-xs">
              AI-powered loan processing assistant
            </p>
          </motion.div>
        )}

        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => (
            <ChatMessage 
              key={message.id} 
              message={message} 
              isLast={index === messages.length - 1}
              isNew={index === messages.length - 1}
            />
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3"
          >
            <AnimatedAvatar isActive />
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl rounded-tl-sm bg-gradient-to-r from-muted/80 to-muted/60 backdrop-blur-sm border border-white/5">
              <motion.div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-2 h-2 rounded-full bg-primary"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                  />
                ))}
              </motion.div>
              <span className="text-sm text-muted-foreground ml-2">Thinking...</span>
            </div>
          </motion.div>
        )}
      </div>

      <div className="p-4 border-t border-white/5 bg-gradient-to-t from-muted/20 to-transparent space-y-4">
        {suggestedActions && suggestedActions.length > 0 && !isLoading && !disabled && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 overflow-x-auto pb-2 scrollbar-none"
          >
            {suggestedActions.map((action, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full bg-background/50 backdrop-blur-sm border-violet-500/20 hover:border-violet-500/50 hover:bg-violet-500/10 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] whitespace-nowrap transition-all duration-300 group"
                  onClick={() => onSendMessage(action)}
                >
                  <Sparkles className="w-3 h-3 mr-1.5 text-violet-400 group-hover:animate-pulse" />
                  {action}
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <motion.div 
            className={cn(
              "relative flex-1 rounded-xl transition-all duration-300",
              isFocused && "shadow-[0_0_15px_hsl(var(--primary)/0.15)]"
            )}
            animate={isFocused ? { scale: 1.01 } : { scale: 1 }}
          >
            <Input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              disabled={disabled || isLoading}
              className={cn(
                "h-12 text-base rounded-xl bg-muted/50 border-primary/20 transition-all duration-300",
                isFocused && "border-primary/50 bg-muted/70"
              )}
              aria-label="Message input"
              data-testid="input-chat-message"
            />
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              type="submit"
              size="icon"
              className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 shadow-lg hover:shadow-primary/25 transition-all duration-300"
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
          </motion.div>
        </form>
      </div>
    </Card>
  );
}

interface AnimatedAvatarProps {
  isUser?: boolean;
  isActive?: boolean;
}

function AnimatedAvatar({ isUser = false, isActive = false }: AnimatedAvatarProps) {
  return (
    <div className="relative">
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(139, 92, 246, 0.4)",
              "0 0 0 8px rgba(139, 92, 246, 0)",
            ],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback className={cn(
          "transition-all duration-300",
          isUser 
            ? "bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-400" 
            : "bg-gradient-to-br from-violet-500/20 to-indigo-500/20 text-violet-400"
        )}>
          {isUser ? (
            <User className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Bot className="h-4 w-4" aria-hidden="true" />
          )}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}

interface ChatMessageProps {
  message: AgentMessage;
  isLast?: boolean;
  isNew?: boolean;
}

function ChatMessage({ message, isLast, isNew }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";
  const [displayedText, setDisplayedText] = useState(isNew && !isUser ? "" : message.content);
  const [isTyping, setIsTyping] = useState(isNew && !isUser && !isSystem);

  useEffect(() => {
    if (isNew && !isUser && !isSystem && isTyping) {
      let index = 0;
      const timer = setInterval(() => {
        if (index <= message.content.length) {
          setDisplayedText(message.content.slice(0, index));
          index++;
        } else {
          setIsTyping(false);
          clearInterval(timer);
        }
      }, 10);
      return () => clearInterval(timer);
    } else {
      setDisplayedText(message.content);
    }
  }, [message.content, isNew, isUser, isSystem, isTyping]);

  if (isSystem) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex justify-center"
        data-testid={`message-system-${message.id}`}
      >
        <div className="px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/10 via-indigo-500/10 to-cyan-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium backdrop-blur-sm">
          {message.content}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={cn(
        "flex items-start gap-3",
        isUser && "flex-row-reverse"
      )}
      data-testid={`message-${isUser ? "user" : "agent"}-${message.id}`}
    >
      <AnimatedAvatar isUser={isUser} isActive={isLast && !isUser} />

      <div className={cn(
        "flex flex-col gap-1 max-w-md",
        isUser && "items-end"
      )}>
        <motion.div 
          className={cn(
            "px-4 py-3 rounded-2xl text-sm relative overflow-hidden",
            isUser 
              ? "bg-primary text-primary-foreground rounded-tr-sm shadow-lg shadow-primary/20" 
              : "bg-gradient-to-r from-muted/80 to-muted/60 backdrop-blur-sm border border-white/5 rounded-tl-sm"
          )}
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {/* Glassmorphism shine effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10">
            {parseMarkdown(displayedText)}
            {isTyping && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="inline-block w-0.5 h-4 bg-current ml-0.5 align-middle"
              />
            )}
          </div>
        </motion.div>
        <span className="text-[10px] text-muted-foreground px-1">
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </span>
      </div>
    </motion.div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      {[...Array(3)].map((_, i) => (
        <motion.div 
          key={i} 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className={cn(
            "flex items-start gap-3",
            i % 2 === 0 ? "" : "flex-row-reverse"
          )}
        >
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 animate-pulse" />
          <div className={cn(
            "h-16 rounded-2xl bg-gradient-to-r from-muted/60 to-muted/40 animate-pulse",
            i % 2 === 0 ? "w-2/3 rounded-tl-sm" : "w-1/2 rounded-tr-sm"
          )} />
        </motion.div>
      ))}
    </div>
  );
}
