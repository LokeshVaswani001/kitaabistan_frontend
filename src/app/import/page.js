"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CloudDownload, FileUp, Trash2, BookOpen } from "lucide-react";
import AppShell from "@/components/AppShell";
import { useLanguage } from "@/context/LanguageContext";
import {
  listImportedBooks,
  saveImportedBook,
  deleteImportedBook,
} from "@/lib/importedBooks";
import {
  extractPdfText,
  extractDocxText,
  extensionOf,
} from "@/lib/extractors";

const fmtDate = (ts) => new Date(ts).toLocaleDateString();

export default function ImportPage() {
  const { isUrdu } = useLanguage();
  const dir = isUrdu ? "font-urdu text-right" : "";

  const [url, setUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState(null); // { text, title, author }
  const [saving, setSaving] = useState(false);
  const [books, setBooks] = useState(null);
  const [reading, setReading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    listImportedBooks().then(setBooks).catch(() => setBooks([]));
  }, []);

  const refresh = () => listImportedBooks().then(setBooks).catch(() => setBooks([]));

  const handleUrlDownload = async (e) => {
    e.preventDefault();
    const target = url.trim();
    if (!target || fetching) return;
    setFetching(true);
    setError("");
    try {
      const res = await fetch(`/api/fetch-book?url=${encodeURIComponent(target)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "fetch-failed");
      setDraft({ text: data.text, title: data.suggestedTitle || "", author: "" });
    } catch (err) {
      const code = String(err?.message || "");
      setError(fetchErrorText(code));
    } finally {
      setFetching(false);
    }
  };

  const fetchErrorText = (code) => {
    if (isUrdu) {
      if (code === "doc-unsupported")
        return "یہ پرانی .doc فائل ہے — پہلے اسے .docx یا .txt میں سیو کر کے لنک استعمال کریں۔";
      if (code === "too-large") return "فائل بہت بڑی ہے — 8 MB تک کی فائلیں چلیں گی۔";
      if (code === "empty-content") return "اس لنک میں پڑھنے لایق متن نہیں ملا۔";
      if (code === "pdf-failed" || code === "docx-failed")
        return "PDF/DOCX نہیں پڑھی جا سکی — یا فائل اپ لوڈ کر کے دیکھیں۔";
      if (code.startsWith("http-") || code === "fetch-failed" || code === "timeout")
        return "ویب سے کتاب نہیں آئی — لنک چیک کریں یا فائل اپ لوڈ کریں۔";
      return "ویب سے کتاب نہیں آئی — لنک چیک کریں یا فائل اپ لوڈ کریں۔";
    }
    if (code === "doc-unsupported")
      return "That's an old .doc file — save it as .docx or .txt first, then use that link.";
    if (code === "too-large") return "That file is too big — links up to 8 MB work.";
    if (code === "empty-content") return "That link didn't contain readable text.";
    if (code === "pdf-failed" || code === "docx-failed")
      return "Couldn't read that PDF/DOCX from the link — try uploading the file instead.";
    return "Couldn't fetch that book — check the link, or upload a file instead.";
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    const ext = extensionOf(file.name);
    setReading(true);
    try {
      let result;
      if (ext === "pdf") {
        result = await extractPdfText(await file.arrayBuffer(), file.name);
      } else if (ext === "docx") {
        result = await extractDocxText(await file.arrayBuffer(), file.name);
      } else if (ext === "doc") {
        setError(
          isUrdu
            ? "یہ پرانی .doc فائل ہے — پہلے اسے .docx یا .txt میں سیو کریں، پھر اپ لوڈ کریں۔"
            : "That's an old .doc file — save it as .docx or .txt first, then upload it."
        );
        return;
      } else if (ext === "txt" || ext === "md" || ext === "") {
        const text = new TextDecoder().decode(await file.arrayBuffer());
        result = {
          text,
          title: file.name.replace(/\.(txt|md)$/i, "").replace(/[-_]+/g, " ").trim(),
        };
      } else {
        setError(
          isUrdu
            ? "یہ فائل فارمیٹ سپورٹ نہیں ہوتا — .txt، .md، .pdf یا .docx استعمال کریں۔"
            : "That file type isn't supported — use .txt, .md, .pdf or .docx."
        );
        return;
      }
      if (result.text.trim().length < 120) {
        setError(
          isUrdu ? "فائل میں لکھا مواد بہت کم ہے۔" : "That file looks too small to be a book."
        );
        return;
      }
      setDraft({ text: result.text, title: result.title || "", author: "" });
    } catch {
      setError(
        isUrdu
          ? "فائل نہیں پڑھی جا سکی — محفوظ فارمیٹ (.txt، .pdf، .docx) آزمائیں۔"
          : "Couldn't read that file — try a standard format (.txt, .pdf, .docx)."
      );
    } finally {
      setReading(false);
      e.target.value = "";
    }
  };

  const handleSave = async () => {
    if (!draft || saving) return;
    setSaving(true);
    setError("");
    try {
      const rec = await saveImportedBook({
        title: draft.title,
        author: draft.author,
        text: draft.text,
      });
      setDraft(null);
      setUrl("");
      await refresh();
      window.__lastImported = rec.id;
    } catch {
      setError(isUrdu ? "محفوظ نہیں ہو سکی۔" : "Couldn't save the book.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await deleteImportedBook(id);
    refresh();
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-5 md:px-10 pt-6 md:pt-10">
        <h1 className={`text-2xl md:text-3xl font-extrabold ${dir}`}>
          {isUrdu ? "اپنی کتابیں شامل کریں" : "Add your own books"}
        </h1>
        <p className={`text-sm text-[var(--ink-soft)] mt-1 ${dir}`}>
          {isUrdu
            ? "کوئی بھی کتاب لنک سے ڈاؤن لوڈ کریں یا فائل اپ لوڈ کریں (.txt، .pdf، .docx) — محفوظ ہوتے ہی بغیر انٹرنیٹ کے پڑھیں اور چیٹ بات بھی ان پر ہوگی۔"
            : "Download any book from a link, or upload a file (.txt, .pdf, .docx) — once saved you can read it fully offline, and the chatbot will answer from it too."}
        </p>

        {/* URL download */}
        <form
          onSubmit={handleUrlDownload}
          className={`mt-6 flex gap-2 ${isUrdu ? "flex-row-reverse" : ""}`}
        >
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={isUrdu ? "کتاب کا لنک (http…)" : "Book link (txt · pdf · docx)"}
            className={`flex-1 min-w-0 border border-[var(--line)] rounded-xl px-4 py-3 text-sm bg-[var(--panel)] ${dir}`}
            dir={isUrdu ? "rtl" : "ltr"}
          />
          <button
            type="submit"
            disabled={fetching || !url.trim()}
            className="btn btn-primary shrink-0 px-5 disabled:opacity-50"
          >
            {fetching
              ? isUrdu
                ? "لے رہے ہیں…"
                : "Fetching…"
              : isUrdu
                ? "ڈاؤن لوڈ"
                : "Download"}
          </button>
        </form>

        {/* File upload */}
        <div className="mt-3 flex items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.md,.pdf,.docx,text/plain,text/markdown,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFile}
            className="hidden"
          />
          <button
            type="button"
            disabled={reading}
            onClick={() => fileRef.current?.click()}
            className="btn border border-[var(--line)] bg-[var(--panel)] text-sm px-4 py-2.5 inline-flex items-center gap-2 disabled:opacity-60"
          >
            <FileUp size={15} />
            {reading
              ? isUrdu
                ? "پڑھ رہے ہیں…"
                : "Reading file…"
              : isUrdu
                ? "کتاب اپ لوڈ کریں"
                : "Upload a book file"}
          </button>
          <span className="text-xs text-[var(--ink-soft)]">
            {isUrdu ? ".txt · .md · .pdf · .docx" : ".txt · .md · .pdf · .docx"}
          </span>
        </div>

        {error && (
          <div className={`mt-4 text-sm text-[var(--danger)] ${dir}`}>{error}</div>
        )}

        {/* Draft confirm */}
        {draft && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-2xl border border-[var(--brand)] bg-[var(--brand-soft)] p-5"
          >
            <div className={`text-sm font-extrabold ${dir}`}>
              {isUrdu ? "محفوظ کرنے سے پہلے تصدیق کریں" : "Confirm before saving"}
            </div>
            <div className="mt-3 space-y-2">
              <input
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder={isUrdu ? "عنوان" : "Title"}
                className={`w-full border border-[var(--line)] rounded-lg px-3 py-2 text-sm bg-[var(--panel)] ${dir}`}
              />
              <input
                value={draft.author}
                onChange={(e) => setDraft({ ...draft, author: e.target.value })}
                placeholder={isUrdu ? "مصنف (اختیاری)" : "Author (optional)"}
                className={`w-full border border-[var(--line)] rounded-lg px-3 py-2 text-sm bg-[var(--panel)] ${dir}`}
              />
            </div>
            <div className="text-xs text-[var(--ink-soft)] mt-2">
              {Math.round(draft.text.length / 1000)}K characters ·{" "}
              {isUrdu ? "آف لائن محفوظ ہوگی" : "saved for offline reading"}
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleSave} disabled={saving} className="btn btn-primary px-5">
                {saving ? (isUrdu ? "محفوظ…" : "Saving…") : isUrdu ? "محفوظ کریں" : "Save book"}
              </button>
              <button
                onClick={() => setDraft(null)}
                className="btn border border-[var(--line)] bg-[var(--panel)] px-4"
              >
                {isUrdu ? "منسوخ" : "Cancel"}
              </button>
            </div>
          </motion.div>
        )}

        {/* Saved list */}
        <div className="mt-10">
          <div className={`text-xs font-bold text-[var(--ink-soft)] ${dir}`}>
            {isUrdu ? "محفوظ کتابیں" : "SAVED BOOKS"}
          </div>
          {books === null ? (
            <div className="mt-4 h-5 w-40 skeleton rounded" />
          ) : books.length === 0 ? (
            <div className={`mt-4 text-sm text-[var(--ink-soft)] ${dir}`}>
              {isUrdu
                ? "ابھی کوئی کتاب محفوظ نہیں — اوپر سے پہلی کتاب شامل کریں۔"
                : "No saved books yet — add your first one above."}
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {books.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-5 py-4"
                >
                  <Link href={`/book/${b.id}`} className="min-w-0 flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-[var(--brand-soft)] flex items-center justify-center shrink-0">
                      <BookOpen size={16} color="var(--brand)" />
                    </span>
                    <span className="min-w-0">
                      <span className={`block font-bold text-sm truncate ${dir}`}>{b.title}</span>
                      <span className={`block text-xs text-[var(--ink-soft)] ${dir}`}>
                        {[b.author, fmtDate(b.addedAt), `${Math.round(b.chars / 1000)}K chars`]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </span>
                  </Link>
                  <button
                    onClick={() => handleDelete(b.id)}
                    aria-label={isUrdu ? "حذف کریں" : "Delete"}
                    className="text-[var(--ink-soft)] hover:text-[var(--danger)] transition-colors shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
