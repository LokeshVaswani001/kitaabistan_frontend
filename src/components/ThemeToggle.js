"use client";

import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

/** Sun / moon switch used in every top bar. */
export default function ThemeToggle({ className = "" }) {
  const { isDark, toggle } = useTheme();

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={`grid place-items-center w-9 h-9 rounded-full border border-line bg-panel text-ink-soft hover:text-brand hover:border-brand transition-colors ${className}`}
    >
      {isDark ? <Sun size={16} strokeWidth={2.2} /> : <Moon size={16} strokeWidth={2.2} />}
    </motion.button>
  );
}

/** 18-language picker (kept under the old name for existing imports). */
export function LangToggle({ className = "" }) {
  return <LanguageSwitcher className={className} />;
}
