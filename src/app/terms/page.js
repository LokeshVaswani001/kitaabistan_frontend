"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function TermsPage() {
  const { isUrdu } = useLanguage();

  return (
    <div className="min-h-screen bg-[var(--paper)] px-6 py-12">
      <div className={`max-w-2xl mx-auto ${isUrdu ? "font-urdu text-right" : ""}`}>
        <Link href="/" className="text-sm font-semibold text-[var(--ink-soft)]">
          ← {isUrdu ? "واپس" : "Back"}
        </Link>

        <h1 className="text-3xl font-extrabold mt-6">
          {isUrdu ? "شرائط و ضوابط" : "Terms of Service"}
        </h1>
        <p className="text-sm text-[var(--ink-soft)] mt-2">
          {isUrdu ? "آخری تازہ کاری: ستمبر 2026" : "Last updated: September 2026"}
        </p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-[var(--ink)]">
          {isUrdu ? (
            <>
              <p>
                کتابستان استعمال کر کے، آپ ان آسان شرائط سے اتفاق کرتے ہیں۔
              </p>
              <div>
                <h2 className="font-extrabold text-base mb-2">مفت استعمال</h2>
                <p>
                  کتابستان کی مکمل لائبریری اور چیٹ بوٹ فی الحال مکمل طور پر مفت ہیں۔ مستقبل
                  میں کچھ اضافی مواد کے لیے اختیاری ادائیگی متعارف کروائی جا سکتی ہے، لیکن
                  بنیادی لائبریری ہمیشہ مفت رہے گی۔
                </p>
              </div>
              <div>
                <h2 className="font-extrabold text-base mb-2">مواد کا استعمال</h2>
                <p>
                  ایپ میں موجود کتابیں، نظمیں اور کہانیاں صرف ذاتی، غیر تجارتی پڑھنے کے لیے
                  ہیں۔ چیٹ بوٹ کے جوابات صرف منتخب شدہ مواد پر مبنی ہوتے ہیں اور انہیں حتمی
                  تعلیمی رائے کے طور پر نہیں لینا چاہیے۔
                </p>
              </div>
              <div>
                <h2 className="font-extrabold text-base mb-2">اکاؤنٹ کی ذمہ داری</h2>
                <p>
                  اگر آپ اکاؤنٹ بناتے ہیں، تو آپ اپنی لاگ اِن تفصیلات کی حفاظت کے ذمہ دار ہیں۔
                  ڈیمو سیشن وقت کے ساتھ ختم ہو جاتا ہے اور اسے دوبارہ شروع کیا جا سکتا ہے۔
                </p>
              </div>
              <div>
                <h2 className="font-extrabold text-base mb-2">تبدیلیاں</h2>
                <p>
                  یہ شرائط وقتاً فوقتاً اپڈیٹ ہو سکتی ہیں۔ اہم تبدیلیوں کی صورت میں ایپ کے
                  اندر واضح اطلاع دی جائے گی۔
                </p>
              </div>
            </>
          ) : (
            <>
              <p>By using Kitaabistan, you agree to these simple terms.</p>
              <div>
                <h2 className="font-extrabold text-base mb-2">Free to use</h2>
                <p>
                  Kitaabistan&apos;s full library and chatbot are currently completely free.
                  Optional paid content may be introduced in the future, but the core library
                  will always stay free.
                </p>
              </div>
              <div>
                <h2 className="font-extrabold text-base mb-2">Using the content</h2>
                <p>
                  Books, poems, and stories in the app are for personal, non-commercial
                  reading only. Chatbot answers come only from curated content and shouldn&apos;t
                  be treated as final academic advice.
                </p>
              </div>
              <div>
                <h2 className="font-extrabold text-base mb-2">Account responsibility</h2>
                <p>
                  If you create an account, you&apos;re responsible for keeping your login
                  details safe. Demo sessions expire after their chosen time and can be
                  restarted at any time.
                </p>
              </div>
              <div>
                <h2 className="font-extrabold text-base mb-2">Changes</h2>
                <p>
                  These terms may be updated from time to time. Significant changes will be
                  clearly announced inside the app.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
