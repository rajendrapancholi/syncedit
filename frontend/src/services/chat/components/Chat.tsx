'use client';

import { Sparkles, Send, Loader2, WifiOff } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/features/auth/authStore';

export default function AiChat({ projectId }: { projectId: string }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const user = useAuthStore((s) => s.user);
  const { socket, isConnected } = useSocket(projectId, user);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    const handleAiResponse = (data: any) => {
      if (data.projectId === projectId) {
        setMessages((prev) => [...prev, { role: 'ai', content: data.message }]);
      }
    };

    const handleAiError = (err: any) => {
      toast.error(`Orchestrator Error: ${err.message}`);
    };

    socket.on('ai-response', handleAiResponse);
    socket.on('ai-error', handleAiError);

    return () => {
      socket.off('ai-response', handleAiResponse);
      socket.off('ai-error', handleAiError);
    };
  }, [socket, projectId]);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    if (!isConnected) {
      toast.error('Cannot reach Orchestrator. Check your connection.');
      return;
    }

    const userMsg = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    if (!socket) return;
    socket.emit('chat-message', { projectId, message: input });
    setInput('');
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background/20 relative">
      {/* AI Header with Live Status */}
      <div className="p-4 border-b border-border/50 flex-between bg-card/40">
        <div className="flex-left gap-2">
          <Sparkles
            size={14}
            className={`${isConnected ? 'text-primary animate-pulse' : 'text-muted-foreground'}`}
          />
          <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">
            Orchestrator v2.6
          </span>
        </div>

        {/* Visual Connection Badge */}
        <div
          className={`px-2 py-0.5 rounded-full border text-[8px] font-bold transition-all ${
            isConnected
              ? 'bg-success/10 border-success/20 text-success'
              : 'bg-destructive/10 border-destructive/20 text-destructive'
          }`}
        >
          {isConnected ? 'SYNCED' : 'OFFLINE'}
        </div>
      </div>

      {/* Message Feed */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar"
      >
        {messages.length === 0 && (
          <div className="h-full flex-col-center text-center opacity-40 space-y-2">
            <div className="p-3 bg-muted rounded-full">
              <Sparkles size={20} />
            </div>
            <p className="text-[10px] uppercase font-bold tracking-tighter">
              Initiating AI Context...
            </p>
          </div>
        )}

        {messages.map((msg, i) => {
          const mine = msg.role === 'user';
          return (
            <div
              key={i}
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
                      : 'var(--color-user-3)',
                  }}
                >
                  {mine ? 'Y' : <Sparkles size={12} />}
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] uppercase font-black mb-1 opacity-40">
                    {mine ? 'You' : 'Agent'}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium wrap-break-word">
                    {msg.content}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Area - Disabled when offline */}
      <div className="p-4 bg-background/40 border-t border-border">
        <div className="relative group">
          {!isConnected && (
            <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-[1px] flex-center gap-2 text-destructive font-bold text-[10px] uppercase tracking-widest">
              <WifiOff size={14} /> Link Severed
            </div>
          )}

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!isConnected}
            onKeyDown={(e) =>
              e.key === 'Enter' &&
              !e.shiftKey &&
              (e.preventDefault(), handleSendMessage())
            }
            placeholder={
              isConnected ? 'Ask the Orchestrator...' : 'Waiting for sync...'
            }
            className="w-full bg-input border border-border rounded-xl px-4 py-3 pr-12 text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none h-20 placeholder:text-muted-foreground/30 disabled:opacity-50"
          />

          <button
            onClick={handleSendMessage}
            disabled={!isConnected || !input.trim()}
            className="absolute bottom-3 right-3 p-2 bg-primary text-primary-foreground rounded-lg hover:scale-105 transition-all shadow-lg shadow-primary/20 disabled:opacity-30 disabled:grayscale cursor-pointer"
          >
            {isConnected ? (
              <Send size={14} />
            ) : (
              <Loader2 size={14} className="animate-spin" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
