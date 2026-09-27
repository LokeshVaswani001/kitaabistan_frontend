"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Languages, ChevronLeft, ChevronRight } from "lucide-react";
import PoemScene from "@/components/poem-player/scenes";
import VideoLogo from "@/components/VideoLogo";

const beatDelay = (text) => Math.min(9000, 3200 + text.length * 65);

const SCENE_EMOJI = { meadow: "🌼", night: "⭐", mountain: "⛰️", mosque: "🕌", forest: "🌲", river: "🏞️" };

export default function StoryPlayer({ story }) {
  const [lang, setLang] = useState("en");
  const [playing, setPlaying] = useState(false);
  const [index, setIndex] = useState(0);
  const [narration, setNarration] = useState(true);
  const stoppedRef = useRef(false);

  const beats = story.beats;
  const total = beats.length;
  const beat = beats[Math.min(index, total - 1)];
  const text = lang === "ur" ? beat.ur : beat.en;

  const switchLang = () => {
    setLang((l) => (l === "en" ? "ur" : "en"));
    setPlaying(false);
  };

  const goTo = (i) => {
    setIndex(Math.max(0, Math.min(total - 1, i)));
    setPlaying(false);
  };

  useEffect(() => {
    if (!playing) return undefined;
    stoppedRef.current = false;
    const id = setTimeout(() => {
      if (stoppedRef.current) return;
      if (index + 1 >= total) {
        setPlaying(false);
        setIndex(0);
      } else {
        setIndex((i) => i + 1);
      }
    }, beatDelay(text));
    return () => clearTimeout(id);
  }, [playing, index, text, total]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (!playing || !narration) {
      window.speechSynthesis.cancel();
      return undefined;
    }
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang === "ur" ? "ur-PK" : "en-US";
    utter.rate = lang === "ur" ? 0.9 : 1;
    window.speechSynthesis.speak(utter);
    return () => window.speechSynthesis.cancel();
  }, [playing, index, narration, lang, text]);

  useEffect(() => {
    return () => {
      stoppedRef.current = true;
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        setPlaying((p) => !p);
      }
      if (e.code === "ArrowRight") setIndex((i) => Math.min(total - 1, i + 1));
      if (e.code === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total]);

  const progress = useMemo(() => ((index + 1) / total) * 100, [index, total]);

  return (
    <div className="relative rounded-3xl overflow-hidden border border-[var(--line)] shadow-[var(--shadow-lift)]">
      <div className="relative h-[440px] md:h-[520px]">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={beat.scene}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <PoemScene scene={beat.scene} />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 flex flex-col justify-between p-5 md:p-8">
          <div className="flex items-start justify-between gap-3">
            <div className="rounded-2xl bg-[var(--panel)]/92 backdrop-blur border border-[var(--line)] px-4 py-3">
              <div className="eyebrow">
                <span className="w-5 h-px bg-[var(--brand)]" />
                {lang === "ur" ? "متحرک کہانی" : "Animated story"}
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xl leading-none">{SCENE_EMOJI[beat.scene]}</span>
                <span className="font-extrabold text-[var(--ink)] text-lg leading-tight">
                  {lang === "ur" ? story.titleUrdu : story.title}
                </span>
              </div>
              <div className="text-xs text-[var(--ink-soft)]">{story.author} · {index + 1}/{total}</div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <VideoLogo />
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={switchLang}
                className="flex items-center gap-2 text-xs font-bold rounded-full bg-[var(--panel)]/92 backdrop-blur border border-[var(--line)] px-3.5 py-2 text-[var(--ink)] hover:border-[var(--brand)] transition-colors"
              >
                <Languages size={14} />
                {lang === "en" ? "اردو" : "English"}
              </motion.button>
            </div>
          </div>

          <div className="max-w-2xl mx-auto text-center w-full">
            <AnimatePresence mode="wait">
              {!playing && (
                <motion.button
                  key="big-play"
                  type="button"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  onClick={() => setPlaying(true)}
                  aria-label="Play story"
                  className="mb-4 w-16 h-16 rounded-full inline-flex items-center justify-center relative"
                  style={{
                    background: "linear-gradient(145deg, var(--brand), var(--brand-deep))",
                    color: "var(--on-brand)",
                    boxShadow: "0 20px 50px -16px var(--brand), 0 0 0 9px rgba(255,255,255,0.4)",
                  }}
                >
                  <motion.span
                    className="absolute inset-0 rounded-full border-2 border-white/70"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.75, 0, 0.75] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <Play size={26} fill="currentColor" />
                </motion.button>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${lang}-${index}`}
                initial={{ opacity: 0, y: 26, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -18, scale: 0.98 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="rounded-2xl bg-[var(--panel)]/90 backdrop-blur-md border border-[var(--line)] px-5 py-4 md:px-7 md:py-5"
              >
                <motion.div
                  className="text-4xl md:text-5xl mb-2"
                  initial={{ scale: 0.5, rotate: -8 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 14 }}
                >
                  {beat.emoji}
                </motion.div>
                <p
                  dir={lang === "ur" ? "rtl" : "ltr"}
                  className={`text-lg md:text-xl font-bold leading-relaxed ${
                    lang === "ur" ? "font-urdu" : ""
                  }`}
                  style={{ color: "var(--ink)" }}
                >
                  {text}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="rounded-2xl bg-[var(--panel)]/92 backdrop-blur border border-[var(--line)] px-4 py-3">
            <div className="flex items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => setPlaying((p) => !p)}
                aria-label={playing ? "Pause" : "Play"}
                className="w-11 h-11 rounded-full bg-[var(--brand)] text-[var(--on-brand)] flex items-center justify-center shrink-0"
              >
                {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => {
                  setIndex(0);
                  setPlaying(true);
                }}
                aria-label="Replay"
                className="w-10 h-10 rounded-full border border-[var(--line)] flex items-center justify-center text-[var(--ink-soft)] hover:text-[var(--brand)] transition-colors shrink-0"
              >
                <RotateCcw size={16} />
              </motion.button>

              <div className="flex-1">
                <div className="flex gap-1 mb-1.5">
                  {beats.map((b, i) => (
                    <motion.button
                      key={i}
                      type="button"
                      onClick={() => goTo(i)}
                      aria-label={`Scene ${i + 1}`}
                      className="h-1 flex-1 rounded-full"
                      animate={{
                        backgroundColor: i <= index ? "var(--brand)" : "var(--line)",
                        opacity: i === index ? 1 : 0.85,
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  ))}
                </div>
                <div className="h-1.5 rounded-full bg-[var(--line)] overflow-hidden">
                  <motion.div
                    className="h-full bg-[var(--brand)]"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
                <div className="mt-1.5 flex justify-between text-[10.5px] font-bold text-[var(--ink-soft)]">
                  <span>Scene {index + 1} / {total}</span>
                  <span>{story.minutes} min · {lang === "ur" ? "اردو" : "English"}</span>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => goTo(index - 1)}
                disabled={index === 0}
                aria-label="Previous scene"
                className="w-9 h-9 rounded-full border border-[var(--line)] flex items-center justify-center text-[var(--ink-soft)] hover:text-[var(--brand)] transition-colors shrink-0 disabled:opacity-35"
              >
                <ChevronLeft size={16} />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => goTo(index + 1)}
                disabled={index === total - 1}
                aria-label="Next scene"
                className="w-9 h-9 rounded-full border border-[var(--line)] flex items-center justify-center text-[var(--ink-soft)] hover:text-[var(--brand)] transition-colors shrink-0 disabled:opacity-35"
              >
                <ChevronRight size={16} />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => setNarration((n) => !n)}
                aria-label={narration ? "Mute narration" : "Unmute narration"}
                className="w-10 h-10 rounded-full border border-[var(--line)] flex items-center justify-center shrink-0 transition-colors"
                style={{ color: narration ? "var(--brand)" : "var(--ink-soft)" }}
              >
                {narration ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
