"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookX } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function NotFound() {
  const { isUrdu } = useLanguage();

  return (
    <div className="min-h-screen bg-[var(--paper)] flex items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm"
      >
        <div className="w-16 h-16 rounded-2xl bg-[var(--line)] mx-auto flex items-center justify-center mb-6">
          <BookX size={26} color="var(--ink-soft)" />
        </div>
        <h1 className={`text-2xl font-extrabold ${isUrdu ? "font-urdu" : ""}`}>
          {isUrdu ? "یہ صفحہ نہیں ملا" : "This shelf is empty"}
        </h1>
        <p className={`text-sm text-[var(--ink-soft)] mt-2 ${isUrdu ? "font-urdu" : ""}`}>
          {isUrdu
            ? "جو کتاب یا صفحہ آپ ڈھونڈ رہے ہیں وہ موجود نہیں۔"
            : "The book or page you're looking for doesn't exist — or hasn't been added to the library yet."}
        </p>
        <Link
          href="/home"
          className="inline-block mt-6 px-6 py-3 rounded-xl bg-[var(--ink)] text-[var(--paper)] font-bold text-sm"
        >
          {isUrdu ? "ہوم پر واپس جائیں" : "Back to your shelf"}
        </Link>
      </motion.div>
    </div>
  );
}
