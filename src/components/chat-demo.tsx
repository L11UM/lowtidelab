"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, Send, Loader2 } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Hey, I'm RocketGPT 🚀 — a demo of the chatbot I'm building. Ask me anything (I'm simulated for now, but it feels real).",
  },
];

const CANNED_RESPONSES = [
  "That's a great question. In the full version, this response would stream in from a real language model in real time.",
  "I'm just a placeholder right now, but soon I'll be wired up to an actual RocketGPT backend with memory and tools.",
  "Interesting! Once RocketGPT ships, this box will connect to a live API instead of these canned replies.",
  "Noted 🚀 — for now I'm simulating a response, but the UI, streaming, and interactions are all real.",
];

function pickResponse(input: string) {
  const hash = input.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return CANNED_RESPONSES[hash % CANNED_RESPONSES.length];
}

export function ChatDemo() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    const userMessage: Message = { id: crypto.randomUUID(), role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    const replyText = pickResponse(trimmed);
    const delay = 500 + Math.random() * 600;

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: replyText },
      ]);
    }, delay);
  }

  return (
    <div className="glass flex h-[480px] w-full flex-col overflow-hidden rounded-2xl shadow-glow-sm">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-primary-light">
          <Rocket className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold">RocketGPT</p>
          <p className="flex items-center gap-1.5 text-xs text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Demo mode
          </p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={
                message.role === "user"
                  ? "ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-white"
                  : "mr-auto max-w-[85%] rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/90"
              }
            >
              {message.content}
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mr-auto flex max-w-[85%] items-center gap-2 rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-muted"
          >
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            RocketGPT is typing…
          </motion.div>
        )}
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-white/10 p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask RocketGPT something…"
          className="flex-1 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-muted focus:border-primary/50 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          aria-label="Send message"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
