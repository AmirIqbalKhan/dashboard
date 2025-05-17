"use client";
import { useState, useRef, useEffect } from "react";
import { FiMessageCircle, FiSend, FiX } from "react-icons/fi";
import { ClipLoader } from "react-spinners";
import { useTheme } from "@/app/theme-context";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AssistantPanel() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const { theme, brandColor } = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const panelBg = brandColor;
  const assistantBg = `${brandColor}CC`; // 80% opacity for assistant messages
  const userBg = brandColor;
  const borderCol = brandColor;
  const textCol = '#fff';

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user" as const, content: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      setMessages((msgs) => [
        ...msgs,
        { role: "assistant", content: data.reply },
      ]);
    } catch {
      setMessages((msgs) => [
        ...msgs,
        { role: "assistant", content: "Sorry, I couldn't get a response." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          className="fixed bottom-6 right-6 z-50 text-white p-4 rounded-full shadow-lg border-4 border-white dark:border-gray-900 hover:shadow-[0_0_0_4px_var(--brand-color)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-color)] transition-all"
          onClick={() => setOpen(true)}
          aria-label="Open AI Assistant"
          style={{ backgroundColor: brandColor, boxShadow: `0 4px 24px 0 ${brandColor}33` }}
        >
          <FiMessageCircle size={28} />
        </button>
      )}
      {/* Chat Panel */}
      {open && (
        <div
          className="fixed bottom-6 right-6 z-50 w-80 max-w-full rounded-2xl shadow-2xl flex flex-col border animate-fade-in"
          style={{ background: panelBg, borderColor: borderCol }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b rounded-t-2xl"
            style={{ background: brandColor, borderColor: borderCol }}>
            <span className="font-semibold text-lg" style={{ color: textCol }}>AI Assistant</span>
            <button onClick={() => setOpen(false)} className="text-white hover:text-gray-200">
              <FiX size={22} />
            </button>
          </div>
          <div
            className="flex-1 overflow-y-auto px-4 py-2 space-y-3"
            style={{ background: panelBg, maxHeight: 350 }}
          >
            {messages.length === 0 && (
              <div className="text-white text-center mt-8 opacity-80">Ask me anything about your dashboard!</div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  background: msg.role === 'user' ? userBg : assistantBg,
                  color: textCol,
                  marginLeft: msg.role === 'user' ? 'auto' : undefined,
                  marginRight: msg.role === 'assistant' ? 'auto' : undefined,
                  border: `1.5px solid ${borderCol}`,
                  borderRadius: msg.role === 'user' ? '18px 18px 6px 18px' : '18px 18px 18px 6px',
                  boxShadow: msg.role === 'user' ? `0 2px 8px 0 ${brandColor}22` : undefined,
                  maxWidth: '85%',
                  padding: '0.5rem 1rem',
                  whiteSpace: 'pre-line',
                  fontSize: '1rem',
                  opacity: 0.98,
                }}
                className="shadow-sm animate-fade-in-fast transition-all duration-200"
              >
                {msg.content}
              </div>
            ))}
            {loading && (
              <div className="flex justify-center items-center py-2">
                <ClipLoader color={textCol} size={24} />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form
            className="flex items-center gap-2 p-3 border-t rounded-b-2xl"
            style={{ background: brandColor, borderColor: borderCol }}
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
          >
            <input
              className="flex-1 rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 shadow-sm placeholder-white"
              style={{
                borderColor: borderCol,
                background: assistantBg,
                color: textCol,
              }}
              placeholder="Type your question..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
              autoFocus
            />
            <button
              type="submit"
              className="p-2 rounded-full text-white hover:scale-110 transition-transform disabled:opacity-50 shadow-md"
              style={{ backgroundColor: brandColor, boxShadow: `0 2px 8px 0 ${brandColor}33` }}
              disabled={loading || !input.trim()}
              aria-label="Send"
            >
              <FiSend size={20} />
            </button>
          </form>
        </div>
      )}
    </>
  );
} 