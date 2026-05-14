import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { chatWithAssistant } from '../lib/gemini';
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatAssistant({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Namaste! I am your Hasta-Kala Assistant. How can I help you with your craft business today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    const response = await chatWithAssistant(messages, userMessage);
    setMessages(prev => [...prev, { role: 'assistant', content: response || "I'm sorry, something went wrong." }]);
    setIsLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="chat-container"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-[60] bg-neutral-950 flex flex-col pt-8"
        >
          <div className="flex items-center justify-between px-6 pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h2 className="font-bold">Hasta-Kala Assistant</h2>
                <span className="text-xs text-neutral-500">Always online to help</span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-3 max-w-[85%]",
                  m.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                  m.role === 'assistant' ? "bg-orange-500/20" : "bg-neutral-800"
                )}>
                  {m.role === 'assistant' ? <Bot className="w-4 h-4 text-orange-400" /> : <User className="w-4 h-4 text-neutral-400" />}
                </div>
                <div className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed",
                  m.role === 'assistant' 
                    ? "bg-neutral-900 border border-white/5 rounded-tl-none" 
                    : "bg-orange-600 text-white rounded-tr-none"
                )}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center animate-pulse">
                  <Bot className="w-4 h-4 text-orange-400" />
                </div>
                <div className="p-4 bg-neutral-900 border border-white/5 rounded-2xl rounded-tl-none flex gap-1">
                  <div className="w-1.5 h-1.5 bg-neutral-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-neutral-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-neutral-600 rounded-full animate-bounce" />
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-white/5 bg-neutral-950">
            <div className="flex gap-2 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me about sales or products..."
                className="flex-1 bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500/50 transition-colors pr-12"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-orange-500 hover:text-orange-400 disabled:text-neutral-600 transition-colors"
                id="send-chat"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
