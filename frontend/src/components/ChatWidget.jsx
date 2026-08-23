/**
 * components/ChatWidget.jsx
 *
 * Floating AI chat assistant, grounded only in Al-Quran Hub's own content
 * (Surah intros/FAQs + blog posts) via POST /api/chat on the backend.
 * Mounted once, globally, in App.jsx — lazy-loaded so it never blocks
 * first paint. Pass `currentSurahSlug` when the visitor is on a Surah page
 * so the backend always includes that Surah's context.
 */

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import "./ChatWidget.css";

const DISCLAIMER = "AI generated. Consult a scholar for guidance.";
const MAX_HISTORY_SENT = 3;

const WELCOME_MESSAGE = "Assalamu Alaikum! 👋 I'm Noor. Ask me about a Surah, an Islamic topic, or a site feature.";

const CHIPS = [
  { icon: "📖", label: "Surah Yaseen", dynamicLabel: "This Surah", message: "Read Surah Yaseen" },
  { icon: "🕌", label: "Zakat", message: "What is Zakat" },
  { icon: "🕐", label: "Prayer Times", message: "Prayer times in Lahore" },
];

function formatSurahName(slug) {
  return String(slug || "").replace(/-/g, " ");
}

function makeId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// Safety net: the backend prompt already tells the model to skip markdown,
// but if it slips up anyway, strip the raw syntax rather than showing
// literal ** or # characters in the chat bubble.
function stripMarkdown(text) {
  return String(text || "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/(?<!\*)\*(?!\*)(.+?)\*(?!\*)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[*-]\s+/gm, "• ");
}

function TypingIndicator() {
  return (
    <div className="chat-widget__bubble chat-widget__bubble--assistant chat-widget__typing" aria-label="Assistant is typing">
      <span />
      <span />
      <span />
    </div>
  );
}

export default function ChatWidget({ currentSurahSlug = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const listEndRef = useRef(null);
  const panelRef = useRef(null);
  const toggleRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Click outside the panel (and not the toggle button itself) closes it —
  // matches the dropdown pattern already used elsewhere on the site.
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (panelRef.current?.contains(e.target)) return;
      if (toggleRef.current?.contains(e.target)) return;
      setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  async function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMessage = { id: makeId(), role: "user", content: trimmed };
    const history = messages.slice(-MAX_HISTORY_SENT).map(({ role, content }) => ({ role, content }));

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const { data } = await api.post("/api/chat", {
        message: trimmed,
        currentSurahSlug: currentSurahSlug || undefined,
        history,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          role: "assistant",
          content: data.reply,
          source: data.source,
          link: data.link || null,
        },
      ]);
    } catch (err) {
      const status = err?.response?.status;
      const friendlyMessage =
        status === 429
          ? "You've reached the hourly limit for AI chat. Please try again a bit later."
          : err?.response?.data?.error ||
            "Sorry, something went wrong reaching the assistant. Please try again shortly.";
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleChipClick(chip) {
    // The "Surah Yaseen" chip swaps its label to "This Surah" when a Surah
    // page is already in context — in that case send a message naming the
    // actual current Surah, not the default Yaseen query.
    if (chip.dynamicLabel && currentSurahSlug) {
      sendMessage(`Tell me about Surah ${formatSurahName(currentSurahSlug)}`);
      return;
    }
    sendMessage(chip.message);
  }

  return (
    <div className="chat-widget">
      {isOpen && (
        <div className="chat-widget__backdrop" onClick={() => setIsOpen(false)} aria-hidden="true" />
      )}

      {isOpen && (
        <div
          className="chat-widget__panel"
          role="dialog"
          aria-modal="false"
          aria-label="Noor — Al Quran Hub AI Assistant"
          ref={panelRef}
        >
          <div className="chat-widget__header">
            <div className="chat-widget__header-title">
              <span className="chat-widget__header-icon">☪</span>
              <div className="chat-widget__header-name">Noor</div>
            </div>
            <button
              type="button"
              className="chat-widget__close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          <div className="chat-widget__messages" role="log" aria-live="polite">
            {messages.length === 0 && !loading && (
              <div className="chat-widget__empty">
                <p>{WELCOME_MESSAGE}</p>
              </div>
            )}

            {messages.map((m) => (
              <div key={m.id} className={`chat-widget__message chat-widget__message--${m.role}`}>
                <div className={`chat-widget__bubble chat-widget__bubble--${m.role}`}>
                  {m.role === "assistant" ? stripMarkdown(m.content) : m.content}
                </div>

                {m.role === "assistant" && m.source === "web" && (
                  <div className="chat-widget__source-tag">
                    🌐 Answered using a live web search — not from this site, verify with a scholar
                  </div>
                )}

                {m.link && (
                  <Link to={m.link.url} className="chat-widget__link-btn" onClick={() => setIsOpen(false)}>
                    {m.link.label} →
                  </Link>
                )}
              </div>
            ))}

            {loading && <TypingIndicator />}

            {error && (
              <div className="chat-widget__bubble chat-widget__bubble--error" role="alert">
                {error}
              </div>
            )}

            <div ref={listEndRef} />
          </div>

          {messages.length === 0 && (
            <div className="chat-widget__chips">
              {CHIPS.map((chip) => {
                const label = chip.dynamicLabel && currentSurahSlug ? chip.dynamicLabel : chip.label;
                return (
                  <button
                    key={chip.label}
                    type="button"
                    className="chat-widget__chip"
                    onClick={() => handleChipClick(chip)}
                  >
                    <span className="chat-widget__chip-icon" aria-hidden="true">
                      {chip.icon}
                    </span>
                    <span className="chat-widget__chip-label">{label}</span>
                  </button>
                );
              })}
            </div>
          )}

          <form className="chat-widget__input-row" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              className="chat-widget__input"
              placeholder="Ask a question…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              maxLength={1000}
              aria-label="Type your question"
            />
            <button
              type="submit"
              className="chat-widget__send-btn"
              disabled={loading || !input.trim()}
              aria-label="Send message"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </form>

          <p className="chat-widget__disclaimer">{DISCLAIMER}</p>
        </div>
      )}

      <button
        ref={toggleRef}
        type="button"
        className={`chat-widget__toggle ${isOpen ? "is-open" : ""}`}
        onClick={() => setIsOpen((o) => !o)}
        aria-label={isOpen ? "Close AI assistant" : "Open AI assistant"}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        )}
      </button>
    </div>
  );
}
