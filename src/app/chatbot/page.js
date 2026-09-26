"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageCircle, ThumbsUp, ThumbsDown, Mic, MicOff, Volume2, Square } from "lucide-react";
import AppShell from "@/components/AppShell";
import { useLanguage } from "@/context/LanguageContext";

// Placeholder matcher standing in for the on-device keyword/semantic
// matching engine described in the blueprint (Section 6).
const FAKE_KNOWLEDGE_BASE = [
  {
    keywords: ["moral", "ant", "grasshopper"],
    question: "What is the moral of \"The Ant and the Grasshopper\"?",
    answer:
      "The moral of \"The Ant and the Grasshopper\" is to prepare for the future instead of only living for today.",
  },
  {
    keywords: ["salah", "prayer", "namaz"],
    question: "What is Salah?",
    answer:
      "Salah is the five-times-daily prayer in Islam. Check the Islamic Books shelf for \"Understanding Salah\" for a full, age-appropriate guide.",
  },
  {
    keywords: ["honest", "woodcutter"],
    question: "What happens in \"The Honest Woodcutter\"?",
    answer:
      "The Honest Woodcutter is rewarded for telling the truth about which axe was really his — a story about honesty.",
  },
];

const UNANSWERED_KEY = "kitaabistan_unanswered_questions";
const FEEDBACK_KEY = "kitaabistan_chat_feedback";

function logUnanswered(question) {
  if (typeof window === "undefined") return;
  try {
    const list = JSON.parse(window.localStorage.getItem(UNANSWERED_KEY) || "[]");
    list.push({ question, at: Date.now() });
    window.localStorage.setItem(UNANSWERED_KEY, JSON.stringify(list));
  } catch {
    // ignore storage errors
  }
}

function logFeedback(question, answer, value) {
  if (typeof window === "undefined") return;
  try {
    const list = JSON.parse(window.localStorage.getItem(FEEDBACK_KEY) || "[]");
    list.push({ question, answer, value, at: Date.now() });
    window.localStorage.setItem(FEEDBACK_KEY, JSON.stringify(list));
  } catch {
    // ignore storage errors
  }
}

function findAnswer(question) {
  const q = question.toLowerCase();
  const hit = FAKE_KNOWLEDGE_BASE.find((entry) => entry.keywords.some((k) => q.includes(k)));
  if (hit) return { answer: hit.answer, matched: true };
  logUnanswered(question);
  return {
    answer:
      "I don't have an approved answer for that yet — I've noted your question so the founder can add it to my knowledge base.",
    matched: false,
  };
}

