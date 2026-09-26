"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function CategoryTile({ category }) {
  const Icon = Icons[category.icon] || Icons.BookOpen;
  const { isUrdu } = useLanguage();
  const label = isUrdu ? category.nameUrdu : category.name;

  return (
    <Link href={`/library/${category.slug}`} className="w-[76px] shrink-0">
      <motion.div
        whileHover={{ y: -4, scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="flex flex-col items-center text-center gap-2"
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: category.color }}
        >
          <Icon size={22} color="#1D2624" strokeWidth={2} />
        </div>
        <span className={`text-[11px] font-bold leading-tight ${isUrdu ? "font-urdu" : ""}`}>
          {label}
        </span>
      </motion.div>
    </Link>
  );
}
