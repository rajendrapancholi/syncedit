'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, WifiOff } from 'lucide-react';
import { useChatSocket } from '@/services/chat/hooks/useChatSocket';

export default function LiveChat({
  projectId,
  currentUsername,
}: {
  projectId: string;
  currentUsername: string;
}) {
  const [input, setInput] = useState('');
  const {
    isConnected,
    messages,
    typingUsers,
    sendMessage,
    notifyTyping,
    stopTyping,
  } = useChatSocket(projectId, currentUsername);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, typingUsers]);

  const handleInputChange = (value: string) => {
    setInput(value);
    value.trim() ? notifyTyping() : stopTyping();
  };

  const handleSend = () => {
    sendMessage(input);
    setInput('');
  };

  const typingLabel = (() => {
    const names = typingUsers.map((u) => u.username);
    if (names.length === 0) return null;
    if (names.length === 1) return `${names[0]} is typing`;
    if (names.length === 2) return `${names[0]} and ${names[1]} are typing`;
    return 'Several people are typing';
  })();

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background/20 relative">
      <div className="p-4 border-b border-border/50 flex-between bg-card/40">
        <div className="flex-left gap-2">
          <MessageCircle size={14} className="text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            Team Chat
          </span>
        </div>
        <div
          className={`px-2 py-0.5 rounded-full border text-[8px] font-bold ${
            isConnected
              ? 'bg-success/10 border-success/20 text-success'
              : 'bg-destructive/10 border-destructive/20 text-destructive'
          }`}
        >
          {isConnected ? 'LIVE' : 'OFFLINE'}
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar"
      >
        {messages.length === 0 && !typingLabel && (
          <div className="h-full flex-col-center text-center opacity-40 space-y-2">
            <MessageCircle size={20} />
            <p className="text-[10px] uppercase font-bold tracking-tighter">
              No messages yet
            </p>
          </div>
        )}
        {messages.map((msg, i) => {
          const mine = msg.username === currentUsername;
          return (
            <div
              key={msg.id || i}
              className={`p-3 rounded-lg border animate-in fade-in slide-in-from-bottom-2 max-w-[85%] ${
                mine
                  ? 'bg-primary/5 border-primary/20 ml-auto'
                  : 'bg-card border-border'
              }`}
            >
              <div className="flex items-start gap-2">
                <div
                  className="w-6 h-6 rounded-full flex-center text-[10px] font-bold text-white shrink-0"
                  style={{
                    backgroundColor: mine
                      ? 'var(--color-primary)'
                      : `var(--color-user-${(msg.username.charCodeAt(0) % 4) + 1})`,
                  }}
                >
                  {(mine ? 'You' : msg.username).charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] uppercase font-black mb-1 opacity-40">
                    {mine ? 'You' : msg.username}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium wrap-break-word">
                    {msg.message}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        {typingLabel && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-1 max-w-[85%]">
            <div className="bg-card border border-border rounded-lg px-3 py-2 flex items-center gap-2">
              <span className="flex gap-0.5 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
              </span>
              <span className="text-[10px] text-muted-foreground italic">
                {typingLabel}...
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-background/40 border-t border-border">
        <div className="relative group">
          {!isConnected && (
            <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-[1px] flex-center gap-2 text-destructive font-bold text-[10px] uppercase tracking-widest">
              <WifiOff size={14} /> Disconnected
            </div>
          )}
          <textarea
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            disabled={!isConnected}
            onKeyDown={(e) =>
              e.key === 'Enter' &&
              !e.shiftKey &&
              (e.preventDefault(), handleSend())
            }
            onBlur={stopTyping}
            placeholder="Message the team..."
            className="w-full bg-input border border-border rounded-xl px-4 py-3 pr-12 text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none h-16 placeholder:text-muted-foreground/30 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!isConnected || !input.trim()}
            className="absolute bottom-3 right-3 p-2 bg-primary text-primary-foreground rounded-lg hover:scale-105 transition-all shadow-lg shadow-primary/20 disabled:opacity-30 disabled:grayscale"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
