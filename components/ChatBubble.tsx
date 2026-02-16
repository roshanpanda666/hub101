"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatBubble() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! 👋 I'm the CPGS Hub AI. Ask me about routines, exams, or anything academic!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply || data.error || "Something went wrong." }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Couldn't reach the server." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed", bottom: 24, right: 24, width: 56, height: 56, borderRadius: "50%",
          background: "linear-gradient(135deg, var(--accent), var(--accent-light))", color: "white",
          border: "none", fontSize: 24, cursor: "pointer", zIndex: 100,
          boxShadow: "0 4px 24px var(--accent-glow)", transition: "transform 0.3s ease",
          transform: open ? "rotate(45deg)" : "none",
        }}
        aria-label="Toggle chat"
      >
        {open ? "✕" : "🤖"}
      </button>

      {/* Chat Panel */}
      {open && (
        <div
          style={{
            position: "fixed", bottom: 92, right: 24, width: 380, maxWidth: "calc(100vw - 48px)",
            height: 480, maxHeight: "calc(100vh - 120px)", borderRadius: 20, overflow: "hidden",
            background: "var(--card-bg)", border: "1px solid var(--card-border)",
            backdropFilter: "blur(20px)", display: "flex", flexDirection: "column",
            zIndex: 99, boxShadow: "0 12px 48px rgba(0,0,0,0.3)",
          }}
        >
          {/* Header */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--card-border)", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>🤖</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "var(--foreground)" }}>CPGS Hub AI</div>
              <div style={{ fontSize: 11, color: "var(--accent-light)" }}>Powered by Gemini</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "80%", padding: "10px 14px", borderRadius: 14, fontSize: 14, lineHeight: 1.6,
                  background: msg.role === "user" ? "linear-gradient(135deg, var(--accent), var(--accent-light))" : "var(--surface-1)",
                  color: msg.role === "user" ? "white" : "var(--foreground)",
                  whiteSpace: "pre-wrap",
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{ padding: "10px 14px", borderRadius: 14, background: "var(--surface-1)", color: "var(--text-muted)", fontSize: 14 }}>
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEnd} />
          </div>

          {/* Input */}
          <div style={{ padding: 12, borderTop: "1px solid var(--card-border)", display: "flex", gap: 8 }}>
            <input
              className="input-field"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask me anything..."
              style={{ flex: 1, padding: "10px 14px" }}
            />
            <button onClick={sendMessage} className="btn-primary" disabled={loading} style={{ padding: "10px 16px", fontSize: 16 }}>
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
