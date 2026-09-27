"use client";

import { BookOpen } from "lucide-react";

export default function VideoLogo() {
  return (
    <div className="flex items-center gap-2 rounded-full bg-[var(--panel)]/92 backdrop-blur border border-[var(--line)] pl-1.5 pr-3 py-1.5">
      <span
        className="w-6 h-6 rounded-[7px] flex items-center justify-center shrink-0"
        style={{ background: "linear-gradient(145deg, #0E5C4C, #0B4A3D)" }}
      >
        <BookOpen size={13} color="#FAF3E7" strokeWidth={2.6} />
      </span>
      <span className="text-[11px] font-extrabold tracking-tight text-[var(--ink)]">
        Kitaabistan
      </span>
    </div>
  );
}
