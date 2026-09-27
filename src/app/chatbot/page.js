"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Sparkles,
  WifiOff,
  ShieldCheck,
  RefreshCw,
  BookOpen,
  ThumbsUp,
  ThumbsDown,
  Mic,
  MicOff,
  Volume2,
  Square,
  Copy,
  Check,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import { useLanguage } from "@/context/LanguageContext";
import { askRehnuma, starterQuestions } from "@/lib/chatEngine";
import { chatReply } from "@/lib/locales/chat";
import { searchImportedBooks, listImportedBooks } from "@/lib/importedBooks";

const UNANSWERED_KEY = "kitaabistan_unanswered_questions";
const FEEDBACK_KEY = "kitaabistan_chat_feedback";

function logUnanswered(question) {
  if (typeof window === "undefined") return;
  try {
    const list = JSON.parse(window.localStorage.getItem(UNANSWERED_KEY) || "[]");
    list.push({ question, at: Date.now() });
    window.localStorage.setItem(UNANSWERED_KEY, JSON.stringify(list));
  } catch {
    // storage unavailable
  }
}

function logFeedback(question, answer, value) {
  if (typeof window === "undefined") return;
  try {
    const list = JSON.parse(window.localStorage.getItem(FEEDBACK_KEY) || "[]");
    list.push({ question, answer, value, at: Date.now() });
    window.localStorage.setItem(FEEDBACK_KEY, JSON.stringify(list));
  } catch {
    // storage unavailable
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function ChatbotPage() {
  const { t, isUrdu, lang } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [searchingSaved, setSearchingSaved] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const recognitionRef = useRef(null);
  const scrollRef = useRef(null);
  const topicRef = useRef(null);

  const starters = useMemo(() => starterQuestions(), []);

  const greeting = chatReply(lang, "greeting");

  const greetingBubble = (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="flex gap-2.5"
    >
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--brand)] to-[var(--brand-deep)] flex items-center justify-center shrink-0 mt-0.5">
        <Sparkles size={14} color="#fff" />
      </div>
      <div
        className={`max-w-[86%] rounded-2xl rounded-tl-md px-4 py-3 text-sm leading-relaxed bg-[var(--panel)] border border-[var(--line)] text-[var(--ink)] ${
          isUrdu ? "font-urdu text-right" : ""
        }`}
      >
        {greeting}
      </div>
    </motion.div>
  );

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const speakMessage = (displayIndex, text) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    if (speakingIndex === displayIndex) {
      setSpeakingIndex(null);
      return;
    }
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = isUrdu ? "ur-PK" : "en-US";
    utter.onend = () => setSpeakingIndex(null);
    utter.onerror = () => setSpeakingIndex(null);
    window.speechSynthesis.speak(utter);
    setSpeakingIndex(displayIndex);
  };

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const SpeechRecognition =
      typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SpeechRecognition) {
      setVoiceSupported(false);
      return;
    }
    setVoiceSupported(true);
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      setInput(event.results[0][0].transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;

    return () => {
      recognition.onresult = null;
      recognition.onend = null;
      recognition.onerror = null;
    };
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = isUrdu ? "ur-PK" : "en-US";
    }
  }, [isUrdu]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setListening(true);
      } catch {
        // recognition already running
      }
    }
  };

  const send = async (text) => {
    const question = (text || "").trim();
    if (!question || thinking) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setThinking(true);
    try {
      await sleep(450);
      const result = askRehnuma(question, { lang, topic: topicRef.current });
      let reply = {
        role: "bot",
        text: result.answer,
        matched: result.matched,
        source: result.source,
        question,
        suggestions: result.matched ? [] : result.related || [],
        related: result.matched ? result.related || [] : [],
        note: result.note || "",
        feedback: null,
      };
      if (result.matched && result.topic) topicRef.current = result.topic;
      if (!result.matched) {
        // Offline retrieval over the reader's own saved books (IndexedDB —
        // no network needed): quote the matching passage with its source.
        setSearchingSaved(true);
        const hit = await searchImportedBooks(question);
        if (hit) {
          reply = {
            ...reply,
            matched: true,
            text: chatReply(lang, "foundInSaved")
              .replace("{title}", hit.title)
              .replace("{snippet}", hit.snippet),
            source: hit.title,
          };
        } else {
          const mine = await listImportedBooks();
          const asksForBooks = /(book|kitab|kitaab|kitabein|books|کتاب|کتب)/i.test(question);
          const possessive = /(my|saved|meri|meray|mere|imported|mausooda|اپنی|محفوظ)/i.test(question);
          if (mine.length && asksForBooks && possessive) {
            reply = {
              ...reply,
              matched: true,
              text:
                `${chatReply(lang, "yourSavedBooks")}\n` +
                mine.map((b) => `• ${b.title}${b.author ? ` — ${b.author}` : ""}`).join("\n"),
            };
          }
        }
      }
      if (!reply.matched) logUnanswered(question);
      setMessages((prev) => [...prev, reply]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          matched: false,
          question,
          text: chatReply(lang, "retry"),
          related: [],
          feedback: null,
        },
      ]);
    } finally {
      setSearchingSaved(false);
      setThinking(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    send(input);
  };

  const handleFeedback = (displayIndex, value) => {
    const realIndex = displayIndex - 1;
    setMessages((prev) =>
      prev.map((m, i) => (i === realIndex ? { ...m, feedback: value } : m))
    );
    const msg = messages[realIndex];
    if (msg) logFeedback(msg.question, msg.text, value);
  };

  const copyMessage = async (displayIndex, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(displayIndex);
      setTimeout(() => setCopiedIndex(null), 1400);
    } catch {
      // clipboard blocked
    }
  };

  const trustChips = [
    { icon: WifiOff, label: t("chatbotChipOffline") },
    { icon: ShieldCheck, label: t("chatbotChipCurated") },
    { icon: RefreshCw, label: t("chatbotChipFeedback") },
  ];

  const hasUser = messages.some((m) => m.role === "user");

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-5 md:px-10 pt-6 md:pt-8 flex flex-col h-[calc(100vh-150px)] md:h-[calc(100vh-196px)]">
        <div className="flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--brand)] to-[var(--brand-deep)] flex items-center justify-center shadow-[0_10px_26px_-14px_var(--brand)]">
                <Sparkles size={20} color="#fff" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[var(--success)] border-2 border-[var(--paper)]" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-extrabold text-[var(--ink)] tracking-tight">
                {t("chatbotName")}
              </h1>
              <p className={`text-xs text-[var(--ink-soft)] ${isUrdu ? "font-urdu" : ""}`}>
                {t("chatbotSubtitle")}
              </p>
            </div>
          </div>
          <span className="chip chip-brand hidden sm:inline-flex">
            <ShieldCheck size={13} />
            {t("chatbotVerified")}
          </span>
        </div>

        <div
          ref={scrollRef}
          className={`flex-1 min-h-0 overflow-y-auto mt-5 pr-1 space-y-4 ${
            !hasUser ? "flex items-center" : ""
          }`}
        >
          {!hasUser && (
            <div className="w-full space-y-4">
              {greetingBubble}
              <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="card p-6 md:p-7 relative overflow-hidden"
            >
              <div className="aura w-56 h-56 -top-24 -right-20" style={{ background: "var(--brand)" }} />
              <div className="relative">
                <div className="eyebrow">
                  <span className="w-6 h-px bg-[var(--brand)]" />
                  {t("chatbotLabel")}
                </div>
                <h2
                  className={`mt-3 text-2xl md:text-[27px] leading-tight font-extrabold text-[var(--ink)] ${
                    isUrdu ? "font-urdu" : ""
                  }`}
                >
                  {t("chatbotIntroTitle")}
                </h2>
                <p
                  className={`mt-2 text-sm leading-relaxed text-[var(--ink-soft)] max-w-lg ${
                    isUrdu ? "font-urdu" : ""
                  }`}
                >
                  {t("chatbotIntroBody")}
                </p>

                <div className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-4">
                  <div
                    className={`text-[13px] font-bold text-[var(--ink)] flex items-start gap-2 ${
                      isUrdu ? "font-urdu" : ""
                    }`}
                  >
                    <span className="w-5 h-5 rounded-md bg-[var(--brand-soft)] text-[var(--brand)] text-[10px] font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                      Q
                    </span>
                    {t("chatbotExampleQ")}
                  </div>
                  <div
                    className={`mt-3 pl-7 text-[13px] leading-relaxed text-[var(--ink)] border-l-2 border-[var(--brand)] ${
                      isUrdu ? "font-urdu pr-0 pl-6 border-l-0 border-r-2 text-right" : ""
                    }`}
                  >
                    {t("chatbotExampleA")}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {trustChips.map((chip) => (
                    <span key={chip.label} className="chip">
                      <chip.icon size={13} className="text-[var(--brand)]" />
                      <span className={isUrdu ? "font-urdu" : ""}>{chip.label}</span>
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className={`text-[11px] font-extrabold uppercase tracking-wider text-[var(--ink-soft)] w-full ${
                    isUrdu ? "font-urdu" : ""
                  }`}>
                    {t("chatbotMore")}
                  </span>
                  {starters.map((q) => (
                    <motion.button
                      key={q}
                      type="button"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => send(q)}
                      className={`text-[12.5px] font-semibold text-left bg-[var(--brand-soft)] border border-[color-mix(in_oklab,var(--brand)_25%,transparent)] text-[var(--ink)] rounded-xl px-3 py-2 hover:border-[var(--brand)] transition-colors ${
                        isUrdu ? "font-urdu" : ""
                      }`}
                    >
                      {q}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
            </div>
          )}

          {hasUser && greetingBubble}

          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.22 }}
                className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : ""}`}
              >
                {m.role === "bot" && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--brand)] to-[var(--brand-deep)] flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles size={14} color="#fff" />
                  </div>
                )}

                <div className={`max-w-[86%] ${m.role === "user" ? "items-end" : ""}`}>
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      m.role === "bot"
                        ? "bg-[var(--panel)] border border-[var(--line)] text-[var(--ink)] rounded-tl-md"
                        : "bg-[var(--brand)] text-[var(--on-brand)] rounded-tr-md"
                    } ${isUrdu ? "font-urdu text-right" : ""}`}
                  >
                    {m.text}
                  </div>

                  {m.role === "bot" && m.note && (
                    <div className="text-[11px] italic text-[var(--ink-soft)] mt-1.5 ml-1 leading-relaxed">
                      {m.note}
                    </div>
                  )}

                  {m.role === "bot" && (
                    <div className="flex flex-wrap items-center gap-2 mt-2 ml-1">
                      {m.source && (
                        <span className="chip !py-1 !text-[10.5px]">
                          <BookOpen size={11} />
                          {m.source}
                        </span>
                      )}
                      <motion.button
                        whileTap={{ scale: 0.75 }}
                        onClick={() => speakMessage(i + 1, m.text)}
                        aria-label="Read aloud"
                        className="text-[var(--ink-soft)] hover:text-[var(--brand)] transition-colors"
                        style={{ color: speakingIndex === i + 1 ? "var(--accent)" : undefined }}
                      >
                        {speakingIndex === i + 1 ? (
                          <Square size={13} fill="currentColor" />
                        ) : (
                          <Volume2 size={14} />
                        )}
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.75 }}
                        onClick={() => copyMessage(i + 1, m.text)}
                        aria-label="Copy answer"
                        className="text-[var(--ink-soft)] hover:text-[var(--brand)] transition-colors"
                      >
                        {copiedIndex === i + 1 ? <Check size={14} /> : <Copy size={13} />}
                      </motion.button>
                      {m.question && (
                        <>
                          <motion.button
                            whileTap={{ scale: 0.75 }}
                            onClick={() => handleFeedback(i + 1, "up")}
                            aria-label="Helpful"
                            className="transition-colors"
                            style={{
                              color:
                                m.feedback === "up" ? "var(--sage-deep)" : "var(--ink-soft)",
                            }}
                          >
                            <ThumbsUp
                              size={14}
                              fill={m.feedback === "up" ? "currentColor" : "none"}
                            />
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.75 }}
                            onClick={() => handleFeedback(i + 1, "down")}
                            aria-label="Not helpful"
                            className="transition-colors"
                            style={{
                              color: m.feedback === "down" ? "var(--danger)" : "var(--ink-soft)",
                            }}
                          >
                            <ThumbsDown
                              size={14}
                              fill={m.feedback === "down" ? "currentColor" : "none"}
                            />
                          </motion.button>
                        </>
                      )}
                    </div>
                  )}

                  {m.role === "bot" && m.related?.length > 0 && (
                    <div className="mt-2 ml-1 space-y-1.5">
                      <span
                        className={`block text-[10.5px] font-extrabold uppercase tracking-wider text-[var(--ink-soft)] ${
                          isUrdu ? "font-urdu tracking-normal" : ""
                        }`}
                      >
                        {m.matched === false ? t("chatbotMore") : chatReply(lang, "askNext")}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {m.related.map((s) => (
                          <motion.button
                            key={s}
                            type="button"
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => send(s)}
                            className={`text-[11.5px] font-semibold text-left bg-[var(--brand-soft)] text-[var(--ink)] border border-[color-mix(in_oklab,var(--brand)_22%,transparent)] rounded-full px-3 py-1.5 hover:border-[var(--brand)] transition-colors ${
                              isUrdu ? "font-urdu" : ""
                            }`}
                          >
                            {s}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {thinking && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--brand)] to-[var(--brand-deep)] flex items-center justify-center shrink-0">
                  <Sparkles size={14} color="#fff" />
                </div>
                <div className="rounded-2xl rounded-tl-md bg-[var(--panel)] border border-[var(--line)] px-4 py-3 flex items-center gap-2">
                  {[0, 1, 2].map((d) => (
                    <motion.span
                      key={d}
                      className="w-1.5 h-1.5 rounded-full bg-[var(--brand)]"
                      animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
                      transition={{ repeat: Infinity, duration: 1, delay: d * 0.16 }}
                    />
                  ))}
                  <span className={`text-[11.5px] font-semibold text-[var(--ink-soft)] ml-1 ${
                    isUrdu ? "font-urdu" : ""
                  }`}>
                    {searchingSaved ? chatReply(lang, "searchingSaved") : t("chatbotThinking")}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <form
          onSubmit={handleSend}
          className="shrink-0 mt-3 flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-3 py-2 shadow-[var(--shadow-card)] focus-within:border-[var(--brand)] transition-colors"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              listening
                ? isUrdu
                  ? "سن رہا ہوں…"
                  : "Listening…"
                : t("chatbotInputPlaceholder")
            }
            className={`flex-1 bg-transparent border-0 outline-none text-sm font-medium py-2 px-1 text-[var(--ink)] placeholder:text-[var(--ink-soft)] placeholder:font-normal ${
              isUrdu ? "font-urdu text-right" : ""
            }`}
          />
          {voiceSupported && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.85 }}
              animate={listening ? { scale: [1, 1.08, 1] } : { scale: 1 }}
              transition={listening ? { repeat: Infinity, duration: 0.9 } : {}}
              onClick={toggleListening}
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: listening ? "var(--danger)" : "var(--brand-soft)",
                color: listening ? "#fff" : "var(--brand)",
              }}
              aria-label={listening ? "Stop listening" : "Ask by voice"}
            >
              {listening ? <MicOff size={17} /> : <Mic size={17} />}
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.88 }}
            type="submit"
            disabled={thinking || !input.trim()}
            className="w-10 h-10 rounded-xl bg-[var(--brand)] text-[var(--on-brand)] flex items-center justify-center shrink-0 disabled:opacity-45"
            aria-label="Send"
          >
            <Send size={17} />
          </motion.button>
        </form>
      </div>
    </AppShell>
  );
}
