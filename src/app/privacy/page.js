"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function PrivacyPage() {
  const { isUrdu } = useLanguage();

  return (
    <div className="min-h-screen bg-[var(--paper)] px-6 py-12">
      <div className={`max-w-2xl mx-auto ${isUrdu ? "font-urdu text-right" : ""}`}>
        <Link href="/" className="text-sm font-semibold text-[var(--ink-soft)]">
          ← {isUrdu ? "واپس" : "Back"}
        </Link>

        <h1 className="text-3xl font-extrabold mt-6">
          {isUrdu ? "پرائیویسی پالیسی" : "Privacy Policy"}
        </h1>
        <p className="text-sm text-[var(--ink-soft)] mt-2">
          {isUrdu ? "آخری تازہ کاری: ستمبر 2026" : "Last updated: September 2026"}
        </p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-[var(--ink)]">
          {isUrdu ? (
            <>
              <p>
                کتابستان ایک ایسی ایپ ہے جو خاص طور پر طلبہ کے لیے بنائی گئی ہے، اس لیے ہم آپ
                کی معلومات کو سادہ اور واضح انداز میں بیان کرتے ہیں — کسی وکیل کی ضرورت کے بغیر۔
              </p>
              <div>
                <h2 className="font-extrabold text-base mb-2">ہم کیا معلومات جمع کرتے ہیں</h2>
                <p>
                  ایپ استعمال کرنے کے لیے ذاتی معلومات دینا ضروری نہیں۔ ڈیمو موڈ بغیر کسی
                  اکاؤنٹ کے کام کرتا ہے۔ اگر آپ سائن اپ کریں تو صرف نام اور ای میل محفوظ کی
                  جاتی ہے، وہ بھی صرف آپ کے پڑھنے کی پیش رفت یاد رکھنے کے لیے۔
                </p>
              </div>
              <div>
                <h2 className="font-extrabold text-base mb-2">بچوں کی حفاظت</h2>
                <p>
                  ہم بچوں سے غیر ضروری معلومات نہیں مانگتے۔ کڈز موڈ میں اشتہارات یا بیرونی
                  لنکس شامل نہیں ہوتے۔ جب بھی اشتہارات شامل کیے جائیں گے، وہ کبھی بھی بچوں کو
                  ہدف بنا کر نہیں دکھائے جائیں گے۔
                </p>
              </div>
              <div>
                <h2 className="font-extrabold text-base mb-2">ڈیٹا کہاں محفوظ ہوتا ہے</h2>
                <p>
                  زیادہ تر معلومات (پسندیدہ کتابیں، پڑھنے کی پیش رفت، پروفائلز) صرف آپ کے فون
                  یا براؤزر میں محفوظ ہوتی ہیں۔ مستقبل میں اگر کلاؤڈ سنک شامل کی جائے تو یہ
                  پالیسی اپڈیٹ کر دی جائے گی۔
                </p>
              </div>
              <div>
                <h2 className="font-extrabold text-base mb-2">رابطہ</h2>
                <p>
                  کسی بھی سوال کے لیے، والدین یا اساتذہ ایپ کے پروفائل سیکشن سے رابطہ کر سکتے
                  ہیں۔
                </p>
              </div>
            </>
          ) : (
            <>
              <p>
                Kitaabistan is built for students, so we keep this explanation simple and
                plain — no legal jargon required.
              </p>
              <div>
                <h2 className="font-extrabold text-base mb-2">What we collect</h2>
                <p>
                  You don&apos;t need to give any personal information to use the app. Demo
                  mode works with no account at all. If you sign up, we only store your name
                  and email — just enough to remember your reading progress.
                </p>
              </div>
              <div>
                <h2 className="font-extrabold text-base mb-2">Child safety</h2>
                <p>
                  We don&apos;t ask children for unnecessary information. Kids Mode never
                  shows ads or outside links. If ads are ever introduced, they will never be
                  targeted at children.
                </p>
              </div>
              <div>
                <h2 className="font-extrabold text-base mb-2">Where your data lives</h2>
                <p>
                  Most information — bookmarks, reading progress, reader profiles — stays on
                  your own phone or browser. If cloud sync is added in the future, this policy
                  will be updated to reflect it.
                </p>
              </div>
              <div>
                <h2 className="font-extrabold text-base mb-2">Contact</h2>
                <p>
                  Parents and teachers with questions can reach out through the Profile
                  section of the app.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
