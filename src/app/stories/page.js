"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Play, BookOpen } from "lucide-react";
import AppShell from "@/components/AppShell";
import StoryPlayer from "@/components/story-player/StoryPlayer";
import { STORY_VIDEOS } from "@/components/story-player/stories";
import { SCENE_EMOJI, SCENE_STYLES } from "@/components/story-player/sceneStyles";
import { useLanguage } from "@/context/LanguageContext";

export default function StoriesPage() {
  const { isUrdu, t } = useLanguage();
  const [activeId, setActiveId] = useState(STORY_VIDEOS[0].id);
  const active = STORY_VIDEOS.find((s) => s.id === activeId) || STORY_VIDEOS[0];

  /* Deep link: /stories?id=tortoise-hare opens that story straight away. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get("id");
    if (wanted && STORY_VIDEOS.some((s) => s.id === wanted)) setActiveId(wanted);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-5 md:px-10 pt-6 md:pt-9">
        <div className="flex items-center gap-2 eyebrow">
          <BookOpen size={13} />
          {isUrdu ? "بچوں کی متحرک کہانیاں" : "Animated stories"}
        </div>
        <h1 className={`mt-3 text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--ink)] ${
          isUrdu ? "font-urdu" : ""
        }`}>
          {isUrdu ? "کہانی سنیں، دیکھیں اور پڑھیں" : "Watch, listen and read along"}
        </h1>
        <p className={`mt-2 text-sm text-[var(--ink-soft)] max-w-xl ${isUrdu ? "font-urdu" : ""}`}>
          {isUrdu
            ? "ہر کہانی کے ساتھ اسٹارفش سین، حروف اور آواز — اردو اور انگریزی دونوں میں، ہمیشہ آف لائن۔"
            : "Every story with animated scenes, characters and narration — Urdu and English, fully offline."}
        </p>

        <div className="mt-7">
          <StoryPlayer key={active.id} story={active} />
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STORY_VIDEOS.map((story, i) => {
            const isActive = story.id === active.id;
            return (
              <motion.button
                key={story.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -4 }}
                onClick={() => setActiveId(story.id)}
                className={`text-left rounded-2xl overflow-hidden border transition-colors ${
                  isActive
                    ? "border-[var(--brand)] shadow-[var(--shadow-lift)]"
                    : "border-[var(--line)] hover:border-[var(--sage)]"
                }`}
              >
                <div
                  className="h-28 relative flex items-center justify-center text-4xl"
                  style={{ background: SCENE_STYLES[story.scene] }}
                >
                  <span className="drop-shadow">{SCENE_EMOJI[story.scene]}</span>
                  <span className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-white/90 text-[#10201c] flex items-center justify-center shadow">
                    <Play size={15} fill="currentColor" />
                  </span>
                </div>
                <div className="bg-[var(--panel)] px-4 py-3">
                  <div className="font-bold text-sm text-[var(--ink)] truncate">
                    {story.title}
                  </div>
                  <div className="font-urdu text-[13px] text-[var(--sage-ink)] truncate">
                    {story.titleUrdu}
                  </div>
                  <div className="mt-1 text-[11px] font-semibold text-[var(--ink-soft)] truncate">
                    {story.author} · {story.minutes} min
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