export default function ChatbotPage() {
  const { t, isUrdu, lang } = useLanguage();
  const [messages, setMessages] = useState([]); // real conversation turns only
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const recognitionRef = useRef(null);

  // Text-to-speech output for bot answers (blueprint Section 6: "Optional
  // voice input and text-to-speech output, in both Urdu and English").
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

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

  // Feature-detecting a browser API after mount (not during render) is
  // the standard fix for the hydration-mismatch problem — same pattern
  // used in LanguageContext and AuthContext.
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
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
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
        // recognition may already be running; ignore
      }
    }
  };

  // The intro bubble is derived from the current language at render time
  // instead of being stored in state, so switching languages doesn't need
  // an effect to "resync" it.
  const displayMessages = useMemo(
    () => [{ role: "bot", text: t("chatbotSeed"), seed: true }, ...messages],
    [messages, t]
  );

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const question = input.trim();
    const { answer, matched } = findAnswer(question);
    setMessages((prev) => [
      ...prev,
      { role: "user", text: question },
      { role: "bot", text: answer, matched, question, feedback: null },
    ]);
    setInput("");
  };

  const handleFeedback = (displayIndex, value) => {
    const realIndex = displayIndex - 1; // shift for the synthetic seed bubble
    setMessages((prev) =>
      prev.map((m, i) => (i === realIndex ? { ...m, feedback: value } : m))
    );
    const msg = messages[realIndex];
    logFeedback(msg.question, msg.text, value);
  };

  const suggestions = FAKE_KNOWLEDGE_BASE.slice(0, 2);

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-5 md:px-10 pt-6 md:pt-10 flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-180px)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--ink)] flex items-center justify-center">
            <MessageCircle size={18} color="#fff" />
          </div>
          <div>
            <div className="font-extrabold">{t("chatbotName")}</div>
            <div className="text-xs text-[var(--ink-soft)]">{t("chatbotSubtitle")}</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto mt-6 space-y-3 pr-1">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                    m.role === "bot"
                      ? "bg-[var(--panel)] border border-[var(--line)]"
                      : "bg-[var(--ink)] text-white ml-auto"
                  } ${isUrdu ? "font-urdu text-right" : ""}`}
                >
                  {m.text}
                </div>

                {m.role === "bot" && (
                  <div className="flex items-center gap-2 mt-1.5 ml-1">
                    <motion.button
                      whileTap={{ scale: 0.75 }}
                      whileHover={{ scale: 1.15 }}
                      onClick={() => speakMessage(i, m.text)}
                      aria-label={speakingIndex === i ? "Stop reading aloud" : "Read aloud"}
                      style={{ color: speakingIndex === i ? "var(--sun)" : "var(--ink-soft)" }}
                    >
                      {speakingIndex === i ? (
                        <Square size={13} fill="currentColor" />
                      ) : (
                        <Volume2 size={14} />
                      )}
                    </motion.button>
                  </div>
                )}

                {m.role === "bot" && m.question && (
                  <div className="flex items-center gap-2 mt-1.5 ml-1">
                    <motion.button
                      whileTap={{ scale: 0.75 }}
                      whileHover={{ scale: 1.15 }}
                      onClick={() => handleFeedback(i, "up")}
                      aria-label="Helpful"
                      style={{ color: m.feedback === "up" ? "var(--sage-deep)" : "var(--ink-soft)" }}
                    >
                      <ThumbsUp size={14} fill={m.feedback === "up" ? "currentColor" : "none"} />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.75 }}
                      whileHover={{ scale: 1.15 }}
                      onClick={() => handleFeedback(i, "down")}
                      aria-label="Not helpful"
                      style={{ color: m.feedback === "down" ? "var(--danger)" : "var(--ink-soft)" }}
                    >
                      <ThumbsDown size={14} fill={m.feedback === "down" ? "currentColor" : "none"} />
                    </motion.button>

                    {m.matched === false && (
                      <div className="ml-2 flex flex-wrap gap-1.5">
                        {suggestions.map((s) => (
                          <motion.button
                            key={s.question}
                            whileTap={{ scale: 0.93 }}
                            whileHover={{ scale: 1.04, backgroundColor: "var(--line)" }}
                            onClick={() => setInput(s.question)}
                            className="text-[11px] font-semibold bg-[var(--line)]/60 rounded-full px-2.5 py-1"
                          >
                            {s.question}
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <form onSubmit={handleSend} className="flex items-center gap-2 py-4">
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
            className={`flex-1 border border-[var(--line)] rounded-xl px-4 py-3 text-sm bg-[var(--panel)] ${
              isUrdu ? "font-urdu text-right" : ""
            }`}
          />
          {voiceSupported && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.08 }}
              animate={listening ? { scale: [1, 1.1, 1] } : { scale: 1 }}
              transition={listening ? { repeat: Infinity, duration: 0.9 } : {}}
              onClick={toggleListening}
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: listening ? "var(--danger)" : "var(--line)",
                color: listening ? "#fff" : "var(--ink-soft)",
              }}
              aria-label={listening ? "Stop listening" : "Ask by voice"}
            >
              {listening ? <MicOff size={18} /> : <Mic size={18} />}
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.88 }}
            type="submit"
            className="w-11 h-11 rounded-xl bg-[var(--ink)] text-white flex items-center justify-center shrink-0"
            aria-label="Send"
          >
            <Send size={18} />
          </motion.button>
        </form>
      </div>
    </AppShell>
  );
}
