import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Brain, Sparkles, X } from 'lucide-react';
import { useAIChat } from '@/hooks/useAI';
import { useAuthStore } from '@/store/auth.store';
import { getInitials } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

const CHIP_PROMPTS = [
  { label: 'Hospital Summary', text: 'Give me a quick summary of the hospital\'s overall status.' },
  { label: 'Critical Patients', text: 'Are there any patients currently in critical condition?' },
  { label: 'Bed Occupancy', text: 'What is the current bed occupancy status and ICU capacity?' },
  { label: 'Today\'s Alerts', text: 'What are the active unresolved operational alerts?' },
  { label: 'Department Load', text: 'Which department is currently overloaded?' },
  { label: 'Staff Availability', text: 'Are there enough staff available on shift?' },
  { label: 'Equipment Status', text: 'Is any medical equipment currently in maintenance?' },
  { label: 'Forecast', text: 'What is the expected patient queue congestion forecast for today?' },
];

function renderMessageText(text: string) {
  // Replace **bold** with strong HTML
  let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Replace bullet points starting with - or * at start of line
  html = html.replace(/^\s*[-*]\s+(.*?)$/gm, '• $1');

  // Split by newline and map to paragraphs/span blocks safely
  return html.split('\n').map((line, i) => (
    <span key={i} dangerouslySetInnerHTML={{ __html: line }} className="block min-h-[0.5rem] leading-relaxed" />
  ));
}

export function AIChat({ onClose }: { onClose?: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const user = useAuthStore((s) => s.user);
  const chatMutation = useAIChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, chatMutation.isPending]);

  const handleSend = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || chatMutation.isPending) return;

    // Add user message
    const userMsg: Message = {
      id: Math.random().toString(36).substring(7),
      sender: 'user',
      text: trimmed,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');

    try {
      const response = await chatMutation.mutateAsync(trimmed);
      
      const aiMsg: Message = {
        id: Math.random().toString(36).substring(7),
        sender: 'ai',
        text: response.message,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: Message = {
        id: Math.random().toString(36).substring(7),
        sender: 'ai',
        text: 'Sorry, I failed to generate a response. Please ensure backend services and Gemini API configuration are correct.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputValue);
    }
  };

  return (
    <div className="bg-card border border-border/80 rounded-2xl shadow-xl overflow-hidden flex flex-col h-full w-full relative">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border/80 flex items-center justify-between bg-muted/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              MediCore AI Copilot
              <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
            </h3>
            <p className="text-[10px] text-muted-foreground">Hospital Operations Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="text-[10px] text-muted-foreground hover:text-foreground font-medium px-2 py-1 rounded bg-muted/30 hover:bg-muted/60 transition-colors"
            >
              Clear
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted/30 hover:text-foreground transition-colors"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages / Empty State */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3.5"
            >
              <Brain className="w-6 h-6" />
            </motion.div>
            <h4 className="text-sm font-semibold text-foreground">Ask MediCore AI</h4>
            <p className="text-xs text-muted-foreground max-w-sm mt-1 leading-relaxed">
              Ask operational questions about bed load, critical patients, active alerts, or general analytics summary.
            </p>

            {/* Empty state prompt chips */}
            <div className="grid grid-cols-2 gap-2 mt-6 max-w-md w-full">
              {CHIP_PROMPTS.slice(0, 4).map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => handleSend(chip.text)}
                  className="p-3 text-left border border-border/80 bg-muted/10 hover:bg-muted/40 hover:border-primary/20 rounded-xl transition-all duration-150 text-[11px] font-medium text-muted-foreground hover:text-foreground group"
                >
                  <span className="font-semibold text-foreground block group-hover:text-primary transition-colors mb-0.5">
                    {chip.label}
                  </span>
                  {chip.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`flex items-start gap-2.5 max-w-[85%] ${
                      isUser ? 'ml-auto flex-row-reverse text-right' : 'mr-auto text-left'
                    }`}
                  >
                    <Avatar className={`w-7 h-7 flex-shrink-0 ${isUser ? 'ring-1 ring-primary/30' : 'ring-1 ring-primary/10 bg-primary/5'}`}>
                      {isUser ? (
                        <AvatarFallback className="text-[10px]">{getInitials(user?.name ?? 'U')}</AvatarFallback>
                      ) : (
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                          <Brain className="w-3.5 h-3.5" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-mono">
                        <span>{isUser ? user?.name : 'MediCore AI'}</span>
                        <span>·</span>
                        <span>
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <div
                        className={`px-3.5 py-2 rounded-2xl text-xs ${
                          isUser
                            ? 'bg-primary text-primary-foreground rounded-tr-none'
                            : 'bg-muted/50 border border-border/80 text-foreground rounded-tl-none'
                        }`}
                      >
                        {renderMessageText(msg.text)}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Typing Indicator */}
            {chatMutation.isPending && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5 mr-auto max-w-[85%]"
              >
                <Avatar className="w-7 h-7 flex-shrink-0 ring-1 ring-primary/10 bg-primary/5">
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                    <Brain className="w-3.5 h-3.5" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-mono">
                    <span>MediCore AI</span>
                    <span>·</span>
                    <span>Analyzing...</span>
                  </div>
                  
                  <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-none bg-muted/30 border border-border/40 w-fit flex gap-1.5 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested chips above footer if messages exist */}
      {messages.length > 0 && (
        <div className="px-4 py-2 border-t border-border/30 bg-muted/5 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5">
          {CHIP_PROMPTS.map((chip) => (
            <button
              key={chip.label}
              disabled={chatMutation.isPending}
              onClick={() => handleSend(chip.text)}
              className="px-2.5 py-1 text-[10px] font-semibold bg-muted hover:bg-primary hover:text-primary-foreground border border-border/80 rounded-full transition-colors inline-block disabled:opacity-50"
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* Footer input */}
      <div className="p-3 sm:p-4 border-t border-border/80 bg-muted/10 flex items-center gap-2">
        <textarea
          rows={1}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask MediCore AI about bed capacity, critical patient counts..."
          className="flex-1 h-9 max-h-24 px-3 py-2 text-xs rounded-xl border border-border/80 bg-background/50 placeholder:text-muted-foreground text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all resize-none overflow-y-auto leading-tight"
        />
        <button
          onClick={() => handleSend(inputValue)}
          disabled={!inputValue.trim() || chatMutation.isPending}
          className="h-9 w-9 flex items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 disabled:opacity-50 transition-all shadow-md shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
