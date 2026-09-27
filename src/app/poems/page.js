"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Sparkles } from "lucide-react";
import AppShell from "@/components/AppShell";
import PoemPlayer from "@/components/poem-player/PoemPlayer";
import { POEM_VIDEOS } from "@/components/poem-player/poems";
import { useLanguage } from "@/context/LanguageContext";

const SCENE_STYLES = {
  meadow: "linear-gradient(160deg,#bfe6ff,#9ed39a)",
  night: "linear-gradient(160deg,#0d1b3e,#2a3f7a)",
  mountain: "linear-gradient(160deg,#bfe6ff,#3f8f74)",
  mosque: "linear-gradient(160deg,#1c6a6a,#f2c46b)",
};

const SCENE_EMOJI = { meadow: "🌼", night: "⭐", mountain: "⛰️", mosque: "🕌" };

export default function PoemsPage() {
  const { isUrdu, t } = useLanguage();
  const [activeId, setActiveId] = useState(POEM_VIDEOS[0].id);
  const active = POEM_VIDEOS.find((p) => p.id === activeId) || POEM_VIDEOS[0];

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-5 md:px-10 pt-6 md:pt-9">
        <div className="flex items-center gap-2 eyebrow">
          <Sparkles size={13} />
          {isUrdu ? "بچوں کے کارٹون پوئم ویڈیوز" : "Cartoon poem videos"}
        </div>
        <h1 className={`mt-3 text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--ink)] ${
          isUrdu ? "font-urdu" : ""
        }`}>
          {isUrdu ? " سنیں، دیکھیں اور ساتھ ساتھ پڑھیں" : "Watch, listen and read along"}
        </h1>
        <p className={`mt-2 text-sm text-[var(--ink-soft)] max-w-xl ${isUrdu ? "font-urdu" : ""}`}>
          {isUrdu
            ? "ہر نظم کے ساتھ متحرک مناظر اور آواز — اردو اور انگریزی، دونوں زبانوں میں، ہمیشہ آف لائن۔"
            : "Animated scenes with narration for every poem — switch between Urdu and English any time, fully offline."}
        </p>

        <div className="mt-7">
          <PoemPlayer key={active.id} poem={active} />
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {POEM_VIDEOS.map((poem, i) => {
            const isActive = poem.id === active.id;
            return (
              <motion.button
                key={poem.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -4 }}
                onClick={() => setActiveId(poem.id)}
                className={`text-left rounded-2xl overflow-hidden border transition-colors ${
                  isActive
                    ? "border-[var(--brand)] shadow-[var(--shadow-lift)]"
                    : "border-[var(--line)] hover:border-[var(--sage)]"
                }`}
              >
                <div
                  className="h-28 relative flex items-center justify-center text-4xl"
                  style={{ background: SCENE_STYLES[poem.scene] }}
                >
                  <span className="drop-shadow">{SCENE_EMOJI[poem.scene]}</span>
                  <span className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-white/90 text-[#10201c] flex items-center justify-center shadow">
                    <Play size={15} fill="currentColor" />
                  </span>
                </div>
                <div className="bg-[var(--panel)] px-4 py-3">
                  <div className="font-bold text-sm text-[var(--ink)] truncate">
                    {poem.title}
                  </div>
                  <div className="font-urdu text-[13px] text-[var(--sage-ink)] truncate">
                    {poem.titleUrdu}
                  </div>
                  <div className="mt-1 text-[11px] font-semibold text-[var(--ink-soft)] truncate">
                    {poem.author} · {poem.minutes} min
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        <p className={`mt-6 text-[11.5px] text-[var(--ink-soft)] ${isUrdu ? "font-urdu" : ""}`}>
          {t("chatbotChipOffline")} · {t("chatbotChipCurated")}
        </p>
      </div>
    </AppShell>
  );
}
